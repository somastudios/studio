import { P } from '../core/boil.js'

// Iconos de proceso. Retícula de 24, un solo grosor, construidos con círculos, arcos,
// puntos y rectas: lo mismo que el logo. Cada clave es una lista de formas.
//
//   P.circle(cx, cy, r, n)                       círculo cerrado
//   P.arc(cx, cy, r, grados0, grados1, n)        arco (0° = derecha, -90° = arriba)
//   P.line(x1, y1, x2, y2, n)                    recta
//   P.curve(x0,y0, x1,y1, x2,y2, x3,y3, n)       curva de Bézier

export const PROCESO = {
  check: [P.circle(12, 12, 9, 12), P.line(7.8, 12.4, 10.8, 15.2), P.line(10.8, 15.2, 16.4, 9)],
  telefono: [P.line(7.5, 3, 16.5, 3), P.line(16.5, 3, 16.5, 21), P.line(16.5, 21, 7.5, 21), P.line(7.5, 21, 7.5, 3), P.line(10.6, 18, 13.4, 18)],
  mensaje: [P.line(3.5, 5, 20.5, 5), P.line(20.5, 5, 20.5, 16), P.line(20.5, 16, 11, 16), P.line(11, 16, 7, 20), P.line(7, 20, 7, 16), P.line(7, 16, 3.5, 16), P.line(3.5, 16, 3.5, 5)],
}
