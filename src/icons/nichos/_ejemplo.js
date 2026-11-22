import { P } from '../../core/boil.js'

// Iconos de nicho de muestra. Retícula de 48. Cada icono es una lista de `partes`;
// una parte es un grupo de formas que puede moverse cuando el icono está vivo.
//
//   { f: [formas], anim: 'vapor', origen: [x, y], retardo: 0.3 }
//
// anim: flota | vapor | giro | vaiven | late | corta | parpadea | desliza | brinca
// origen: el punto alrededor del cual gira o crece la parte.

export default {
  // Un plato visto de frente, con cubiertos y vapor.
  restaurante: {
    partes: [
      { f: [P.arc(24, 30, 15, 180, 360, 12), P.line(7, 30, 41, 30), P.line(16, 36, 32, 36)] },
      { f: [P.curve(19, 22, 17, 19, 21, 17, 19, 13, 6)], anim: 'vapor', origen: [19, 18] },
      { f: [P.curve(25, 22, 23, 18, 27, 16, 25, 11, 6)], anim: 'vapor', origen: [25, 17], retardo: 0.35 },
      { f: [P.curve(31, 22, 29, 19, 33, 17, 31, 13, 6)], anim: 'vapor', origen: [31, 18], retardo: 0.7 },
    ],
  },

  // Una tienda genérica: toldo, puerta y un punto que late.
  general: {
    partes: [
      { f: [P.line(8, 20, 8, 40), P.line(40, 20, 40, 40), P.line(8, 40, 40, 40), P.line(20, 40, 20, 29), P.line(20, 29, 28, 29), P.line(28, 29, 28, 40)] },
      { f: [P.line(6, 12, 42, 12), P.line(6, 12, 5, 20), P.line(42, 12, 43, 20), P.arc(9.75, 20, 4.75, 0, 180, 6), P.arc(19.25, 20, 4.75, 0, 180, 6), P.arc(28.75, 20, 4.75, 0, 180, 6), P.arc(38.25, 20, 4.75, 0, 180, 6)], anim: 'flota', origen: [24, 16] },
    ],
  },
}
