import { boil, P } from '../core/boil.js'

// Iconografía propia. Una sola regla: todo se construye con círculos, arcos,
// puntos y rectas (lo mismo que el logo), en una retícula de 24 y un único grosor.

const SW = 1.45
const AMP = 0.2

const SHAPES = {
  // una persona: cabeza y hombros
  clientes: [P.circle(12, 8, 3.4, 10), P.arc(12, 20.6, 7.4, 205, 335, 7)],
  // un timbre de mostrador
  atencion: [P.arc(12, 15.5, 7, 180, 360, 9), P.line(3.4, 18.6, 20.6, 18.6), P.circle(12, 5.6, 1.3, 8)],
  // una lista: punto y línea
  organizacion: [
    P.circle(4.8, 6.5, 1.15, 8),
    P.line(9.4, 6.5, 20.4, 6.5),
    P.circle(4.8, 12, 1.15, 8),
    P.line(9.4, 12, 17, 12),
    P.circle(4.8, 17.5, 1.15, 8),
    P.line(9.4, 17.5, 20.4, 17.5),
  ],
  // una caja con tapa
  inventarios: [
    P.line(3, 4.6, 21, 4.6),
    P.line(3, 9, 21, 9),
    P.line(3, 4.6, 3, 9),
    P.line(21, 4.6, 21, 9),
    P.line(5, 9, 5, 19.8),
    P.line(19, 9, 19, 19.8),
    P.line(5, 19.8, 19, 19.8),
    P.line(9.8, 13, 14.2, 13),
  ],
  // dos controles deslizantes
  administracion: [
    P.line(3, 7.2, 6.3, 7.2),
    P.circle(9, 7.2, 2.5, 9),
    P.line(11.7, 7.2, 21, 7.2),
    P.line(3, 16.8, 12.3, 16.8),
    P.circle(15, 16.8, 2.5, 9),
    P.line(17.7, 16.8, 21, 16.8),
  ],
  // origen, trayecto y destino
  logistica: [P.circle(5.6, 18, 2.4, 9), P.curve(7.8, 17, 13.4, 14.6, 10.6, 9.4, 16.2, 7), P.circle(18.4, 6, 2.4, 9)],
  // dos áreas que se traslapan
  comunicacion: [P.circle(8.8, 12, 5.6, 12), P.circle(15.2, 12, 5.6, 12)],
  // tres barras que crecen
  rentabilidad: [P.line(5.2, 20, 5.2, 14.6), P.line(12, 20, 12, 9.6), P.line(18.8, 20, 18.8, 7.6), P.circle(18.8, 4.2, 1.3, 8)],
}

export function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${boil(SHAPES[name], {
    amp: AMP,
    attrs: `stroke-width="${SW}"`,
  })}</svg>`
}

/** Glifo de alcance: el punto y 1, 2 o 3 anillos. */
export function scopeGlyph(level) {
  const rings = [P.circle(12, 12, 4.2, 9), P.circle(12, 12, 7.4, 11), P.circle(12, 12, 10.6, 13)].slice(0, level)
  return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1.5" fill="currentColor"/>${boil(rings, {
    amp: AMP,
    attrs: `stroke-width="${SW}"`,
  })}</svg>`
}

const ROT = { right: 0, down: 90, left: 180, up: 270 }

/**
 * Botón de anillo: el único botón de la presentación.
 * Un anillo con una flecha; al enfocarlo el anillo se llena desde el centro.
 */
export function ringBtn(label, { act = '', dir = 'right', cls = '', attrs = '', aria = '' } = {}) {
  return `<button type="button" class="rbtn ${cls}" ${act ? `data-act="${act}"` : ''} ${aria ? `aria-label="${aria}"` : ''} ${attrs}>
    <span class="rbtn-ring"><svg viewBox="0 0 48 48" aria-hidden="true">
      <circle class="rbtn-fill" cx="24" cy="24" r="21.6"/>
      ${boil(P.circle(24, 24, 21.6, 14), { amp: 0.45, attrs: 'stroke-width="1.5"' })}
      <g transform="rotate(${ROT[dir]} 24 24)"><g class="rbtn-arrow">${boil([P.line(15.5, 24, 32.5, 24), P.line(26, 17.5, 32.5, 24), P.line(26, 30.5, 32.5, 24)], {
        amp: 0.3,
        attrs: 'stroke-width="1.6"',
      })}</g></g>
    </svg></span>${label ? `<span class="rbtn-label t-name">${label}</span>` : ''}
  </button>`
}
