import { lienzo, punto, pon, raya, caja, tinte, gira, calca, registra, pelicula, canvasDe } from './pixel.js'
import { peliPuertas } from './peli-puertas.js'

// Las escenas de «Hoy». Cada una cuenta, en chiquito, lo que mide su ficha:
//   puertas   Prospectos en proceso: Dalí y Alex van de puerta en puerta. Es una película
//             con cortes de cámara y vive en su propio archivo (peli-puertas.js).
//   agentes   Clientes: llegan de traje y lentes oscuros, exigen, y se van contentos.
//   billetes  Cobrado este mes: billetes de 500 que caen y se van apilando.
//   cobro     Por cobrar o por vencer: el reloj de arena corre, el calendario se deshoja y,
//             cuando llega el día, suena la campana y sale el aviso.
//
// Letras → colores en pixel.js (PALETA).

const W = 56
const H = 22

const piso = () => {
  const L = lienzo(W, H)
  raya(L, 0, W - 1, 20, 'k')
  raya(L, 0, W - 1, 21, 's')
  return L
}

/** Junta cuadros: toma((L) => dibuja en L) agrega uno. */
const rollo = () => {
  const cuadros = []
  const toma = (fn) => {
    const L = lienzo(W, H)
    fn(L, cuadros.length)
    cuadros.push(L)
  }
  return { cuadros, toma }
}

// Globos de diálogo: nueve de ancho, con su pico. El icono va adentro.
const GLOBO = ['.wwwwwww.', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', '.wwwwwww.', '...ww....']
const GLOBITO = ['.ww.', 'wwww', '.ww.']
const ICONO = {
  no: ['r...r', '.r.r.', '..r..', '.r.r.', 'r...r'],
  amor: ['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'],
  uno: ['.....', '.....', 'k....', '.....', '.....'],
  dos: ['.....', '.....', 'k.k..', '.....', '.....'],
  tres: ['.....', '.....', 'k.k.k', '.....', '.....'],
  si: ['.....', '....g', 'g..gg', 'gggg.', '.gg..'],
  ya: ['..r..', '..r..', '..r..', '.....', '..r..'],
  yaya: ['.r.r.', '.r.r.', '.r.r.', '.....', '.r.r.'],
  hora: ['.kkk.', 'k.k.k', 'k.kkk', 'k...k', '.kkk.'],
}
const globo = (L, x, y, icono) => {
  pon(L, GLOBO, x, y)
  if (icono) pon(L, ICONO[icono], x + 2, y + 1)
}

/** Estrena una escena de fondo fijo: cada cuadro es el fondo con lo que se mueve encima. */
const estrena = (id, fondo, cuadros, fps, colores, cartel = 0) =>
  registra(id, {
    w: W,
    h: H,
    fps,
    n: cuadros.length,
    colores,
    cartel,
    cuadro: (i) => {
      const L = fondo.map((fila) => [...fila])
      calca(L, cuadros[i])
      return L
    },
  })

// ───────────────────────── Clientes: los agentes ─────────────────────────

const AGENTE = { h: 'k', c: 'c', g: 'k', s: 'd', t: 'w', r: 'r', l: 'd' }
const AG_PIE = ['.hhh.', '.cgg.', '.ccc.', 'sstss', 'ssrss', '.sss.', '.l.l.', '.l.l.', '.k.k.']
const AG_PASO = ['.hhh.', '.cgg.', '.ccc.', 'sstss', 'ssrss', '.sss.', '..l..', '..l..', '..k..']
const AG_ZANCADA = ['.hhh.', '.cgg.', '.ccc.', 'sstss', 'ssrss', '.sss.', '.l.l.', '.l.l.', 'k...k']
const LOGO = ['.kkk.', 'k...k', 'k.z.k', 'k...k', '.kkk.']
const PLANTA = ['..g..', '.gg.g', 'g.ggg', '.ggg.', '..g..', '.rrr.', '.rrr.']
// Alex en su escritorio: pelo oscuro y revuelto que le cae en la nuca, sudadera negra.
const SENTADO = ['.aaaa.', 'aaAaa.', 'aaaek.', 'aaeee.', 'a.eee.', '.kkkkk', '.kkGkk', '.kkkkk', '.kkkkk', '.kkkkk']

function escenaAgentes() {
  const fondo = piso()
  pon(fondo, LOGO, 1, 3)
  pon(fondo, PLANTA, 49, 13)
  // La silla, y el escritorio con su cajonera.
  caja(fondo, 6, 10, 1, 10, 'd')
  caja(fondo, 5, 14, 22, 1, 'k')
  caja(fondo, 6, 15, 20, 5, 'p')
  caja(fondo, 6, 15, 1, 5, 'k')
  caja(fondo, 25, 15, 1, 5, 'k')
  raya(fondo, 19, 23, 17, 'k')
  punto(fondo, 21, 16, 'k')
  // La laptop, de perfil.
  raya(fondo, 14, 20, 13, 'd')
  caja(fondo, 20, 8, 1, 5, 'k')
  const { cuadros, toma } = rollo()

  /** El de Soma en su escritorio. `prisa` 0 tranquilo · 1 teclea · 2 teclea como loco. */
  const yo = (L, n, prisa = 1, susto = 0) => {
    pon(L, SENTADO, 7, 4 - susto)
    // Las manos sobre el teclado.
    const a = prisa ? n % 2 : 0
    punto(L, 13, 12 - a, 'e')
    punto(L, 15, 12 - (1 - a), 'e')
    // El brillo de la pantalla.
    caja(L, 19, 9, 1, 3, prisa === 2 && n % 2 ? 'w' : 'b')
    if (prisa && n % 2) punto(L, 19, 9 + (n % 3), 'w')
    // Sudor, cuando aprietan.
    if (prisa === 2) {
      punto(L, 14 + (n % 3), 6 - (n % 2), 'b')
      punto(L, 6 - (n % 2), 7 + (n % 3), 'b')
    }
  }
  const agente = (L, x, pose, dy = 0) => pon(L, tinte(pose, AGENTE), x, 11 + dy, true)
  const carpeta = (L, x, y) => pon(L, ['ooooo', 'okkko'], x, y)
  const listo = (L) => {
    caja(L, 19, 9, 1, 3, 'g')
    punto(L, 17, 7, 'w')
    punto(L, 18, 5, 'w')
    punto(L, 21, 6, 'w')
  }

  // Un día tranquilo.
  for (let n = 0; n < 5; n++) toma((L) => yo(L, n, 1))

  // Llega el primero.
  for (let x = 57, n = 0; x > 29; x -= 2, n++)
    toma((L) => {
      yo(L, n, 1)
      agente(L, x, n % 2 ? AG_ZANCADA : AG_PASO)
      pon(L, ['kkk', 'kkk'], x - 2, 16)
    })
  // Deja caer la carpeta en el escritorio.
  for (let n = 0; n < 2; n++)
    toma((L) => {
      yo(L, n, 0, n === 0 ? 1 : 0)
      agente(L, 29, AG_PIE)
      carpeta(L, 21, 12)
      if (n === 0) {
        punto(L, 20, 11, 'w')
        punto(L, 26, 11, 'w')
        punto(L, 23, 10, 'w')
      }
    })
  // Exige: «¡ya!», «¡¡ya!!», «para ayer».
  ;['ya', 'ya', 'ya', 'yaya', 'yaya', 'yaya', 'hora', 'hora', 'hora'].forEach((ic, n) =>
    toma((L) => {
      yo(L, n, n < 3 ? 1 : 2)
      agente(L, 29, AG_PIE, n % 2 && n > 2 ? -1 : 0)
      carpeta(L, 21, 12)
      globo(L, 27, 2, ic)
    }),
  )
  // Listo. La carpeta vuelve.
  for (let n = 0; n < 2; n++)
    toma((L) => {
      yo(L, 0, 0)
      listo(L)
      agente(L, 29, AG_PIE)
      carpeta(L, 21 + n * 3, 12)
    })
  for (let n = 0; n < 4; n++)
    toma((L) => {
      yo(L, 0, 0)
      agente(L, 29, AG_PIE, n % 2 ? 0 : 1)
      carpeta(L, 27, 14)
      globo(L, 27, 2, 'si')
    })
  // Se va.
  for (let x = 29, n = 0; x < 57; x += 2, n++)
    toma((L) => {
      yo(L, n, n > 4 ? 1 : 0)
      pon(L, tinte(n % 2 ? AG_ZANCADA : AG_PASO, AGENTE), x, 11)
      carpeta(L, x - 2, 14)
    })

  // Ahora llegan dos.
  for (let x = 57, n = 0; x > 28; x -= 2, n++)
    toma((L) => {
      yo(L, n, 1)
      agente(L, x, n % 2 ? AG_ZANCADA : AG_PASO)
      agente(L, x + 9, n % 2 ? AG_PASO : AG_ZANCADA)
    })
  for (let n = 0; n < 2; n++)
    toma((L) => {
      yo(L, n, 0, n === 0 ? 1 : 0)
      agente(L, 29, AG_PIE)
      agente(L, 38, AG_PIE)
      carpeta(L, 21, 12)
      carpeta(L, 20, 10)
    })
  ;['ya', 'hora', 'yaya', 'ya', 'hora', 'yaya', 'ya', 'hora', 'yaya', 'hora'].forEach((ic, n) =>
    toma((L) => {
      yo(L, n, 2)
      agente(L, 29, AG_PIE, n % 2 ? -1 : 0)
      agente(L, 38, AG_PIE, n % 2 ? 0 : -1)
      carpeta(L, 21, 12)
      carpeta(L, 20, 10)
      globo(L, 26, 2, n % 2 ? ic : 'yaya')
      globo(L, 36, 2, n % 2 ? 'yaya' : ic)
    }),
  )
  for (let n = 0; n < 2; n++)
    toma((L) => {
      yo(L, 0, 0)
      listo(L)
      agente(L, 29, AG_PIE)
      agente(L, 38, AG_PIE)
      carpeta(L, 21 + n * 3, 12)
      carpeta(L, 20 + n * 3, 10)
    })
  for (let n = 0; n < 6; n++)
    toma((L) => {
      yo(L, 0, 0)
      agente(L, 29, AG_PIE, n % 2 ? 0 : -1)
      agente(L, 38, AG_PIE, n % 2 ? -1 : 0)
      carpeta(L, 27, 14)
      carpeta(L, 36, 14)
      globo(L, 26, 2, 'amor')
      globo(L, 36, 2, 'amor')
    })
  for (let x = 29, n = 0; x < 57; x += 2, n++)
    toma((L) => {
      yo(L, n, n > 5 ? 1 : 0)
      pon(L, tinte(n % 2 ? AG_ZANCADA : AG_PASO, AGENTE), x, 11)
      pon(L, tinte(n % 2 ? AG_PASO : AG_ZANCADA, AGENTE), x + 9, 11)
      carpeta(L, x - 2, 14)
      carpeta(L, x + 7, 14)
    })
  return estrena('agentes', fondo, cuadros, 8, { s: '#c98510', y: '#ffffff' }, 30)
}

// ───────────────────────── Cobrado: billetes de 500 ─────────────────────────
// u azul del billete · n azul marino. A la izquierda el retrato; a la derecha, el 500.

const BILLETE = [
  'nnnnnnnnnnnnnnnnnn',
  'nuuuuuuuuuuuuuuuun',
  'nunnuwwwuwwwuwwwun',
  'nunnuwuuuwuwuwuwun',
  'nnnnuwwwuwuwuwuwun',
  'nnnnuuuwuwuwuwuwun',
  'nuuuuwwwuwwwuwwwun',
  'nuuuuuuuuuuuuuuuun',
  'nnnnnnnnnnnnnnnnnn',
]
// El billete cayendo: de frente, ladeado y de canto.
const LADEADO = [BILLETE[0], BILLETE[2], BILLETE[4], BILLETE[6], BILLETE[8]]
const DE_CANTO = ['nnnnnnnnnnnnnnnnnn', 'uuuuuuuuuuuuuuuuuu']
const CIFRA = {
  0: ['###', '#.#', '#.#', '#.#', '###'],
  2: ['###', '..#', '###', '#..', '###'],
  5: ['###', '#..', '###', '..#', '###'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  $: ['.##', '#..', '.#.', '..#', '##.'],
}
const letrero = (L, txt, x, y, c) =>
  [...txt].forEach((ch, i) => {
    pon(L, tinte(CIFRA[ch], { '#': c }), x + i * 4, y)
    // El signo de pesos lleva su raya, que sobresale arriba y abajo.
    if (ch === '$') {
      punto(L, x + i * 4 + 1, y - 1, c)
      punto(L, x + i * 4 + 1, y + 5, c)
    }
  })
const CHISPA = [['w'], ['.w.', 'www', '.w.'], ['..w..', '.....', 'w.w.w', '.....', '..w..'], ['w...w', '.....', '.....', '.....', 'w...w']]
const chispa = (L, x, y, t) => {
  const d = CHISPA[t]
  if (d) pon(L, d, x - Math.floor(d[0].length / 2), y - Math.floor(d.length / 2))
}

function escenaBilletes() {
  const fondo = piso()
  const { cuadros, toma } = rollo()
  const N = 5
  const CADA = 5 // cuadros entre un billete y el siguiente
  const lugar = (i, junto = 1) => [8 + Math.round(3 * i * junto), 11 - Math.round(2 * i * junto)]
  const caida = [
    [16, 3, BILLETE, 0],
    [12, 1, LADEADO, 2],
    [8, -1, DE_CANTO, 4],
    [5, -2, LADEADO, 2],
    [2, 1, BILLETE, 0],
  ]

  // Caen uno tras otro y se van acomodando en abanico.
  const fin = (N - 1) * CADA + caida.length
  for (let f = 0; f <= fin + 3; f++)
    toma((L) => {
      for (let i = 0; i < N; i++) {
        const t = f - i * CADA
        const [x, y] = lugar(i)
        if (t < 0) continue
        if (t < caida.length) {
          const [alto, dx, forma, dy] = caida[t]
          pon(L, forma, x + dx, y - alto + dy)
        } else pon(L, BILLETE, x, y)
        // Cada billete que cae suma.
        const s = t - caida.length
        if (s >= 0 && s < 5) letrero(L, '+500', 40, 9 - s, s < 4 ? 'w' : 's')
      }
    })
  // Se juntan en un fajo.
  for (const junto of [0.66, 0.33, 0])
    toma((L) => {
      for (let i = 0; i < N; i++) pon(L, BILLETE, ...lugar(i, junto))
    })
  // El fajo, con su cintilla, y lo que suma.
  const fajo = (L, x, y) => {
    for (let i = 3; i > 0; i--) pon(L, [BILLETE[8], BILLETE[8]], x + i, y + 7 + i)
    pon(L, BILLETE, x, y)
  }
  for (let n = 0; n < 8; n++)
    toma((L) => {
      fajo(L, 8, n === 0 ? 9 : 8)
      letrero(L, '$2500'.slice(0, 5), 35, 8, 'y')
      chispa(L, 6, 5, n - 1)
      chispa(L, 29, 15, n - 3)
      chispa(L, 44, 4, n - 4)
    })
  // Y se va a la cuenta.
  ;[0, -3, -4, -2, 4, 14, 28, 46].forEach((d, n) =>
    toma((L) => {
      fajo(L, 8 + Math.max(0, d), 8 + Math.min(0, d))
      if (n < 3) letrero(L, '$2500', 35, 8, 'y')
      if (n > 3) {
        raya(L, 4 + Math.max(0, d) - 6, 6 + Math.max(0, d) - 2, 10, 'w')
        raya(L, 4 + Math.max(0, d) - 9, 6 + Math.max(0, d) - 5, 14, 'w')
      }
    }),
  )
  for (let n = 0; n < 3; n++) toma(() => {})
  return estrena('billetes', fondo, cuadros, 10, { s: '#12924d', g: '#0b7a3c' }, 34)
}

// ───────────────────────── Por cobrar: se acerca el día ─────────────────────────

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
const HOJA = ['..kk.....kk..', 'kkkkkkkkkkkkk', 'kkwkkkkkkkwkk', 'kkkkkkkkkkkkk', ...Array(10).fill('kwwwwwwwwwwwk'), 'kkkkkkkkkkkkk']
const NUMERO = {
  3: ['kkkk.', '....k', '....k', '.kkk.', '....k', '....k', 'kkkk.'],
  2: ['.kkk.', 'k...k', '....k', '...k.', '..k..', '.k...', 'kkkkk'],
  1: ['..k..', '.kk..', '..k..', '..k..', '..k..', '..k..', '.kkk.'],
  '!': ['.rr..', '.rr..', '.rr..', '.rr..', '.rr..', '.....', '.rr..'],
  ok: ['.....', '....g', '...gg', 'g.gg.', 'ggg..', '.g...', '.....'],
}
const CAMPANA = ['....k....', '...kyk...', '..kyyyk..', '..kyyyk..', '..kyyyk..', '.kyyyyyk.', 'kyyyyyyyk', 'kkkkkkkkk', '...kyk...']
const AVION = ['......w', '....www', '..wwwww', 'wwwwww.', '..www..', '...ww..', '...w...']

function escenaCobro() {
  const fondo = piso()
  const { cuadros, toma } = rollo()
  const RX = 3
  const RY = 4
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

  /** El reloj de arena con una fracción de la arena ya abajo (0 a 1). */
  const arena = (L, k, hilo = 0) => {
    pon(L, VIDRIO, RX, RY)
    arriba.slice(Math.round(arriba.length * k)).forEach(([i, j]) => punto(L, RX + i, RY + j, 'y'))
    abajo.slice(0, Math.round(abajo.length * k)).forEach(([i, j]) => punto(L, RX + i, RY + j, 'y'))
    if (k > 0 && k < 1) for (let j = 7; j <= 13; j++) if ((j + hilo) % 2 === 0 && L[RY + j][RX + 5] === 'v') punto(L, RX + 5, RY + j, 'y')
  }
  const hoja = (L, n) => {
    pon(L, HOJA, 21, 5)
    pon(L, NUMERO[n], 25, 10)
  }
  const campana = (L, dx = 0, suena = false) => {
    raya(L, 44, 44, 4, 'k')
    punto(L, 44, 5, 'k')
    pon(L, CAMPANA, 40 + dx, 6)
    if (suena) {
      const lado = dx < 0 ? 37 : 51
      punto(L, lado, 8, 'w')
      punto(L, lado + (dx < 0 ? -1 : 1), 10, 'w')
      punto(L, lado, 12, 'w')
    }
  }

  // Tres, dos, uno: cada día que pasa se arranca una hoja.
  const PASOS = 30
  let paso = 0
  for (const n of [3, 2, 1]) {
    for (let f = 0; f < 10; f++) {
      const k = paso++ / PASOS
      toma((L) => {
        arena(L, k, paso)
        hoja(L, n)
        campana(L)
        // La hoja se dobla y sale volando.
        if (f === 8) pon(L, ['.s', 'ss'], 31, 17)
        if (f === 9) {
          caja(L, 22, 14, 11, 5, 'w')
          pon(L, ['wwww', 'wkkw', 'wwww'], 34, 13)
        }
        if (f === 0 && n !== 3) pon(L, ['ww.', 'www', '.ww'], 36, 16)
      })
    }
  }
  // Llegó el día: suena la campana.
  for (let f = 0; f < 8; f++)
    toma((L) => {
      arena(L, 1)
      hoja(L, '!')
      campana(L, f % 2 ? 1 : -1, true)
    })
  // Sale el aviso, el reloj se voltea y la cuenta vuelve a empezar.
  const lleno = lienzo(W, H)
  arena(lleno, 1)
  ;[45, 90, 135, 180, 180, 180, 180].forEach((g, f) =>
    toma((L) => {
      if (g === 180) arena(L, 0)
      else pon(L, gira(lleno, g, RX + 5, RY + 7.5), 0, 0)
      hoja(L, 'ok')
      campana(L)
      const x = 46 + f * 2
      const y = 3 - Math.floor(f / 2)
      pon(L, AVION, x, y)
      if (f > 0) punto(L, x - 2, y + 7, 'w')
      if (f > 1) punto(L, x - 5, y + 9, 'w')
    }),
  )
  return estrena('cobro', fondo, cuadros, 8, { s: '#c12e26', y: '#ffe27a', r: '#c81e10' }, 4)
}

const ESCENAS = { puertas: peliPuertas, agentes: escenaAgentes, billetes: escenaBilletes, cobro: escenaCobro }

/** El canvas de una escena. La película se arma la primera vez que se pide. */
export function escena(nombre) {
  if (!pelicula(nombre)) ESCENAS[nombre]()
  return canvasDe(nombre)
}

// Para las herramientas que revisan las películas cuadro por cuadro.
export { pelicula, pinta } from './pixel.js'
