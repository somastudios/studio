// Pixel art animado, sin imágenes. Cada escena se compone en una cuadrícula de letras y sale
// como un SVG de bordes duros: un fondo fijo y, encima, los cuadros de lo que se mueve. Los
// cuadros se alternan con CSS (como el trazo que hierve), así que animar no cuesta nada por
// cuadro y un repintado no reinicia nada si el HTML no cambió.
//
// Cada letra es un color (ver .px-* en hoy.css). El punto es transparente.

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
  for (let x = x0; x <= x1; x++) punto(L, x, y, c)
}

export const caja = (L, x, y, w, h, c) => {
  for (let j = 0; j < h; j++) raya(L, x, x + w - 1, y + j, c)
}

/** Cambia letras de un dibujo: tinte(PERSONA, { s: 'r' }) le pone la camisa roja. */
export const tinte = (dibujo, mapa) => dibujo.map((fila) => [...fila].map((c) => mapa[c] ?? c).join(''))

/**
 * Gira una zona del lienzo alrededor de un centro. Cada pixel nuevo mira nueve puntos del
 * original y se queda con el color que más se repite: así los contornos sobreviven al giro.
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

/** Un lienzo, como trazos: uno por color, hechos de tiras horizontales. */
function trazos(L) {
  const porColor = {}
  for (let y = 0; y < L.length; y++) {
    let x = 0
    while (x < L[0].length) {
      const c = L[y][x]
      if (c === '.') {
        x++
        continue
      }
      let n = 1
      while (x + n < L[0].length && L[y][x + n] === c) n++
      porColor[c] = (porColor[c] || '') + `M${x} ${y}h${n}v1h-${n}z`
      x += n
    }
  }
  return Object.keys(porColor)
    .sort()
    .map((c) => `<path class="px-${c}" d="${porColor[c]}"/>`)
    .join('')
}

/**
 * Arma la película. El fondo se dibuja una vez y queda fijo; de cada cuadro solo se guarda lo
 * que se mueve. Los cuadros repetidos se dibujan una sola vez y cada turno apunta al suyo.
 */
export function pelicula(id, fondo, cuadros, fps) {
  const w = fondo[0].length
  const h = fondo.length
  const dibujos = cuadros.map(trazos)
  const unicos = [...new Set(dibujos)]
  const n = cuadros.length
  const T = n / fps
  const corte = (100 / n).toFixed(4)
  const turnos = dibujos.map((d, i) => `<use href="#px-${id}-${unicos.indexOf(d)}" style="animation:px-${id} ${T.toFixed(3)}s steps(1) ${(-(T - i / fps)).toFixed(3)}s infinite"/>`).join('')
  return `<svg class="px" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true"><style>@keyframes px-${id}{0%{visibility:visible}${corte}%,to{visibility:hidden}}</style><defs>${unicos.map((d, i) => `<g id="px-${id}-${i}">${d}</g>`).join('')}</defs><g>${trazos(fondo)}</g>${turnos}</svg>`
}
