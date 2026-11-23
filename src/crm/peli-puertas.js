import { lienzo, punto, pon, raya, caja, linea, elipse, sombra, suave, frena, rebota, tramo } from './pixel.js'
import { W, H, DALI, ALEX, DON, DOÑA, busto, nuca, mini, globo, golpe, confeti, rotulo, TACHE, CORAZON, montaje } from './reparto.js'

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
// El reparto (Dalí, Alex y los de las casas) vive en reparto.js.

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
    linea(L, X(xD) + 4, 17, X(xD) + 6 + sube, 17 - sube, 'c')
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
  // El antebrazo y el puño.
  linea(L, hx - 26, hy + 20, hx - 5, hy + 5, 'c', 9)
  linea(L, hx - 26, hy + 24, hx - 6, hy + 9, 'C', 2)
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
    linea(afuera, 27, 32, 27 + m, 24, 'C', 3)
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
    linea(L, 32, 32, mx - 2, my + 2, 'c', 4)
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
    elipse(L, x, y, 2.4, 6, P.ropa)
    const b = Math.round(fase * 2)
    punto(L, x + b, y - 7, P.piel)
    punto(L, x - b, y + 7, P.piel)
    if (P.peinado === 'rizos') {
      // Los rizos: un nubarrón disparejo, con mechones que se salen.
      elipse(L, x, y, 4.4, 4.4, P.pelo)
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
      raya(L, x + 1, x + 3, y, 'a')
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
  linea(L, 33, 33, xD - 1 - atras, yM + 3, 'c', 4)
  linea(L, 51, 33, xA + 1 + atras, yM + 3, 'n', 4)
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
export const peliPuertas = () => montaje('puertas', PLANOS, { s: '#1848b4' }, 66)
