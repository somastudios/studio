import Trazo from '../core/trazo-vivo.js'
import { actua, persona, muneca, mezclaPose } from './reparto-trazo.js'
import { DUENO, parpadea } from './trazos.js'

// Los dibujos de trazo vivo de las demás escenas de la visita. Cada función recibe un <svg>
// vacío, lo echa a andar y devuelve con qué se le avisa de lo que pasa en la escena.
//
// Un hilo une varias: la maraña. En «Lo que suele pasar» cada problema que el dueño marca le
// agrega vueltas a un nudo sobre su cabeza; en «Lo que entendimos» el punto jala la punta y el
// nudo se vuelve los renglones de su expediente. Cómo se hace y cómo se revisa: skill
// soma-animation.

const { P, D, T, G, monta, remuestra, corre, corona, mezclaPts, tramo, mezcla, suave, salto, golpe, campana, elastico, rebota, brinco, pon, traza, ve, forma, agita, punto } = Trazo

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

// ── Una figura que cambia de forma con cada paso ────────────────────────────────────────────
// Es el sistema de «Antes de empezar», suelto: cada paso es { dur, forma, giro(L), svg(),
// detalle(q, L), punto(L) }. Al cambiar de paso lo de antes se desvanece, la figura cambia y se
// pasa tantito, el punto viaja a su nuevo lugar y lo nuevo se dibuja.

const quieto = (x, y) => ({ x, y, sx: 1, sy: 1 })
const va2 = (a, b, p) => [mezcla(a[0], b[0], p), mezcla(a[1], b[1], p)]
/** Un brinco de a hasta b. */
const arco = (a, b, p, alto) => {
  const j = brinco(p, alto)
  const [x, y] = va2(a, b, suave(p))
  return { x, y: y + j.dy, sx: j.sx, sy: j.sy }
}
/** El punto que va a la fracción p de una línea de puntos. */
const sobre = (pts, p) => {
  const f = Math.max(0, Math.min(1, p)) * (pts.length - 1)
  const i = Math.min(pts.length - 2, Math.floor(f))
  return va2(pts[i], pts[i + 1], f - i)
}

function figuraViva(svg, PASOS, { inicial = 0, r = 7, despues = '' } = {}) {
  let de = inicial
  let a = inicial
  let t0 = null
  let sale = null
  let ultimo = PASOS[inicial].punto(0)

  monta(svg, {
    dur: Infinity,
    cartel: 3,
    svg: () => T(D(corre(PASOS[inicial].forma, 7, 7)), { cls: 'blq', n: 'sombra' }) + T(D(PASOS[inicial].forma), { cls: 'ln tapa', n: 'figura' }) + PASOS.map((p, k) => G('d' + k, p.svg())).join('') + despues + punto(r),
    paso(q, t) {
      if (t0 === null) t0 = t
      const u = t - t0
      const cambia = de !== a
      const pts = cambia ? mezclaPts(PASOS[de].forma, PASOS[a].forma, elastico(tramo(u, 0.12, 0.98))) : PASOS[a].forma
      const presente = suave(tramo(u, cambia ? 0.6 : 0.15, cambia ? 0.98 : 0.6))
      const L = Math.max(0, u - (cambia ? 0.8 : 0.3)) % PASOS[a].dur
      const g = PASOS[a].giro(L)
      const giro = { ox: g.ox, oy: g.oy, r: g.r * presente }
      forma(q('figura'), pts)
      forma(q('sombra'), corre(pts, 7, 7))
      agita(q('figura'), 1 + (cambia ? 1.6 * salto(tramo(u, 0.1, 0.95)) : 0))
      pon(q('figura'), giro)
      pon(q('sombra'), giro)
      PASOS.forEach((p, k) => {
        const d = q('d' + k)
        ve(d, k === a ? presente : k === de ? 1 - tramo(u, 0, 0.18) : 0)
        if (k !== a) return
        pon(d, giro)
        p.detalle(q, L)
      })
      const fin = PASOS[a].punto(L)
      let pos = fin
      if (cambia && sale && u < 0.85) {
        const p = tramo(u, 0.05, 0.85)
        const j = brinco(p, 30)
        pos = { x: mezcla(sale.x, fin.x, suave(p)), y: mezcla(sale.y, fin.y, suave(p)) + j.dy, sx: j.sx, sy: j.sy }
      }
      pon(q('pt'), pos)
      ultimo = pos
    },
  })

  return {
    /** Vuelve a empezar el paso actual en el segundo `t` del reloj (para revisarlo). */
    desde(t) {
      de = a
      t0 = t
    },
    /** Se transforma al paso `i`. */
    ir(i, t) {
      if (i === a || !PASOS[i]) return
      de = a
      a = i
      sale = { ...ultimo }
      t0 = t ?? ahora()
    },
    /** Queda en el paso `i` sin transformarse (al entrar a la escena). */
    pon(i, t) {
      if (!PASOS[i]) return
      de = a = i
      sale = null
      t0 = t ?? ahora()
    },
  }
}

// ── «Cómo trabajamos» ───────────────────────────────────────────────────────────────────────

const NF = 96
// todas empiezan arriba al centro y giran hacia la derecha, para que el cambio no se tuerza
const F_LENTE = Array.from({ length: NF }, (_, i) => enAro(56, -90 + (360 * i) / NF)).map(([x, y]) => [160 + x, 104 + y])
const F_ROMBO = remuestra([[160, 32], [238, 110], [160, 188], [82, 110]], NF)
const F_PANTALLA = remuestra([[160, 46], [244, 46], [252, 54], [252, 152], [244, 160], [76, 160], [68, 152], [68, 54], [76, 46]], NF)
const F_HOJA = remuestra([[160, 26], [198, 26], [226, 54], [226, 192], [94, 192], [94, 26]], NF)
const F_LOCAL = remuestra([[160, 40], [236, 40], [248, 78], [236, 78], [236, 192], [84, 192], [84, 78], [72, 78], [84, 40]], NF)
const MINI = marana(160, 104, 17).flat()
const RUTAS = [
  [[160, 162], [150, 138], [128, 118], [112, 100]],
  [[160, 162], [160, 130], [160, 100], [160, 72]],
  [[160, 162], [170, 138], [192, 118], [208, 100]],
]
const FIRMA = [[112, 170], [122, 158], [130, 172], [140, 156], [150, 172], [162, 160], [174, 170], [188, 164]]
const cabeza = ([x, y], g) => {
  const [a, b] = [enAro(9, g + 150), enAro(9, g - 150)]
  return P.poli([[x + a[0], y + a[1]], [x, y], [x + b[0], y + b[1]]])
}

const METODO = [
  {
    // Diagnóstico: una lupa sobre la maraña. El punto la rodea, buscando de dónde sale.
    dur: (Math.PI * 2) / 1.5,
    forma: F_LENTE,
    giro: (L) => ({ ox: 160, oy: 104, r: 4 * Math.sin(L * 1.5) }),
    svg: () =>
      T(P.linea(160 + 56 * Math.cos(2.13), 104 + 56 * Math.sin(2.13), 160 + 96 * Math.cos(2.13), 104 + 96 * Math.sin(2.13), 4), { cls: 'ln', amp: 0.5 }) +
      T(P.arco(160, 104, 44, 196, 246, 6), { cls: 'ln fino tenue', amp: 0.3 }) +
      T(D(MINI, false), { cls: 'ln fino', amp: 1.2, n: 'mini' }),
    detalle(q, L) {
      agita(q('mini'), 1.4 + 0.8 * Math.sin(L * 3))
    },
    punto: (L) => ({ x: 160 + 34 * Math.cos(L * 1.5 - 1.2), y: 104 + 30 * Math.sin(L * 1.5 - 1.2), sx: 1, sy: 1 }),
  },
  {
    // Soluciones: tres rutas salen del mismo lugar. El punto duda, elige una y la recorre.
    dur: 5,
    forma: F_ROMBO,
    giro: (L) => ({ ox: 160, oy: 110, r: 2 * Math.sin(L * 1.3) }),
    svg: () =>
      RUTAS.map((r, i) => T([P.suave(r), cabeza(r[3], [-125, -90, -55][i])], { cls: 'ln fino tz', amp: 0.4, n: 'ru' + i })).join('') +
      T([P.suave(RUTAS[2]), cabeza(RUTAS[2][3], -55)], { cls: 'ln ln-azul tz', amp: 0.4, n: 'elegida' }),
    detalle(q, L) {
      const fin = 1 - suave(tramo(L, 4.4, 4.9))
      ;[0, 1, 2].forEach((i) => traza(q('ru' + i), suave(tramo(L, 0.1 + i * 0.22, 0.7 + i * 0.22)) * fin))
      traza(q('elegida'), suave(tramo(L, 2.4, 3.05)) * fin)
    },
    punto(L) {
      const base = RUTAS[0][0]
      if (L < 2.2) return { x: base[0] - 7 * salto(tramo(L, 1.1, 1.6)) + 7 * salto(tramo(L, 1.6, 2.15)), y: base[1], sx: 1, sy: 1 }
      if (L < 2.4) {
        const v = salto(tramo(L, 2.2, 2.4))
        return { x: base[0] - 3 * v, y: base[1] + 4 * v, sx: 1 + 0.15 * v, sy: 1 - 0.15 * v }
      }
      if (L < 3.05) {
        const [x, y] = sobre(abierta(RUTAS[2], 24), suave(tramo(L, 2.4, 3.05)))
        return quieto(x, y)
      }
      if (L < 4.4) {
        const g = golpe(L, 3.05, 0.3)
        return { x: RUTAS[2][3][0], y: RUTAS[2][3][1], sx: 1 + 0.3 * g, sy: 1 + 0.3 * g }
      }
      return arco(RUTAS[2][3], base, tramo(L, 4.4, 5), 22)
    },
  },
  {
    // Demostración: una pantalla. El punto oprime «reproducir» y aparece el sistema andando.
    dur: 5.2,
    forma: F_PANTALLA,
    giro: (L) => ({ ox: 160, oy: 104, r: 1.6 * golpe(L, 1.42, 0.4) * Math.sin((L - 1.42) * 22) }),
    svg: () =>
      T([P.linea(160, 160, 160, 184, 3), P.linea(126, 186, 194, 186, 4)], { cls: 'ln', amp: 0.4 }) +
      G('play', T(P.poli([[-16, -22], [22, 0], [-16, 22]], true), { cls: 'ln tapa', amp: 0.4 })) +
      [0, 1, 2].map((i) => T([P.rect(88, 66 + i * 28, 16, 16, 3), P.linea(114, 74 + i * 28, [214, 190, 204][i], 74 + i * 28, 4)], { cls: 'ln fino tz', amp: 0.35, n: 'fi' + i })).join('') +
      T(P.poli([[91, 74], [95, 79], [102, 69]]), { cls: 'ln ln-azul tz', amp: 0.2, n: 'ok' }),
    detalle(q, L) {
      const fin = 1 - suave(tramo(L, 4.5, 5))
      const anda = suave(tramo(L, 1.45, 1.7)) * fin
      pon(q('play'), { x: 160, y: 104, sx: (1 - 0.25 * golpe(L, 1.4, 0.2)) * (1 - anda), o: 1 - anda })
      ;[0, 1, 2].forEach((i) => traza(q('fi' + i), suave(tramo(L, 1.7 + i * 0.25, 2.3 + i * 0.25)) * fin))
      traza(q('ok'), suave(tramo(L, 3.25, 3.5)) * fin)
    },
    punto(L) {
      const espera = [226, 136]
      if (L < 1.0) return { x: espera[0], y: espera[1] + 2 * Math.sin(L * 5), sx: 1, sy: 1 }
      if (L < 1.4) return arco(espera, [160, 104], tramo(L, 1.0, 1.4), 26)
      if (L < 1.7) {
        const g = golpe(L, 1.4, 0.25)
        return { x: 160, y: 104, sx: 1 + 0.35 * g, sy: 1 - 0.3 * g }
      }
      if (L < 3.2) return arco([160, 104], [96, 74], tramo(L, 2.7, 3.2), 16)
      if (L < 4.5) return { x: 96 + 30 * suave(tramo(L, 3.5, 3.9)) * 4.2, y: 74 + 44 * suave(tramo(L, 3.5, 3.9)), sx: 1, sy: 1 }
      return arco([222, 118], espera, tramo(L, 4.5, 5.1), 14)
    },
  },
  {
    // Plano: una hoja con lo acordado. El punto firma al pie.
    dur: 5,
    forma: F_HOJA,
    giro: (L) => ({ ox: 160, oy: 110, r: -2 + 1.2 * Math.sin(L * 1.2) }),
    svg: () =>
      T(P.poli([[198, 26], [198, 54], [226, 54]]), { cls: 'ln fino', amp: 0.3 }) +
      [0, 1, 2, 3].map((i) => T(P.linea(112, 76 + i * 20, [206, 190, 206, 168][i], 76 + i * 20, 4), { cls: 'ln fino tz', amp: 0.4, n: 're' + i })).join('') +
      T(P.suave(FIRMA), { cls: 'ln ln-azul tz', amp: 0.5, n: 'firma' }),
    detalle(q, L) {
      const fin = 1 - suave(tramo(L, 4.4, 4.9))
      ;[0, 1, 2, 3].forEach((i) => traza(q('re' + i), suave(tramo(L, 0.15 + i * 0.22, 0.75 + i * 0.22)) * fin))
      traza(q('firma'), suave(tramo(L, 2.1, 3.0)) * fin)
    },
    punto(L) {
      const espera = [240, 60]
      if (L < 1.5) return { x: espera[0], y: espera[1] + 2 * Math.sin(L * 4.4), sx: 1, sy: 1 }
      if (L < 2.0) return arco(espera, FIRMA[0], tramo(L, 1.5, 2.0), 24)
      if (L < 3.0) {
        const [x, y] = sobre(abierta(FIRMA, 30), suave(tramo(L, 2.1, 3.0)))
        return quieto(x, y)
      }
      if (L < 4.4) return quieto(196, 166)
      return arco([196, 166], espera, tramo(L, 4.4, 5), 20)
    },
  },
  {
    // Implementación: el local, ya andando. El punto sube al techo y se enciende.
    dur: 5,
    forma: F_LOCAL,
    giro: (L) => ({ ox: 160, oy: 192, r: 1.5 * golpe(L, 1.6, 0.4) * Math.sin((L - 1.6) * 24) }),
    svg: () =>
      T([0, 1, 2, 3].map((i) => P.arco(101 + i * 39.3, 78, 19.6, 0, 180, 7)), { cls: 'ln tz', amp: 0.4, n: 'toldo' }) +
      T(P.poli([[112, 192], [112, 132], [146, 132], [146, 192]]), { cls: 'ln tz', amp: 0.4, n: 'puerta' }) +
      T(P.rect(166, 126, 50, 34, 2), { cls: 'ln fino tz', amp: 0.4, n: 'vent' }) +
      T(P.poli([[176, 144], [186, 154], [206, 132]]), { cls: 'ln ln-azul tz', amp: 0.3, n: 'listo' }) +
      G('luz', corona('rayos', 7, 13, 23)),
    detalle(q, L) {
      const fin = 1 - suave(tramo(L, 4.4, 4.9))
      traza(q('toldo'), suave(tramo(L, 0.1, 0.8)) * fin)
      traza(q('puerta'), suave(tramo(L, 0.4, 1.0)) * fin)
      traza(q('vent'), suave(tramo(L, 0.6, 1.2)) * fin)
      traza(q('listo'), suave(tramo(L, 2.3, 2.7)) * fin)
      const luz = rebota(tramo(L, 1.6, 2.0)) * fin
      pon(q('luz'), { x: 160, y: 28, sx: luz * (1 + 0.08 * Math.sin(L * 6)), r: L * 14, o: luz })
    },
    punto(L) {
      const espera = [262, 176]
      if (L < 1.1) return { x: espera[0], y: espera[1] + 0, sx: 1, sy: 1 }
      if (L < 1.6) return arco(espera, [160, 28], tramo(L, 1.1, 1.6), 46)
      if (L < 4.4) {
        const g = golpe(L, 1.6, 0.25)
        return { x: 160, y: 28, sx: 1 + 0.3 * g, sy: 1 - 0.25 * g }
      }
      return arco([160, 28], espera, tramo(L, 4.4, 5), 30)
    },
  },
]

/** «Cómo trabajamos»: una figura por paso. El <svg> lleva viewBox="44 0 240 212". */
export const metodoVivo = (svg, inicial = 0) => figuraViva(svg, METODO, { inicial })

// ── «¿Hasta dónde quiere llegar?» ───────────────────────────────────────────────────────────

const F_PUESTO = remuestra([[160, 104], [212, 104], [222, 126], [208, 126], [208, 192], [112, 192], [112, 126], [98, 126], [108, 104]], NF)
const F_EDIFICIO = remuestra([[160, 22], [226, 22], [226, 86], [250, 86], [250, 192], [70, 192], [70, 86], [94, 86], [94, 22]], NF)
const vive = (L) => ({ ox: 160, oy: 192, r: 0.7 * Math.sin(L * 1.3) })
const luzDe = (q, L, x, y, cuando, tam = 1) => {
  const luz = rebota(tramo(L, cuando, cuando + 0.4))
  pon(q('luz'), { x, y, sx: tam * luz * (1 + 0.08 * Math.sin(L * 6)), r: L * 14, o: luz })
}

const ALCANCE = [
  {
    // Essential: un puesto. Lo justo, y ya atiende.
    dur: 1e6,
    forma: F_PUESTO,
    giro: vive,
    svg: () =>
      T([0, 1, 2].map((i) => P.arco(116.3 + i * 36.7, 126, 18.3, 0, 180, 7)), { cls: 'ln tz', amp: 0.4, n: 'a0toldo' }) +
      T(P.linea(112, 158, 208, 158, 4), { cls: 'ln tz', amp: 0.4, n: 'a0barra' }),
    detalle(q, L) {
      traza(q('a0toldo'), suave(tramo(L, 0.1, 0.7)))
      traza(q('a0barra'), suave(tramo(L, 0.4, 0.9)))
      pon(q('luz'), { x: 160, y: 150, sx: 0, o: 0 })
    },
    punto: (L) => {
      const b = brinco(tramo(L % 3.2, 0.2, 0.7), 9)
      return { x: 160, y: 150 + b.dy, sx: b.sx, sy: b.sy }
    },
  },
  {
    // Advanced: el local completo, con toldo, puerta y ventana. El punto lo enciende.
    dur: 1e6,
    forma: F_LOCAL,
    giro: vive,
    svg: () =>
      T([0, 1, 2, 3].map((i) => P.arco(101 + i * 39.3, 78, 19.6, 0, 180, 7)), { cls: 'ln tz', amp: 0.4, n: 'a1toldo' }) +
      T(P.poli([[112, 192], [112, 132], [146, 132], [146, 192]]), { cls: 'ln tz', amp: 0.4, n: 'a1puerta' }) +
      T(P.rect(166, 126, 50, 34, 2), { cls: 'ln fino tz', amp: 0.4, n: 'a1vent' }),
    detalle(q, L) {
      traza(q('a1toldo'), suave(tramo(L, 0.1, 0.8)))
      traza(q('a1puerta'), suave(tramo(L, 0.4, 1.0)))
      traza(q('a1vent'), suave(tramo(L, 0.6, 1.2)))
      luzDe(q, L, 160, 28, 0.9, 0.8)
    },
    punto: (L) => {
      const g = golpe(L, 0.6, 0.25)
      return { x: 160, y: 28, sx: 1 + 0.3 * g, sy: 1 - 0.25 * g }
    },
  },
  {
    // Enterprise: dos pisos, letrero y todas las ventanas. La luz se ve desde lejos.
    dur: 1e6,
    forma: F_EDIFICIO,
    giro: vive,
    svg: () =>
      T([0, 1, 2].map((i) => P.rect(106 + i * 38, 38, 26, 30, 2)), { cls: 'ln fino tz', amp: 0.4, n: 'a2arriba' }) +
      T([0, 1, 2, 3].map((i) => P.arco(92.5 + i * 45, 86, 22.5, 0, 180, 7)), { cls: 'ln tz', amp: 0.4, n: 'a2toldo' }) +
      T(P.poli([[140, 192], [140, 134], [180, 134], [180, 192]]), { cls: 'ln tz', amp: 0.4, n: 'a2puerta' }) +
      T([P.rect(86, 130, 38, 34, 2), P.rect(196, 130, 38, 34, 2)], { cls: 'ln fino tz', amp: 0.4, n: 'a2vent' }) +
      T(P.linea(160, 134, 160, 192, 3), { cls: 'ln fino tz', amp: 0.3, n: 'a2hoja' }),
    detalle(q, L) {
      traza(q('a2toldo'), suave(tramo(L, 0.1, 0.8)))
      traza(q('a2puerta'), suave(tramo(L, 0.3, 0.9)))
      traza(q('a2hoja'), suave(tramo(L, 0.7, 1.0)))
      traza(q('a2vent'), suave(tramo(L, 0.5, 1.2)))
      traza(q('a2arriba'), suave(tramo(L, 0.8, 1.6)))
      luzDe(q, L, 160, 8, 1.1, 1.15)
    },
    punto: (L) => {
      const g = golpe(L, 0.6, 0.25)
      return { x: 160, y: 8, sx: 1 + 0.3 * g, sy: 1 - 0.25 * g }
    },
  },
]

/** «¿Hasta dónde quiere llegar?»: el local crece con el nivel. viewBox="44 -22 240 232". */
export function alcanceVivo(svg, inicial = 0) {
  return figuraViva(svg, ALCANCE, { inicial, despues: G('luz', corona('a-rayos', 7, 13, 23)) })
}

// ── «Antes de cerrar» ───────────────────────────────────────────────────────────────────────

/**
 * Alex escucha y anota: mira a quien habla, asiente, baja la vista a la libreta, escribe un
 * renglón y vuelve a mirar. Tres renglones y da vuelta a la hoja. viewBox="62 38 196 192".
 */
export function rondaVivo(svg) {
  const DUR = 6.4
  const REN = [[134, 191, 176], [134, 201, 176], [134, 211, 160]] // x0, y, x1 de cada renglón
  const CUANDO = [[1.6, 2.8], [4.2, 5.2], [5.25, 5.85]]
  const M0 = muneca(0)
  monta(svg, {
    dur: DUR,
    cartel: 2.4,
    svg: () =>
      persona('a') +
      T(P.poli([[124, 182], [184, 178], [188, 220], [128, 224]], true), { cls: 'blq', amp: 0.4 }) +
      T(P.poli([[120, 178], [180, 174], [184, 216], [124, 220]], true), { cls: 'ln tapa', amp: 0.4 }) +
      REN.map(([x0, y, x1], i) => T(P.linea(x0 - 4, y - 3 + i * 0.4, x1 - 4, y - 6 + i * 0.4, 4), { cls: 'ln fino tz', amp: 0.5, n: 'ap' + i })).join('') +
      G('lapiz', T(P.linea(0, 0, 13, -17, 3), { cls: 'ln', amp: 0.2 })),
    paso(q, t) {
      // la punta del lápiz: en el renglón que toca, o descansando al margen
      let punta = [REN[0][0] - 6, REN[0][1] - 2]
      let escribe = 0
      CUANDO.forEach(([a, b], i) => {
        const p = tramo(t, a, b)
        traza(q('ap' + i), suave(p) * (1 - suave(tramo(t, 6.0, 6.35))))
        if (t >= a - 0.3) {
          const [x0, y, x1] = REN[i]
          punta = [mezcla(x0, x1, suave(p)) - 4 + (p > 0 && p < 1 ? 1.4 * Math.sin(t * 34) : 0), y - 3 - 3 * suave(p) + (p > 0 && p < 1 ? 1.2 * Math.cos(t * 41) : 0)]
        }
        if (p > 0 && p < 1) escribe = 1
      })
      pon(q('lapiz'), { x: punta[0], y: punta[1] })
      const abajo = suave(tramo(t, 1.3, 1.6)) * (1 - suave(tramo(t, 2.8, 3.1))) + suave(tramo(t, 3.9, 4.2)) * (1 - suave(tramo(t, 5.9, 6.2)))
      const asiente = salto(tramo(t, 0.5, 0.95)) + salto(tramo(t, 3.3, 3.7))
      const aja = campana(t, 3.5, 0.35)
      actua(q, 'a', {
        gira: 2.2 * abajo - 1.5 * (1 - abajo),
        dy: 2.6 * asiente + 2.2 * abajo,
        mira: [mezcla(3.2, -1.6, abajo), mezcla(-0.8, 3, abajo)],
        abre: (1 - 0.3 * abajo) * (1 - 0.9 * campana(t, 1.32, 0.08)) * (1 - 0.9 * campana(t, 2.86, 0.08)) * (1 - 0.9 * campana(t, 3.94, 0.08)) * (1 - 0.9 * campana(t, 5.96, 0.08)),
        cejas: [-2.2 * aja - 0.6 * (1 - abajo), -3 * aja, -2.2 * aja - 0.6 * (1 - abajo), 3 * aja],
        boca: [0.2 * abajo, mezcla(0.75, 0.25, abajo), 0.3 * aja],
        brazo: 0,
        mano: [punta[0] + 14 - M0[0], punta[1] - 15 - M0[1], -62 + 3 * escribe * Math.sin(t * 34)],
        pelo: -3 * salto(tramo(t, 0.56, 1.0)) + 3 * abajo - 3 * salto(tramo(t, 3.36, 3.8)),
        lentes: [1.3 * abajo, 0],
        resp: 0.012 * Math.sin(t * 1.9),
      })
    },
  })
}

// ── «El siguiente paso» ─────────────────────────────────────────────────────────────────────

/**
 * Una hoja de calendario con catorce días. El punto brinca de día en día, buscando. Cuando se
 * elige uno, vuela a ese día y un aro lo aparta. Al agendar, palomita y la hoja da un saltito.
 * Devuelve { elige(i, t), listo(t) }. viewBox="18 12 204 172".
 */
export function agendaVivo(svg, { elegido = -1, hecho = false } = {}) {
  const celda = (i) => [48 + (i % 7) * 24, 100 + Math.floor(i / 7) * 36]
  let sel = elegido
  let ts = -9
  let tl = hecho ? -9 : 1e9
  let sale = null
  let ultimo = celda(0)

  monta(svg, {
    dur: Infinity,
    cartel: 2,
    svg: () =>
      G(
        'hoja',
        T(P.rect(36, 36, 180, 138, 5), { cls: 'blq', amp: 0.5 }) +
          T(P.rect(30, 30, 180, 138, 5), { cls: 'ln tapa', amp: 0.6 }) +
          T(P.linea(30, 66, 210, 66, 6), { cls: 'ln', amp: 0.5 }) +
          T([P.linea(78, 20, 78, 42, 3), P.linea(162, 20, 162, 42, 3)], { cls: 'ln', amp: 0.3 }) +
          T(P.linea(48, 50, 108, 50, 4), { cls: 'ln fino tenue', amp: 0.4 }) +
          T(Array.from({ length: 14 }, (_, i) => P.circ(...celda(i), 6.5, 8)), { cls: 'ln fino tenue', amp: 0.3 }) +
          G('aro', T(P.circ(0, 0, 13, 12), { cls: 'ln ln-azul tz', amp: 0.4, n: 'aro-l' })) +
          T(P.poli([[176, 44], [184, 54], [200, 38]]), { cls: 'ln ln-azul tz', amp: 0.3, n: 'ok' }),
      ) + punto(6.5),
    paso(q, t) {
      const u = t - ts
      const v = t - tl
      let pos
      if (sel < 0) {
        const k = Math.floor(t / 0.62) % 14
        pos = arco(celda(k), celda((k + 1) % 14), tramo((t / 0.62) % 1, 0.3, 1), 11)
      } else if (u < 0.5 && sale) pos = arco(sale, celda(sel), tramo(u, 0, 0.5), 24)
      else {
        const g = golpe(u, 0.5, 0.25)
        const [x, y] = celda(sel)
        pos = { x, y, sx: 1 + 0.3 * g, sy: 1 - 0.25 * g }
      }
      ultimo = [pos.x, pos.y]
      const salta = golpe(v, 0, 0.35)
      pon(q('hoja'), { ox: 120, oy: 168, y: -7 * salta, r: 2 * salta * Math.sin(v * 26), sy: 1 + 0.04 * salta })
      pon(q('pt'), { ...pos, y: pos.y - 7 * salta })
      if (sel >= 0) pon(q('aro'), { x: celda(sel)[0], y: celda(sel)[1] })
      traza(q('aro-l'), sel < 0 ? 0 : suave(tramo(u, 0.45, 0.9)))
      traza(q('ok'), suave(tramo(v, 0.1, 0.45)))
    },
  })

  return {
    /** Se eligió el día `i` (0 a 13), o ninguno con -1. */
    elige(i, t) {
      if (i === sel) return
      sale = [...ultimo]
      sel = i
      ts = t ?? ahora()
      tl = 1e9
    },
    /** La cita quedó apartada. */
    listo(t) {
      tl = t ?? ahora()
    },
  }
}

// ── «Gracias» ───────────────────────────────────────────────────────────────────────────────

/** El dueño, ya sin maraña: sonríe con los ojos y asiente. viewBox="70 44 180 176". */
export function graciasVivo(svg) {
  monta(svg, {
    dur: 4.6,
    cartel: 1.2,
    svg: () => DUENO(),
    paso(q, t) {
      const gusto = suave(tramo(t, 0.5, 0.9)) * (1 - suave(tramo(t, 2.9, 3.3)))
      const asiente = salto(tramo(t, 1.0, 1.45)) + salto(tramo(t, 1.5, 1.95))
      actua(q, 'u', {
        gira: 2.5 * gusto + 1.2 * Math.sin(t * 1.37),
        dy: 2.8 * asiente,
        mira: [1.5, 0],
        abre: parpadea(t, 0.3, 3.7),
        feliz: gusto,
        cejas: [-2 * gusto, 0, -2 * gusto, 0],
        boca: [0, mezcla(0.8, 1.2, gusto), 0.25 * gusto],
        brazo: 0,
        mano: [20, 80, 0],
        pelo: -3 * salto(tramo(t, 1.06, 1.5)) - 3 * salto(tramo(t, 1.56, 2.0)),
        rubor: gusto,
        resp: 0.012 * Math.sin(t * 1.8),
      })
      for (const x of ['um', 'uante', 'umanga']) ve(q(x), 0)
    },
  })
}

// ── Segunda visita ──────────────────────────────────────────────────────────────────────────

/**
 * «Cómo se paga». Vuelve la etiqueta del primer día, la que el punto tachó. Ahora el punto sí
 * escribe en ella: dibuja el signo de pesos, sube al ojal y la etiqueta se mece contenta.
 * viewBox="92 -18 136 226".
 */
export function precioVivo(svg) {
  const ESE = abierta([[180, 104], [160, 96], [141, 107], [158, 125], [180, 139], [160, 159], [139, 149]], 30)
  const HOYO = [160, 66]
  monta(svg, {
    dur: 7,
    cartel: 4,
    svg: () =>
      G(
        'tag',
        T(P.linea(160, -16, 160, 40, 4), { cls: 'ln fino', amp: 0.4 }) +
          T(P.poli([[122, 86], [166, 46], [210, 86], [210, 202], [122, 202]], true), { cls: 'blq', amp: 0.5 }) +
          T(P.poli([[116, 80], [160, 40], [204, 80], [204, 196], [116, 196]], true), { cls: 'ln tapa', amp: 0.6 }) +
          T(P.circ(HOYO[0], HOYO[1], 6.5, 10), { cls: 'ln fino', amp: 0.25 }) +
          T(P.suave(ESE), { cls: 'ln tz', amp: 0.5, n: 's1' }) +
          T(P.linea(160, 86, 160, 170, 4), { cls: 'ln tz', amp: 0.4, n: 's2' }) +
          T(P.linea(134, 182, 186, 182, 4), { cls: 'ln fino tz', amp: 0.4, n: 's3' }) +
          punto(7),
      ),
    paso(q, t) {
      const fin = 1 - suave(tramo(t, 6.2, 6.8))
      traza(q('s1'), suave(tramo(t, 1.0, 1.9)) * fin)
      traza(q('s2'), suave(tramo(t, 2.05, 2.4)) * fin)
      traza(q('s3'), suave(tramo(t, 3.2, 3.6)) * fin)
      const gusto = golpe(t, 3.0, 0.9)
      pon(q('tag'), { ox: 160, oy: -16, r: 4 * Math.sin(t * 1.9) + 5 * gusto * Math.sin((t - 3) * 14) })
      let pos
      if (t < 0.5) pos = quieto(...HOYO)
      else if (t < 1.0) pos = arco(HOYO, ESE[0], tramo(t, 0.5, 1.0), 18)
      else if (t < 1.9) pos = quieto(...sobre(ESE, suave(tramo(t, 1.0, 1.9))))
      else if (t < 2.05) pos = arco(ESE[ESE.length - 1], [160, 86], tramo(t, 1.9, 2.05), 6)
      else if (t < 2.4) pos = quieto(160, mezcla(86, 170, suave(tramo(t, 2.05, 2.4))))
      else if (t < 3.0) pos = arco([160, 170], HOYO, tramo(t, 2.4, 3.0), 30)
      else pos = { x: HOYO[0], y: HOYO[1], sx: 1 + 0.3 * golpe(t, 3.0, 0.25), sy: 1 - 0.25 * golpe(t, 3.0, 0.25) }
      pon(q('pt'), pos)
    },
  })
}

/**
 * «Formas de pago»: tres iconos que hierven, uno por renglón. `svgs` son los tres <svg
 * viewBox="0 0 64 48">, en orden: tarjeta, transferencia, efectivo.
 */
export function pagoVivo(svgs) {
  const OBRAS = [
    {
      // la tarjeta: el punto recorre la banda
      svg: () => T(P.rect(8, 9, 48, 30, 5), { cls: 'ln tapa', amp: 0.4 }) + T(P.linea(8, 19, 56, 19, 4), { cls: 'ln', amp: 0.3 }) + T(P.linea(14, 31, 30, 31, 3), { cls: 'ln fino tenue', amp: 0.2 }) + punto(3.4),
      paso: (q, t) => pon(q('pt'), { x: mezcla(16, 48, suave(tramo(t % 3, 0.3, 1.5))) - 32 * suave(tramo(t % 3, 2.2, 2.9)), y: 31 }),
    },
    {
      // la transferencia: el punto va de una flecha a la otra
      svg: () =>
        T([P.linea(10, 17, 50, 17, 4), P.poli([[43, 10], [51, 17], [43, 24]])], { cls: 'ln', amp: 0.35 }) + T([P.linea(54, 33, 14, 33, 4), P.poli([[21, 26], [13, 33], [21, 40]])], { cls: 'ln', amp: 0.35 }) + punto(3.4),
      paso(q, t) {
        const u = t % 3.2
        const ida = suave(tramo(u, 0.2, 1.2))
        const vuelta = suave(tramo(u, 1.8, 2.8))
        pon(q('pt'), u < 1.5 ? { x: mezcla(12, 40, ida), y: 17, o: 1 - tramo(u, 1.3, 1.5) } : { x: mezcla(52, 24, vuelta), y: 33, o: tramo(u, 1.6, 1.8) * (1 - tramo(u, 3.0, 3.2)) })
      },
    },
    {
      // el efectivo: un billete, y el punto es la moneda que brinca
      svg: () => T(P.rect(8, 12, 48, 26, 3), { cls: 'ln tapa', amp: 0.4 }) + T(P.circ(32, 25, 6.5, 9), { cls: 'ln fino', amp: 0.2 }) + T([P.linea(14, 18, 18, 18, 2), P.linea(46, 32, 50, 32, 2)], { cls: 'ln fino tenue', amp: 0.2 }) + punto(3.4),
      paso(q, t) {
        const b = brinco(tramo(t % 2.6, 0.2, 0.8), 10)
        pon(q('pt'), { x: 32, y: 25 + b.dy, sx: b.sx, sy: b.sy })
      },
    },
  ]
  svgs.forEach((svg, i) => svg && OBRAS[i] && monta(svg, { dur: Infinity, cartel: 1, ...OBRAS[i] }))
}

/**
 * «Su decisión». El dueño piensa, con la mano en la barbilla. Si dice que sí, baja la mano,
 * sonríe y asiente, y a su lado se dibuja una palomita. Si lo va a pensar, aparece el reloj en
 * pausa del primer día y él asiente tranquilo: usted marca el ritmo.
 * Devuelve { elige(cual, t) } con cual = 'si' | 'pensar' | ''. viewBox="24 22 262 220".
 */
export function decisionVivo(svg, inicial = '') {
  const C = [236, 76] // el centro de lo que se dibuja a su lado
  let est = inicial
  let te = -9
  let pose = null
  let poseSale = null

  const posar = (t, u) => {
    const idea = Math.sin(t * 0.9)
    if (!est)
      return {
        gira: -3 + 1.5 * idea,
        dy: 0,
        mira: [2.4, -2.2 + 0.6 * idea],
        abre: parpadea(t % 4.4, 1.2, 3.6),
        feliz: 0,
        cejas: [-2.4, -6, 0.4, 2],
        boca: [0.7, 0.1, 0],
        brazo: 0,
        mano: [0, 0, 0],
        pelo: 1.5 * idea,
        rubor: 0,
        resp: 0.012 * Math.sin(t * 1.8),
      }
    const si = est === 'si'
    const asiente = salto(tramo(u, 0.35, 0.8)) + (si ? salto(tramo(u, 0.85, 1.3)) : 0)
    const gusto = si ? suave(tramo(u, 0.3, 0.6)) * (1 - suave(tramo(u, 2.2, 2.6))) : 0
    return {
      gira: si ? 2.5 : -1.5,
      dy: 2.8 * asiente,
      mira: si ? [1.5, 0] : [3, -1.4],
      abre: parpadea(u, 0.15, 3.2),
      feliz: gusto,
      cejas: [-2 * (si ? 1 : 0.4), 0, -2 * (si ? 1 : 0.4), 0],
      boca: [0, si ? 1.2 : 0.75, 0.25 * gusto],
      brazo: 0,
      mano: [20, 80, 0],
      pelo: -3 * salto(tramo(u, 0.4, 0.85)),
      rubor: gusto,
      resp: 0.012 * Math.sin(t * 1.8),
    }
  }

  monta(svg, {
    dur: Infinity,
    cartel: 2,
    svg: () =>
      `<g transform="translate(-34 24)">${DUENO()}</g>` +
      // pensando: tres bolitas que suben
      [0, 1, 2].map((i) => G('bo' + i, T(P.circ(0, 0, 3 + i * 1.6, 7), { cls: 'ln fino', amp: 0.2 }))).join('') +
      G(
        'cosa',
        T(P.circ(0, 0, 27, 16), { cls: 'ln tapa tz', amp: 0.5, n: 'aro' }) +
          T(P.poli([[-12, 1], [-3, 11], [14, -10]]), { cls: 'ln tz', amp: 0.4, n: 'paloma' }) +
          T([P.linea(0, 0, 0, -17, 3), P.linea(0, 0, 11, 6, 3)], { cls: 'ln fino tz', amp: 0.3, n: 'agujas' }) +
          T([P.linea(38, -10, 38, 10, 3), P.linea(46, -10, 46, 10, 3)], { cls: 'ln tz', amp: 0.3, n: 'pausa' }),
      ) +
      punto(6.5),
    paso(q, t) {
      const u = t - te
      const nueva = posar(t, u)
      pose = poseSale && u < 0.5 ? mezclaPose(poseSale, nueva, suave(tramo(u, 0, 0.5))) : nueva
      actua(q, 'u', pose)
      const mano = Math.max(0, 1 - Math.hypot(pose.mano[0], pose.mano[1]) / 40)
      for (const x of ['um', 'uante', 'umanga']) ve(q(x), mano)
      // las bolitas de pensar
      ;[0, 1, 2].forEach((i) => {
        const f = (t * 0.45 + i / 3) % 1
        pon(q('bo' + i), { x: mezcla(152, C[0] - 8, f), y: mezcla(108, C[1] + 6, f) - 10 * Math.sin(f * Math.PI), o: est ? 0 : Math.sin(f * Math.PI) })
      })
      // lo que se dibuja a su lado
      const p = est ? suave(tramo(u, 0.25, 0.75)) : 0
      pon(q('cosa'), { x: C[0], y: C[1] + 1.6 * Math.sin(t * 2), r: 3 * golpe(u, 0.75, 0.4) * Math.sin(u * 24) })
      traza(q('aro'), p)
      traza(q('paloma'), est === 'si' ? suave(tramo(u, 0.6, 0.95)) : 0)
      traza(q('agujas'), est === 'pensar' ? suave(tramo(u, 0.6, 0.95)) : 0)
      traza(q('pausa'), est === 'pensar' ? suave(tramo(u, 0.85, 1.15)) : 0)
      // el punto: da vueltas mientras piensa y luego se queda de aviso en la esquina
      const b = brinco(tramo(u, 0.2, 0.7), 22)
      const ronda = { x: C[0] + 16 * Math.cos(t * 1.7), y: C[1] + 10 * Math.sin(t * 1.7), sx: 1, sy: 1 }
      const aviso = { x: C[0] + 20, y: C[1] - 21 + b.dy, sx: b.sx, sy: b.sy }
      pon(q('pt'), est ? aviso : ronda)
    },
  })

  return {
    elige(cual, t) {
      if (cual === est) return
      poseSale = pose ? JSON.parse(JSON.stringify(pose)) : null
      est = cual
      te = t ?? ahora()
    },
  }
}
