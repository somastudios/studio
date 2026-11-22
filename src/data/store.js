import { ESQUEMA, TABLAS, AJUSTES_BASE } from './esquema.js'
import { uid, ahora } from '../app/util.js'

// Almacén local primero.
// Todo se lee y se escribe en este dispositivo al instante (memoria + localStorage), así una visita
// funciona aunque el negocio no tenga señal. Cada cambio se anota en una cola y, cuando hay sesión
// y conexión, la cola sube a Supabase y lo nuevo del servidor baja. Gana la última escritura.

const LS = 'soma.db.'
const mem = {}
let cola = []
let marcas = {}
const oyentes = new Set()
let nube = null // { sb, activo: () => bool, quien: () => uuid }
let enCurso = null
let temporizador = 0
const estado = { ultima: null, error: null, sincronizando: false }

const leer = (k, def) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : def
  } catch {
    return def
  }
}

const escribir = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
    return true
  } catch (e) {
    estado.error = 'Este dispositivo se quedó sin espacio para guardar.'
    return false
  }
}

function cargar() {
  for (const t of TABLAS) {
    mem[t] = new Map()
    for (const f of leer(LS + t, [])) mem[t].set(f.id, f)
  }
  cola = leer('soma.cola', [])
  marcas = leer('soma.marcas', {})
}

const persistir = (t) => escribir(LS + t, [...mem[t].values()])
const emitir = (tabla) => oyentes.forEach((fn) => fn(tabla))

function encolar(tabla, id) {
  if (!cola.some((c) => c.tabla === tabla && c.id === id)) {
    cola.push({ tabla, id })
    escribir('soma.cola', cola)
  }
  clearTimeout(temporizador)
  temporizador = setTimeout(() => store.sincronizar(), 1500)
}

const coincide = (fila, filtro) => {
  if (!filtro) return true
  if (typeof filtro === 'function') return filtro(fila)
  for (const k in filtro) if (fila[k] !== filtro[k]) return false
  return true
}

/** Solo las columnas que el servidor acepta, sin las que le pertenecen a él. */
function paraSubir(tabla, fila) {
  const { cols, servidor = [] } = ESQUEMA[tabla]
  const o = {}
  for (const c of cols) if (!servidor.includes(c) && fila[c] !== undefined) o[c] = fila[c]
  return o
}

export const store = {
  /** Filas vigentes de una tabla. `filtro` es un objeto de igualdades o una función. */
  lista(tabla, filtro) {
    const out = []
    for (const f of mem[tabla].values()) if (!f.eliminado && coincide(f, filtro)) out.push(f)
    return out
  },

  uno(tabla, id) {
    const f = id ? mem[tabla].get(id) : null
    return f && !f.eliminado ? f : null
  },

  /** Crea o actualiza. Devuelve la fila completa. Lo que no mandes se conserva. */
  guardar(tabla, datos) {
    const id = datos.id || uid()
    const previa = mem[tabla].get(id)
    const t = ahora()
    const fila = { ...(previa || { creado: t, creado_por: nube?.quien?.() || null }), ...datos, id, actualizado: t }
    if (tabla === 'ajustes') delete fila.creado_por
    mem[tabla].set(id, fila)
    persistir(tabla)
    encolar(tabla, id)
    emitir(tabla)
    return fila
  },

  /** Borrado suave: la fila deja de aparecer aquí y en los demás dispositivos. */
  borrar(tabla, id) {
    const previa = mem[tabla].get(id)
    if (!previa) return
    mem[tabla].set(id, { ...previa, eliminado: ahora(), actualizado: ahora() })
    persistir(tabla)
    encolar(tabla, id)
    emitir(tabla)
  },

  /** Avísame cuando cambie algo. Devuelve la función para dejar de escuchar. */
  alCambiar(fn) {
    oyentes.add(fn)
    return () => oyentes.delete(fn)
  },

  /** Un ajuste, con su valor de fábrica si nadie lo ha tocado. */
  ajuste(clave) {
    const f = mem.ajustes.get(clave)
    const base = AJUSTES_BASE[clave]
    if (!f || f.eliminado) return structuredClone(base)
    if (base && typeof base === 'object' && !Array.isArray(base)) return { ...structuredClone(base), ...f.valor }
    return f.valor
  },

  ponAjuste(clave, valor) {
    return store.guardar('ajustes', { id: clave, valor })
  },

  /** Línea en la bitácora de un prospecto. */
  anotar(prospecto_id, tipo, texto, datos = null, quien = null) {
    return store.guardar('bitacora', { prospecto_id, tipo, texto, datos, quien })
  },

  conectar(n) {
    nube = n
  },

  get estado() {
    return { ...estado, pendientes: cola.length, conNube: !!nube?.activo?.() }
  },

  /** Sube lo pendiente y baja lo nuevo. No hace nada sin sesión o sin conexión. */
  async sincronizar() {
    if (!nube?.activo?.() || !navigator.onLine) return false
    if (enCurso) return enCurso
    estado.sincronizando = true
    emitir('_sync')
    enCurso = (async () => {
      try {
        // 1. Subir
        const pendientes = cola.slice()
        const porTabla = {}
        for (const c of pendientes) {
          const fila = mem[c.tabla]?.get(c.id)
          if (fila) (porTabla[c.tabla] ||= []).push(paraSubir(c.tabla, fila))
        }
        // Los prospectos primero: lo demás apunta a ellos.
        for (const t of TABLAS) {
          if (!porTabla[t]?.length) continue
          const { error } = await nube.sb.from(t).upsert(porTabla[t])
          if (error) throw error
          cola = cola.filter((c) => !(c.tabla === t && pendientes.some((p) => p.tabla === t && p.id === c.id)))
          escribir('soma.cola', cola)
        }
        // 2. Bajar
        for (const t of TABLAS) {
          let q = nube.sb.from(t).select('*').order('sincronizado', { ascending: true }).limit(1000)
          if (marcas[t]) q = q.gt('sincronizado', marcas[t])
          const { data, error } = await q
          if (error) throw error
          if (!data?.length) continue
          for (const f of data) {
            marcas[t] = f.sincronizado
            if (cola.some((c) => c.tabla === t && c.id === f.id)) continue
            const { sincronizado, ...fila } = f
            mem[t].set(f.id, fila)
          }
          persistir(t)
          emitir(t)
        }
        escribir('soma.marcas', marcas)
        estado.ultima = ahora()
        estado.error = null
        return true
      } catch (e) {
        estado.error = e?.message || 'No se pudo sincronizar.'
        return false
      } finally {
        estado.sincronizando = false
        enCurso = null
        emitir('_sync')
      }
    })()
    return enCurso
  },

  /** Borra la copia de este dispositivo (al cerrar sesión). Lo ya sincronizado sigue en la nube. */
  vaciar() {
    for (const t of TABLAS) {
      mem[t] = new Map()
      localStorage.removeItem(LS + t)
    }
    cola = []
    marcas = {}
    localStorage.removeItem('soma.cola')
    localStorage.removeItem('soma.marcas')
    emitir('_todo')
  },
}

cargar()

if (typeof window !== 'undefined') {
  addEventListener('online', () => store.sincronizar())
  document.addEventListener('visibilitychange', () => !document.hidden && store.sincronizar())
  setInterval(() => !document.hidden && store.sincronizar(), 60000)
}
