import { lienzo, punto, pon, raya, caja, linea, elipse, sombra, tramos, calca, suave, frena, rebota, tramo, registra } from './pixel.js'

// «De puerta en puerta»: la película de la ficha de Prospectos. Dalí y Alex salen a tocar
// puertas. Diez planos, con cortes de cámara como en el cine:
//
//   1  general     llegan caminando por la calle; la cámara los sigue
//   2  detalle     el puño toca la puerta
//   3  desde dentro la puerta se abre y ahí están los dos, saludando
//   4  sobre el hombro  el dueño, de malas: no
//   5  portazo
//   6  dos caras   se miran, Alex se encoge de hombros, Dalí señala la siguiente
//   7  desde arriba cruzan la banqueta hasta la otra casa
//   8  detalle     tocan otra vez
//   9  sobre el hombro  la dueña, encantada: sí
//  10  dos caras   chocan las manos
//
// Los personajes no son dibujos fijos: se arman por piezas (cabeza, pelo, ojos, boca, hombros)
// y cada plano les dice hacia dónde miran, qué cara ponen y cómo se mueven.

const W = 84
const H = 33
const FPS = 12

// ───────────────────────── Reparto ─────────────────────────

// Dalí: castaño, peinado de librito (raya en medio, fleco a los lados), polo blanca.
const DALI = { piel: 'c', sombra: 'C', pelo: 'h', luz: 'H', ropa: 'w', ropa2: 'G', pierna: 'n', peinado: 'librito', ceja: 4 }
// Alex: pelo oscuro, ondulado, largo y revuelto; sudadera negra.
const ALEX = { piel: 'e', sombra: 'E', pelo: 'a', luz: 'A', ropa: 'k', ropa2: 'd', pierna: 'D', peinado: 'greña', ceja: 5 }
// Los de las casas.
const DON = { piel: 'm', sombra: 'O', pelo: 'G', luz: 'w', ropa: 'u', ropa2: 'n', peinado: 'entradas', ceja: 4, bigote: true }
const DOÑA = { piel: 'c', sombra: 'C', pelo: 'o', luz: 'y', ropa: 'g', ropa2: 'q', peinado: 'chongo', ceja: 4 }

const PEINADOS = {
  // La raya al centro y el fleco que cae a los dos lados, como un libro abierto.
  librito: {
    pelo: [
      [-2, -3, 3],
      [-1, -5, 5],
      [0, -6, 6],
      [1, -6, -1],
      [1, 1, 6],
      [2, -6, -2],
      [2, 2, 6],
      [3, -6, -3],
      [3, 3, 6],
      [4, -6, -5],
      [4, 5, 6],
      [5, -6, -6],
      [5, 6, 6],
    ],
    luz: [
      [-1, -3, -2],
      [0, -5, -4],
      [1, -5, -5],
      [-1, 2, 3],
      [0, 4, 5],
      [1, 5, 5],
    ],
    raya: [
      [-2, 0, 0],
      [-1, 0, 0],
      [0, 0, 0],
    ],
  },
  // Mechones para todos lados, fleco disparejo, y cae hasta la mandíbula con las puntas hacia afuera.
  greña: {
    pelo: [
      [-4, -3, -2],
      [-4, 3, 4],
      [-3, -5, 5],
      [-2, -6, 6],
      [-1, -7, 7],
      [0, -8, 8],
      [1, -8, 8],
      [2, -8, 8],
      [3, -8, -3],
      [3, -1, 2],
      [3, 4, 8],
      [4, -8, -5],
      [4, -1, 0],
      [4, 5, 8],
      [5, -8, -6],
      [5, 6, 8],
      [6, -8, -7],
      [6, 7, 8],
      [7, -8, -7],
      [7, 7, 8],
      [8, -8, -7],
      [8, 7, 8],
      [9, -9, -7],
      [9, 7, 8],
      [10, -9, -6],
      [10, 6, 9],
      [11, -8, -6],
      [11, 7, 9],
      [12, -9, -7],
      [12, 7, 8],
      [13, -8, -8],
      [13, 8, 9],
    ],
    luz: [
      [-2, -4, -2],
      [-1, -6, -5],
      [0, 3, 5],
      [1, 6, 7],
      [2, -5, -4],
      [6, -8, -8],
      [9, -8, -8],
      [10, 8, 8],
      [7, 8, 8],
    ],
    raya: [],
  },
  entradas: {
    pelo: [
      [-1, -4, 4],
      [0, -6, -3],
      [0, 3, 6],
      [1, -6, -5],
      [1, 5, 6],
      [2, -6, -6],
      [2, 6, 6],
      [3, -6, -6],
      [3, 6, 6],
      [4, -6, -6],
      [4, 6, 6],
    ],
    luz: [],
    raya: [],
  },
  chongo: {
    pelo: [
      [-5, -2, 2],
      [-4, -3, 3],
      [-3, -3, 3],
      [-2, -4, 4],
      [-1, -5, 5],
      [0, -6, 6],
      [1, -6, 6],
      [2, -6, -3],
      [2, 4, 6],
      [3, -6, -5],
      [3, 5, 6],
      [4, -7, -6],
      [4, 6, 7],
      [5, -7, -6],
      [5, 6, 7],
      [6, -7, -6],
      [6, 6, 7],
      [7, -7, -7],
      [7, 7, 7],
      [8, -7, -7],
      [8, 7, 7],
    ],
    luz: [
      [-4, -1, 0],
      [-1, -3, -2],
      [0, 2, 4],
    ],
    raya: [],
  },
}

const CABEZA = [
  [0, -3, 3],
  [1, -4, 4],
  [2, -5, 5],
  [3, -6, 6],
  [4, -6, 6],
  [5, -6, 6],
  [6, -6, 6],
  [7, -6, 6],
  [8, -6, 6],
  [9, -6, 6],
  [10, -6, 6],
  [11, -5, 5],
  [12, -4, 4],
  [13, -2, 2],
]

/**
 * Un personaje de frente, de hombros para arriba. cx es su centro y `top` el renglón donde
 * empieza la cabeza.
 *   mira     -1 izquierda · 0 al frente · 1 derecha
 *   cierra   ojos cerrados (parpadeo o risa)
 *   boca     'neutra' · 'sonrie' · 'rie' · 'ups' · 'o'
 *   cejas    0 normales · 1 arriba · -1 preocupadas · 2 de enojo
 *   hombros  cuánto los sube (encogerse)
 *   pelo     cuánto se retrasa el pelo al moverse (rebote)
 */
function busto(L, cx, top, P, o = {}) {
  const { mira = 0, cierra = false, boca = 'neutra', cejas = 0, hombros = 0, pelo = 0 } = o
  const X = (x) => cx + x
  const Y = (y) => top + y
  // Hombros y pecho.
  const ty = Y(16) - hombros
  if (P === ALEX) {
    // La capucha, detrás del cuello.
    raya(L, X(-6), X(6), ty - 2, 'd')
    raya(L, X(-7), X(7), ty - 1, 'd')
  }
  raya(L, X(-7), X(7), ty, P.ropa)
  raya(L, X(-9), X(9), ty + 1, P.ropa)
  for (let y = ty + 2; y < H; y++) raya(L, X(-10), X(10), y, P.ropa)
  for (let y = ty + 1; y < H; y++) raya(L, X(9), X(10), y, P.ropa2)
  // El cuello.
  caja(L, X(-2), Y(13), 5, ty - Y(13) + 1, P.sombra)
  if (P === DALI) {
    // El cuello de la polo.
    raya(L, X(-2), X(2), ty, P.piel)
    raya(L, X(-1), X(1), ty + 1, P.piel)
    punto(L, X(0), ty + 2, P.piel)
    ;[-3, -2, -1].forEach((x, i) => {
      punto(L, X(x), ty + i, P.ropa2)
      punto(L, X(-x), ty + i, P.ropa2)
    })
  } else if (P === ALEX) {
    // Los cordones de la sudadera.
    for (let i = 2; i < 6; i++) {
      punto(L, X(-2), ty + i, 'G')
      punto(L, X(2), ty + i, 'G')
    }
  } else {
    raya(L, X(-1), X(1), ty, P.piel)
  }
  // La cabeza, con su sombra a la derecha y bajo la barbilla.
  tramos(L, cx, top, CABEZA, P.piel)
  for (let y = 3; y <= 10; y++) punto(L, X(6), Y(y), P.sombra)
  raya(L, X(4), X(5), Y(11), P.sombra)
  raya(L, X(2), X(4), Y(12), P.sombra)
  raya(L, X(-2), X(2), Y(13), P.sombra)
  // Las orejas.
  caja(L, X(-7), Y(6), 1, 3, P.piel)
  caja(L, X(7), Y(6), 1, 3, P.sombra)
  // La cara.
  const ojo = (x) => {
    if (cierra) raya(L, X(x + mira), X(x + 1 + mira), Y(7), 'a')
    else caja(L, X(x + mira), Y(6), 2, 2, 'a')
  }
  ojo(-4)
  ojo(3)
  punto(L, X(0), Y(8), P.sombra)
  punto(L, X(0), Y(9), P.sombra)
  raya(L, X(-5), X(-4), Y(9), 'R')
  raya(L, X(4), X(5), Y(9), 'R')
  const B = {
    neutra: [[11, -1, 1]],
    sonrie: [
      [10, -2, -2],
      [10, 2, 2],
      [11, -1, 1],
    ],
    rie: [
      [10, -3, -3],
      [10, 3, 3],
      [10, -2, 2, 'w'],
      [11, -2, 2],
    ],
    ups: [
      [11, 0, 0],
      [12, -1, -1],
      [12, 1, 1],
    ],
    o: [
      [10, -1, 0],
      [11, -1, 0],
    ],
  }
  tramos(L, cx, top, B[boca], 'a')
  if (P.bigote) {
    raya(L, X(-3), X(3), Y(10), P.pelo)
    punto(L, X(-4), Y(11), P.pelo)
    punto(L, X(4), Y(11), P.pelo)
  }
  // El pelo va encima de la cara; las cejas, encima del pelo.
  const peinado = PEINADOS[P.peinado]
  tramos(L, cx, top + pelo, peinado.pelo, P.pelo)
  tramos(L, cx, top + pelo, peinado.luz, P.luz)
  tramos(L, cx, top + pelo, peinado.raya, 'a')
  const cy = P.ceja
  const C = {
    0: [
      [cy, -4, -2],
      [cy, 2, 4],
    ],
    1: [
      [cy - 1, -4, -2],
      [cy - 1, 2, 4],
    ],
    '-1': [
      [cy + 1, -5, -5],
      [cy, -4, -3],
      [cy, 3, 4],
      [cy + 1, 5, 5],
    ],
    2: [
      [cy, -5, -4],
      [cy + 1, -3, -2],
      [cy + 1, 2, 3],
      [cy, 4, 5],
    ],
  }
  tramos(L, cx, top, C[cejas], P.pelo === 'G' ? 'D' : P.pelo)
}

/** El mismo personaje visto por detrás, en primer plano: lo que se ve es su pelo. */
function nuca(L, cx, cy, P, dy = 0) {
  cy += dy
  // Los hombros.
  for (let y = cy + 9; y < H + 2; y++) raya(L, cx - 13 - Math.min(2, y - cy - 9), cx + 13 + Math.min(2, y - cy - 9), y, P.ropa)
  for (let y = cy + 10; y < H + 2; y++) raya(L, cx + 12, cx + 14, y, P.ropa2)
  if (P === ALEX) {
    elipse(L, cx, cy + 9, 8, 2, 'd')
    elipse(L, cx, cy, 10, 9, P.pelo)
    // Las puntas, disparejas, sobre la capucha.
    ;[
      [9, -11, 11],
      [10, -11, -8],
      [10, -6, -3],
      [10, -1, 2],
      [10, 4, 7],
      [10, 9, 11],
      [11, -10, -9],
      [11, -5, -4],
      [11, 0, 1],
      [11, 5, 6],
      [11, 10, 11],
      [12, -10, -10],
      [12, 6, 6],
      [-10, -4, -3],
      [-11, 3, 4],
      [-10, 2, 5],
    ].forEach(([y, a, b]) => raya(L, cx + a, cx + b, cy + y, P.pelo))
    ;[
      [-6, -5, -3],
      [-5, -7, -6],
      [-3, 3, 5],
      [-2, 6, 7],
      [1, -8, -7],
      [3, -4, -3],
      [4, 2, 4],
      [6, 7, 8],
      [7, -6, -5],
    ].forEach(([y, a, b]) => raya(L, cx + a, cx + b, cy + y, P.luz))
  } else {
    // El cuello y las orejas asoman bajo el pelo corto.
    caja(L, cx - 3, cy + 6, 7, 4, P.sombra)
    caja(L, cx - 10, cy, 2, 3, P.piel)
    caja(L, cx + 9, cy, 2, 3, P.sombra)
    elipse(L, cx, cy - 1, 8, 8, P.pelo)
    raya(L, cx - 5, cx + 5, cy + 7, P.pelo)
    // La raya en medio, vista por detrás, y la luz en cada lado.
    linea(L, cx, cy - 9, cx, cy - 2, 'a')
    ;[
      [-6, -4, -2],
      [-5, -6, -5],
      [-3, -7, -7],
      [-6, 2, 4],
      [-5, 5, 6],
      [-3, 7, 7],
    ].forEach(([y, a, b]) => raya(L, cx + a, cx + b, cy + y, P.luz))
    raya(L, cx - 4, cx + 4, cy + 10, P.ropa2)
  }
}

/** De cuerpo entero y de perfil, chiquito, caminando hacia la derecha. `y` es el piso. */
function mini(L, x, y, P, fase, anda = true) {
  const paso = anda ? Math.sin(fase) : 0
  const bote = anda && Math.abs(Math.cos(fase)) > 0.7 ? 0 : anda ? -1 : 0
  x = Math.round(x)
  const yy = y + bote
  sombra(L, x + 3, y, 4, 0.6)
  // Las piernas: de la cadera al pie, una adelante y otra atrás.
  const cad = [x + 3, yy - 6]
  const pieA = x + 3 + Math.round(3 * paso)
  const pieB = x + 3 - Math.round(3 * paso)
  linea(L, cad[0], cad[1], pieB, y - 1 - (paso > 0.3 ? 1 : 0), P.pierna === 'n' ? 'u' : 'd', 2)
  linea(L, cad[0], cad[1], pieA, y - 1 - (paso < -0.3 ? 1 : 0), P.pierna, 2)
  punto(L, pieA + 1, y - 1 - (paso < -0.3 ? 1 : 0), 'k')
  punto(L, pieB + 1, y - 1 - (paso > 0.3 ? 1 : 0), 'k')
  // El tronco y el brazo, que va al revés que la pierna.
  caja(L, x + 1, yy - 11, 5, 6, P.ropa)
  caja(L, x + 5, yy - 11, 1, 6, P.ropa2)
  const mano = x + 3 - Math.round(2 * paso)
  linea(L, x + 3, yy - 10, mano, yy - 6, P.ropa2)
  punto(L, mano, yy - 5, P.piel)
  // La cabeza.
  if (P === ALEX) pon(L, ['.aaaaa.', 'aaAaaaa', 'aaaaaee', 'aaaeeae', 'aaaeeee', 'aa..ee.', 'a......'], x - 1, yy - 17)
  else pon(L, ['.hhhh.', 'hhHhhh', 'hhhhcc', 'hhccac', '.ccccc', '..ccc.'], x, yy - 17)
}

// ───────────────────────── Utilería ─────────────────────────

const GLOBO = [
  '..wwwwwwwwwww..',
  '.wwwwwwwwwwwww.',
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwww',
  '.wwwwwwwwwwwww.',
  '..wwwwwwwwwww..',
  '..www..........',
  '..ww...........',
  '..w............',
]
const TACHE = ['rr.....rr', 'rrr...rrr', '.rrr.rrr.', '..rrrrr..', '...rrr...', '..rrrrr..', '.rrr.rrr.', 'rrr...rrr', 'rr.....rr']
const CORAZON = ['.rr...rr.', 'rrrr.rrrr', 'rRrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....']
const LETRA = {
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  C: ['###', '#..', '#..', '#..', '###'],
  '!': ['#', '#', '#', '.', '#'],
}
const rotulo = (L, txt, x, y, c) => [...txt].forEach((ch, i) => pon(L, LETRA[ch].map((f) => f.replace(/#/g, c)), x + i * 4, y))

/** El globo de diálogo, que crece de golpe (k va de 0 a 1). */
function globo(L, x, y, icono, k) {
  if (k <= 0) return
  if (k < 0.5) return pon(L, ['.www.', 'wwwww', 'wwwww', '.www.'], x + 5, y + 6)
  if (k < 0.8) return pon(L, ['.wwwwwww.', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', '.wwwwwww.', '.ww......'], x + 3, y + 3)
  pon(L, GLOBO, x, y)
  pon(L, icono, x + 3, y + 1)
}

/** Rayos que salen de un punto: el golpe. */
function golpe(L, x, y, r, c = 'w') {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3
    const r0 = r * (i % 2 ? 0.55 : 0.4)
    const r1 = r * (i % 2 ? 0.8 : 1)
    linea(L, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, i % 2 ? 'y' : c)
  }
}

const CONFETI = 'ywrgbwyr'
function confeti(L, f, n = 26) {
  for (let i = 0; i < n; i++) {
    const x = (i * 37 + 11) % W
    const v = 1 + (i % 3) * 0.6
    const y = ((i * 13) % 40) - 38 + f * v
    if (y >= 0 && y < H) {
      punto(L, x + Math.round(Math.sin((f + i) * 0.7)), y, CONFETI[i % 8])
      if (i % 4 === 0) punto(L, x + 1 + Math.round(Math.sin((f + i) * 0.7)), y, CONFETI[i % 8])
    }
  }
}

/** La cámara tiembla: desplaza todo el cuadro. */
const sacude = (L, dx, dy) => {
  if (!dx && !dy) return L
  const N = lienzo(W, H)
  calca(N, L, dx, dy)
  return N
}

// ───────────────────────── Los planos ─────────────────────────

/** 1 · General: la calle. Llegan caminando y la cámara los sigue hasta la puerta. */
function planoCalle(L, f, n) {
  const k = suave(tramo(f, 0, n - 6))
  const cam = Math.round(k * 22)
  const X = (x) => x - cam
  // Nubes, que se mueven más despacio que lo de cerca.
  const nube = (x, y) => pon(L, ['..www...', '.wwwwww.', 'wwwwwwww'], Math.round(x - cam * 0.3), y)
  nube(12, 3)
  nube(58, 7)
  nube(96, 2)
  // Un árbol.
  caja(L, X(14), 16, 2, 11, 'O')
  elipse(L, X(15), 12, 6, 5, 'q')
  elipse(L, X(13), 10, 3, 2, 'g')
  // La tienda del fondo.
  caja(L, X(22), 13, 20, 14, 'G')
  caja(L, X(22), 11, 20, 3, 'r')
  for (let x = 24; x < 42; x += 4) caja(L, X(x), 11, 2, 3, 'w')
  caja(L, X(26), 18, 6, 5, 'b')
  caja(L, X(35), 18, 5, 9, 'D')
  // La casa a la que van.
  for (let i = 0; i < 9; i++) raya(L, X(64 - i * 2), X(64 + i * 2 + 1), 2 + i, 'r')
  raya(L, X(46), X(83), 11, 'O')
  caja(L, X(48), 12, 34, 15, 'x')
  caja(L, X(80), 12, 2, 15, 'X')
  caja(L, X(70), 15, 7, 6, 'k')
  caja(L, X(71), 16, 5, 4, 'b')
  raya(L, X(71), X(75), 18, 'k')
  // Su puerta.
  caja(L, X(57), 14, 9, 13, 'O')
  caja(L, X(58), 15, 7, 12, 'o')
  punto(L, X(63), 21, 'y')
  // Un farol.
  caja(L, X(102), 9, 1, 18, 'd')
  caja(L, X(100), 7, 5, 3, 'y')
  // La banqueta.
  raya(L, 0, W - 1, 27, 'k')
  caja(L, 0, 28, W, 5, 'p')
  for (let x = -((cam * 1) % 12); x < W; x += 12) caja(L, x, 28, 1, 5, 'G')
  // Los dos: Alex un paso atrás. Al llegar se detienen frente a la puerta.
  const llega = tramo(f, 0, n - 6)
  const xD = -4 + frena(llega) * 53
  const anda = f < n - 6
  mini(L, X(xD - 11), 27, ALEX, f * 0.9 + 1.4, anda)
  mini(L, X(xD), 27, DALI, f * 0.9, anda)
  // Dalí levanta el puño.
  if (!anda) {
    const sube = Math.min(3, f - (n - 6))
    linea(L, X(xD) + 4, 17, X(xD) + 6 + sube, 17 - sube, 'G')
    punto(L, X(xD) + 7 + sube, 16 - sube, 'c')
  }
}

/** 2 y 8 · Detalle: el puño toca. `amarilla` cambia la puerta. */
function planoToca(L, f, n, amarilla = false) {
  const tabla = amarilla ? 'y' : 'o'
  const veta = amarilla ? 'o' : 'O'
  caja(L, 0, 0, W, H, tabla)
  for (let x = 13; x < W; x += 14) caja(L, x, 0, 1, H, veta)
  caja(L, 0, 0, W, 2, veta)
  // La mirilla y la chapa.
  elipse(L, 62, 8, 2.4, 2.4, 'G')
  elipse(L, 62, 8, 1.2, 1.2, 'k')
  elipse(L, 76, 23, 3, 3, 'y')
  elipse(L, 76, 23, 1.4, 1.4, 'O')
  // El puño viene, toma vuelo y pega. Dos veces.
  const toques = n > 12 ? [5, 9] : [3, 6]
  let atras = 0
  let pega = -1
  toques.forEach((t, i) => {
    if (f === t - 2) atras = 3
    if (f === t - 1) atras = 6
    if (f === t) pega = i
    if (f === t + 1) atras = 2
  })
  const entra = frena(tramo(f, 0, 3))
  const sale = f > toques[1] + 3 ? (f - toques[1] - 3) * 3 : 0
  const hx = 4 + entra * 34 - atras - sale
  const hy = 24 - entra * 9 + atras * 0.7 + sale
  // El antebrazo (la manga de la polo) y el puño.
  linea(L, hx - 26, hy + 20, hx - 5, hy + 5, 'w', 9)
  linea(L, hx - 26, hy + 24, hx - 6, hy + 9, 'G', 2)
  linea(L, hx - 7, hy + 6, hx - 3, hy + 3, 'C', 7)
  elipse(L, hx, hy, 5, 4.4, 'c')
  caja(L, Math.round(hx) - 4, Math.round(hy) + 3, 8, 2, 'C')
  // Los nudillos y el pulgar.
  for (let i = 0; i < 4; i++) punto(L, hx + 3 - (i % 2), hy - 3 + i * 2, 'C')
  raya(L, hx - 3, hx + 1, hy + 1, 'C')
  if (pega >= 0) {
    golpe(L, hx + 9, hy - 2, 9)
    rotulo(L, 'TOC', pega ? 58 : 50, pega ? 21 : 3, 'w')
  } else if (toques.includes(f - 1)) {
    rotulo(L, 'TOC', f - 1 === toques[1] ? 58 : 50, f - 1 === toques[1] ? 21 : 3, 'w')
    golpe(L, hx + 11, hy - 2, 6)
  }
  return pega >= 0 ? [1, 0] : null
}

/** 3 · Desde dentro: la casa a oscuras; la puerta se abre y ahí están los dos. */
function planoDesdeDentro(L, f) {
  const abre = rebota(tramo(f, 2, 11))
  const ancho = Math.max(1, Math.round(abre * 34))
  const x0 = 24
  // Afuera: los dos, saludando. Se dibujan aparte y solo se deja ver lo que cabe en el vano.
  const afuera = lienzo(W, H)
  caja(afuera, 0, 27, W, 6, 'p')
  raya(afuera, 0, W - 1, 27, 'G')
  const t = f - 9
  const saluda = t > 2
  busto(afuera, 49, 9, ALEX, { boca: t > 5 ? 'rie' : 'sonrie', cierra: t === 9, cejas: t > 5 ? 1 : 0, mira: -0 })
  busto(afuera, 36, 9, DALI, { boca: saluda ? 'rie' : 'sonrie', cierra: t === 11, cejas: saluda ? 1 : 0 })
  if (saluda) {
    // La mano de Dalí, de un lado a otro.
    const m = Math.round(Math.sin(t * 1.5) * 2)
    linea(afuera, 27, 32, 27 + m, 24, 'G', 3)
    pon(afuera, ['.c.c.', 'ccccc', 'cccCc', '.cCC.'], 25 + m, 20)
  }
  // Adentro: pared y piso a oscuras.
  caja(L, 0, 0, W, 27, 'k')
  caja(L, 0, 27, W, 6, 'd')
  // La luz que entra y se riega por el piso.
  for (let y = 27; y < H; y++) raya(L, x0 - (y - 27) * 2, x0 + ancho - 1 + (y - 27) * 3, y, 'D')
  // El vano.
  for (let y = 1; y < 27; y++)
    for (let x = x0; x < x0 + ancho; x++) L[y][x] = afuera[y][x]
  // El marco, y la hoja de la puerta que se va viendo de canto.
  caja(L, x0 - 2, 0, 2, 27, 'O')
  caja(L, x0 - 2, 0, 38, 1, 'O')
  const hoja = Math.max(2, Math.round((1 - abre) * 9) + 2)
  caja(L, x0 + ancho, 1, hoja, 26, 'o')
  caja(L, x0 + ancho, 1, 1, 26, 'O')
  if (abre < 0.9) punto(L, x0 + ancho + 1, 15, 'y')
}

/** El vano con alguien dentro, visto desde afuera, entre las nucas de los dos. */
function planoSobreHombro(L, P, o) {
  const { pared, ancho = 26, cara = {}, gk = 0, icono = TACHE, dy = [0, 0] } = o
  caja(L, 0, 0, W, H, pared)
  if (pared === 'x') for (let y = 5; y < H; y += 6) raya(L, 0, W - 1, y, 'X')
  // El vano oscuro, con quien abre.
  const x0 = 29
  caja(L, x0 - 2, 0, 30, H, 'O')
  caja(L, x0, 2, 26, H, 'o')
  if (ancho > 0) {
    const dentro = lienzo(W, H)
    caja(dentro, 0, 0, W, H, 'd')
    busto(dentro, 42, 7, P, cara)
    for (let y = 2; y < H; y++)
      for (let x = x0; x < x0 + ancho; x++) L[y][x] = dentro[y][x]
  }
  if (ancho < 26) {
    // La hoja, cerrándose.
    caja(L, x0 + ancho, 2, 1, H, 'O')
    punto(L, x0 + ancho + 2, 18, 'y')
  }
  globo(L, 53, 1, icono, gk)
  // En primer plano, de espaldas.
  nuca(L, 12, 25, DALI, dy[0])
  nuca(L, 72, 25, ALEX, dy[1])
}

/** 4 · El dueño, de malas. */
function planoNo(L, f) {
  const abre = Math.round(frena(tramo(f, 0, 3)) * 26)
  planoSobreHombro(L, DON, { pared: 'x', ancho: abre, cara: { cejas: 2, boca: f > 5 && f % 4 < 2 ? 'o' : 'ups', mira: f > 9 ? 1 : -1 }, gk: tramo(f, 4, 7), icono: TACHE })
}

/** 5 · Portazo. */
function planoPortazo(L, f) {
  const ancho = [14, 4, 0, 0, 0, 0][f]
  planoSobreHombro(L, DON, { pared: 'x', ancho, cara: { cejas: 2, boca: 'ups' }, dy: f >= 2 && f <= 3 ? [1, 2] : [0, 0] })
  if (f >= 2 && f <= 4) {
    golpe(L, 29, 14, 9 - (f - 2) * 2)
    golpe(L, 56, 20, 8 - (f - 2) * 2)
  }
  return f === 2 ? [2, 1] : f === 3 ? [-1, -1] : f === 4 ? [1, 0] : null
}

/** El fondo de los planos de dos caras: la pared y la puerta cerrada. */
function fondoPared(L, pared, puerta, veta) {
  caja(L, 0, 0, W, H, pared)
  if (pared === 'x') for (let y = 5; y < H; y += 6) raya(L, 0, W - 1, y, 'X')
  caja(L, 28, 0, 28, H, veta)
  caja(L, 30, 2, 24, H, puerta)
  caja(L, 41, 2, 1, H, veta)
}

/** 6 · Se miran, Alex se encoge de hombros y Dalí señala la siguiente. */
function planoQueSigue(L, f) {
  fondoPared(L, 'x', 'o', 'O')
  const caido = f < 6
  const encoge = f >= 6 && f < 11 ? Math.round(Math.sin(tramo(f, 6, 11) * Math.PI) * 3) : 0
  const va = f >= 11
  const brinco = f === 12 ? -1 : 0
  busto(L, 60, 9 + (caido ? 1 : 0) + brinco, ALEX, {
    mira: va ? 1 : f >= 3 ? -1 : 0,
    boca: va ? 'sonrie' : encoge ? 'neutra' : 'ups',
    cejas: va ? 1 : encoge ? 1 : -1,
    hombros: encoge,
    cierra: f === 8,
    pelo: f === 12 ? 1 : 0,
  })
  busto(L, 24, 9 + (caido ? 1 : 0) + brinco, DALI, {
    mira: f >= 3 ? 1 : 0,
    boca: va ? 'rie' : 'ups',
    cejas: va ? 1 : caido ? -1 : 0,
    cierra: f === 4 || f === 17,
  })
  if (va) {
    // El brazo de Dalí sube y apunta a la derecha.
    const s = rebota(tramo(f, 11, 15))
    const mx = 35 + s * 5
    const my = 31 - s * 13
    linea(L, 32, 32, mx - 2, my + 2, 'w', 4)
    pon(L, ['.cccc...', 'ccccccc.', 'cccccccc', 'ccccCC..', '.ccc....'], Math.round(mx) - 2, Math.round(my) - 2)
    if (f >= 15 && f % 2) {
      raya(L, mx + 8, mx + 10, my, 'w')
      raya(L, mx + 12, mx + 13, my, 'w')
    }
  }
}

/** 7 · Desde arriba: cruzan la banqueta hacia la casa de al lado. */
function planoDesdeArriba(L, f, n) {
  const k = tramo(f, 0, n - 1)
  const cam = Math.round(k * 40)
  const X = (x) => x - cam
  // El pasto y los techos, vistos desde arriba.
  caja(L, 0, 0, W, 12, 'q')
  const techo = (x, c) => {
    caja(L, X(x), -2, 30, 11, c)
    raya(L, X(x), X(x) + 29, 3, 'k')
    caja(L, X(x) + 12, 9, 6, 3, 'G')
  }
  techo(-6, 'r')
  techo(74, 'y')
  // Un arbusto entre las dos casas.
  elipse(L, X(44), 5, 5, 3, 'g')
  elipse(L, X(55), 7, 3, 2, 'g')
  // La banqueta, con sus juntas.
  caja(L, 0, 12, W, 12, 'G')
  raya(L, 0, W - 1, 12, 'D')
  for (let x = -(cam % 10); x < W; x += 10) caja(L, x, 13, 1, 11, 'D')
  // La calle.
  caja(L, 0, 24, W, 9, 'd')
  raya(L, 0, W - 1, 24, 'k')
  for (let x = -((cam * 1) % 16); x < W; x += 16) caja(L, x, 28, 8, 1, 'G')
  // El camino a la siguiente puerta, y su señal.
  for (let x = 46; x < 88; x += 3) punto(L, X(x), 18, 'y')
  for (let y = 17; y > 12; y -= 2) punto(L, X(89), y, 'y')
  const s = Math.round(Math.abs(Math.sin(f * 0.8)) * 2)
  pon(L, ['.yyy.', 'yykyy', 'yykyy', 'yyyyy', 'yykyy', '.yyy.', '..y..'], X(87), 1 - s)
  // Los dos, desde arriba: se les ve el pelo, los hombros y las manos que van y vienen.
  const wx = 12 + k * 62
  const sube = frena(tramo(f, n - 7, n - 1)) * 3
  const paso = Math.sin(f * 1.1)
  const cenital = (x, y, P, fase) => {
    x = Math.round(X(x))
    y = Math.round(y)
    sombra(L, x + 2, y + 1, 3, 6)
    // Los hombros, atravesados al rumbo; las manos van y vienen en las puntas.
    const tela = P === ALEX ? 'd' : P.ropa
    elipse(L, x, y, 2.4, 6, tela)
    const b = Math.round(fase * 2)
    punto(L, x + b, y - 7, P.piel)
    punto(L, x - b, y + 7, P.piel)
    if (P === ALEX) {
      // La capucha atrás y la greña: grande, dispareja, con mechones que se salen.
      elipse(L, x - 3, y, 1.6, 3, 'k')
      elipse(L, x, y, 4, 4, P.pelo)
      punto(L, x - 5, y + 2, P.pelo)
      punto(L, x - 4, y - 4, P.pelo)
      punto(L, x + 1, y - 5, P.pelo)
      punto(L, x + 2, y + 5, P.pelo)
      raya(L, x - 2, x, y - 2, P.luz)
      raya(L, x, x + 2, y + 1, P.luz)
      punto(L, x - 2, y + 2, P.luz)
    } else {
      // El librito: la raya corre de la frente a la nuca.
      elipse(L, x, y, 3.4, 3.4, P.pelo)
      raya(L, x - 3, x + 3, y, 'a')
      raya(L, x - 1, x + 1, y - 2, P.luz)
      raya(L, x - 1, x + 1, y + 2, P.luz)
    }
    // La nariz asoma al frente: para allá van.
    punto(L, x + 5, y, P.piel)
  }
  cenital(wx - 13, 19 - sube * 0.5, ALEX, -paso)
  cenital(wx, 17.5 - sube, DALI, paso)
}

/** 9 · La dueña, encantada. */
function planoSi(L, f) {
  const abre = Math.round(frena(tramo(f, 0, 3)) * 26)
  const feliz = f > 4
  const b = feliz && f > 8 ? (f % 4 < 2 ? [-1, 0] : [0, -1]) : [0, 0]
  planoSobreHombro(L, DOÑA, { pared: 'y', ancho: abre, cara: { cejas: feliz ? 1 : 0, boca: feliz ? 'rie' : 'neutra', cierra: f > 9 && f % 6 < 2, mira: f < 4 ? -1 : 0 }, gk: tramo(f, 5, 8), icono: CORAZON, dy: b })
  // Corazoncitos que suben.
  if (f > 9)
    for (let i = 0; i < 3; i++) {
      const y = 14 - ((f - 9 + i * 4) % 12) * 1.4
      pon(L, ['r.r', 'rrr', '.r.'], 58 + i * 5 + Math.round(Math.sin(f + i) * 1), Math.round(y))
    }
}

/** 10 · Chocan las manos. */
function planoChoque(L, f) {
  const choca = 8
  const sube = frena(tramo(f, 2, choca))
  const despues = f - choca
  // Antes del choque toman vuelo: bajan un pixel.
  const dy = f < 3 ? 1 : despues === 0 ? -2 : despues === 1 ? -1 : despues > 4 && despues % 6 < 3 ? -1 : 0
  if (despues >= 0) confeti(L, despues)
  busto(L, 60, 10 + dy, ALEX, { mira: -1, boca: f > 3 ? 'rie' : 'sonrie', cejas: 1, cierra: despues >= 0 && despues < 5, pelo: despues === 0 ? 2 : despues === 1 ? -1 : 0 })
  busto(L, 24, 10 + dy, DALI, { mira: 1, boca: f > 3 ? 'rie' : 'sonrie', cejas: 1, cierra: despues >= 0 && despues < 5, pelo: despues === 0 ? 1 : 0 })
  // Los brazos suben y se encuentran arriba, en medio.
  const yM = 31 - sube * 22
  const xD = 33 + sube * 6
  const xA = 51 - sube * 6
  const atras = despues > 1 ? Math.min(3, despues - 1) : 0
  linea(L, 33, 33, xD - 1 - atras, yM + 3, 'w', 4)
  linea(L, 51, 33, xA + 1 + atras, yM + 3, 'k', 4)
  pon(L, ['.c.c.', 'ccccc', 'ccccc', 'ccccc', '.ccc.'], Math.round(xD - 3 - atras), Math.round(yM - 2))
  pon(L, ['.e.e.', 'eeeee', 'eeeee', 'eeeee', '.eee.'], Math.round(xA - 1 + atras), Math.round(yM - 2))
  if (despues >= 0 && despues < 4) golpe(L, 42, 9, 6 + despues * 4)
  if (despues === 0) return [0, 1]
  if (despues === 1) return [0, -1]
  return null
}

// ───────────────────────── El montaje ─────────────────────────

const PLANOS = [
  [30, planoCalle],
  [16, planoToca],
  [26, planoDesdeDentro],
  [16, planoNo],
  [6, planoPortazo],
  [22, planoQueSigue],
  [26, planoDesdeArriba],
  [10, (L, f, n) => planoToca(L, f, n, true)],
  [22, planoSi],
  [24, planoChoque],
]
const TOTAL = PLANOS.reduce((s, [n]) => s + n, 0)

function cuadro(i) {
  let f = i
  for (const [n, plano] of PLANOS) {
    if (f < n) {
      const L = lienzo(W, H)
      const temblor = plano(L, f, n)
      return temblor ? sacude(L, temblor[0], temblor[1]) : L
    }
    f -= n
  }
  return lienzo(W, H)
}

export const peliPuertas = () => registra('puertas', { w: W, h: H, fps: FPS, n: TOTAL, cuadro, colores: { s: '#1848b4' }, cartel: 30 + 16 + 20 })
