import { P } from '../../core/boil.js'

// Cuidado personal. Retícula de 48, margen de 5.

export default {
  // Tijeras y peine. Una hoja de la tijera corta.
  barberia: {
    partes: [
      { f: [P.line(10.1, 6.2, 24.3, 32.5), P.circle(26.5, 36.5, 4.6, 10)] },
      { f: [P.line(27.9, 6.2, 13.7, 32.5), P.circle(11.5, 36.5, 4.6, 10)], anim: 'corta', origen: [19, 23] },
      { f: [P.circle(19, 23, 1.1, 6)] },
      {
        f: [
          P.line(41.5, 8, 41.5, 38),
          P.line(36, 10, 41.5, 10),
          P.line(36, 15.2, 41.5, 15.2),
          P.line(36, 20.4, 41.5, 20.4),
          P.line(36, 25.6, 41.5, 25.6),
          P.line(36, 30.8, 41.5, 30.8),
          P.line(36, 36, 41.5, 36),
        ],
      },
    ],
  },

  // Secadora de perfil: el aire sale y se desliza.
  salon: {
    partes: [
      {
        f: [
          P.circle(15.5, 18, 8.5, 13),
          P.circle(15.5, 18, 3, 8),
          P.line(23, 13.5, 30, 11.5),
          P.line(23, 22.5, 30, 24.5),
          P.line(30, 11.5, 30, 24.5),
          P.line(11.5, 25.8, 13.5, 40),
          P.line(19.5, 25.8, 20.5, 40),
          P.line(13.5, 40, 20.5, 40),
        ],
      },
      { f: [P.line(34, 12.5, 40, 11.5)], anim: 'desliza', origen: [37, 12] },
      { f: [P.line(34, 18, 41, 18)], anim: 'desliza', origen: [37, 18], retardo: 0.25 },
      { f: [P.line(34, 23.5, 40, 24.5)], anim: 'desliza', origen: [37, 24], retardo: 0.5 },
    ],
  },

  // Flor de loto que flota sobre el agua.
  spa: {
    partes: [
      {
        f: [
          P.curve(24, 37, 16, 30, 16, 19, 24, 10),
          P.curve(24, 37, 32, 30, 32, 19, 24, 10),
          P.curve(24, 37, 14, 34, 9, 26, 11, 17, 9),
          P.curve(11, 17, 15, 19, 17, 21.5, 18, 24.2, 6),
          P.curve(24, 37, 34, 34, 39, 26, 37, 17, 9),
          P.curve(37, 17, 33, 19, 31, 21.5, 30, 24.2, 6),
          P.curve(24, 37, 17, 38.5, 9, 35, 5.5, 27, 9),
          P.curve(5.5, 27, 8, 27, 11, 28, 13, 29.3, 5),
          P.curve(24, 37, 31, 38.5, 39, 35, 42.5, 27, 9),
          P.curve(42.5, 27, 40, 27, 37, 28, 35, 29.3, 5),
        ],
        anim: 'flota',
        origen: [24, 28],
      },
      { f: [P.line(14, 42, 34, 42)] },
    ],
  },

  // Mancuerna que brinca sobre el piso.
  gimnasio: {
    partes: [
      {
        f: [
          P.line(17, 23, 31, 23),
          P.line(12, 13, 17, 13),
          P.line(17, 13, 17, 33),
          P.line(17, 33, 12, 33),
          P.line(12, 13, 12, 33),
          P.line(7, 17, 12, 17),
          P.line(7, 17, 7, 29),
          P.line(7, 29, 12, 29),
          P.line(36, 13, 31, 13),
          P.line(31, 13, 31, 33),
          P.line(31, 33, 36, 33),
          P.line(36, 13, 36, 33),
          P.line(41, 17, 36, 17),
          P.line(41, 17, 41, 29),
          P.line(41, 29, 36, 29),
        ],
        anim: 'brinca',
        origen: [24, 23],
      },
      { f: [P.line(15, 41, 33, 41)] },
    ],
  },
}
