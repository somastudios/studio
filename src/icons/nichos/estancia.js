import { P } from '../../core/boil.js'

// Estancia. Retícula de 48, margen de 5.

export default {
  // Una cama y, arriba, la luna que flota.
  hotel: {
    partes: [
      {
        f: [
          P.line(7, 20, 7, 41),
          P.line(7, 36, 41, 36),
          P.line(41, 36, 41, 41),
          P.circle(13.5, 30.5, 3.3, 9),
          P.line(19.5, 36, 19.5, 28),
          P.line(19.5, 28, 36, 28),
          P.curve(36, 28, 40, 28, 41, 31, 41, 36, 6),
        ],
      },
      {
        f: [P.arc(31, 13, 6.5, 50, 290, 10), P.curve(33.22, 6.89, 30, 10, 30.5, 15.5, 35.18, 17.98, 7)],
        anim: 'flota',
        origen: [31, 13],
      },
      { f: [P.circle(17, 9, 0.9, 6)], anim: 'parpadea', origen: [17, 9] },
      { f: [P.circle(21.5, 16.5, 0.8, 6)], anim: 'parpadea', origen: [21.5, 16.5], retardo: 0.7 },
    ],
  },

  // Tres globos, cada uno con su hilo, que flotan a destiempo.
  eventos: {
    partes: [
      {
        f: [P.circle(12.5, 20, 6.5, 11), P.arc(12.5, 20, 3.5, 190, 250, 4), P.curve(12.5, 26.5, 10, 30, 15.5, 33.5, 13, 38.5, 7)],
        anim: 'flota',
        origen: [12.5, 20],
        retardo: 0.5,
      },
      {
        f: [P.circle(25, 13, 7.5, 12), P.arc(25, 13, 4.2, 190, 250, 4), P.curve(25, 20.5, 22, 26, 28, 34, 25, 42, 8)],
        anim: 'flota',
        origen: [25, 13],
      },
      {
        f: [P.circle(37, 21, 5.8, 11), P.arc(37, 21, 3, 190, 250, 4), P.curve(37, 26.8, 39.5, 30, 34.5, 33, 36.5, 38, 7)],
        anim: 'flota',
        origen: [37, 21],
        retardo: 1,
      },
    ],
  },

  // Birrete: la borla se mece.
  escuela: {
    partes: [
      {
        f: [
          P.line(24, 10.5, 43, 19),
          P.line(43, 19, 24, 27.5),
          P.line(24, 27.5, 5, 19),
          P.line(5, 19, 24, 10.5),
          P.line(13, 23.2, 13, 32.5),
          P.curve(13, 32.5, 17, 39, 31, 39, 35, 32.5, 9),
          P.line(35, 23.2, 35, 32.5),
        ],
      },
      { f: [P.line(39.5, 21, 39.5, 33), P.circle(39.5, 35, 1.9, 7)], anim: 'vaiven', origen: [39.5, 21] },
    ],
  },
}
