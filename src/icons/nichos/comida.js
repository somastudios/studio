import { P } from '../../core/boil.js'

// Iconos de nicho · comida. Retícula de 48, margen de 5.

const rad = (g) => (g * Math.PI) / 180

// Gira una forma `g` grados alrededor de (cx, cy).
const gira = (forma, g, cx, cy) => {
  const c = Math.cos(rad(g))
  const s = Math.sin(rad(g))
  return { ...forma, pts: forma.pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]) }
}

// Una fila de ondas apoyadas sobre un círculo de radio `r`: cada onda es un arco pequeño
// cuyos extremos tocan el círculo. `medios` es el medio ángulo que ocupa cada onda.
const ondas = (medios, desde, cx, cy, r) => {
  let a = desde
  return medios.map((m) => {
    const g = a + m
    a += 2 * m
    const R = r * Math.cos(rad(m))
    return P.arc(cx + Math.cos(rad(g)) * R, cy + Math.sin(rad(g)) * R, r * Math.sin(rad(m)), g - 90, g + 90, 5)
  })
}

// El taco: la tortilla doblada es un medio círculo; el relleno asoma por el borde curvo.
const taco = [
  P.arc(24, 38, 14.5, 180, 360, 12),
  P.curve(9.5, 38, 16, 40.4, 32, 40.4, 38.5, 38, 6),
  ...ondas([16, 22, 18, 24], 190, 24, 38, 14.5),
  P.circle(18.5, 32.5, 1.1, 6),
  P.circle(25, 29, 1.1, 6),
  P.circle(30, 33.5, 1.1, 6),
].map((f) => gira(f, -8, 24, 32))

export default {
  // Un taco de perfil, con su relleno, y la lumbre del asador que parpadea.
  taqueria: {
    partes: [
      { f: taco },
      {
        f: [P.curve(11.2, 17.4, 5, 14.7, 9.9, 10.3, 10.3, 5.5, 8), P.curve(11.2, 17.4, 17.3, 15.6, 15.6, 10.8, 13.8, 9, 8), P.curve(13.8, 9, 13.4, 10.8, 11.6, 10.3, 10.3, 5.5, 5)],
        anim: 'parpadea',
        origen: [11.2, 17.4],
      },
    ],
  },

  // Una taza con asa sobre su plato, y el vapor del café.
  cafeteria: {
    partes: [
      {
        f: [
          P.line(10, 19, 34, 19),
          P.curve(10, 19, 11, 40.5, 33, 40.5, 34, 19, 12),
          P.arc(35, 25, 5, -72, 118, 7),
          P.curve(7, 38.5, 13, 42.6, 31, 42.6, 37, 38.5, 7),
        ],
      },
      { f: [P.curve(17.5, 14.5, 15, 12, 20, 9.5, 17.5, 6.5, 6)], anim: 'vapor', origen: [17.5, 10] },
      { f: [P.curve(26.5, 14.5, 24, 11.5, 29, 9, 26.5, 5.5, 6)], anim: 'vapor', origen: [26.5, 10], retardo: 0.6 },
    ],
  },

  // Una copa de coctel con su aceituna; las burbujas suben y se van.
  bar: {
    partes: [
      {
        f: [
          P.line(9, 14.5, 39, 14.5),
          P.line(9, 14.5, 24, 30.5),
          P.line(39, 14.5, 24, 30.5),
          P.line(24, 30.5, 24, 41.5),
          P.line(16, 42, 32, 42),
        ],
      },
      { f: [P.line(34.5, 7, 24.4, 21.6), P.circle(23, 23.6, 2.4, 8)] },
      { f: [P.circle(13, 10, 1.5, 7)], anim: 'vapor', origen: [13, 10] },
      { f: [P.circle(18.5, 6.5, 1.1, 6)], anim: 'vapor', origen: [18.5, 6.5], retardo: 0.7 },
      { f: [P.circle(24.5, 10.2, 1.2, 6)], anim: 'vapor', origen: [24.5, 10.2], retardo: 1.2 },
    ],
  },

  // Una concha recién salida del horno: el pan redondo con sus surcos, y el vapor.
  panaderia: {
    partes: [
      {
        f: [
          P.curve(7, 35, 7, 12, 41, 12, 41, 35, 14),
          P.curve(7, 35, 9, 41.5, 39, 41.5, 41, 35, 8),
          P.curve(13, 22.5, 17, 24, 20, 28.5, 20.5, 34.5, 6),
          P.curve(19.5, 18.8, 24.5, 21, 28, 27, 28.5, 35, 6),
          P.curve(27.5, 18.2, 32, 20.5, 35.5, 26, 36, 33.5, 6),
        ],
      },
      { f: [P.curve(19, 13, 16.5, 10.8, 21.5, 8.8, 19, 6, 6)], anim: 'vapor', origen: [19, 10] },
      { f: [P.curve(29, 13, 26.5, 10.4, 31.5, 8.2, 29, 5.5, 6)], anim: 'vapor', origen: [29, 10], retardo: 0.6 },
    ],
  },
}
