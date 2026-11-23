import { lienzo, punto, pon, raya, caja, linea, elipse, sombra, calca, frena, rebota, tramo } from './pixel.js'
import { W, H, DALI, ALEX, busto, golpe, destello, confeti, rotulo, dobla, montaje } from './reparto.js'

// «Cayó el pago»: la película de la ficha de Cobrado. Llega la transferencia y llueven
// billetes de 500.
//
//   1  detalle        el teléfono: «+$500»
//   2  dos caras      se miran… ¿ya viste?
//   3  contrapicado   llueven billetes; las manos, arriba
//   4  detalle        contando: el pulgar pasa un billete tras otro
//   5  general        los billetes brincan al cochinito

// El billete de 500: azul, con su retrato a la izquierda y la cifra a la derecha.
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
// Cayendo: de frente, ladeado y de canto.
const LADEADO = [BILLETE[0], BILLETE[2], BILLETE[4], BILLETE[6], BILLETE[8]]
const DE_CANTO = ['nnnnnnnnnnnnnnnnnn', 'uuuuuuuuuuuuuuuuuu']
const GIRO = [BILLETE, LADEADO, DE_CANTO, LADEADO]
const GRANDE = GIRO.map((d) => dobla(d, 2))

/** 1 · Detalle: el teléfono vibra. */
function planoAviso(L, f) {
  const vibra = f >= 5 && f < 9 ? (f % 2 ? 1 : -1) : 0
  const x = 22 + vibra
  // La mano que lo sostiene.
  elipse(L, 18, 30, 8, 8, 'c')
  elipse(L, 66, 34, 9, 7, 'c')
  // El teléfono: se sale del cuadro por abajo.
  caja(L, x, 2, 40, 34, 'k')
  caja(L, x + 2, 4, 36, 32, 'N')
  raya(L, x + 16, x + 23, 3, 'd')
  // El fondo de pantalla: el logo.
  elipse(L, x + 20, 22, 6, 6, 'n')
  elipse(L, x + 20, 22, 2, 2, 'z')
  // La notificación baja rebotando.
  const baja = rebota(tramo(f, 2, 8))
  const y = Math.round(-10 + baja * 16)
  if (f >= 2) {
    caja(L, x + 4, y, 32, 11, 'w')
    elipse(L, x + 9, y + 5, 3, 3, 'g')
    raya(L, x + 8, x + 10, y + 5, 'w')
    rotulo(L, '+$500', x + 14, y + 3, 'k')
  }
  // Una segunda, que empuja a la primera.
  if (f >= 13) {
    const y2 = Math.round(-10 + rebota(tramo(f, 13, 18)) * 29)
    caja(L, x + 4, y2, 32, 11, 'p')
    elipse(L, x + 9, y2 + 5, 3, 3, 'g')
    raya(L, x + 8, x + 10, y2 + 5, 'w')
    rotulo(L, '+$500', x + 14, y2 + 3, 'k')
  }
  // Suena.
  if (f >= 5 && f < 11) {
    const d = (f - 5) % 3
    linea(L, 16 - d, 6, 13 - d, 10, 'w')
    linea(L, 67 + d, 6, 70 + d, 10, 'w')
    linea(L, 14 - d, 14, 12 - d, 17, 'w')
    linea(L, 69 + d, 14, 71 + d, 17, 'w')
  }
  if (f === 6 || f === 15) destello(L, 70, 4, 3, 'y')
}

/** 2 · Dos caras: se miran. */
function planoYaViste(L, f) {
  const riendo = f >= 9
  const b = riendo ? (f % 4 < 2 ? -1 : 0) : 0
  if (riendo) {
    // Signos de pesos que suben entre los dos.
    for (let i = 0; i < 3; i++) {
      const y = 26 - ((f - 9) * 2 + i * 9) % 30
      rotulo(L, '$', 38 + i * 3 - 3, y, 'y')
    }
  }
  busto(L, 62, 9 + (riendo ? -1 - b : 0), ALEX, { mira: f >= 5 ? -1 : 0, cejas: 1, boca: riendo ? 'rie' : 'o', cierra: riendo && f % 6 < 2, pelo: riendo && f % 4 === 0 ? 1 : 0 })
  busto(L, 22, 9 + b, DALI, { mira: f >= 5 ? 1 : 0, cejas: 1, boca: riendo ? 'rie' : 'o', cierra: f === 3 || (riendo && f % 6 > 3) })
}

/** 3 · Contrapicado: llueve dinero. */
function planoLluvia(L, f) {
  // Rayos que giran despacio detrás de todo.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + f * 0.05
    for (let r = 6; r < 60; r += 1) {
      const x = 42 + Math.cos(a) * r * 1.6
      const y = 30 + Math.sin(a) * r
      caja(L, Math.round(x), Math.round(y), 2, 1, 'q')
    }
  }
  // Los billetes de lejos, chicos y lentos; los de cerca, grandes y rápidos.
  for (let i = 0; i < 7; i++) {
    const x = (i * 29 + 5) % 84
    const y = ((i * 17 + f * 2.2) % 50) - 12
    pon(L, GIRO[(i + Math.floor(f / 2)) % 4], x - 9 + Math.round(Math.sin(f * 0.5 + i) * 2), Math.round(y))
  }
  // Las manos, arriba: los brazos de Dalí y las mangas de Alex.
  const ola = (i) => Math.round(Math.sin(f * 0.9 + i * 1.7) * 2)
  ;[
    [12, 'c', 'c'],
    [26, 'c', 'c'],
    [56, 'n', 'e'],
    [70, 'n', 'e'],
  ].forEach(([x, manga, piel], i) => {
    const y = 21 + ola(i)
    linea(L, x, 34, x + ola(i), y + 4, manga, 5)
    pon(L, ['.#.#.', '#####', '#####', '.###.'].map((r) => r.replace(/#/g, piel)), x - 2 + ola(i), y)
  })
  for (let i = 0; i < 3; i++) {
    const x = (i * 37 + 16) % 80
    const y = ((i * 23 + f * 4.5) % 70) - 26
    pon(L, GRANDE[(i * 2 + Math.floor(f / 2)) % 4], x - 18, Math.round(y))
  }
}

/** 4 · Detalle: contando. */
function planoCuenta(L, f) {
  const CADA = 4
  const pasados = Math.min(5, Math.floor(f / CADA))
  const t = f % CADA
  // El montón de la izquierda, que baja, y el de la derecha, que sube.
  for (let i = 4 - pasados; i >= 0; i--) pon(L, GRANDE[0], 2 + i, 13 - i)
  for (let i = 0; i < pasados; i++) pon(L, GRANDE[0], 45 - i, 13 - i)
  // El que va pasando: se arquea en el aire.
  if (pasados < 5 && f < 5 * CADA) {
    const k = t / (CADA - 1)
    const x = 4 + k * 40
    const y = 12 - Math.sin(k * Math.PI) * 9
    pon(L, GRANDE[t === 1 || t === 2 ? 1 : 0], Math.round(x), Math.round(y + (t === 1 || t === 2 ? 4 : 0)))
    if (t === 1) {
      raya(L, 8, 14, 9, 'w')
      raya(L, 6, 10, 12, 'w')
    }
  }
  // Los pulgares.
  const pulgar = (x, y, piel, sombra) => {
    caja(L, x, y + 1, 6, 12, piel)
    raya(L, x + 1, x + 4, y, piel)
    caja(L, x + 5, y + 2, 1, 11, sombra)
    caja(L, x + 1, y + 1, 4, 3, 'w')
    raya(L, x + 1, x + 4, y + 6, sombra)
  }
  pulgar(9 + (t === 0 ? 3 : 0), 23, 'c', 'C')
  pulgar(60, 24 - (t === CADA - 1 ? 1 : 0), 'e', 'E')
  // La cuenta.
  const total = pasados * 500
  if (total) {
    const txt = `$${total}`
    caja(L, 82 - txt.length * 4 - 3, 1, txt.length * 4 + 4, 9, 'k')
    rotulo(L, txt, 82 - txt.length * 4 - 1, 3, t === 0 && f < 21 ? 'w' : 'y')
  }
  if (pasados === 5 && f >= 20) {
    destello(L, 40, 5, f % 2 ? 3 : 2, 'y')
    destello(L, 24, 8, f % 2 ? 2 : 3)
  }
}

/** 5 · General: al cochinito. */
function planoCochinito(L, f) {
  raya(L, 0, W - 1, 30, 'k')
  caja(L, 0, 31, W, 2, 's')
  // Cada billete brinca en arco y entra por la ranura.
  const CADA = 5
  const entra = (i) => f === i * CADA + 4
  const traga = [0, 1, 2].some(entra)
  const feliz = f >= 16
  const brinca = feliz ? Math.round(Math.abs(Math.sin((f - 16) * 0.9)) * 4) : 0
  const aplasta = traga ? 1 : 0
  const cy = 19 + aplasta - brinca
  sombra(L, 56, 30, 14 - brinca, 1)
  // Las patas, la cola, el cuerpo y la oreja.
  caja(L, 62, cy + 7, 4, 30 - cy - 7, 'r')
  caja(L, 46, cy + 7, 4, 30 - cy - 7, 'r')
  linea(L, 70, cy - 2, 73, cy - 5, 'r')
  punto(L, 74, cy - 4, 'r')
  elipse(L, 56, cy, 14, 9 - aplasta, 'R')
  elipse(L, 56, cy + 3, 13, 6 - aplasta, 'r')
  elipse(L, 56, cy - 1, 13, 8 - aplasta, 'R')
  pon(L, ['.rr', 'rRr', 'RRr'], 46, cy - 10 + aplasta)
  // El hocico, el ojo y el logo en el lomo.
  elipse(L, 42, cy + 1, 3, 3, 'r')
  punto(L, 41, cy, 'k')
  punto(L, 41, cy + 2, 'k')
  if (feliz) {
    linea(L, 46, cy - 3, 48, cy - 4, 'k')
    linea(L, 48, cy - 4, 50, cy - 3, 'k')
  } else caja(L, 47, cy - 4, 2, 2, 'k')
  elipse(L, 60, cy, 3, 3, 'w')
  elipse(L, 60, cy, 1, 1, 'z')
  // La ranura.
  raya(L, 53, 61, cy - 9 + aplasta, 'k')
  for (let i = 0; i < 3; i++) {
    const t = f - i * CADA
    if (t < 0 || t > 4) continue
    const k = t / 4
    const x = -16 + k * 64
    const y = 14 - Math.sin(k * Math.PI) * 16 + k * (cy - 22)
    pon(L, GIRO[t % 4], Math.round(x), Math.round(y))
  }
  if (traga) golpe(L, 57, cy - 10, 7)
  if (feliz) {
    confeti(L, f - 16, 20)
    rotulo(L, '$1500', 1, 5 - Math.min(2, f - 16), 'y', 2)
  }
}

const PLANOS = [
  [20, planoAviso],
  [18, planoYaViste],
  [26, planoLluvia],
  [24, planoCuenta],
  [26, planoCochinito],
]

export const peliCobrado = () => montaje('billetes', PLANOS, { s: '#12924d', q: '#1fbd68' }, 20 + 18 + 12)
