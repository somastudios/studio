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

const { D, T, G, monta, mezclaPts, tramo, mezcla, suave, salto, golpe, elastico, brinco, pon, traza, ve, forma, agita, punto } = Trazo

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
