// Pixel art animado, sin imágenes. Una película es una lista de cuadros; cada cuadro es una
// cuadrícula de letras y cada letra, un color (el punto es transparente). Se proyecta en un
// <canvas> escalado sin suavizar, así que los pixeles quedan nítidos a cualquier tamaño y una
// película larga no pesa nada en la página.
//
// El reloj es global: si la vista se repinta y el canvas se cambia por otro, la película sigue
// donde iba en lugar de volver a empezar.

export const PALETA = {
  k: '#050506', // tinta
  p: '#efece4', // papel
  w: '#ffffff',
  d: '#2b2c33', // gris oscuro
  D: '#5d5f6b', // gris medio
  G: '#a9abb6', // gris claro
  y: '#ffcb1f',
  o: '#c9790a', // madera
  O: '#8f5406', // madera oscura
  r: '#ff5240',
  R: '#ffb1a4', // rubor
  b: '#8fbaff',
  g: '#1fce6d',
  q: '#2f9e63', // verde hoja
  x: '#ead0aa', // adobe
  X: '#d3b185', // adobe en sombra
  z: '#216fff', // el azul de Soma
  u: '#5b92f5', // billete
  n: '#1d3f8f', // azul marino
  N: '#122a66', // marino en sombra
  c: '#fbdcc0', // piel de Dalí
  C: '#e6b796', // su sombra
  e: '#f0c49c', // piel de Alex
  E: '#d6a078', // su sombra
  m: '#c68a5c', // otra piel (vecinos)
  h: '#4d2f1c', // castaño oscuro
  H: '#7a4d2c', // castaño con luz
  a: '#17141d', // pelo negro
  A: '#3c3850', // pelo negro con luz
  s: '#1848b4', // la sombra de la ficha (cada película pone la suya)
  v: 'rgb(255 255 255 / 0.3)', // vidrio
  t: 'rgb(5 5 6 / 0.28)', // sombra en el piso
}

// ───────────────────────── Dibujar en la cuadrícula ─────────────────────────

export const lienzo = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'))

export const punto = (L, x, y, c) => {
  x = Math.round(x)
  y = Math.round(y)
  if (c !== '.' && y >= 0 && y < L.length && x >= 0 && x < L[0].length) L[y][x] = c
}

/** Estampa un dibujo (lista de renglones) con su esquina en x, y. `espejo` lo voltea. */
export const pon = (L, dibujo, x, y, espejo = false) =>
  dibujo.forEach((fila, j) => {
    const f = espejo ? [...fila].reverse() : [...fila]
    f.forEach((c, i) => punto(L, x + i, y + j, c))
  })

export const raya = (L, x0, x1, y, c) => {
  for (let x = Math.round(x0); x <= Math.round(x1); x++) punto(L, x, y, c)
}

export const caja = (L, x, y, w, h, c) => {
  for (let j = 0; j < h; j++) raya(L, x, x + w - 1, y + j, c)
}

/** Una recta de cualquier grosor entre dos puntos. */
export function linea(L, x0, y0, x1, y1, c, grosor = 1) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))))
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    const y = y0 + ((y1 - y0) * i) / n
    if (grosor === 1) punto(L, x, y, c)
    else caja(L, Math.round(x - (grosor - 1) / 2), Math.round(y - (grosor - 1) / 2), grosor, grosor, c)
  }
}

export function elipse(L, cx, cy, rx, ry, c) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / (rx + 0.35)
      const dy = (y - cy) / (ry + 0.35)
      if (dx * dx + dy * dy <= 1) punto(L, x, y, c)
    }
}

// Una cuadrícula no mezcla colores: la sombra oscurece lo que haya debajo, tono por tono.
const MAS_OSCURO = { p: 'G', w: 'G', G: 'D', D: 'd', d: 'k', x: 'X', X: 'O', y: 'o', o: 'O', r: 'O', b: 'u', q: 'd', g: 'q' }

/** Una sombra ovalada en el piso. */
export function sombra(L, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / (rx + 0.35)
      const dy = (y - cy) / (ry + 0.35)
      if (dx * dx + dy * dy > 1 || y < 0 || y >= L.length || x < 0 || x >= L[0].length) continue
      const c = L[y][x]
      L[y][x] = c === '.' ? 't' : (MAS_OSCURO[c] ?? c)
    }
}

/** Renglones como [y, x0, x1] (o [y, x0, x1, color]) relativos a un origen: para siluetas. */
export const tramos = (L, ox, oy, lista, c) => lista.forEach(([y, x0, x1, cc]) => raya(L, ox + x0, ox + x1, oy + y, cc || c))

/** Cambia letras de un dibujo: tinte(PERSONA, { s: 'r' }) le pone la camisa roja. */
export const tinte = (dibujo, mapa) => dibujo.map((fila) => [...fila].map((c) => mapa[c] ?? c).join(''))

/** Copia un lienzo sobre otro, desplazado. Lo que se sale, se pierde. */
export const calca = (L, otro, dx = 0, dy = 0) => otro.forEach((fila, j) => fila.forEach((c, i) => punto(L, i + dx, j + dy, c)))

/**
 * Gira un lienzo alrededor de un centro. Cada pixel nuevo mira nueve puntos del original y se
 * queda con el color que más se repite: así los contornos sobreviven al giro.
 */
export function gira(L, grados, cx, cy) {
  const a = (-grados * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  const H = L.length
  const W = L[0].length
  const N = lienzo(W, H)
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

// Curvas de movimiento: de 0 a 1.
export const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
export const frena = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3))
export const rebota = (t) => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const c = 2.2
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}
// El tiempo fino. Los planos se escriben contando cuadros enteros (a 12 por segundo), pero se
// proyectan a 60: entre un cuadro y el siguiente hay cinco pasos. `fino` dice en cuál vamos
// (de 0 a 1) y lo usan las funciones de movimiento, así que todo lo que se mueve con `tramo`
// o con `ahora` avanza de corrido sin tocar la lógica de cada plano.
let fino = 0
export const fija = (x) => (fino = x)
/** La fracción del cuadro en curso: 0, 0.2, 0.4… */
export const fraccion = () => fino
/** El cuadro con decimales, para movimientos continuos: Math.sin(ahora(f) * 0.9). */
export const ahora = (f) => f + fino

/** Avance de 0 a 1 entre dos cuadros (continuo). */
export const tramo = (f, desde, hasta) => {
  const t = f + fino
  return t <= desde ? 0 : t >= hasta ? 1 : (t - desde) / (hasta - desde)
}

// ───────────────────────── Películas ─────────────────────────

const PELIS = {}

/**
 * Registra una película.
 *   w, h      tamaño en pixeles
 *   fps       cuadros por segundo
 *   n         cuántos cuadros tiene
 *   cuadro(i) devuelve el lienzo del cuadro i (se llama una vez por cuadro y se guarda)
 *   colores   letras que cambian de color en esta película (la sombra de su ficha, acentos)
 *   cartel    el cuadro que se muestra quieto a quien pidió menos movimiento
 */
export function registra(id, peli) {
  PELIS[id] = { cartel: 0, colores: {}, ...peli, hechos: new Set(), hoja: null }
  return PELIS[id]
}

export const pelicula = (id) => PELIS[id]

function hojaDe(p) {
  if (!p.hoja) {
    // Todos los cuadros, uno junto al otro, en un lienzo que nunca se muestra.
    const cols = Math.min(p.n, 24)
    p.cols = cols
    p.hoja = document.createElement('canvas')
    p.hoja.width = p.w * cols
    p.hoja.height = p.h * Math.ceil(p.n / cols)
  }
  return p.hoja
}

function revela(p, i) {
  const hoja = hojaDe(p)
  if (p.hechos.has(i)) return
  const g = hoja.getContext('2d')
  const L = p.cuadro(i)
  const ox = (i % p.cols) * p.w
  const oy = Math.floor(i / p.cols) * p.h
  const color = { ...PALETA, ...p.colores }
  for (let y = 0; y < p.h; y++) {
    let x = 0
    while (x < p.w) {
      const c = L[y][x]
      if (c === '.') {
        x++
        continue
      }
      let n = 1
      while (x + n < p.w && L[y][x + n] === c) n++
      g.fillStyle = color[c] || '#f0f'
      g.fillRect(ox + x, oy + y, n, 1)
      x += n
    }
  }
  p.hechos.add(i)
}

/** Dibuja el cuadro i de una película en un canvas. */
export function pinta(canvas, id, i) {
  const p = PELIS[id]
  if (!p) return
  revela(p, i)
  const g = canvas.getContext('2d')
  g.clearRect(0, 0, p.w, p.h)
  g.drawImage(p.hoja, (i % p.cols) * p.w, Math.floor(i / p.cols) * p.h, p.w, p.h, 0, 0, p.w, p.h)
}

/** El canvas de una película, listo para ponerse en la página. */
export const canvasDe = (id) => {
  const p = PELIS[id]
  return `<canvas class="px" data-px="${id}" width="${p.w}" height="${p.h}"></canvas>`
}

let corriendo = false
const quieto = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Echa a andar el proyector: mientras haya canvas de película en la página, les va poniendo
 * el cuadro que toca. Cuando ya no hay ninguno, se apaga solo. Llamarlo de más no hace daño.
 */
export function proyecta() {
  if (corriendo) return
  corriendo = true
  const paso = (ahora) => {
    const pantallas = document.querySelectorAll('canvas[data-px]')
    if (!pantallas.length) {
      corriendo = false
      return
    }
    const parado = quieto()
    // Calcular un cuadro por primera vez cuesta; después sale de la hoja. Si en esta vuelta
    // ya se gastó el tiempo, los que falten esperan a la siguiente y la página no se traba.
    const limite = performance.now() + 7
    for (const c of pantallas) {
      const p = PELIS[c.dataset.px]
      if (!p) continue
      const i = parado ? p.cartel : Math.floor((ahora / 1000) * p.fps) % p.n
      if (c._cuadro !== i) {
        if (c._cuadro !== undefined && !p.hechos.has(i) && performance.now() > limite) continue
        pinta(c, c.dataset.px, i)
        c._cuadro = i
      }
    }
    requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}
