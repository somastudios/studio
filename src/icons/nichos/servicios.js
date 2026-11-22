import { P } from '../../core/boil.js'

// Servicios. Retícula de 48, margen de 5.

// Gira una forma alrededor del origen y la lleva a [x, y]: sirve para dibujar
// una pieza "acostada" y colocarla en diagonal.
const coloca = (forma, grados, [x, y]) => {
  const a = (grados * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { ...forma, pts: forma.pts.map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]) }
}

// Llave española acostada: la boca en el origen, abierta hacia la derecha; el mango hacia la izquierda.
const LLAVE = [
  P.arc(0, 0, 10, 50, 162, 7),
  P.arc(0, 0, 10, 198, 310, 7),
  P.line(6.4, 7.7, 6.4, 3.9),
  P.line(6.4, -7.7, 6.4, -3.9),
  P.line(6.4, -3.9, -2.5, -3.9),
  P.line(6.4, 3.9, -2.5, 3.9),
  P.line(-2.5, -3.9, -2.5, 3.9),
  P.line(-9.5, -3.1, -27, -3.1),
  P.line(-9.5, 3.1, -27, 3.1),
  P.arc(-27, 0, 3.1, 90, 270, 5),
]
const BOCA = [31, 17]

export default {
  // Llave que aprieta una tuerca: se mece alrededor de ella.
  taller: {
    partes: [
      { f: LLAVE.map((f) => coloca(f, -45, BOCA)), anim: 'vaiven', origen: BOCA },
    ],
  },

  // Lavadora de carga frontal: la ropa gira en el tambor.
  lavanderia: {
    partes: [
      {
        f: [
          P.line(9, 6, 39, 6),
          P.line(39, 6, 39, 42),
          P.line(39, 42, 9, 42),
          P.line(9, 42, 9, 6),
          P.line(9, 14, 39, 14),
          P.circle(14, 10, 1.4, 7),
          P.line(28, 10, 34.5, 10),
          P.circle(24, 28, 9.5, 14),
        ],
      },
      {
        f: [P.curve(16, 28, 20, 23, 28, 33, 32, 28, 9), P.circle(27, 23.5, 1.1, 6)],
        anim: 'giro',
        origen: [24, 28],
      },
    ],
  },

  // Auto de perfil, con burbujas de jabón que suben.
  autolavado: {
    partes: [
      {
        f: [
          P.line(13, 27, 17, 19.5),
          P.line(17, 19.5, 29, 19.5),
          P.line(29, 19.5, 34.5, 27),
          P.line(8, 27, 40, 27),
          P.curve(8, 27, 5, 27.5, 5, 32, 5.5, 36, 6),
          P.curve(40, 27, 43, 28, 43, 32, 42.5, 36, 6),
          P.line(5.5, 36, 10.5, 36),
          P.line(19.5, 36, 28.5, 36),
          P.line(37.5, 36, 42.5, 36),
          P.circle(15, 36, 4.2, 10),
          P.circle(33, 36, 4.2, 10),
        ],
      },
      { f: [P.circle(13, 12, 2.7, 9)], anim: 'vapor', origen: [13, 12] },
      { f: [P.circle(24, 9.5, 3.4, 10)], anim: 'vapor', origen: [24, 9.5], retardo: 0.45 },
      { f: [P.circle(34, 12.5, 2.3, 9)], anim: 'vapor', origen: [34, 12.5], retardo: 0.9 },
    ],
  },

  // Un documento que se firma: la pluma se desliza sobre la línea.
  despacho: {
    partes: [
      {
        f: [
          P.line(9, 6, 26, 6),
          P.line(26, 6, 33, 13),
          P.line(33, 13, 33, 22),
          P.line(33, 36, 33, 42),
          P.line(33, 42, 9, 42),
          P.line(9, 42, 9, 6),
          P.line(14, 15, 22, 15),
          P.line(14, 21, 27, 21),
          P.line(14, 27, 24, 27),
          P.curve(14, 36, 16, 32, 18, 39, 20, 35.5, 7),
          P.line(20, 35.5, 24.5, 35.5),
        ],
      },
      {
        f: [
          P.line(26, 31.5, 37.5, 20),
          P.line(29, 34.5, 40.5, 23),
          P.line(37.5, 20, 40.5, 23),
          P.line(26, 31.5, 25, 35.5),
          P.line(29, 34.5, 25, 35.5),
        ],
        anim: 'desliza',
        origen: [25, 35.5],
      },
    ],
  },

  // Casa con la llave colgada: la llave se mece.
  inmobiliaria: {
    partes: [
      {
        f: [
          P.line(24, 7, 5.5, 23),
          P.line(24, 7, 42.5, 23),
          P.line(10, 19.5, 10, 41),
          P.line(38, 19.5, 38, 41),
          P.line(10, 41, 38, 41),
        ],
      },
      {
        f: [P.circle(24, 22.5, 3.6, 9), P.line(24, 26.1, 24, 36.5), P.line(24, 32.5, 27.5, 32.5), P.line(24, 36.5, 28.5, 36.5)],
        anim: 'vaiven',
        origen: [24, 18.9],
      },
    ],
  },
}
