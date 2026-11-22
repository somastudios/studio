// Boil: el trazo "a mano" que hierve.
// Cada forma se describe como una lista de puntos; se generan 3 variantes con
// un temblor suave distinto y el CSS las alterna a ~8 fps (animación en treses).
// No hay filtros SVG en vivo: el costo por cuadro es cero.

const TAU = Math.PI * 2
const FRAMES = 3
let counter = 1

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n) => Math.round(n * 100) / 100
const rad = (deg) => (deg * Math.PI) / 180

/** Primitivas: devuelven { pts, closed }. Ángulos en grados, 0° = derecha, -90° = arriba. */
export const P = {
  circle(cx, cy, r, n) {
    n = n || Math.max(10, Math.round(8 + r * 0.2))
    const pts = Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i / n) * TAU
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    })
    return { pts, closed: true }
  },
  arc(cx, cy, r, a0, a1, n) {
    n = n || Math.max(4, Math.round((Math.abs(a1 - a0) / 360) * (8 + r * 0.2)) + 1)
    const pts = Array.from({ length: n }, (_, i) => {
      const a = rad(a0 + ((a1 - a0) * i) / (n - 1))
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    })
    return { pts, closed: false }
  },
  line(x1, y1, x2, y2, n) {
    n = n || Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 36) + 1)
    const pts = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1)
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]
    })
    return { pts, closed: false }
  },
  curve(x0, y0, x1, y1, x2, y2, x3, y3, n = 12) {
    const pts = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1)
      const m = 1 - t
      return [
        m * m * m * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x3,
        m * m * m * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y3,
      ]
    })
    return { pts, closed: false }
  },
}

function wobble(pts, closed, amp, rand) {
  const n = pts.length
  const s = [0]
  let L = 0
  for (let i = 1; i < n; i++) {
    L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    s.push(L)
  }
  if (closed) L += Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1])
  // dos ondas lentas: el pulso de la mano, no ruido
  const k1 = closed ? 2 + Math.floor(rand() * 2) : 0.55 + rand() * 0.8
  const k2 = closed ? 5 + Math.floor(rand() * 3) : 1.9 + rand() * 1.4
  const p1 = rand() * TAU
  const p2 = rand() * TAU
  const p3 = rand() * TAU
  return pts.map((p, i) => {
    const a = closed ? pts[(i - 1 + n) % n] : pts[Math.max(0, i - 1)]
    const b = closed ? pts[(i + 1) % n] : pts[Math.min(n - 1, i + 1)]
    let tx = b[0] - a[0]
    let ty = b[1] - a[1]
    const tl = Math.hypot(tx, ty) || 1
    tx /= tl
    ty /= tl
    const t = (s[i] / (L || 1)) * TAU
    const end = !closed && (i === 0 || i === n - 1) ? 0.45 : 1
    const off = amp * end * (0.66 * Math.sin(k1 * t + p1) + 0.34 * Math.sin(k2 * t + p2))
    const along = amp * end * 0.4 * Math.sin(k1 * t + p3)
    return [p[0] - ty * off + tx * along, p[1] + tx * off + ty * along]
  })
}

// Catmull-Rom → Bézier cúbica
function toPath(pts, closed) {
  const n = pts.length
  const g = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1)
    const p1 = g(i)
    const p2 = g(i + 1)
    const p3 = g(i + 2)
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(
      p2[0] - (p3[0] - p1[0]) / 6,
    )} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return closed ? d + 'Z' : d
}

/** Trazo exacto (sin temblor): sirve de guía de movimiento para el punto. */
export function guide(shape) {
  return toPath(shape.pts, shape.closed)
}

/** Las 3 variantes `d` de una o varias formas. */
export function boilD(shapes, { amp = 1, seed } = {}) {
  const list = Array.isArray(shapes) ? shapes : [shapes]
  const base = seed ?? counter++
  return Array.from({ length: FRAMES }, (_, fr) =>
    list.map((sh, k) => toPath(wobble(sh.pts, sh.closed, amp, rng(base * 97 + fr * 31 + k * 7 + 1)), sh.closed)).join(''),
  )
}

/** Grupo SVG listo para insertar. Con la clase `draw` el trazo se dibuja animando --draw de 1.06 a 0. */
export function boil(shapes, { amp = 1, seed, cls = '', attrs = '' } = {}) {
  const paths = boilD(shapes, { amp, seed })
    .map((d) => `<path d="${d}" pathLength="1"/>`)
    .join('')
  return `<g class="boil ${cls}" ${attrs}>${paths}</g>`
}
