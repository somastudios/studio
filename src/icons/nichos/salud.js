import { P } from '../../core/boil.js'

// Salud. Retícula de 48, margen de 5.

export default {
  // Estetoscopio: la campana late.
  consultorio: {
    partes: [
      {
        f: [
          P.circle(11.5, 8.5, 1.3, 7),
          P.circle(25.5, 8.5, 1.3, 7),
          P.line(11.5, 10.5, 11.5, 20.5),
          P.line(25.5, 10.5, 25.5, 20.5),
          P.arc(18.5, 20.5, 7, 0, 180, 8),
          P.line(18.5, 27.5, 18.5, 32.5),
          P.arc(26, 32.5, 7.5, 180, 0, 8),
          P.line(33.5, 32.5, 33.5, 27.5),
        ],
      },
      { f: [P.circle(33.5, 22.5, 4.8, 10), P.circle(33.5, 22.5, 1.6, 7)], anim: 'late', origen: [33.5, 22.5] },
    ],
  },

  // Muela limpia: el destello parpadea.
  dentista: {
    partes: [
      {
        f: [
          P.curve(8, 19, 7, 9, 16, 8, 21, 12, 10),
          P.curve(21, 12, 26, 8, 35, 9, 34, 19, 10),
          P.curve(8, 19, 8.5, 28, 11, 35, 13.5, 41, 8),
          P.curve(34, 19, 33.5, 28, 31, 35, 28.5, 41, 8),
          P.curve(13.5, 41, 17.5, 41, 16, 30.5, 21, 30.5, 8),
          P.curve(28.5, 41, 24.5, 41, 26, 30.5, 21, 30.5, 8),
          P.arc(16.5, 18.5, 4.5, 185, 255, 4),
        ],
      },
      {
        f: [
          P.curve(39, 5, 39.4, 8, 40.3, 9.1, 43, 9.5, 5),
          P.curve(43, 9.5, 40.3, 9.9, 39.4, 11, 39, 14, 5),
          P.curve(39, 14, 38.6, 11, 37.7, 9.9, 35, 9.5, 5),
          P.curve(35, 9.5, 37.7, 9.1, 38.6, 8, 39, 5, 5),
        ],
        anim: 'parpadea',
        origen: [39, 9.5],
      },
    ],
  },

  // Huella que late, con el sello de clínica.
  veterinaria: {
    partes: [
      {
        f: [
          P.circle(9.5, 23, 3.3, 9),
          P.circle(16.5, 14.5, 3.7, 9),
          P.circle(26.5, 14.5, 3.7, 9),
          P.circle(33.5, 23, 3.3, 9),
          P.curve(12.5, 37, 11.5, 29, 17, 25, 21.5, 25, 8),
          P.curve(21.5, 25, 26, 25, 31.5, 29, 30.5, 37, 8),
          P.curve(12.5, 37, 13.5, 42, 18.5, 39.5, 21.5, 39.5, 7),
          P.curve(21.5, 39.5, 24.5, 39.5, 29.5, 42, 30.5, 37, 7),
        ],
        anim: 'late',
        origen: [21.5, 30],
      },
      { f: [P.circle(38.5, 9.5, 4.5, 10), P.line(38.5, 7.2, 38.5, 11.8), P.line(36.2, 9.5, 40.8, 9.5)] },
    ],
  },

  // Lentes de frente: el brillo del cristal parpadea.
  optica: {
    partes: [
      {
        f: [
          P.circle(14, 27, 8, 13),
          P.circle(34, 27, 8, 13),
          P.arc(24, 28.5, 3.4, 215, 325, 5),
          P.curve(6.3, 24.5, 5.5, 18, 7, 14, 11, 13, 7),
          P.curve(41.7, 24.5, 42.5, 18, 41, 14, 37, 13, 7),
        ],
      },
      { f: [P.line(11, 27, 15, 23)], anim: 'parpadea', origen: [13, 25], retardo: 0.7 },
      { f: [P.line(31, 27, 35, 23), P.line(34.5, 29.5, 37, 27)], anim: 'parpadea', origen: [34, 26] },
    ],
  },
}
