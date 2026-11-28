import Trazo from '../core/trazo-vivo.js'
import { actua } from './reparto-trazo.js'
import { DUENO, parpadea } from './trazos.js'

// Los dibujos de trazo vivo de las demás escenas de la visita. Cada función recibe un <svg>
// vacío, lo echa a andar y devuelve con qué se le avisa de lo que pasa en la escena.
//
// Un hilo une varias: la maraña. En «Lo que suele pasar» cada problema que el dueño marca le
// agrega vueltas a un nudo sobre su cabeza; en «Lo que entendimos» el punto jala la punta y el
// nudo se vuelve los renglones de su expediente. Cómo se hace y cómo se revisa: skill
// soma-animation.

const { P, D, T, G, monta, mezclaPts, tramo, mezcla, suave, salto, golpe, elastico, brinco, pon, traza, ve, forma, agita, punto } = Trazo

const ahora = () => performance.now() / 1000
const HEBRAS = 4
const M = 56

/** La maraña: un garabato de una sola línea, partido en cuatro hebras que se continúan. */
function marana(cx, cy, R) {
  const total = HEBRAS * (M - 1)
  const pt = (i) => {
    const t = i / total
    const a = 2 * Math.PI * 7.4 * t + 1.5 * Math.sin(2 * Math.PI * 3.1 * t)
    const r = R * (0.34 + 0.66 * Math.abs(Math.sin(2 * Math.PI * 2.6 * t + 0.6)))
    return [cx + 1.12 * r * Math.cos(a) + 0.3 * R * Math.sin(2 * Math.PI * 3.3 * t + 1), cy + 0.84 * r * Math.sin(a) + 0.24 * R * Math.cos(2 * Math.PI * 4.1 * t)]
  }
  return Array.from({ length: HEBRAS }, (_, k) => Array.from({ length: M }, (_, j) => pt(k * (M - 1) + j)))
}
const recta = (x0, x1, y) => Array.from({ length: M }, (_, j) => [mezcla(x0, x1, j / (M - 1)), y])
const hebras = (H, cls) => H.map((h, k) => T(D(h, false), { cls, amp: 1.1, n: 'h' + k })).join('')

/**
 * «Lo que suele pasar». El dueño está tranquilo; cada problema que marca le agrega vueltas a la
 * maraña y él se va apurando: las cejas, la boca, una gota de sudor y, con tres, la mano a la
 * barbilla. Si desmarca, se afloja. Devuelve { pon(n, t) } para avisarle cuántos lleva.
 * El <svg> lleva viewBox="56 4 208 276".
 */
export function sueleVivo(svg, cuantos = 0) {
  const NUDO = marana(172, 62, 46)
  let n = cuantos
  let desde = cuantos // cuántos «se veían» cuando cambió
  let tk = -9 // cuándo cambió
  let sube = true

  monta(svg, {
    dur: Infinity,
    cartel: 2,
    svg: () => G('nudo', hebras(NUDO, 'ln tz')) + `<g transform="translate(10 66)">${DUENO()}</g>`,
    paso(q, t) {
      const k = t - tk
      const nv = mezcla(desde, n, suave(tramo(k, 0, 0.55)))
      const lleno = Math.min(1, nv / 6)
      const s = Math.min(1, nv / 4) // qué tan apurado está
      const susto = sube ? golpe(k, 0.05, 0.45) : 0
      const alivio = sube ? 0 : salto(tramo(k, 0.1, 1))
      // la maraña: se dibuja por hebras, hierve más entre más grande y se mece
      NUDO.forEach((_, i) => {
        traza(q('h' + i), tramo(lleno, i / HEBRAS, (i + 1) / HEBRAS))
        agita(q('h' + i), 1 + 1.5 * s + 2.2 * susto)
      })
      pon(q('nudo'), { ox: 172, oy: 62, r: 5 * s * Math.sin(t * 1.4) + 6 * susto * Math.sin(k * 26) })
      // usted
      const barbilla = suave(tramo(nv, 2.4, 3))
      const g = (t % 2.8) / 1.1
      actua(q, 'u', {
        gira: 3.5 * s + 1.2 * (1 - s) * Math.sin(t * 1.1),
        dy: 2.2 * s - 2.8 * susto + 1.4 * alivio,
        sy: 1 - 0.02 * alivio,
        mira: [mezcla(3, 1.4, s), mezcla(0.2, -2.6, s)],
        abre: (1 + 0.45 * susto) * parpadea(t % 4.2, 1.1, 3.4),
        cejas: [-1.2 * s - 3 * susto, -13 * s, -1.2 * s - 3 * susto, 13 * s],
        boca: [0, mezcla(0.75, -0.95, s), 0.3 * susto + 0.25 * alivio],
        brazo: 0,
        mano: [mezcla(20, 0, barbilla), mezcla(80, 0, barbilla), 0],
        pelo: -4 * susto + 2 * alivio,
        gota: nv >= 1.6 && g <= 1 ? g : -1,
        resp: 0.012 * Math.sin(t * (1.8 + 1.6 * s)) - 0.03 * alivio,
      })
      for (const x of ['um', 'uante', 'umanga']) ve(q(x), barbilla)
    },
  })

  return {
    /** Ahora lleva `k` problemas marcados. `t` (opcional) es el segundo del reloj, para revisar. */
    pon(k, t) {
      if (k === n) return
      const tt = t ?? ahora()
      desde = mezcla(desde, n, suave(tramo(tt - tk, 0, 0.55)))
      sube = k > n
      n = k
      tk = tt
    },
  }
}

/**
 * «Esto es lo que entendimos». El dueño llega con su maraña. El punto baja, toma la punta, jala,
 * y el nudo se estira hasta quedar en cuatro renglones. Él suelta el aire y asiente. Va encima
 * de la ficha y dura 2.6 s: después la escena lo desvanece y queda el expediente de verdad.
 * Devuelve { desde(t) } para arrancarlo. El <svg> lleva viewBox="0 0 320 200".
 */
export function entendidoVivo(svg) {
  const NUDO = marana(206, 64, 40)
  const REN = [0, 1, 2, 3].map((k) => recta(150, k === 3 ? 246 : 300, 44 + k * 32))
  const PUNTA = NUDO[3][M - 1]
  const FIN = REN[3][M - 1]
  let t0 = Infinity

  monta(svg, {
    dur: Infinity,
    cartel: 2.4,
    svg: () => hebras(NUDO, 'ln') + `<g transform="translate(-76 24)">${DUENO()}</g>` + punto(6.5),
    paso(q, t) {
      const u = Math.max(0, t - t0)
      // 0.35 baja el punto · 0.95 toma vuelo · 1.1 jala · 1.95 suelta el aire · 2.3 asiente
      const estira = suave(tramo(u, 1.1, 1.95))
      let punta = PUNTA
      NUDO.forEach((h, k) => {
        const pts = mezclaPts(h, REN[k], elastico(tramo(u, 1.1 + k * 0.06, 1.95 + k * 0.06)))
        forma(q('h' + k), pts)
        agita(q('h' + k), mezcla(2.2, 0.5, estira) + 1.5 * golpe(u, 1.1, 0.3))
        if (k === 3) punta = pts[M - 1]
      })
      // el punto
      if (u < 0.95) {
        const p = tramo(u, 0.35, 0.95)
        const j = brinco(p, 30)
        pon(q('pt'), { x: mezcla(318, PUNTA[0], suave(p)), y: mezcla(-12, PUNTA[1], suave(p)) + j.dy, sx: j.sx, sy: j.sy })
      } else if (u < 1.1) {
        const v = salto(tramo(u, 0.95, 1.1))
        pon(q('pt'), { x: PUNTA[0] - 5 * v, y: PUNTA[1] + 2 * v, sx: 1 - 0.14 * v, sy: 1 + 0.14 * v })
      } else {
        const fin = suave(tramo(u, 1.9, 2.2))
        pon(q('pt'), { x: mezcla(punta[0], FIN[0] + 9, fin), y: mezcla(punta[1], FIN[1], fin) })
      }
      // usted: apurado, se sorprende con el jalón, suelta el aire, sonríe y asiente
      const s = 1 - suave(tramo(u, 1.25, 1.95))
      const susto = golpe(u, 1.12, 0.5)
      const alivio = suave(tramo(u, 1.95, 2.35))
      const suspiro = salto(tramo(u, 1.9, 2.5))
      const asiente = salto(tramo(u, 2.35, 2.75))
      actua(q, 'u', {
        gira: 3.5 * s - 2 * alivio,
        dy: 2.2 * s - 2.8 * susto + 1.5 * suspiro + 2.6 * asiente,
        sy: 1 - 0.02 * suspiro,
        mira: [mezcla(3.4, 2.6, s), mezcla(-0.4, -2.4, s)],
        abre: (1 + 0.5 * susto) * parpadea(u, 0.5, 2.05),
        cejas: [-1.2 * s - 4 * susto - 1.5 * alivio, -13 * s, -1.2 * s - 4 * susto - 1.5 * alivio, 13 * s],
        boca: [0, mezcla(-0.95, 1.1, alivio), 0.4 * susto + 0.35 * suspiro],
        brazo: 0,
        mano: [20, 80, 0],
        pelo: -5 * susto + 3 * suspiro - 3 * asiente,
        gota: -1,
        resp: 0.014 * Math.sin(u * 3) * s - 0.035 * suspiro,
      })
      for (const x of ['um', 'uante', 'umanga']) ve(q(x), 0)
    },
  })

  return {
    desde(t) {
      t0 = t ?? ahora()
    },
  }
}

// ── «Primero el problema» ──────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2
const enAro = (r, g) => [r * Math.cos((g * Math.PI) / 180), r * Math.sin((g * Math.PI) / 180)]
/** Reparte n puntos a lo largo de una línea abierta. */
function abierta(v, n) {
  const L = [0]
  for (let i = 1; i < v.length; i++) L.push(L[i - 1] + Math.hypot(v[i][0] - v[i - 1][0], v[i][1] - v[i - 1][1]))
  const out = []
  let j = 1
  for (let i = 0; i < n; i++) {
    const d = (L[L.length - 1] * i) / (n - 1)
    while (j < v.length - 1 && L[j] < d) j++
    const p = (d - L[j - 1]) / (L[j] - L[j - 1] || 1)
    out.push([mezcla(v[j - 1][0], v[j][0], p), mezcla(v[j - 1][1], v[j][1], p)])
  }
  return out
}
const NQ = 64
const RQ = 26
// el gancho del «?»: tres cuartos de aro y la colita que baja al centro
const GANCHO = abierta([...Array.from({ length: 22 }, (_, i) => enAro(RQ, 200 + i * 10)), [8, 27], [1.5, 33], [0, 38], [0, 46]], NQ)
// la lente: el mismo aro, cerrado, empezando donde empieza el gancho
const LENTE = Array.from({ length: NQ }, (_, i) => enAro(RQ, 200 + (360 * i) / (NQ - 1)))
const MANGO = 122 // hacia dónde sale el mango de la lupa, en grados

/**
 * «Primero el problema». Un signo «?» frente a un local: su punto es el punto azul. El gancho
 * se cierra y queda una lupa, con el punto adentro mirando. La lupa revisa el letrero, la
 * ventana, y se detiene donde gotea: ahí estaba el problema. Regresa y vuelve a ser pregunta.
 * Devuelve { desde(t) }. El <svg> lleva viewBox="0 0 320 200".
 */
export function premisaVivo(svg) {
  const SALE = [70, 76] // dónde está el «?»
  const PARADAS = [SALE, [196, 66], [238, 128], [276, 136]]
  const GOTERA = [286, 112]
  let t0 = 0
  const va = (a, b, p) => [mezcla(a[0], b[0], p), mezcla(a[1], b[1], p)]

  monta(svg, {
    dur: 8.2,
    cartel: 5.2,
    t0: 0,
    svg: () =>
      // el local: piso, pared, toldo, letrero, puerta y ventana
      T(P.linea(132, 177, 316, 177, 6), { cls: 'ln fino', amp: 0.5 }) +
      T(P.rect(170, 84, 132, 93, 2), { cls: 'blq', amp: 0.6 }) +
      T(P.rect(164, 78, 132, 99, 2), { cls: 'ln tapa', amp: 0.6 }) +
      T(P.poli([[156, 80], [304, 80], [294, 56], [166, 56]], true), { cls: 'ln tapa', amp: 0.5 }) +
      T([0, 1, 2, 3, 4].map((i) => P.arco(170.8 + i * 29.6, 80, 14.8, 0, 180, 7)), { cls: 'ln tapa', amp: 0.4 }) +
      T([1, 2, 3, 4].map((i) => P.linea(166 + i * 25.6 + 2, 57, 156 + i * 29.6, 80, 3)), { cls: 'ln fino tenue', amp: 0.3 }) +
      T(P.rect(200, 30, 60, 18, 3), { cls: 'ln tapa', amp: 0.4 }) +
      T(P.suave([[210, 40], [218, 36], [226, 42], [234, 37], [242, 41], [250, 38]]), { cls: 'ln fino', amp: 0.3 }) +
      T(P.rect(180, 118, 30, 59, 2), { cls: 'ln', amp: 0.5 }) +
      '<circle class="lleno" cx="204" cy="150" r="2.2"/>' +
      T(P.rect(224, 114, 52, 38, 2), { cls: 'ln', amp: 0.5 }) +
      T([P.linea(250, 114, 250, 152, 3), P.linea(224, 133, 276, 133, 3)], { cls: 'ln fino tenue', amp: 0.3 }) +
      // la gotera: la grieta, las gotas y el charco
      G(
        'fuga',
        T(P.poli([[288, 86], [284, 93], [289, 99], [285, 107]]), { cls: 'ln fino', amp: 0.4 }) +
          [0, 1, 2].map((i) => G('g' + i, T(P.suave([[0, -5], [2.6, -0.4], [2.2, 2.6], [0, 3.8], [-2.2, 2.6], [-2.6, -0.4]], true), { cls: 'ln fino tapa', amp: 0.15 }))).join('') +
          T(P.elipse(286, 177.5, 9, 2.2, 10), { cls: 'ln fino tapa', amp: 0.2, n: 'charco' }),
      ) +
      T([P.linea(-8, -40, -12, -52, 3), P.linea(4, -42, 6, -55, 3), P.linea(16, -36, 24, -46, 3)], { cls: 'ln fino tz', amp: 0.3, n: 'aviso' }) +
      // el «?» que se vuelve lupa
      G('lupa', T(P.linea(...enAro(RQ, MANGO), ...enAro(RQ + 27, MANGO), 4), { cls: 'ln tz', amp: 0.4, n: 'mango' }) + T(D(GANCHO, false), { cls: 'ln', amp: 0.8, n: 'aro' })) +
      punto(6.5),
    paso(q, tt) {
      const t = (((tt - t0) % 8.2) + 8.2) % 8.2
      // 0 duda · 0.9 toma vuelo · 1.1 se cierra en lupa · 1.9 letrero · 3.0 ventana · 3.95 gotera
      // 4.5 la encuentra · 6.7 regresa y vuelve a ser pregunta
      const lupa = elastico(tramo(t, 1.1, 1.9)) * (1 - suave(tramo(t, 6.9, 7.7)))
      const vuelo = salto(tramo(t, 0.86, 1.14))
      let c = SALE
      let hacia = [1, 0]
      const tramos = [[1.9, 2.7, 0, 1], [3.0, 3.7, 1, 2], [3.95, 4.45, 2, 3]]
      for (const [a, b, i, j] of tramos)
        if (t >= a) {
          c = va(PARADAS[i], PARADAS[j], suave(tramo(t, a, b)))
          hacia = [PARADAS[j][0] - PARADAS[i][0], PARADAS[j][1] - PARADAS[i][1]]
        }
      if (t >= 6.7) c = va(PARADAS[3], SALE, suave(tramo(t, 6.7, 7.7)))
      const halla = golpe(t, 4.47, 0.4)
      const visto = suave(tramo(t, 4.45, 4.7)) * (1 - suave(tramo(t, 6.7, 7.2)))
      const duda = 1 - suave(tramo(t, 0.86, 1.2)) + suave(tramo(t, 7.7, 8.1))
      const mece = 2.2 * Math.sin(t * 2.3) * (0.4 + 0.6 * visto)
      const x = c[0]
      const y = c[1] + mece + 3 * vuelo
      forma(q('aro'), mezclaPts(GANCHO, LENTE, Math.max(0, lupa)))
      agita(q('aro'), 1 + 1.4 * salto(tramo(t, 1.1, 1.9)) + 2 * halla)
      traza(q('mango'), suave(tramo(t, 1.45, 1.85)) * (1 - suave(tramo(t, 6.8, 7.2))))
      pon(q('lupa'), { x, y, r: 7 * duda * Math.sin(t * 2.6 + 0.4) + 5 * halla * Math.sin((t - 4.47) * 30), sx: 1 + 0.07 * vuelo + 0.1 * halla, sy: 1 - 0.07 * vuelo + 0.1 * halla })
      // el punto: abajo es el punto del «?»; adentro de la lente, mira hacia donde va
      const m = Math.hypot(hacia[0], hacia[1]) || 1
      const viaja = t > 1.9 && t < 4.45 ? 1 : 0
      const mira = visto ? [5, 2 + 4 * Math.sin(t * 5.6)] : viaja ? [(8 * hacia[0]) / m, (8 * hacia[1]) / m] : [6 * Math.sin(t * 4.2), 0]
      const adentro = suave(tramo(t, 1.15, 1.65)) * (1 - suave(tramo(t, 7.0, 7.6)))
      const b = brinco(tramo(t, 1.15, 1.65), 20)
      const b0 = brinco(tramo(t, 0.25, 0.7), 9)
      const cae = brinco(tramo(t, 7.0, 7.6), 12)
      pon(q('pt'), {
        x: x + mira[0] * adentro,
        y: y + mezcla(59, mira[1], adentro) + (t < 1.1 ? b0.dy : 0) + b.dy * (t < 1.7 ? 1 : 0) + (t > 7 ? cae.dy : 0),
        sx: (t < 1.1 ? b0.sx : b.sx) * (1 + 0.25 * halla),
        sy: (t < 1.1 ? b0.sy : b.sy) * (1 + 0.25 * halla),
      })
      // la gotera apenas se nota hasta que la lupa llega
      ve(q('fuga'), mezcla(0.22, 1, visto))
      ;[0, 1, 2].forEach((i) => {
        const f = (t * 0.85 + i / 3) % 1
        pon(q('g' + i), { x: GOTERA[0], y: GOTERA[1] + 62 * f * f, sx: Math.min(1, f * 6), o: f > 0.9 ? (1 - f) * 10 : 1 })
      })
      pon(q('charco'), { ox: 286, oy: 177.5, sx: 0.7 + 0.3 * Math.sin(t * 5.3) ** 2 })
      pon(q('aviso'), { x, y })
      traza(q('aviso'), suave(tramo(t, 4.5, 4.72)) * (1 - suave(tramo(t, 5.2, 5.6))))
    },
  })

  return {
    desde(t) {
      t0 = t ?? ahora()
    },
  }
}
