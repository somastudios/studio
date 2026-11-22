import { boil, P } from '../core/boil.js'
import { PROCESO } from './proceso.js'

// Dos familias de iconos, las dos con el mismo trazo que hierve:
//
// · Proceso — retícula de 24. Pequeños, estáticos. Ilustran los pasos de una solución.
// · Nicho   — retícula de 48. Más grandes y con partes que se mueven cuando el icono está "vivo"
//             (al pasar el cursor o al elegirlo): el vapor de una taza, la tijera que corta.

const nichoMods = import.meta.glob('./nichos/*.js', { eager: true })
export const NICHO_ICO = Object.assign({}, ...Object.values(nichoMods).map((m) => m.default || {}))

const RESPALDO_PROCESO = [P.circle(12, 12, 8, 12)]
const RESPALDO_NICHO = { partes: [{ f: [P.circle(24, 24, 15, 16)] }, { f: [P.circle(24, 24, 4, 9)], anim: 'late', origen: [24, 24] }] }

/** Icono de proceso (24×24). */
export function icoProceso(clave, cls = '') {
  return `<svg class="ico ico-p ${cls}" viewBox="0 0 24 24" aria-hidden="true">${boil(PROCESO[clave] || RESPALDO_PROCESO, { amp: 0.2, attrs: 'stroke-width="1.45"' })}</svg>`
}

/**
 * Icono de nicho (48×48). Cada parte es un grupo; si trae `anim`, se anima cuando un
 * ancestro tiene la clase `.vivo`. Animaciones: flota, vapor, giro, vaiven, late, corta,
 * parpadea, desliza, brinca.
 */
export function icoNicho(id, cls = '') {
  const def = NICHO_ICO[id] || RESPALDO_NICHO
  const partes = def.partes
    .map((p) => {
      const o = p.origen || [24, 24]
      const estilo = `transform-origin:${o[0]}px ${o[1]}px;${p.retardo ? `animation-delay:${p.retardo}s;` : ''}`
      return `<g class="ico-parte ${p.anim ? 'an-' + p.anim : ''}" style="${estilo}">${boil(p.f, { amp: p.amp ?? 0.36, attrs: `stroke-width="${p.grosor ?? 2.1}"` })}</g>`
    })
    .join('')
  return `<svg class="ico ico-n ${cls}" viewBox="0 0 48 48" aria-hidden="true">${partes}</svg>`
}

export const hayIconoNicho = (id) => !!NICHO_ICO[id]
export const hayIconoProceso = (clave) => !!PROCESO[clave]
