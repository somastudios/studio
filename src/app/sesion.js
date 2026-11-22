import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY, FUNCIONES } from '../config.js'
import { store } from '../data/store.js'
import { archivos } from '../data/archivos.js'

// Quién está usando el sistema.
// Hay dos maneras de trabajar: con cuenta (todo se sincroniza entre Dalí, Alex y sus dispositivos)
// o solo en este dispositivo (nada sale de aquí hasta que alguien inicie sesión).

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'soma.sesion' },
})

const oyentes = new Set()

// El almacenamiento del navegador puede no estar disponible (vistas previas, modo privado).
// En ese caso todo sigue funcionando en memoria: se puede entrar y probar, pero nada se conserva
// al cerrar la pestaña.
const memoria = new Map()
const ls = {
  lee: (k) => {
    try {
      const v = localStorage.getItem(k)
      return v ?? memoria.get(k) ?? null
    } catch {
      return memoria.get(k) ?? null
    }
  },
  pon: (k, v) => {
    memoria.set(k, v)
    try {
      localStorage.setItem(k, v)
    } catch {}
  },
  quita: (k) => {
    memoria.delete(k)
    try {
      localStorage.removeItem(k)
    } catch {}
  },
}

export const sesion = {
  usuario: null,
  /** Nombre con el que firma lo que registra. */
  get nombre() {
    return ls.lee('soma.nombre') || ''
  },
  get local() {
    return ls.lee('soma.local') === '1'
  },
  get dentro() {
    return !!sesion.usuario || sesion.local
  },
  alCambiar(fn) {
    oyentes.add(fn)
    return () => oyentes.delete(fn)
  },
}

const nube = { sb, activo: () => !!sesion.usuario, quien: () => sesion.usuario?.id || null }
store.conectar(nube)
archivos.conectar(nube)

function fijar(s) {
  sesion.usuario = s?.user || null
  oyentes.forEach((fn) => fn())
}

const conLimite = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))])

/** Recupera la sesión guardada. Nunca bloquea el arranque más de un par de segundos. */
export async function iniciarSesion() {
  try {
    const r = await conLimite(sb.auth.getSession(), 2500)
    fijar(r?.data?.session || null)
  } catch {
    fijar(null)
  }
  sb.auth.onAuthStateChange((_e, s) => {
    const antes = sesion.usuario?.id
    fijar(s)
    if (s?.user && s.user.id !== antes) despuesDeEntrar()
  })
  if (sesion.usuario) despuesDeEntrar()
}

async function despuesDeEntrar() {
  ls.quita('soma.local')
  try {
    const { data } = await sb.from('equipo').select('nombre').eq('id', sesion.usuario.id).maybeSingle()
    if (data?.nombre) ls.pon('soma.nombre', data.nombre)
  } catch {}
  await store.sincronizar()
  archivos.subirPendientes()
  oyentes.forEach((fn) => fn())
}

const MENSAJES = {
  'Invalid login credentials': 'El correo o la contraseña no coinciden.',
  'Email not confirmed': 'Falta confirmar ese correo.',
  codigo: 'Ese código de equipo no es el correcto.',
  existe: 'Ya hay una cuenta con ese correo. Prueba entrar.',
  corta: 'La contraseña necesita al menos 8 caracteres.',
  red: 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.',
}

const traducir = (m) => MENSAJES[m] || m || 'Algo no salió bien. Intenta de nuevo.'

export async function entrar(correo, clave) {
  try {
    const { error } = await sb.auth.signInWithPassword({ email: correo.trim(), password: clave })
    if (error) return { error: traducir(error.message === 'Failed to fetch' ? 'red' : error.message) }
    return {}
  } catch {
    return { error: MENSAJES.red }
  }
}

/** Crea la cuenta de un integrante. Solo funciona con el código de equipo. */
export async function crearCuenta({ nombre, correo, clave, codigo }) {
  if ((clave || '').length < 8) return { error: MENSAJES.corta }
  try {
    const r = await fetch(`${FUNCIONES}/unirse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ nombre: nombre.trim(), correo: correo.trim(), clave, codigo: codigo.trim() }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return { error: traducir(j.error) }
    ls.pon('soma.nombre', nombre.trim())
    return entrar(correo, clave)
  } catch {
    return { error: MENSAJES.red }
  }
}

export async function salir({ borrarLocal = true } = {}) {
  try {
    await sb.auth.signOut()
  } catch {}
  ls.quita('soma.local')
  if (borrarLocal) store.vaciar()
  fijar(null)
}

export function usarSinCuenta(nombre) {
  ls.pon('soma.local', '1')
  if (nombre) ls.pon('soma.nombre', nombre)
  oyentes.forEach((fn) => fn())
}

/** Llama a una función edge con la sesión actual. */
export async function funcion(nombre, cuerpo) {
  try {
    const { data } = await sb.auth.getSession()
    const token = data?.session?.access_token
    if (!token) return { error: 'Necesitas iniciar sesión para esto.' }
    const r = await fetch(`${FUNCIONES}/${nombre}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
      body: JSON.stringify(cuerpo || {}),
    })
    const j = await r.json().catch(() => ({}))
    return r.ok ? j : { error: j.error || 'El servidor no pudo completar la operación.' }
  } catch {
    return { error: MENSAJES.red }
  }
}
