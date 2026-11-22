import { P } from '../../core/boil.js'

// Iconos de nicho · tiendas. Retícula de 48, margen de 5.

// Gira una forma `g` grados alrededor de (cx, cy). Sirve para dibujar una herramienta
// derecha y dejarla en su postura de reposo; la animación la lleva a la otra postura.
const gira = (forma, g, cx, cy) => {
  const a = (g * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { ...forma, pts: forma.pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]) }
}

// Martillo de uña: dibujado en el momento del golpe (mango horizontal) y levantado 16° desde el puño.
const PUNO = [42, 25]
const martillo = [
  P.line(19, 23, 41, 23),
  P.line(19, 27, 41, 27),
  P.arc(41, 25, 2, -90, 90, 4),
  P.line(11.5, 34, 19.5, 34),
  P.line(12, 34, 12, 20),
  P.line(19, 34, 19, 27),
  P.curve(12, 20, 12, 13, 18, 10.5, 24.5, 13.5, 8),
  P.curve(19, 23, 19, 18.5, 21, 15.5, 24.5, 13.5, 6),
].map((f) => gira(f, 16, ...PUNO))

// Hacha de carnicero: igual, dibujada al caer y levantada 16° desde el final del mango.
const MANGO = [42, 18.5]
const hacha = [
  P.line(9, 15, 31, 15),
  P.line(31, 15, 31, 30),
  P.line(31, 30, 9, 30),
  P.line(9, 30, 9, 15),
  P.circle(13.8, 19.6, 1.7, 7),
  P.line(31, 16.6, 41, 16.6),
  P.line(31, 20.4, 41, 20.4),
  P.arc(41, 18.5, 1.9, -90, 90, 4),
].map((f) => gira(f, 16, ...MANGO))

// Lápiz: dibujado de pie con la punta en (15, 37) y recostado 45°.
const PUNTA = [15, 37]
const lapiz = [
  P.line(15, 37, 11.5, 30),
  P.line(15, 37, 18.5, 30),
  P.line(11.5, 30, 18.5, 30),
  P.line(11.5, 30, 11.5, 2),
  P.line(18.5, 30, 18.5, 2),
  P.line(11.5, 2, 18.5, 2),
  P.line(11.5, 7, 18.5, 7),
].map((f) => gira(f, 45, ...PUNTA))

// Cápsula: dos mitades y su unión, recostada 45°.
const CAP = [37, 37]
const capsula = [
  P.curve(37, 33.7, 27.7, 33.7, 27.7, 40.3, 37, 40.3, 9),
  P.curve(37, 33.7, 46.3, 33.7, 46.3, 40.3, 37, 40.3, 9),
  P.line(37, 33.7, 37, 40.3),
].map((f) => gira(f, -45, ...CAP))

export default {
  // Una canasta de mandado; lo que lleva dentro brinca.
  abarrotes: {
    partes: [
      {
        f: [
          P.curve(10, 25, 10, 1, 38, 1, 38, 25, 12),
          P.line(6, 25, 42, 25),
          P.line(9, 25, 12.5, 41.5),
          P.line(39, 25, 35.5, 41.5),
          P.line(12.5, 41.5, 35.5, 41.5),
          P.line(18.4, 29, 19.2, 37.5),
          P.line(24, 29, 24, 37.5),
          P.line(29.6, 29, 28.8, 37.5),
        ],
      },
      { f: [P.circle(17.5, 20.8, 3.7, 10)], anim: 'brinca', origen: [17.5, 20.8] },
      {
        f: [P.line(24.5, 25, 24.5, 17.5), P.line(31.5, 25, 31.5, 17.5), P.line(24.5, 17.5, 31.5, 17.5), P.line(24.5, 17.5, 28, 13.5), P.line(31.5, 17.5, 28, 13.5)],
        anim: 'brinca',
        origen: [28, 20],
        retardo: 0.3,
      },
    ],
  },

  // Una playera colgada de su gancho: se mece en el tubo.
  ropa: {
    partes: [
      { f: [P.line(11, 5.6, 37, 5.6)] },
      {
        f: [
          P.arc(24, 8.6, 3, 170, 450, 8),
          P.line(24, 11.6, 24, 15.5),
          P.arc(24, 15.5, 4.5, 0, 180, 6),
          P.line(19.5, 15.5, 7, 24.5),
          P.line(28.5, 15.5, 41, 24.5),
          P.line(7, 24.5, 12, 29.5),
          P.line(41, 24.5, 36, 29.5),
          P.line(12, 29.5, 15.5, 26.5),
          P.line(36, 29.5, 32.5, 26.5),
          P.line(15.5, 26.5, 15.5, 42),
          P.line(32.5, 26.5, 32.5, 42),
          P.line(15.5, 42, 32.5, 42),
        ],
        anim: 'vaiven',
        origen: [24, 5.6],
      },
    ],
  },

  // Un martillo que clava.
  ferreteria: {
    partes: [
      { f: [P.line(11.5, 35.6, 19.5, 35.6), P.line(15.5, 35.6, 15.5, 42.5), P.line(6, 42.5, 28, 42.5)] },
      { f: martillo, anim: 'corta', origen: PUNO },
    ],
  },

  // La cruz de la farmacia, que late, y una pastilla.
  farmacia: {
    partes: [
      {
        f: [
          P.line(17, 7, 27, 7),
          P.line(27, 7, 27, 17),
          P.line(27, 17, 37, 17),
          P.line(37, 17, 37, 27),
          P.line(37, 27, 27, 27),
          P.line(27, 27, 27, 37),
          P.line(27, 37, 17, 37),
          P.line(17, 37, 17, 27),
          P.line(17, 27, 7, 27),
          P.line(7, 27, 7, 17),
          P.line(7, 17, 17, 17),
          P.line(17, 17, 17, 7),
        ],
        anim: 'late',
        origen: [22, 22],
      },
      { f: capsula },
    ],
  },

  // El hacha de carnicero cae sobre el corte.
  carniceria: {
    partes: [
      { f: [P.curve(7.5, 38, 6.5, 30.5, 17, 30.5, 20, 33.5, 8), P.curve(20, 33.5, 23, 36.5, 31.5, 31.5, 32.5, 37, 8), P.curve(32.5, 37, 33.5, 43.8, 8, 44.2, 7.5, 38, 10), P.circle(13, 36.8, 1.8, 7)] },
      { f: hacha, anim: 'corta', origen: MANGO },
    ],
  },

  // Un lápiz que escribe.
  papeleria: {
    partes: [
      { f: [P.curve(6, 39.5, 9.5, 36.5, 12, 42.5, 15.5, 39.5, 6), P.curve(15.5, 39.5, 19, 36.5, 21.5, 42.5, 25, 39.5, 6)] },
      { f: lapiz, anim: 'desliza', origen: PUNTA },
    ],
  },
}
