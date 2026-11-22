import { P } from '../../core/boil.js'

// Iconos de las secciones del CRM. Misma retícula de 48 y mismo trazo que los de los giros.
// Cada uno tiene una parte que cobra vida cuando su sección está abierta.

const TAU = Math.PI * 2
const dientes = (cx, cy, r0, r1, n, giro = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = giro + (i / n) * TAU
    return P.line(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 2)
  })

export default {
  // Hoy: el sol que sale. Medio anillo sobre el horizonte, con sus rayos.
  'crm-hoy': {
    partes: [
      { f: [P.line(6, 35, 42, 35)] },
      { f: [P.arc(24, 35, 10.5, 180, 360, 9)], anim: 'flota', origen: [24, 35] },
      { f: [P.line(24, 13, 24, 18, 2), P.line(10.2, 21.2, 13.6, 24.6, 2), P.line(37.8, 21.2, 34.4, 24.6, 2)], anim: 'parpadea', origen: [24, 20] },
      { f: [P.line(15, 41, 33, 41)] },
    ],
  },

  // Prospectos: dos personas, una al frente.
  'crm-prospectos': {
    partes: [
      { f: [P.circle(32.5, 17, 5, 9), P.arc(32.5, 41, 11, 222, 300, 6)] },
      { f: [P.circle(18.5, 17.5, 6.5, 10), P.arc(18.5, 42, 12.5, 196, 344, 9)], anim: 'flota', origen: [18.5, 30] },
    ],
  },

  // Agenda: la hoja del calendario con un día marcado.
  'crm-agenda': {
    partes: [
      { f: [P.line(8, 12, 40, 12), P.line(40, 12, 40, 41), P.line(40, 41, 8, 41), P.line(8, 41, 8, 12), P.line(8, 20, 40, 20), P.line(16, 7, 16, 15, 2), P.line(32, 7, 32, 15, 2)] },
      { f: [P.circle(29.5, 31, 3.6, 8)], anim: 'late', origen: [29.5, 31] },
      { f: [P.line(14, 27, 20, 27, 2), P.line(14, 34, 20, 34, 2)] },
    ],
  },

  // Cobranza: una moneda con su signo.
  'crm-cobranza': {
    partes: [
      { f: [P.circle(24, 24, 16.5, 16)] },
      { f: [P.arc(24, 20.2, 4.2, -20, -270, 7), P.arc(24, 27.8, 4.2, -90, 160, 7), P.line(24, 12.5, 24, 16, 2), P.line(24, 32, 24, 35.5, 2)], anim: 'late', origen: [24, 24] },
    ],
  },

  // Sistemas: una pantalla con su pulso.
  'crm-sistemas': {
    partes: [
      { f: [P.line(6, 9, 42, 9), P.line(42, 9, 42, 33), P.line(42, 33, 6, 33), P.line(6, 33, 6, 9), P.line(24, 33, 24, 40, 2), P.line(15, 40, 33, 40)] },
      { f: [{ pts: [[11, 21], [18, 21], [21.5, 14.5], [26, 27.5], [29, 21], [37, 21]], closed: false }], anim: 'parpadea', origen: [24, 21] },
    ],
  },

  // Ajustes: un engrane que gira.
  'crm-ajustes': {
    partes: [{ f: [P.circle(24, 24, 5.2, 9), P.circle(24, 24, 12.2, 14), ...dientes(24, 24, 12.2, 17.2, 8, Math.PI / 8)], anim: 'giro', origen: [24, 24] }],
  },
}
