// Pixel art animado, sin imágenes: cada escena se compone en una cuadrícula de letras y sale
// como un SVG de bordes duros. Los cuadros se alternan con CSS (como el trazo que hierve), así
// que animar no cuesta nada por cuadro y un repintado no las reinicia si el HTML no cambió.
//
// Cada letra es un color (ver .px-* en hoy.css): k tinta · p papel · w blanco · d gris oscuro
// y amarillo · o oro viejo · r rojo · b azul · g verde · s sombra de la ficha · v vidrio.

const W = 20
const H = 20

const lienzo = () => Array.from({ length: H }, () => Array(W).fill('.'))
const punto = (L, x, y, c) => {
  x = Math.round(x)
  y = Math.round(y)
  if (c !== '.' && y >= 0 && y < H && x >= 0 && x < W) L[y][x] = c
}
/** Estampa un dibujo (lista de renglones) con su esquina en x, y. El punto es transparente. */
const pon = (L, dibujo, x, y) => dibujo.forEach((fila, j) => [...fila].forEach((c, i) => punto(L, x + i, y + j, c)))
const raya = (L, x0, x1, y, c) => {
  for (let x = x0; x <= x1; x++) punto(L, x, y, c)
}

/**
 * Gira un lienzo alrededor de un centro. Cada pixel nuevo mira nueve puntos del original y se
 * queda con el color que más se repite: así los contornos de un pixel sobreviven al giro.
 */
function gira(L, grados, cx = 9.5, cy = 9.5) {
  const a = (-grados * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  const N = lienzo()
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const votos = {}
      for (const dy of [-0.33, 0, 0.33])
        for (const dx of [-0.33, 0, 0.33]) {
          const sx = Math.round(cx + (x + dx - cx) * cos - (y + dy - cy) * sin)
          const sy = Math.round(cy + (x + dx - cx) * sin + (y + dy - cy) * cos)
          const c = sy >= 0 && sy < H && sx >= 0 && sx < W ? L[sy][sx] : '.'
          votos[c] = (votos[c] || 0) + (c === 'k' ? 1.6 : 1)
        }
      N[y][x] = Object.keys(votos).sort((p, q) => votos[q] - votos[p])[0]
    }
  return N
}

/** Un cuadro, como trazos: uno por color, hechos de tiras horizontales. */
function trazos(L) {
  const porColor = {}
  for (let y = 0; y < H; y++) {
    let x = 0
    while (x < W) {
      const c = L[y][x]
      if (c === '.') {
        x++
        continue
      }
      let n = 1
      while (x + n < W && L[y][x + n] === c) n++
      porColor[c] = (porColor[c] || '') + `M${x} ${y}h${n}v1h-${n}z`
      x += n
    }
  }
  return Object.keys(porColor)
    .sort()
    .map((c) => `<path class="px-${c}" d="${porColor[c]}"/>`)
    .join('')
}

/** Arma la película: los cuadros distintos se dibujan una vez y cada turno apunta al suyo. */
function pelicula(id, cuadros, fps) {
  const dibujos = cuadros.map(trazos)
  const unicos = [...new Set(dibujos)]
  const n = cuadros.length
  const T = n / fps
  const corte = (100 / n).toFixed(3)
  const turnos = dibujos.map((d, i) => `<use href="#px-${id}-${unicos.indexOf(d)}" style="animation:px-${id} ${T.toFixed(3)}s steps(1) ${(-(T - i / fps)).toFixed(3)}s infinite"/>`).join('')
  return `<svg class="px" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" aria-hidden="true"><style>@keyframes px-${id}{0%{visibility:visible}${corte}%,to{visibility:hidden}}</style><defs>${unicos.map((d, i) => `<g id="px-${id}-${i}">${d}</g>`).join('')}</defs>${turnos}</svg>`
}

// ───────────────────────── Prospectos: en camino ─────────────────────────
// Una moto rumbo a la siguiente visita. El camino pasa, las ruedas giran, el escape humea.

const MOTO = [
  '..........kkkk......',
  '.........kyyyyk.....',
  '.........kywwwk.....',
  '......kkkkyyyyk.....',
  '....kkppppkkkk.kk...',
  '...kppppppppkkkwwk..',
  'kkkkkkkpppkrrrrkwk..',
  '.krrrrkkpprrrrrrrkk.',
  '..kkkkrrpkrrrrrrrrk.',
  '......kkrrrrrrrkkk..',
  '.......kdddddkk.....',
  '.......kkddddk......',
]
// Las ruedas: dos posiciones de los rayos, para que giren.
const RUEDA = [
  ['..kkk..', '.kdddk.', 'kdwdwdk', 'kddkddk', 'kdwdwdk', '.kdddk.', '..kkk..'],
  ['..kkk..', '.kdwdk.', 'kdddddk', 'kwdkdwk', 'kdddddk', '.kdwdk.', '..kkk..'],
]

function escenaMoto() {
  const cuadros = []
  for (let f = 0; f < 8; f++) {
    const L = lienzo()
    const bote = f % 4 === 1 ? -1 : 0
    // El camino: una línea y sus rayas, que corren hacia atrás.
    raya(L, 0, W - 1, 18, 'k')
    for (let x = -8; x < W + 8; x += 6) raya(L, x - ((f * 3) % 6), x + 2 - ((f * 3) % 6), 19, 's')
    // Líneas de velocidad.
    const v1 = 21 - ((f * 5) % 28)
    raya(L, v1, v1 + 3, 0, 'w')
    const v2 = 26 - (((f + 3) * 5) % 34)
    raya(L, Math.min(v2, 2), Math.min(v2 + 2, 4), 5, 'w')
    // Humo del escape: nace junto a la rueda trasera, sube y se deshace.
    const edad = f % 4
    // (queda detrás de la moto: se dibuja antes)
    if (edad === 1) pon(L, ['w'], 0, 8)
    else if (edad === 2) pon(L, ['ww', 'ww'], 0, 6)
    else if (edad === 3) pon(L, ['w.', '.w'], 0, 4)
    pon(L, MOTO, 0, 2 + bote)
    pon(L, RUEDA[f % 2], 0, 11)
    pon(L, RUEDA[(f + 1) % 2], 13, 11)
    cuadros.push(L)
  }
  return pelicula('moto', cuadros, 10)
}

// ───────────────────────── Clientes: la tienda abierta ─────────────────────────
// Un local con su toldo. La luz del escaparate vive y cada tanto sale un corazón.

const TIENDA = [
  '......kkkkkkkk......',
  '.....kkwwwwwwkk.....',
  '.kkkkkkkkkkkkkkkkkk.',
  'krrwwrrwwrrwwrrwwrrk',
  'krrwwrrwwrrwwrrwwrrk',
  'kkrwwkkrwwkkrwwkkrwk',
  '.kkkk..kkk..kkk..kk.',
  '.kppppppppppppppppk.',
  '.kpkkkkkkppkkkkkkpk.',
  '.kpkbbbbkppkddddkpk.',
  '.kpkbbbbkppkddddkpk.',
  '.kpkbbbbkppkddydkpk.',
  '.kpkkkkkkppkddddkpk.',
  '.kpppppppppkddddkpk.',
  'kkkkkkkkkkkkkkkkkkkk',
]
const CORAZON = [
  ['r'],
  ['r.r', 'rrr', '.r.'],
  ['.r.r.', 'rwrrr', 'rrrrr', '.rrr.', '..r..'],
]

function escenaTienda() {
  const cuadros = []
  for (let f = 0; f < 16; f++) {
    const L = lienzo()
    pon(L, TIENDA, 0, 5)
    // El letrero se enciende y se apaga.
    if (f % 8 < 4) raya(L, 7, 12, 6, 'y')
    // El brillo recorre el escaparate.
    const b = f % 8
    if (b < 4) {
      punto(L, 4 + b, 14, 'w')
      punto(L, 4 + b, 15, 'w')
      if (b > 0) punto(L, 3 + b, 16, 'w')
    }
    // La puerta se abre cuando alguien sale contento.
    if (f >= 8 && f < 13) pon(L, ['yyyy', 'yyyy', 'yyyy', 'yyyy', 'yyyy'], 12, 14)
    // El corazón sube desde la puerta y se va haciendo chico.
    if (f >= 9) {
      const t = f - 9
      const paso = [[0, 16, 4], [1, 15, 3], [2, 14, 1], [2, 14, 0], [2, 14, 0], [1, 15, 0], [0, 16, 0]][t]
      pon(L, CORAZON[paso[0]], paso[1], paso[2])
    }
    cuadros.push(L)
  }
  return pelicula('tienda', cuadros, 7)
}

// ───────────────────────── Cobrado: la moneda ─────────────────────────
// Gira y rebota. Cuando llega arriba, destella.

function moneda(L, cx, cy, a) {
  const R = 6
  for (let j = -R; j <= R; j++) {
    const ancho = a < 1.5 ? (Math.abs(j) < R ? 1 : 0) : Math.round(a * Math.sqrt(Math.max(0, 1 - (j * j) / ((R + 0.45) * (R + 0.45)))))
    if (a < 1.5) {
      if (Math.abs(j) > R - 1) {
        punto(L, cx, cy + j, 'k')
        continue
      }
      punto(L, cx - 1, cy + j, 'k')
      punto(L, cx, cy + j, 'o')
      punto(L, cx + 1, cy + j, 'k')
      continue
    }
    for (let i = -ancho; i <= ancho; i++) {
      const borde = Math.abs(i) === ancho || Math.abs(j) === R
      let c = 'y'
      if (borde) c = 'k'
      else if (i === -ancho + 1 && Math.abs(j) < R - 1) c = 'w'
      else if (i === ancho - 1 || j === R - 1) c = 'o'
      punto(L, cx + i, cy + j, c)
    }
  }
  // De frente se le ve el troquel.
  if (a >= 6) pon(L, ['.ooo.', 'o....', '.ooo.', '....o', '.ooo.'], cx - 2, cy - 2)
  else if (a >= 4.5) pon(L, ['.o.', 'o..', '.o.', '..o', '.o.'], cx - 1, cy - 2)
}

const DESTELLO = [['w'], ['.w.', 'www', '.w.'], ['..w..', '.....', 'w.w.w', '.....', '..w..'], ['w...w', '.....', '.....', '.....', 'w...w']]

function escenaMoneda() {
  const anchos = [6, 5, 3, 1, 3, 5]
  const alturas = [0, -2, -4, -5, -6, -6, -5, -4, -2, 0, 1, 0]
  return pelicula(
    'moneda',
    alturas.map((dy, f) => {
      const L = lienzo()
      // La sombra en el piso se encoge cuando la moneda sube.
      const s = dy <= -5 ? 2 : dy <= -2 ? 3 : 5
      raya(L, 10 - s, 10 + s, 19, 's')
      moneda(L, 10, 11 + Math.min(0, dy), anchos[f % 6])
      // Al tocar el piso levanta dos motas de polvo.
      if (dy === 1) {
        punto(L, 2, 18, 'w')
        punto(L, 18, 18, 'w')
      }
      const d = f - 3
      if (d >= 0 && d < 4) pon(L, DESTELLO[d], 16 - Math.floor(DESTELLO[d][0].length / 2), 3 - Math.floor(DESTELLO[d].length / 2))
      return L
    }),
    12,
  )
}

// ───────────────────────── Por cobrar: el reloj de arena ─────────────────────────
// La arena cae grano a grano. Cuando se acaba, el reloj se voltea y vuelve a empezar.

const VIDRIO = [
  'kkkkkkkkkkk',
  'kkkkkkkkkkk',
  '.kvvvvvvvk.',
  '.kvvvvvvvk.',
  '.kvvvvvvvk.',
  '..kvvvvvk..',
  '...kvvvk...',
  '....kvk....',
  '....kvk....',
  '...kvvvk...',
  '..kvvvvvk..',
  '.kvvvvvvvk.',
  '.kvvvvvvvk.',
  '.kvvvvvvvk.',
  'kkkkkkkkkkk',
  'kkkkkkkkkkk',
]

function escenaArena() {
  const X = 5
  const Y = 2
  // Las celdas de cada cámara, en el orden en que se vacían (arriba) y se llenan (abajo).
  const arriba = []
  const abajo = []
  VIDRIO.forEach((fila, j) =>
    [...fila].forEach((c, i) => {
      if (c !== 'v') return
      if (j < 7) arriba.push([i, j])
      else if (j > 8) abajo.push([i, j])
    }),
  )
  // Arriba se hunde por el centro; abajo crece un montón.
  arriba.sort((a, b) => a[1] - b[1] || Math.abs(a[0] - 5) - Math.abs(b[0] - 5))
  abajo.sort((a, b) => b[1] + Math.abs(b[0] - 5) * 0.75 - (a[1] + Math.abs(a[0] - 5) * 0.75))
  const PASOS = 10
  const quieto = (k) => {
    const L = lienzo()
    pon(L, VIDRIO, X, Y)
    const caidos = Math.round((arriba.length * k) / PASOS)
    arriba.slice(caidos).forEach(([i, j]) => punto(L, X + i, Y + j, 'y'))
    abajo.slice(0, Math.round((abajo.length * k) / PASOS)).forEach(([i, j]) => punto(L, X + i, Y + j, 'y'))
    // El hilo de arena: solo mientras queda arriba.
    if (k > 0 && k < PASOS) for (let j = 7; j <= 13; j++) if ((j + k) % 2 === 0 && L[Y + j][X + 5] === 'v') punto(L, X + 5, Y + j, 'y')
    return L
  }
  const cuadros = []
  for (let k = 0; k <= PASOS; k++) cuadros.push(quieto(k))
  cuadros.push(quieto(PASOS))
  const lleno = quieto(PASOS)
  for (const g of [45, 90, 135]) cuadros.push(gira(lleno, g, 10, 9.5))
  return pelicula('arena', cuadros, 8)
}

const HECHAS = {}
const ESCENAS = { moto: escenaMoto, tienda: escenaTienda, moneda: escenaMoneda, arena: escenaArena }

/** El SVG de una escena. Se dibuja una sola vez: siempre sale idéntico. */
export const pixel = (nombre) => (HECHAS[nombre] ||= ESCENAS[nombre]())
