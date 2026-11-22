import { store } from '../data/store.js'
import { nicho as nichoPorId } from '../content/nichos/index.js'
import { vocab } from '../content/base.js'
import { SOL } from '../content/soluciones.js'
import { sesion } from '../app/sesion.js'

// El estado de una visita en curso. Todo lo que el cliente dice o elige se guarda al momento:
// si se cierra la pestaña a media visita, al volver a abrirla sigue donde iba.

export function crearEstado(visitaId) {
  const visita = store.uno('visitas', visitaId)
  if (!visita) return null
  const prospecto = store.uno('prospectos', visita.prospecto_id)
  if (!prospecto) return null
  const nicho = nichoPorId(prospecto.nicho)

  const E = {
    visita,
    prospecto,
    nicho,
    v: vocab(nicho),
    datos: { marcados: [], propios: [], ronda: {}, escena: 0, ...(visita.datos || {}) },
    get negocio() {
      return E.prospecto.negocio || 'su negocio'
    },
    get plural() {
      return prospecto.nicho_otro && nicho.id === 'general' ? 'negocios' : nicho.plural
    },
    presentadores: () => {
      const todos = store.ajuste('presentadores') || []
      const ids = visita.presentadores || []
      const van = todos.filter((p) => ids.includes(p.id))
      return van.length ? van : todos.slice(0, 1)
    },

    /** Un problema por su id: del giro, o uno propio que el cliente dijo con sus palabras. */
    problema(id) {
      return nicho.problemas.find((p) => p.id === id) || E.datos.propios.find((p) => p.id === id) || null
    },
    marcados: () => E.datos.marcados.map((id) => E.problema(id)).filter(Boolean),

    guardaDatos() {
      E.visita = store.guardar('visitas', { id: visita.id, datos: E.datos })
    },
    ponVisita(c) {
      E.visita = store.guardar('visitas', { id: visita.id, ...c })
    },
    ponProspecto(c) {
      E.prospecto = store.guardar('prospectos', { id: prospecto.id, ...c })
    },

    hallazgo(pid) {
      return store.lista('hallazgos', (h) => h.visita_id === visita.id && h.problema_id === pid)[0] || null
    },
    hallazgos: () => store.lista('hallazgos', { visita_id: visita.id }).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    ponHallazgo(pid, cambios = {}) {
      const p = E.problema(pid)
      const previo = E.hallazgo(pid)
      return store.guardar('hallazgos', {
        ...(previo ? { id: previo.id } : { prospecto_id: prospecto.id, visita_id: visita.id, problema_id: pid, area: p?.area || null, titulo: p?.titulo || '', matices: {}, etiquetas: [], rutas: [], estado: 'detectado', a_medida: !!p?.propio, orden: E.datos.marcados.indexOf(pid) }),
        ...cambios,
      })
    },
    quitaHallazgo(pid) {
      const h = E.hallazgo(pid)
      if (h) store.borrar('hallazgos', h.id)
    },

    /** Marca o desmarca un problema. Devuelve si quedó marcado. */
    alterna(pid) {
      const i = E.datos.marcados.indexOf(pid)
      if (i >= 0) {
        E.datos.marcados.splice(i, 1)
        E.quitaHallazgo(pid)
      } else {
        E.datos.marcados.push(pid)
        E.ponHallazgo(pid)
      }
      E.guardaDatos()
      return i < 0
    },
    agregaPropio(titulo) {
      const id = `propio-${Date.now().toString(36)}`
      E.datos.propios.push({ id, titulo, area: null, propio: true, senal: '', matices: [], rutas: [] })
      E.datos.marcados.push(id)
      E.ponHallazgo(id, { a_medida: true, titulo })
      E.guardaDatos()
      return id
    },

    /** Rutas de un problema ordenadas: primero las que encajan con lo que respondió. */
    rutas(p, respuestas = {}) {
      return (p.rutas || [])
        .map((r, i) => {
          let choca = null
          for (const [k, quiere] of Object.entries(r.pide || {})) {
            if (k in respuestas && respuestas[k] !== quiere) {
              const m = p.matices.find((x) => x.id === k)
              choca = m ? (respuestas[k] ? m.si : m.no) : 'su forma de operar'
            }
          }
          return { ...r, i, solucion: SOL[r.sol], choca }
        })
        .filter((r) => r.solucion)
        .sort((a, b) => !!a.choca - !!b.choca || a.i - b.i)
    },

    quien: () => sesion.nombre || E.presentadores()[0]?.nombre || '',
  }
  return E
}
