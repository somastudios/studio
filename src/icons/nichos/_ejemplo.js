import { P } from '../../core/boil.js'

// Iconos de nicho de muestra. Retícula de 48. Cada icono es una lista de `partes`;
// una parte es un grupo de formas que puede moverse cuando el icono está vivo.
//
//   { f: [formas], anim: 'vapor', origen: [x, y], retardo: 0.3 }
//
// anim: flota | vapor | giro | vaiven | late | corta | parpadea | desliza | brinca
// origen: el punto alrededor del cual gira o crece la parte.

export default {
  // Una campana de servicio sobre su charola: la tapa se levanta apenas y sale el vapor.
  restaurante: {
    partes: [
      { f: [P.line(6, 37, 42, 37), P.line(16, 41.5, 32, 41.5)] },
      { f: [P.arc(24, 37, 14.5, 180, 360, 12), P.circle(24, 20.2, 2.3, 8)], anim: 'flota', origen: [24, 37] },
      { f: [P.curve(14, 19.5, 11.5, 17, 16.5, 14.5, 14, 11.5, 6)], anim: 'vapor', origen: [14, 15] },
      { f: [P.curve(24, 14, 21.5, 11.5, 26.5, 9, 24, 5.5, 6)], anim: 'vapor', origen: [24, 10], retardo: 0.35 },
      { f: [P.curve(34, 19.5, 31.5, 17, 36.5, 14.5, 34, 11.5, 6)], anim: 'vapor', origen: [34, 15], retardo: 0.7 },
    ],
  },

  // Una tienda genérica: toldo que respira, puerta y un punto que late en el aparador.
  general: {
    partes: [
      { f: [P.line(8, 24.4, 8, 40), P.line(40, 24.4, 40, 40), P.line(8, 40, 40, 40), P.line(13, 40, 13, 29.5), P.line(13, 29.5, 21, 29.5), P.line(21, 29.5, 21, 40)] },
      { f: [P.circle(31, 32.5, 2.8, 9)], anim: 'late', origen: [31, 32.5] },
      { f: [P.line(6, 12, 42, 12), P.line(6, 12, 5, 20), P.line(42, 12, 43, 20), P.arc(9.75, 20, 4.75, 0, 180, 6), P.arc(19.25, 20, 4.75, 0, 180, 6), P.arc(28.75, 20, 4.75, 0, 180, 6), P.arc(38.25, 20, 4.75, 0, 180, 6)], anim: 'flota', origen: [24, 16] },
    ],
  },
}
