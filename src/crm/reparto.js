import { lienzo, punto, pon, raya, caja, linea, elipse, sombra, tramos, calca, registra } from './pixel.js'

// El reparto y la utilería que comparten las películas de «Hoy».
//
// Los personajes no son dibujos fijos: se arman por piezas (cabeza, pelo, ojos, boca, hombros)
// y cada plano les dice hacia dónde miran, qué cara ponen y cómo se mueven. Para cambiarle el
// pelo, la piel o la ropa a alguien, se toca aquí y cambia en todas las películas.

export const W = 84
export const H = 33
export const FPS = 12

// ───────────────────────── Reparto ─────────────────────────

// Dalí: piel clara, pelo castaño oscuro con volumen, raya casi al centro y el fleco que cae a
// los dos lados (de librito); playera negra.
export const DALI = {
  piel: 'c',
  sombra: 'C',
  pelo: 'h',
  luz: 'H',
  ropa: 'k',
  ropa2: 'd',
  cuello: 'D',
  brazo: 'c',
  pierna: 'n',
  peinado: 'librito',
  prenda: 'playera',
  ceja: 4,
  cabecita: ['.hhhh.', 'hhHhhh', 'hhhhcc', 'hhccac', '.ccccc', '..ccc.'],
}
// Alex: rizos negros, muchos, que le caen en la frente; lentes de armazón negro; suéter marino.
export const ALEX = {
  piel: 'e',
  sombra: 'E',
  pelo: 'a',
  luz: 'A',
  ropa: 'n',
  ropa2: 'N',
  cuello: 'u',
  brazo: 'n',
  pierna: 'D',
  peinado: 'rizos',
  prenda: 'playera',
  lentes: 'claros',
  ceja: 4,
  cabecita: ['.aaaaa.', 'aaAaaaa', 'aaaaAaa', 'aaaaekk', 'aa.eeee', '...eee.'],
}
// Los de las casas.
export const DON = { piel: 'm', sombra: 'O', pelo: 'G', luz: 'w', ropa: 'u', ropa2: 'n', peinado: 'entradas', ceja: 4, bigote: true }
export const DOÑA = { piel: 'c', sombra: 'C', pelo: 'o', luz: 'y', ropa: 'g', ropa2: 'q', peinado: 'chongo', ceja: 4 }
// Los clientes: de traje y lentes oscuros.
export const AGENTE = {
  piel: 'c',
  sombra: 'C',
  pelo: 'k',
  luz: 'd',
  ropa: 'k',
  ropa2: 'd',
  brazo: 'k',
  pierna: 'k',
  peinado: 'corto',
  prenda: 'saco',
  lentes: 'oscuros',
  ceja: 4,
  cabecita: ['.kkkk.', 'kkkkkk', 'kkcccc', 'kkckkk', '.ccccc', '..ccc.'],
}
export const AGENTE_2 = { ...AGENTE, piel: 'm', sombra: 'O', cabecita: ['.kkkk.', 'kkkkkk', 'kkmmmm', 'kkmkkk', '.mmmmm', '..mmm.'] }

const PEINADOS = {
  // Volumen arriba, la raya un poco a la izquierda y el fleco abierto a los dos lados.
  librito: {
    pelo: [
      [-4, -2, 3],
      [-3, -4, 5],
      [-2, -6, 6],
      [-1, -7, 7],
      [0, -7, 7],
      [1, -7, -2],
      [1, 0, 7],
      [2, -7, -3],
      [2, 1, 7],
      [3, -7, -4],
      [3, 2, 7],
      [4, -7, -5],
      [4, 4, 7],
      [5, -7, -6],
      [5, 6, 7],
      [6, -7, -7],
      [6, 7, 7],
    ],
    luz: [
      [-3, 0, 2],
      [-2, 3, 4],
      [-1, 5, 6],
      [0, 6, 6],
      [-2, -4, -3],
      [-1, -6, -5],
      [1, 2, 3],
      [2, 4, 5],
    ],
    raya: [
      [-3, -1, -1],
      [-2, -1, -1],
    ],
  },
  // Un nubarrón de rizos: el contorno ondulado y mechones que caen sobre la frente.
  rizos: {
    pelo: [
      [-7, -4, -2],
      [-7, 1, 3],
      [-6, -6, 5],
      [-5, -8, 7],
      [-4, -9, 8],
      [-3, -9, 9],
      [-2, -10, 9],
      [-1, -10, 10],
      [0, -10, 10],
      [1, -10, 10],
      [2, -9, 10],
      [3, -10, -3],
      [3, -1, 4],
      [3, 6, 10],
      [4, -10, -5],
      [4, -2, 1],
      [4, 3, 4],
      [4, 7, 10],
      [5, -9, -7],
      [5, -1, 0],
      [5, 8, 9],
      [6, -9, -7],
      [6, 7, 9],
      [7, -8, -7],
      [7, 7, 8],
      [8, -8, -8],
      [8, 8, 8],
    ],
    luz: [
      [-5, -5, -4],
      [-4, -6, -6],
      [-5, 2, 3],
      [-4, 4, 4],
      [-2, -2, -1],
      [-1, 0, 0],
      [-1, -8, -7],
      [0, -9, -9],
      [-2, 6, 7],
      [-1, 8, 8],
      [1, -4, -3],
      [2, -2, -2],
      [1, 3, 4],
      [2, 5, 5],
      [4, -8, -8],
      [5, 8, 8],
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
  // Corto y relamido.
  corto: {
    pelo: [
      [-1, -4, 4],
      [0, -6, 6],
      [1, -6, 6],
      [2, -6, -4],
      [2, 5, 6],
      [3, -6, -6],
      [3, 6, 6],
      [4, -6, -6],
      [4, 6, 6],
    ],
    luz: [
      [0, -3, 1],
      [1, 2, 4],
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

const BOCAS = {
  neutra: [[11, -1, 1]],
  sonrie: [
    [10, -2, -2],
    [10, 2, 2],
    [11, -1, 1],
  ],
  // Dientes arriba, boca abierta abajo.
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
  // De lado: la media sonrisa del que ya sabe.
  mueca: [
    [11, -1, 1],
    [10, 2, 2],
  ],
}

/**
 * Un personaje de frente, de hombros para arriba. cx es su centro y `top` el renglón donde
 * empieza la cabeza.
 *   mira     -1 izquierda · 0 al frente · 1 derecha
 *   cierra   ojos cerrados (parpadeo o risa)
 *   boca     'neutra' · 'sonrie' · 'rie' · 'ups' · 'o' · 'mueca'
 *   cejas    0 normales · 1 arriba · -1 preocupadas · 2 de enojo o de concentración
 *   hombros  cuánto los sube (encogerse)
 *   pelo     cuánto se retrasa el pelo al moverse (rebote)
 *   bajaLentes  los lentes oscuros subidos a la frente: se le ven los ojos
 *   brillo   0 a 1: un destello que cruza los lentes
 */
export function busto(L, cx, top, P, o = {}) {
  const { mira = 0, cierra = false, boca = 'neutra', cejas = 0, hombros = 0, pelo = 0, bajaLentes = false, brillo = -1 } = o
  const X = (x) => cx + x
  const Y = (y) => top + y
  const alto = L.length
  // Hombros y pecho.
  const ty = Y(16) - hombros
  raya(L, X(-7), X(7), ty, P.ropa)
  raya(L, X(-9), X(9), ty + 1, P.ropa)
  for (let y = ty + 2; y < alto; y++) raya(L, X(-10), X(10), y, P.ropa)
  for (let y = ty + 1; y < alto; y++) raya(L, X(9), X(10), y, P.ropa2)
  // El cuello.
  caja(L, X(-2), Y(13), 5, ty - Y(13) + 1, P.sombra)
  if (P.prenda === 'playera') {
    // Cuello redondo.
    raya(L, X(-2), X(2), ty, P.piel)
    punto(L, X(-3), ty, P.cuello)
    punto(L, X(3), ty, P.cuello)
    raya(L, X(-2), X(2), ty + 1, P.cuello)
  } else if (P.prenda === 'saco') {
    // Camisa blanca, solapas y corbata.
    ;[3, 2, 2, 1, 1, 0].forEach((a, i) => raya(L, X(-a), X(a), ty + i, 'w'))
    ;[4, 3, 3, 2, 2, 1].forEach((a, i) => {
      punto(L, X(-a), ty + i, 'D')
      punto(L, X(a), ty + i, 'D')
    })
    raya(L, X(-1), X(1), ty + 1, 'r')
    for (let y = ty + 2; y < alto; y++) punto(L, X(0), y, 'r')
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
  // Los ojos. Con armazón, cada ojo se mueve dentro de su lente.
  const oscuros = P.lentes === 'oscuros' && !bajaLentes
  const ojo = (x) => {
    if (cierra) raya(L, X(x), X(x + 1), Y(7), 'a')
    else caja(L, X(x), Y(6), 2, 2, 'a')
  }
  if (!oscuros) {
    if (P.lentes === 'claros') {
      ojo(mira < 0 ? -5 : -4)
      ojo(mira > 0 ? 4 : 3)
    } else {
      ojo(-4 + mira)
      ojo(3 + mira)
    }
  }
  punto(L, X(0), Y(8), P.sombra)
  punto(L, X(0), Y(9), P.sombra)
  raya(L, X(-5), X(-4), Y(9), 'R')
  raya(L, X(4), X(5), Y(9), 'R')
  tramos(L, cx, top, BOCAS[boca], 'a')
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
  if (!P.lentes || bajaLentes) tramos(L, cx, top, C[cejas], P.pelo === 'G' ? 'D' : P.pelo)
  // Los lentes.
  if (P.lentes === 'claros') {
    for (const x0 of [-6, 2]) {
      raya(L, X(x0), X(x0 + 4), Y(5), 'k')
      raya(L, X(x0), X(x0 + 4), Y(8), 'k')
      caja(L, X(x0), Y(5), 1, 4, 'k')
      caja(L, X(x0 + 4), Y(5), 1, 4, 'k')
    }
    raya(L, X(-1), X(1), Y(6), 'k')
    punto(L, X(-7), Y(6), 'k')
    punto(L, X(7), Y(6), 'k')
    // Las cejas asoman sobre el armazón.
    if (cejas === 1) {
      raya(L, X(-5), X(-3), Y(3), P.pelo)
      raya(L, X(3), X(5), Y(3), P.pelo)
    } else if (cejas === 2) {
      punto(L, X(-2), Y(4), P.pelo)
      punto(L, X(2), Y(4), P.pelo)
    } else if (cejas === -1) {
      punto(L, X(-6), Y(4), P.pelo)
      punto(L, X(6), Y(4), P.pelo)
    }
    if (brillo >= 0 && brillo <= 1) {
      const bx = Math.round(-5 + brillo * 9)
      for (const d of [0, 1]) if (Math.abs(bx + d) >= 2 && Math.abs(bx + d) <= 5) punto(L, X(bx + d), Y(6 + d), 'w')
    }
  } else if (P.lentes === 'oscuros') {
    const y0 = bajaLentes ? 1 : 5
    caja(L, X(-6), Y(y0), 5, 3, 'k')
    caja(L, X(2), Y(y0), 5, 3, 'k')
    raya(L, X(-1), X(1), Y(y0), 'k')
    if (!bajaLentes) {
      punto(L, X(-7), Y(y0), 'k')
      punto(L, X(7), Y(y0), 'k')
      punto(L, X(-5), Y(y0), 'D')
      punto(L, X(3), Y(y0), 'D')
    }
    if (brillo >= 0 && brillo <= 1) {
      const bx = Math.round(-6 + brillo * 12)
      for (const d of [0, 1, 2]) if (Math.abs(bx - d) >= 2 && Math.abs(bx - d) <= 6) punto(L, X(bx - d), Y(y0 + d), 'w')
    }
    // El cable del audífono.
    punto(L, X(8), Y(8), 'w')
    punto(L, X(8), Y(10), 'w')
    punto(L, X(9), Y(9), 'w')
    punto(L, X(9), Y(11), 'w')
  }
}

/** El mismo personaje visto por detrás, en primer plano: lo que se ve es su pelo. */
export function nuca(L, cx, cy, P, dy = 0) {
  cy += dy
  const alto = L.length
  // Los hombros.
  for (let y = cy + 9; y < alto + 2; y++) raya(L, cx - 13 - Math.min(2, y - cy - 9), cx + 13 + Math.min(2, y - cy - 9), y, P.ropa)
  for (let y = cy + 10; y < alto + 2; y++) raya(L, cx + 12, cx + 14, y, P.ropa2)
  // El cuello y las orejas.
  caja(L, cx - 3, cy + 6, 7, 4, P.sombra)
  caja(L, cx - 10, cy, 2, 3, P.piel)
  caja(L, cx + 9, cy, 2, 3, P.sombra)
  if (P.peinado === 'rizos') {
    // Las patas de los lentes, y el nubarrón: redondo, con el borde ondulado.
    punto(L, cx - 11, cy, 'k')
    punto(L, cx + 11, cy, 'k')
    elipse(L, cx, cy - 2, 10, 9, P.pelo)
    ;[
      [-12, -5, -3],
      [-12, 2, 4],
      [-11, -8, -7],
      [-11, 7, 8],
      [-7, -11, -11],
      [-7, 11, 11],
      [-3, -11, -11],
      [-2, 11, 11],
      [2, -11, -11],
      [3, 11, 11],
      [7, -8, -6],
      [8, -3, -1],
      [7, 6, 8],
      [8, 2, 4],
    ].forEach(([y, a, b]) => raya(L, cx + a, cx + b, cy + y, P.pelo))
    ;[
      [-9, -4, -3],
      [-8, -5, -5],
      [-8, 3, 4],
      [-7, 5, 5],
      [-5, -8, -7],
      [-4, -9, -9],
      [-5, 0, 1],
      [-4, 2, 2],
      [-2, 6, 7],
      [-1, 8, 8],
      [-1, -4, -3],
      [0, -2, -2],
      [2, -7, -6],
      [3, -5, -5],
      [3, 3, 4],
      [4, 5, 5],
    ].forEach(([y, a, b]) => raya(L, cx + a, cx + b, cy + y, P.luz))
  } else {
    elipse(L, cx, cy - 1, 8, 8, P.pelo)
    raya(L, cx - 5, cx + 5, cy + 7, P.pelo)
    // La raya, vista por detrás, y la luz en cada lado.
    linea(L, cx, cy - 9, cx, cy - 2, 'a')
    ;[
      [-6, -4, -2],
      [-5, -6, -5],
      [-3, -7, -7],
      [-6, 2, 4],
      [-5, 5, 6],
      [-3, 7, 7],
    ].forEach(([y, a, b]) => raya(L, cx + a, cx + b, cy + y, P.luz))
  }
  raya(L, cx - 4, cx + 4, cy + 10, P.cuello || P.ropa2)
}

/** De cuerpo entero y de perfil, chiquito, caminando hacia la derecha. `y` es el piso. */
export function mini(L, x, y, P, fase, anda = true) {
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
  if (P.prenda === 'saco') caja(L, x + 4, yy - 11, 1, 3, 'w')
  const mano = x + 3 - Math.round(2 * paso)
  linea(L, x + 3, yy - 10, mano, yy - 6, P.brazo || P.ropa2)
  punto(L, mano, yy - 5, P.piel)
  // La cabeza.
  pon(L, P.cabecita, x + (P.cabecita[0].length > 6 ? -1 : 0), yy - 17)
}

/** Lo mismo, pero caminando hacia la izquierda. */
export function miniIzq(L, x, y, P, fase, anda = true) {
  const ancho = L[0].length
  const tmp = lienzo(ancho, L.length)
  mini(tmp, ancho - 1 - x - 6, y, P, fase, anda)
  tmp.forEach((fila, j) => fila.forEach((c, i) => c !== '.' && punto(L, ancho - 1 - i, j, c === 't' ? 't' : c)))
}

// ───────────────────────── Utilería ─────────────────────────

export const GLOBO = [
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
export const TACHE = ['rr.....rr', 'rrr...rrr', '.rrr.rrr.', '..rrrrr..', '...rrr...', '..rrrrr..', '.rrr.rrr.', 'rrr...rrr', 'rr.....rr']
export const CORAZON = ['.rr...rr.', 'rrrr.rrrr', 'rRrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....']
export const PALOMA = ['........g', '.......gg', '......gg.', 'g....gg..', 'gg..gg...', '.gggg....', '..gg.....']

const LETRA = {
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['###', '..#', '###', '#..', '###'],
  3: ['###', '..#', '.##', '..#', '###'],
  5: ['###', '#..', '###', '..#', '###'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  $: ['.##', '#..', '.#.', '..#', '##.'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  C: ['###', '#..', '#..', '#..', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  ' ': ['...', '...', '...', '...', '...'],
}

/** Agranda un dibujo: cada pixel se vuelve n × n. */
export const dobla = (dibujo, n = 2) => dibujo.flatMap((fila) => Array(n).fill([...fila].map((c) => c.repeat(n)).join('')))

/** Escribe con letras de 3 × 5 (o más grandes, con `esc`). */
export function rotulo(L, txt, x, y, c, esc = 1) {
  ;[...String(txt)].forEach((ch, i) => {
    const g = (LETRA[ch] || LETRA[' ']).map((f) => f.replace(/#/g, c))
    pon(L, esc > 1 ? dobla(g, esc) : g, x + i * 4 * esc, y)
    // El signo de pesos lleva su raya, que sobresale arriba y abajo.
    if (ch === '$') {
      caja(L, x + i * 4 * esc + esc, y - esc, esc, esc, c)
      caja(L, x + i * 4 * esc + esc, y + 5 * esc, esc, esc, c)
    }
  })
}

/** El globo de diálogo, que crece de golpe (k va de 0 a 1). */
export function globo(L, x, y, icono, k) {
  if (k <= 0) return
  if (k < 0.5) return pon(L, ['.www.', 'wwwww', 'wwwww', '.www.'], x + 5, y + 6)
  if (k < 0.8) return pon(L, ['.wwwwwww.', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', '.wwwwwww.', '.ww......'], x + 3, y + 3)
  pon(L, GLOBO, x, y)
  pon(L, icono, x + 3, y + 1)
}

/** Rayos que salen de un punto: el golpe. */
export function golpe(L, x, y, r, c = 'w') {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3
    const r0 = r * (i % 2 ? 0.55 : 0.4)
    const r1 = r * (i % 2 ? 0.8 : 1)
    linea(L, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, i % 2 ? 'y' : c)
  }
}

/** Una estrellita de cuatro puntas. */
export function destello(L, x, y, r, c = 'w') {
  raya(L, x - r, x + r, y, c)
  for (let j = -r; j <= r; j++) punto(L, x, y + j, c)
}

const CONFETI = 'ywrgbwyr'
export function confeti(L, f, n = 26) {
  const ancho = L[0].length
  for (let i = 0; i < n; i++) {
    const x = (i * 37 + 11) % ancho
    const v = 1 + (i % 3) * 0.6
    const y = ((i * 13) % 40) - 38 + f * v
    if (y >= 0 && y < L.length) {
      punto(L, x + Math.round(Math.sin((f + i) * 0.7)), y, CONFETI[i % 8])
      if (i % 4 === 0) punto(L, x + 1 + Math.round(Math.sin((f + i) * 0.7)), y, CONFETI[i % 8])
    }
  }
}

/** Líneas que apuntan al centro desde las orillas: «ahora sí, en serio». */
export function rayosDeFoco(L, f, c = 'w') {
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + (f % 2) * 0.22
    const r0 = 30 + ((i * 7) % 9)
    linea(L, 42 + Math.cos(a) * r0 * 1.5, 16 + Math.sin(a) * r0 * 0.62, 42 + Math.cos(a) * 60, 16 + Math.sin(a) * 26, c)
  }
}

/** La cámara tiembla: desplaza todo el cuadro. */
export const sacude = (L, dx, dy) => {
  if (!dx && !dy) return L
  const N = lienzo(L[0].length, L.length)
  calca(N, L, dx, dy)
  return N
}

/**
 * Arma y registra una película a partir de sus planos: [[cuadros, plano], …]. Cada plano es
 * plano(L, f, n) y dibuja su cuadro f; si devuelve [dx, dy], la cámara tiembla ese cuadro.
 */
export function montaje(id, planos, colores = {}, cartel = 0) {
  const total = planos.reduce((s, [n]) => s + n, 0)
  const cuadro = (i) => {
    let f = i
    for (const [n, plano] of planos) {
      if (f < n) {
        const L = lienzo(W, H)
        const temblor = plano(L, f, n)
        return temblor ? sacude(L, temblor[0], temblor[1]) : L
      }
      f -= n
    }
    return lienzo(W, H)
  }
  return registra(id, { w: W, h: H, fps: FPS, n: total, cuadro, colores, cartel })
}
