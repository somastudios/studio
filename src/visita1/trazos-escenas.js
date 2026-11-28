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

const { P, D, T, G, monta, remuestra, corre, capsula, madeja, corona, rayos, manoSvg, mezclaPts, tramo, mezcla, suave, frena, acelera, salto, golpe, campana, elastico, rebota, brinco, sacude, pon, camara, traza, ve, forma, agita, punto } = Trazo

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

const tramito = (x0, x1, y, n = 8) => Array.from({ length: n }, (_, i) => [mezcla(x0, x1, i / (n - 1)), y])

/**
 * «Lo que suele pasar». Un carrete de hilo, limpio, con el punto al lado. Cada problema que el
 * cliente marca: el carrete se encoge, suelta un hilo que sale disparado, da un tirón y se
 * enreda arriba en una madeja que crece. El carrete brinca y adelgaza, saltan migas, la cámara
 * se sacude y el punto se asusta. Con tres, la madeja ya es un lío y le sale un «?». Si
 * desmarca, la madeja se afloja y encoge. Devuelve { pon(n, t) }. viewBox="0 0 240 260".
 */
export function sueleVivo(svg, cuantos = 0) {
  const C = [120, 96]
  const radio = (v) => (v < 1 ? 34 * Math.max(0, v) : 26 + 8 * Math.min(v, 6))
  let n = cuantos
  let desde = cuantos
  let tk = -9
  let sube = true
  let giro = 0 // lo que ya se ha retorcido con cada cambio

  monta(svg, {
    dur: Infinity,
    cartel: 2,
    svg: () =>
      G(
        'cam',
        T(P.linea(12, 244, 228, 244, 6), { cls: 'ln fino', amp: 0.5 }) +
          T(D(tramito(120, 120, 150, 10), false), { cls: 'ln fino', amp: 0.5, n: 'hilo' }) +
          G(
            'car',
            T(P.poli([[104, 204], [144, 204], [144, 242], [104, 242]], true), { cls: 'blq', amp: 0.4, n: 'csombra' }) +
              T(P.poli([[98, 198], [142, 198], [142, 236], [98, 236]], true), { cls: 'ln tapa', amp: 0.4, n: 'cuerpo' }) +
              [0, 1, 2, 3].map((i) => T(D(tramito(98, 142, 204 + i * 8, 4), false), { cls: 'ln fino tenue', amp: 0.3, n: 'vu' + i })).join('') +
              T(P.elipse(120, 236, 31, 7, 14), { cls: 'ln tapa', amp: 0.4 }) +
              T(P.elipse(120, 198, 31, 7, 14), { cls: 'ln tapa', amp: 0.4 }) +
              T(P.elipse(120, 198, 8, 2.2, 8), { cls: 'ln fino', amp: 0.15 }),
          ) +
          G('migas', rayos('mig', [[-62, -38, -54, -32], [66, 44, 58, 38], [-68, 40, -60, 35], [0, -70, 0, -61], [58, -52, 52, -46]])) +
          T(D(madeja(C[0], C[1], 34, 1, 0)), { cls: 'ln', n: 'lio' }) +
          G('duda', T(P.suave([[-7, -9], [-6, -15], [0, -18], [6, -15], [6, -9], [1, -4], [0, 2]]), { cls: 'ln', amp: 0.4, n: 'signo' }) + '<circle class="lleno" cx="0" cy="10" r="2.6"/>') +
          punto(7),
      ),
    paso(q, t) {
      const k = t - tk
      // 0 se encoge · 0.12 sale el hilo · 0.3 el tirón · 0.9 ya quedó
      const nv = mezcla(desde, n, rebota(tramo(k, 0.26, 0.9)))
      const vuelo = sube ? salto(tramo(k, 0, 0.24)) : 0
      const tiron = sube ? salto(tramo(k, 0.14, 0.52)) : 0
      const afloja = sube ? 0 : salto(tramo(k, 0.05, 0.8))
      const pega = sube ? golpe(k, 0.3, 0.5) : 0
      const R = radio(nv) * (1 - 0.14 * tiron + 0.06 * afloja)
      const lio = q('lio')
      forma(lio, madeja(C[0], C[1], Math.max(0.5, R), Math.min(1, 0.42 + 0.2 * nv), giro + t * (0.5 + 0.18 * Math.min(nv, 6)) + 4.5 * suave(tramo(k, 0.1, 0.7)) * (sube ? 1 : -1)))
      ve(lio, nv > 0.03 ? 1 : 0)
      agita(lio, 1 + 0.25 * Math.min(nv, 5) + 1.8 * tiron)
      // el hilo va del carrete a la madeja: flojo, y tieso con el tirón
      const arriba = C[1] + R * 0.8
      forma(q('hilo'), Array.from({ length: 10 }, (_, i) => {
        const p = i / 9
        return [120 + 7 * (1 - tiron) * Math.sin(p * 6.3 + t * 2.2) * Math.sin(p * Math.PI), mezcla(192, arriba, p)]
      }))
      ve(q('hilo'), nv > 0.03 ? 1 : 0)
      // el carrete: adelgaza con cada hilo que suelta, se encoge antes y brinca con el tirón
      const a = 22 - 2.5 * Math.min(nv, 6)
      forma(q('cuerpo'), [[120 - a, 198], [120 + a, 198], [120 + a, 236], [120 - a, 236]])
      forma(q('csombra'), [[126 - a, 204], [126 + a, 204], [126 + a, 242], [126 - a, 242]])
      const corre8 = 26 * suave(tramo(k, 0.1, 0.7)) * (sube ? 1 : -1)
      ;[0, 1, 2, 3].forEach((i) => {
        const y = 202 + ((((i * 8 + corre8 + giro * 3) % 32) + 32) % 32)
        forma(q('vu' + i), tramito(120 - a, 120 + a, y, 4).map(([x, yy], j) => [x, yy + (j - 1.5) * 0.8]))
      })
      const b = brinco(tramo(k, 0.3, 0.64), sube ? 8 : 0)
      const sy = (1 - 0.1 * vuelo) * b.sy
      pon(q('car'), { ox: 120, oy: 243, y: b.dy, r: 3.5 * pega * Math.sin(k * 30), sx: (1 + 0.08 * vuelo) * b.sx, sy })
      // migas, el «?» y la sacudida
      pon(q('migas'), { ox: C[0], oy: C[1], r: -t * 26, sx: Math.max(0.3, R / 52), o: 0.7 * pega })
      const hay = rebota(tramo(nv, 2.5, 3))
      const rr = radio(nv)
      pon(q('duda'), { x: Math.min(214, C[0] + rr * 0.92 + 12), y: Math.max(26, C[1] - rr * 0.86), r: 12 + 6 * tiron * Math.sin(t * 30), sx: Math.max(0, hay) })
      agita(q('signo'), 1 + 2 * tiron)
      // el punto, en el piso: mira hacia arriba y brinca hacia atrás con cada tirón
      const s = brinco(tramo(k, 0.3, 0.72), sube ? 14 : 5)
      const mira = Math.min(1, nv / 3)
      pon(q('pt'), { x: 46 - 8 * (sube ? salto(tramo(k, 0.3, 0.72)) : 0), y: 236 + s.dy + 1.2 * Math.sin(t * 2.1) * (1 - mira), sx: s.sx * (1 - 0.08 * mira), sy: s.sy * (1 + 0.12 * mira) })
      camara(q('cam'), 120 + (sube ? sacude(k, 0.3, 2.6) : 0), 130 + (sube ? sacude(k, 0.32, 1.6) : 0), 1, 120, 130)
    },
  })

  return {
    /** Ahora lleva `c` problemas marcados. `t` (opcional) es el segundo del reloj, para revisar. */
    pon(c, t) {
      if (c === n) return
      const tt = t ?? ahora()
      desde = mezcla(desde, n, rebota(tramo(tt - tk, 0.26, 0.9)))
      giro += 4.5 * (sube ? 1 : -1) * suave(tramo(tt - tk, 0.1, 0.7))
      sube = c > n
      n = c
      tk = tt
    },
  }
}

/** Cuándo pasa cada cosa en «Lo que entendimos», según cuántas filas tenga la ficha. */
export function tiemposFicha(K) {
  const paso = Math.min(0.46, 1.5 / K)
  const filas = Array.from({ length: K }, (_, i) => 1.6 + i * paso)
  const sello = filas[K - 1] + 0.42
  return { paso, filas, sello, fin: sello + 1.75 }
}

/**
 * «Lo que entendimos». Va encima de la ficha de verdad, con sus mismas medidas. La madeja cae
 * sobre la ficha vacía y rebota. El punto llega, toma la punta y le da un tirón. Luego corre
 * por cada fila sacando el hilo, derecho: la madeja se va quedando sin hilo y baja a la fila
 * siguiente. Cuando ya no queda nada, baja una mano con el sello, toma vuelo y estampa.
 * `arma({ alto, filas: [[x0, y, x1]], sello: [x, y] })` le da las medidas (el ancho siempre
 * es 320) y `desde(t)` lo arranca.
 */
export function entendidoVivo(svg) {
  const MAXF = 6
  let cfg = null
  let t0 = 1e9
  let tm = null

  monta(svg, {
    dur: Infinity,
    cartel: 3,
    svg: () =>
      G(
        'cam',
        Array.from({ length: MAXF }, (_, i) => T(D(tramito(0, 10, 0), false), { cls: 'ln tz', amp: 0.5, n: 'f' + i })).join('') +
          G('migas', rayos('mig', [[-56, -40, -48, -34], [58, 38, 50, 32], [-60, 36, -52, 30], [0, -64, 0, -55], [52, -46, 46, -40]])) +
          T(D(madeja(0, 0, 40, 1, 0)), { cls: 'ln', n: 'lio' }) +
          G('marca', T(P.circ(0, 0, 13, 16), { cls: 'azul', amp: 0.6 }) + T(P.poli([[-5.8, 0.6], [-1.8, 4.9], [6.4, -4.7]]), { cls: 'ln ln-claro tz', amp: 0.3, n: 'ok' })) +
          corona('ray', 9, 22, 34) +
          punto(6.5) +
          // el sello y la mano que lo empuña: el origen es la base del sello
          G(
            'sello',
            T(D(capsula([4, -52], [24, -260], 18)), { cls: 'ln tapa', amp: 0.5 }) +
              T(D(capsula([0, -8], [0, -24], 9, 3)), { cls: 'ln tapa', amp: 0.3 }) +
              T(P.rect(-18, -10, 36, 10, 3.5), { cls: 'ln tapa', amp: 0.4 }) +
              T(P.linea(-14, -5.2, 14, -5.2, 3), { cls: 'ln fino tenue', amp: 0.2 }) +
              `<g transform="translate(1 -50) rotate(184)">${manoSvg('sm')}</g>`,
          ),
      ),
    paso(q, t) {
      const fuera = { x: -400, y: -400, o: 0 }
      if (!cfg) {
        for (const n of ['lio', 'migas', 'marca', 'ray', 'pt', 'sello']) pon(q(n), fuera)
        return
      }
      const u = Math.max(0, t - t0)
      const K = cfg.filas.length
      const R0 = Math.min(58, cfg.alto * 0.36)
      const centro = [160, Math.min(cfg.alto * 0.5, cfg.filas[0][1] + R0 * 0.6)]
      const inicio = (i) => [cfg.filas[i][0] - 2, cfg.filas[i][1]]
      // 0 cae · 0.45 llega el punto · 0.9 tirón · 1.3 baja a la primera fila · luego una por una
      const cae = acelera(tramo(u, 0, 0.42))
      const pega = golpe(u, 0.42, 0.3)
      const tiron = salto(tramo(u, 0.9, 1.3))
      // dónde está la madeja y cuánto hilo le queda
      let c = [centro[0], mezcla(-R0 * 1.4, centro[1], cae) - 9 * salto(tramo(u, 0.42, 0.7))]
      let queda = 1
      for (let i = 0; i < K; i++) {
        const a = tm.filas[i]
        const va = suave(tramo(u, a - 0.3, a))
        const de = i === 0 ? centro : inicio(i - 1)
        if (u >= a - 0.3) c = [mezcla(de[0], inicio(i)[0], va), mezcla(de[1], inicio(i)[1], va) - 10 * salto(tramo(u, a - 0.3, a)) * (i ? 1 : 0)]
        const saca = suave(tramo(u, a, a + 0.36))
        queda = Math.min(queda, 1 - (i + saca) / K)
        const [x0, y, x1] = cfg.filas[i]
        forma(q('f' + i), tramito(x0, x1, y))
        traza(q('f' + i), saca)
        ve(q('f' + i), 1 - suave(tramo(u, a + 0.42, a + 0.66)))
        agita(q('f' + i), mezcla(1.8, 0.5, saca))
      }
      for (let i = K; i < MAXF; i++) ve(q('f' + i), 0)
      const R = R0 * Math.pow(Math.max(0, queda), 0.6) * (1 - 0.14 * tiron)
      const lio = q('lio')
      pon(lio, { x: c[0], y: c[1] + 4 * pega, sx: R / 40 * (1 + 0.14 * pega), sy: (R / 40) * (1 - 0.16 * pega) })
      forma(lio, madeja(0, 0, 40, 1, u * (1.6 + 2.6 * tiron) + 6 * (1 - queda)))
      ve(lio, R > 1 ? 1 : 0)
      lio.style.strokeWidth = (3.1 * 40) / Math.max(12, R) > 9 ? '9' : String((3.1 * 40) / Math.max(12, R))
      agita(lio, 2 + 1.4 * tiron)
      pon(q('migas'), { x: centro[0], y: centro[1], r: -u * 26, sx: R0 / 46, o: 0.7 * Math.max(pega, golpe(u, 1.1, 0.4)) })
      // el punto: llega, jala, y luego saca cada fila corriendo de izquierda a derecha
      const S = cfg.sello
      const punta = [centro[0] - R0 * 0.75, centro[1] + R0 * 0.7]
      let pos
      if (u < 0.9) {
        const p = tramo(u, 0.45, 0.9)
        const b = brinco(p, 26)
        pos = { x: mezcla(330, punta[0], suave(p)), y: mezcla(-14, punta[1], suave(p)) + b.dy, sx: b.sx, sy: b.sy }
      } else if (u < tm.filas[0] - 0.3) pos = { x: punta[0] - 9 * tiron, y: punta[1] + 7 * tiron, sx: 1 + 0.2 * tiron, sy: 1 - 0.16 * tiron }
      else {
        pos = { x: punta[0], y: punta[1], sx: 1, sy: 1 }
        for (let i = 0; i < K; i++) {
          const a = tm.filas[i]
          const [x0, y, x1] = cfg.filas[i]
          const de = i === 0 ? punta : [cfg.filas[i - 1][2], cfg.filas[i - 1][1]]
          if (u >= a - 0.3) {
            const p = tramo(u, a - 0.3, a)
            const b = brinco(p, 16)
            const saca = suave(tramo(u, a, a + 0.36))
            pos = { x: mezcla(mezcla(de[0], x0, suave(p)), x1, saca), y: mezcla(de[1], y, suave(p)) + b.dy, sx: b.sx * (1 + 0.25 * salto(saca)), sy: b.sy * (1 - 0.18 * salto(saca)) }
          }
        }
        if (u >= tm.sello) {
          const p = tramo(u, tm.sello, tm.sello + 0.4)
          const b = brinco(p, 22)
          const ult = cfg.filas[K - 1]
          pos = { x: mezcla(ult[2], S[0], suave(p)), y: mezcla(ult[1], S[1], suave(p)) + b.dy, sx: b.sx, sy: b.sy }
        }
      }
      // la mano con el sello: llega, toma vuelo, estampa y se va
      const ts = tm.sello + 0.15
      const v = u - ts
      const llega = frena(tramo(v, 0, 0.6))
      const vuelo = salto(tramo(v, 0.62, 0.9))
      const baja = acelera(tramo(v, 0.88, 1.02))
      const sella = golpe(v, 1.02, 0.26)
      const quita = rebota(tramo(v, 1.3, 1.68))
      const sefue = acelera(tramo(v, 1.75, 2.3))
      const sy = 1 + (v < 1.02 ? 0.1 * baja : 0) - 0.1 * sella
      pon(q('sello'), {
        x: S[0] + mezcla(mezcla(mezcla(46, 14, llega), 0, baja), 50, sefue) + 8 * quita * (1 - sefue),
        y: S[1] + mezcla(mezcla(mezcla(-190, -50, llega) - 13 * vuelo, 2, baja) - 62 * quita, -230, sefue),
        r: mezcla(10, 0, llega) - 5 * vuelo + 7 * quita,
        sx: 2 - sy,
        sy,
        o: v < 0 ? 0 : 1,
      })
      const ya = v >= 1.02
      pon(q('marca'), { x: S[0], y: S[1], r: -10, o: ya ? 1 : 0 })
      traza(q('ok'), suave(tramo(v, 1.5, 1.85)))
      pon(q('ray'), { x: S[0], y: S[1], sx: mezcla(0.6, 1.2, frena(tramo(v, 1.02, 1.5))), o: golpe(v, 1.02, 0.5) })
      pon(q('pt'), { ...pos, o: ya ? 0 : 1 })
      camara(q('cam'), 160 + sacude(u, 0.42, 2.4) + sacude(v, 1.02, 3), cfg.alto / 2 + sacude(u, 0.43, 1.6), 1, 160, cfg.alto / 2)
    },
  })

  return {
    arma(c) {
      cfg = c
      tm = tiemposFicha(c.filas.length)
    },
    desde(t) {
      t0 = t ?? ahora()
    },
  }
}

/**
 * Enlaza la ficha de una lámina (`.ve-der` con `.ve-ficha`, sus `.ve-item` y `.ve-vivo svg`)
 * con su animación: mide la ficha cuando la lámina entra, arranca el dibujo y hace aparecer
 * cada fila de verdad justo cuando su hilo termina de salir. Devuelve cuándo termina (en
 * segundos de la línea de tiempo `tl`), o 0 si no hubo animación.
 */
export function fichaViva(el, tl, { reduced = false } = {}) {
  const der = el.querySelector('.ve-der')
  const caja = der?.querySelector('.ve-vivo')
  const svg = caja?.querySelector('svg')
  const ficha = der?.querySelector('.ve-ficha')
  const items = [...el.querySelectorAll('.ve-item')].filter((x) => x.querySelector('.ve-t')).slice(0, 6)
  if (reduced || !svg || !ficha || !items.length) {
    if (caja) caja.style.visibility = 'hidden'
    return 0
  }
  const vivo = entendidoVivo(svg)
  svg._vivo = vivo
  const tm = tiemposFicha(items.length)
  const E = 0.25 // cuándo arranca dentro de la línea de tiempo
  const medir = () => {
    const r = ficha.getBoundingClientRect()
    if (!r.width) return
    const k = 320 / r.width
    const alto = r.height * k
    svg.setAttribute('viewBox', `0 0 320 ${alto.toFixed(1)}`)
    const filas = items.map((it) => {
      const tEl = it.querySelector('.ve-t')
      const b = tEl.getBoundingClientRect()
      const rango = document.createRange()
      rango.selectNodeContents(tEl)
      const ancho = Math.min(b.width, rango.getBoundingClientRect().width || b.width)
      const x0 = (b.left - r.left) * k
      return [x0, (b.top + Math.min(b.height, 30) / 2 - r.top) * k, Math.min(300, x0 + Math.max(60, ancho * k))]
    })
    vivo.arma({ alto, filas, sello: [286, Math.max(26, alto - 30)] })
  }
  tl.call(() => {
    medir()
    vivo.desde()
  }, null, E)
  tl.fromTo(caja, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.05)
  tl.fromTo(ficha, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
  items.forEach((it, i) => tl.fromTo(it, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, E + tm.filas[i] + 0.44))
  const fin = E + tm.fin
  tl.to(caja, { autoAlpha: 0, duration: 0.35 }, fin)
  return { fin, filas: tm.filas.map((x) => E + x), sello: E + tm.sello + 1.17 }
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

const lente = (R) => Array.from({ length: NQ }, (_, i) => enAro(R, 200 + (360 * i) / (NQ - 1)))
// el palo del «!»: el gancho, enderezado
const PALO = abierta([[0, -34], [0, 26]], NQ)
const ZOOM = 3.2 // cuánto se acerca el plano de detalle
const RL = 90 // el radio de la lente cuando llena el cuadro
const GRIETA = [286, 100]
const CHARCO = [286, 176]

/** El local: piso, pared, toldo, letrero, puerta, ventana y, a la derecha, la gotera. */
const local = (k) =>
  T(P.linea(132, 177, 316, 177, 6), { cls: 'ln fino', amp: 0.5 }) +
  T(P.rect(170, 84, 132, 93, 2), { cls: 'blq', amp: 0.6 }) +
  T(P.rect(164, 78, 132, 99, 2), { cls: 'ln tapa', amp: 0.6 }) +
  T(P.poli([[156, 80], [304, 80], [294, 56], [166, 56]], true), { cls: 'ln tapa', amp: 0.5 }) +
  T([0, 1, 2, 3, 4].map((i) => P.arco(170.8 + i * 29.6, 80, 14.8, 0, 180, 7)), { cls: 'ln tapa', amp: 0.4 }) +
  T([1, 2, 3, 4].map((i) => P.linea(166 + i * 25.6 + 2, 57, 156 + i * 29.6, 80, 3)), { cls: 'ln fino tenue', amp: 0.3 }) +
  G(k + 'letrero', T([P.linea(214, 30, 214, 22, 2), P.linea(246, 30, 246, 22, 2)], { cls: 'ln fino', amp: 0.2 }) + T(P.rect(200, 30, 60, 18, 3), { cls: 'ln tapa', amp: 0.4 }) + T(P.suave([[210, 40], [218, 36], [226, 42], [234, 37], [242, 41], [250, 38]]), { cls: 'ln fino', amp: 0.3 })) +
  T(P.rect(180, 118, 30, 59, 2), { cls: 'ln', amp: 0.5 }) +
  '<circle class="lleno" cx="204" cy="150" r="2.2"/>' +
  T(P.rect(224, 114, 52, 38, 2), { cls: 'ln', amp: 0.5 }) +
  T([P.linea(250, 114, 250, 152, 3), P.linea(224, 133, 276, 133, 3)], { cls: 'ln fino tenue', amp: 0.3 }) +
  T([P.linea(231, 121, 238, 128, 2), P.linea(257, 139, 266, 148, 2)], { cls: 'ln fino tenue', amp: 0.2, n: k + 'brillo' }) +
  G(
    k + 'fuga',
    T(P.poli([[288, 84], [284, 90], [289, 95], [285, 100]]), { cls: 'ln fino', amp: 0.4 }) +
      G(k + 'gota', T(P.suave([[0, -5], [2.6, -0.4], [2.2, 2.6], [0, 3.8], [-2.2, 2.6], [-2.6, -0.4]], true), { cls: 'ln fino tapa', amp: 0.15 })) +
      T(D(elipseAb(CHARCO[0], CHARCO[1], 7, 1.8), true), { cls: 'ln fino', amp: 0.2, n: k + 'onda0' }) +
      T(D(elipseAb(CHARCO[0], CHARCO[1], 7, 1.8), true), { cls: 'ln fino', amp: 0.2, n: k + 'onda1' }),
  )
function elipseAb(cx, cy, rx, ry, n = 12) {
  return Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * TAU), cy + ry * Math.sin((i / n) * TAU)])
}
/** La gota: crece en la grieta, se suelta, cae y hace ondas en el charco. `u` va de 0 a 1.4. */
function gotea(q, k, u) {
  const crece = rebota(tramo(u, 0, 0.45))
  const cae = acelera(tramo(u, 0.5, 0.92))
  const y = mezcla(GRIETA[1] + 5, CHARCO[1] - 3, cae)
  pon(q(k + 'gota'), { x: GRIETA[0] - 0.5, y, sx: crece * (1 - 0.25 * cae), sy: crece * (1 + 0.45 * cae), o: u > 0.92 || u < 0 ? 0 : 1 })
  ;[0, 1].forEach((i) => {
    const o = tramo(u, 0.92 + i * 0.12, 1.4)
    forma(q(k + 'onda' + i), elipseAb(CHARCO[0], CHARCO[1], 3 + 14 * frena(o), 0.8 + 3 * frena(o)))
    ve(q(k + 'onda' + i), o > 0 && o < 1 ? 1 - o : 0)
  })
  return y
}

/**
 * «Primero el problema», en tres planos (10.9 s, en bucle).
 *   1 · La pregunta   General. Un «?» frente al local; su punto es el punto azul. El punto se
 *                     mete al gancho, el gancho se cierra y queda una lupa. Se acerca al local
 *                     y la lente crece hasta llenar el cuadro: entramos a lo que ve.
 *   2 · Busca         Detalle, a través de la lente. Sube al letrero, baja a la ventana, y de
 *                     pronto la grieta: se frena en seco. Una gota crece, se suelta, la sigue
 *                     hasta el charco y salpica.
 *   3 · Aquí está     General. Salimos de la lente. La lupa se hace a un lado, el punto brinca
 *                     a la grieta y la marca con un aro. El local se sacude. La lupa se abre,
 *                     se endereza y queda un «!»: la pregunta ya tiene respuesta.
 * Devuelve { desde(t) }. El <svg> lleva viewBox="0 0 320 200".
 */
export function premisaVivo(svg) {
  const SALE = [70, 80]
  const FRENTE = [238, 112]
  const A = [232, 48] // el letrero
  const B = [250, 133] // la ventana
  const Cg = [284, 98] // la grieta
  const Dg = [286, 158] // el charco
  const ASIDE = [124, 92] // a dónde se hace la lupa en el plano 3: al claro, para que el «!» se lea
  const fino = (el, z) => el.style.setProperty('--z', z.toFixed(3))
  const mascara = (n) => `<circle class="mascara" data-n="${n}" cx="160" cy="100" r="${RL + 100}"/>`
  const aro = (n) => G(n, T(P.linea(...enAro(RQ, MANGO), ...enAro(RQ + 27, MANGO), 4), { cls: 'ln tz', amp: 0.4, n: n + 'mango' }) + T(D(GANCHO, false), { cls: 'ln', amp: 0.8, n: n + 'aro' }))

  const corto = {
    cartel: 9.2,
    abre: [70, 80],
    cierra: [285, 98],
    t0: 0,
    planos: [
      {
        nombre: 'La pregunta',
        dur: 3.5,
        svg: () => G('p1mundo', local('p1')) + mascara('p1mas') + aro('p1') + punto(6.5, 'p1pt'),
        paso(q, t) {
          // 0.3 brinca el punto · 0.75 toma vuelo · 0.95 se cierra · 1.6 se acerca · 2.7 entra
          const lupa = elastico(tramo(t, 0.95, 1.6))
          const vuelo = salto(tramo(t, 0.72, 0.98))
          const va = rebota(tramo(t, 1.6, 2.5))
          const atras = salto(tramo(t, 2.45, 2.75))
          const entra = Math.pow(suave(tramo(t, 2.7, 3.5)), 1.4)
          const duda = 1 - suave(tramo(t, 0.72, 1.1))
          const c = [mezcla(mezcla(SALE[0], FRENTE[0], va), 160, entra), mezcla(mezcla(SALE[1], FRENTE[1], va), 100, entra) + 2 * Math.sin(t * 2.3) * (1 - entra) + 3 * vuelo]
          const R = mezcla(RQ * (1 - 0.08 * atras), RL, entra)
          forma(q('p1aro'), entra > 0 ? lente(R) : mezclaPts(GANCHO, LENTE, Math.max(0, lupa)))
          agita(q('p1aro'), 1 + 1.4 * salto(tramo(t, 0.95, 1.6)))
          q('p1aro').style.strokeWidth = String(mezcla(3.1, 5, entra))
          traza(q('p1mango'), suave(tramo(t, 1.2, 1.55)) * (1 - suave(tramo(t, 2.7, 3.0))))
          pon(q('p1'), { x: c[0], y: c[1], r: 7 * duda * Math.sin(t * 2.6 + 0.4) - 6 * salto(tramo(t, 1.6, 2.1)), sx: 1 + 0.07 * vuelo, sy: 1 - 0.07 * vuelo })
          // el punto: abajo es el punto del «?»; brinca, y luego se mete a la lente y mira al frente
          const adentro = suave(tramo(t, 1.0, 1.45))
          const b0 = brinco(tramo(t, 0.28, 0.7), 10)
          const b = brinco(tramo(t, 1.0, 1.45), 20)
          const s = mezcla(1, 9 / 6.5, entra)
          pon(q('p1pt'), { x: c[0] + 8 * adentro * (1 - entra) * (t > 1.6 ? 1 : 0), y: c[1] + mezcla(59, 0, adentro) + (t < 0.9 ? b0.dy : b.dy), sx: s * (t < 0.9 ? b0.sx : b.sx), sy: s * (t < 0.9 ? b0.sy : b.sy) })
          // el local: el letrero se mece cuando la lupa llega; la gotera apenas se nota
          pon(q('p1letrero'), { ox: 230, oy: 22, r: 5 * golpe(t, 2.3, 1.1) * Math.sin((t - 2.3) * 9) })
          ve(q('p1fuga'), 0.22)
          gotea(q, 'p1', (t % 1.7) - 0.1)
          // la cámara se mete: el mundo crece y su línea se adelgaza lo mismo, para que no engorde
          const z = mezcla(1, ZOOM, entra)
          camara(q('p1mundo'), mezcla(160, FRENTE[0] + 12, entra), mezcla(100, FRENTE[1] - 7, entra), z)
          fino(q('p1mundo'), z)
          ve(q('p1mas'), entra)
        },
      },
      {
        nombre: 'Busca',
        dur: 4.0,
        svg: () =>
          G('p2mundo', local('p2')) +
          mascara('p2mas') +
          G('p2rim', T(P.circ(160, 100, RL, 36), { cls: 'ln rim', amp: 0.9 }) + T(P.arco(160, 100, RL - 13, 196, 236, 8), { cls: 'ln fino tenue', amp: 0.4 })) +
          corona('p2ray', 9, 16, 30) +
          punto(9, 'p2pt'),
        paso(q, t) {
          // 0.1 sube al letrero · 1.0 baja a la ventana · 1.95 se va a la grieta · 2.45 la encuentra
          // 2.55 crece la gota · 3.05 se suelta y la sigue · 3.5 salpica
          const p1 = suave(tramo(t, 0.1, 0.7))
          const p2 = rebota(tramo(t, 1.0, 1.7))
          const p3 = rebota(tramo(t, 1.95, 2.45))
          const sigue = suave(tramo(t, 3.07, 3.5))
          let c = [mezcla(FRENTE[0] + 12, A[0], p1), mezcla(FRENTE[1] - 7, A[1], p1)]
          c = [mezcla(c[0], B[0], p2), mezcla(c[1], B[1], p2)]
          c = [mezcla(c[0], Cg[0], p3), mezcla(c[1], Cg[1], p3)]
          c = [mezcla(c[0], Dg[0], sigue), mezcla(c[1], Dg[1], sigue)]
          const halla = golpe(t, 2.45, 0.45)
          const salpica = golpe(t, 3.5, 0.4)
          camara(q('p2mundo'), c[0] + sacude(t, 2.45, 0.9) + sacude(t, 3.5, 0.5), c[1] + 0.5 * Math.sin(t * 2.2), ZOOM)
          fino(q('p2mundo'), ZOOM)
          // lo que se va encontrando
          pon(q('p2letrero'), { ox: 230, oy: 22, r: 4 * Math.sin(t * 3.1) * (1 - p2) })
          ve(q('p2brillo'), 0.5 + 0.5 * Math.sin(t * 5))
          ve(q('p2fuga'), mezcla(0.25, 1, suave(tramo(t, 2.4, 2.6))))
          gotea(q, 'p2', t - 2.55)
          // la lente: se aplasta al frenar y se sacude al encontrar
          pon(q('p2rim'), { ox: 160, oy: 100, r: 2.5 * halla * Math.sin((t - 2.45) * 28), sx: 1 + 0.03 * halla - 0.02 * salpica, sy: 1 - 0.03 * halla + 0.02 * salpica })
          // el punto es la pupila: mira hacia donde va, y se agranda cuando la ve
          const mira = t < 0.7 ? [2, -9] : t < 1.0 ? [8 * Math.sin(t * 9), -2] : t < 1.7 ? [5, 9] : t < 1.95 ? [7 * Math.sin(t * 10), 2] : t < 2.45 ? [10, -6] : [0, 6 * sigue]
          const g = 1 + 0.45 * halla + 0.25 * salpica
          pon(q('p2pt'), { x: 160 + mira[0] * (1 - halla), y: 100 + mira[1] * (1 - halla), sx: g, sy: g })
          pon(q('p2ray'), { x: 160, y: 100, sx: mezcla(0.7, 1.5, frena(tramo(t, 2.45, 2.9))), o: golpe(t, 2.45, 0.5) })
        },
      },
      {
        nombre: 'Aquí está',
        dur: 4.2,
        svg: () =>
          G('p3mundo', local('p3') + G('p3onda', T(P.circ(0, 0, 13, 12), { cls: 'ln fino', amp: 0.3 })) + G('p3marca', T(P.circ(0, 0, 13, 14), { cls: 'ln ln-azul tz', amp: 0.4, n: 'p3mk' }))) +
          mascara('p3mas') +
          aro('p3') +
          '<circle class="lleno" data-n="p3punto" cx="0" cy="0" r="4.6"/>' +
          corona('p3ray', 8, 18, 30) +
          punto(6.5, 'p3pt'),
        paso(q, t) {
          // 0 salimos de la lente · 0.85 se hace a un lado · 1.25 brinca el punto · 1.7 marca
          // 1.9 la lupa se abre y se endereza · 2.5 ya es «!»
          const sale = suave(tramo(t, 0, 0.85))
          const z = mezcla(ZOOM, 1, Math.pow(sale, 0.8))
          camara(q('p3mundo'), mezcla(Dg[0], 160, sale) + sacude(t, 1.7, 2.6), mezcla(Dg[1], 100, sale) + sacude(t, 1.72, 1.6), z)
          fino(q('p3mundo'), z)
          ve(q('p3mas'), 1 - sale)
          ve(q('p3fuga'), 1)
          gotea(q, 'p3', ((t + 0.6) % 1.6) - 0.1)
          // la lupa: de llenar el cuadro a su tamaño, sobre la grieta; luego se hace a un lado
          const aside = rebota(tramo(t, 0.85, 1.35))
          const c = [mezcla(mezcla(160, Cg[0] - 6, sale), ASIDE[0], aside), mezcla(mezcla(100, Cg[1] + 16, sale), ASIDE[1], aside)]
          const abre = suave(tramo(t, 1.9, 2.25))
          const recta = elastico(tramo(t, 2.2, 2.9))
          const R = mezcla(RL, RQ, Math.pow(sale, 0.7))
          const pts = sale < 1 ? lente(R) : recta > 0 ? mezclaPts(GANCHO, PALO, recta) : mezclaPts(LENTE, GANCHO, abre)
          forma(q('p3aro'), pts)
          q('p3aro').style.strokeWidth = String(mezcla(5, 3.1, sale))
          agita(q('p3aro'), 1 + 1.5 * salto(tramo(t, 1.9, 2.9)))
          traza(q('p3mango'), suave(tramo(t, 0.5, 0.85)) * (1 - suave(tramo(t, 1.8, 2.05))))
          const gusto = brinco(tramo(t, 3.0, 3.45), 9)
          pon(q('p3'), { x: c[0], y: c[1] + gusto.dy, r: -8 * salto(tramo(t, 0.85, 1.2)) + 4 * golpe(t, 2.9, 0.5) * Math.sin((t - 2.9) * 22), sx: gusto.sx, sy: gusto.sy })
          // el punto negro del «!» nace cuando el palo ya está derecho
          pon(q('p3punto'), { x: c[0], y: c[1] + 40 + gusto.dy, sx: rebota(tramo(t, 2.7, 3.0)) })
          // el punto azul sale de la lente, brinca a la grieta y la marca
          const brinca = tramo(t, 1.25, 1.7)
          const b = brinco(brinca, 46)
          const pega = golpe(t, 1.7, 0.25)
          const s = mezcla(9 / 6.5, 1, sale)
          pon(q('p3pt'), { x: mezcla(c[0], GRIETA[0] - 1, suave(brinca)), y: mezcla(c[1], GRIETA[1] - 2, suave(brinca)) + b.dy + 2 * pega, sx: s * b.sx * (1 + 0.35 * pega), sy: s * b.sy * (1 - 0.3 * pega) })
          pon(q('p3marca'), { x: GRIETA[0] - 1, y: GRIETA[1] - 2 })
          traza(q('p3mk'), suave(tramo(t, 1.72, 2.1)))
          const o = ((t - 1.75) % 1.1) / 1.1
          pon(q('p3onda'), { x: GRIETA[0] - 1, y: GRIETA[1] - 2, sx: 1 + 1.3 * frena(o), o: t > 1.75 ? 0.7 * (1 - o) : 0 })
          pon(q('p3ray'), { x: GRIETA[0] - 1, y: GRIETA[1] - 2, sx: mezcla(0.6, 1.2, frena(tramo(t, 1.7, 2.15))), o: golpe(t, 1.7, 0.5) })
          pon(q('p3letrero'), { ox: 230, oy: 22, r: 6 * golpe(t, 1.7, 1.0) * Math.sin((t - 1.7) * 11) })
        },
      },
    ],
  }
  monta(svg, corto)
  return {
    desde(t) {
      corto.t0 = t ?? ahora()
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

function figuraViva(svg, PASOS, { inicial = 0, r = 7, despues = '', centro = [160, 100] } = {}) {
  const vista = (k) => PASOS[k].vista || [centro[0], centro[1], 1]
  let de = inicial
  let a = inicial
  let t0 = null
  let sale = null
  let ultimo = PASOS[inicial].punto(0)

  monta(svg, {
    dur: Infinity,
    cartel: 3,
    svg: () => G('cam', T(D(corre(PASOS[inicial].forma, 7, 7)), { cls: 'blq', n: 'sombra' }) + T(D(PASOS[inicial].forma), { cls: 'ln tapa', n: 'figura' }) + PASOS.map((p, k) => G('d' + k, p.svg())).join('') + despues + punto(r)),
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
      // la cámara: cada paso tiene su encuadre; al llegar la figura, todo se sacude tantito
      const v0 = vista(de)
      const v1 = vista(a)
      const m = cambia ? suave(tramo(u, 0.1, 0.9)) : 1
      const z = mezcla(v0[2], v1[2], m)
      camara(q('cam'), mezcla(v0[0], v1[0], m) + (cambia ? sacude(u, 0.9, 1.8) : 0), mezcla(v0[1], v1[1], m) + (cambia ? sacude(u, 0.92, 1.2) : 0), z, centro[0], centro[1])
      q('cam').style.setProperty('--z', z.toFixed(3))
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
export const metodoVivo = (svg, inicial = 0) => figuraViva(svg, METODO, { inicial, centro: [164, 106] })

// ── «¿Hasta dónde quiere llegar?» ───────────────────────────────────────────────────────────

const F_PUESTO = remuestra([[160, 104], [212, 104], [222, 126], [208, 126], [208, 192], [112, 192], [112, 126], [98, 126], [108, 104]], NF)
const F_EDIFICIO = remuestra([[160, 22], [226, 22], [226, 86], [250, 86], [250, 192], [70, 192], [70, 86], [94, 86], [94, 22]], NF)
const vive = (L) => ({ ox: 160, oy: 192, r: 0.7 * Math.sin(L * 1.3) })
const luzDe = (q, L, x, y, cuando, tam = 1) => {
  const luz = rebota(tramo(L, cuando, cuando + 0.4))
  pon(q('luz'), { x, y, sx: tam * luz * (1 + 0.08 * Math.sin(L * 6)), r: L * 14, o: luz })
}

/** Una pieza que cae de arriba y rebota. */
const cae = (el, L, cuando, alto = 46) => {
  const p = rebota(tramo(L, cuando, cuando + 0.42))
  pon(el, { y: -alto * (1 - p), o: L < cuando ? 0 : 1 })
}
/** Una pieza que brota desde su centro. */
const brota = (el, L, cuando, ox, oy) => pon(el, { ox, oy, sx: Math.max(0, rebota(tramo(L, cuando, cuando + 0.32))) })
/** El polvo que levanta la figura al asentarse. */
const polvo = (q, L, x0, x1) => {
  const g = golpe(L, 0.1, 0.55)
  pon(q('polvoi'), { x: x0 - 10 * (1 - g), y: 190, o: g })
  pon(q('polvod'), { x: x1 + 10 * (1 - g), y: 190, o: g })
}

const ALCANCE = [
  {
    // Essential: un puesto. Lo justo, y ya atiende. Cae el toldo y se pone la barra.
    dur: 1e6,
    vista: [160, 144, 1.55],
    forma: F_PUESTO,
    giro: vive,
    svg: () =>
      T([0, 1, 2].map((i) => P.arco(116.3 + i * 36.7, 126, 18.3, 0, 180, 7)), { cls: 'ln', amp: 0.4, n: 'a0toldo' }) +
      T(P.linea(112, 158, 208, 158, 4), { cls: 'ln tz', amp: 0.4, n: 'a0barra' }) +
      T([P.linea(136, 172, 136, 180, 2), P.linea(160, 170, 160, 180, 2), P.linea(184, 172, 184, 180, 2)], { cls: 'ln fino tenue tz', amp: 0.2, n: 'a0tabla' }),
    detalle(q, L) {
      cae(q('a0toldo'), L, 0.1, 30)
      traza(q('a0barra'), suave(tramo(L, 0.45, 0.8)))
      traza(q('a0tabla'), suave(tramo(L, 0.7, 1.0)))
      pon(q('luz'), { x: 160, y: 150, sx: 0, o: 0 })
      polvo(q, L, 108, 212)
    },
    punto: (L) => {
      const b = brinco(tramo(L % 3.2, 0.2, 0.7), 9)
      return { x: 160, y: 150 + b.dy, sx: b.sx, sy: b.sy }
    },
  },
  {
    // Advanced: el local completo. Cae el toldo, sube la puerta, brota la ventana y se enciende.
    dur: 1e6,
    vista: [160, 106, 1.14],
    forma: F_LOCAL,
    giro: vive,
    svg: () =>
      T([0, 1, 2, 3].map((i) => P.arco(101 + i * 39.3, 78, 19.6, 0, 180, 7)), { cls: 'ln', amp: 0.4, n: 'a1toldo' }) +
      T(P.poli([[112, 192], [112, 132], [146, 132], [146, 192]]), { cls: 'ln', amp: 0.4, n: 'a1puerta' }) +
      '<circle class="lleno" data-n="a1perilla" cx="139" cy="164" r="2.4"/>' +
      G('a1vent', T(P.rect(166, 126, 50, 34, 2), { cls: 'ln fino', amp: 0.4 }) + T([P.linea(191, 126, 191, 160, 3), P.linea(166, 143, 216, 143, 3)], { cls: 'ln fino tenue', amp: 0.3 })),
    detalle(q, L) {
      cae(q('a1toldo'), L, 0.1)
      pon(q('a1puerta'), { ox: 129, oy: 192, sy: Math.max(0, rebota(tramo(L, 0.35, 0.75))) })
      ve(q('a1perilla'), tramo(L, 0.75, 0.85))
      brota(q('a1vent'), L, 0.6, 191, 143)
      luzDe(q, L, 160, 28, 0.95, 0.8)
      polvo(q, L, 80, 240)
    },
    punto: (L) => {
      const g = golpe(L, 0.6, 0.25)
      return { x: 160, y: 28, sx: 1 + 0.3 * g, sy: 1 - 0.25 * g }
    },
  },
  {
    // Enterprise: dos pisos. Todo llega por partes: toldo, puerta doble, ventanas de abajo y,
    // una por una, las de arriba. La luz se ve desde lejos.
    dur: 1e6,
    vista: [160, 92, 1],
    forma: F_EDIFICIO,
    giro: vive,
    svg: () =>
      [0, 1, 2].map((i) => G('a2a' + i, T(P.rect(106 + i * 38, 38, 26, 30, 2), { cls: 'ln fino', amp: 0.4 }) + T(P.linea(106 + i * 38, 53, 132 + i * 38, 53, 2), { cls: 'ln fino tenue', amp: 0.2 }))).join('') +
      T([0, 1, 2, 3].map((i) => P.arco(92.5 + i * 45, 86, 22.5, 0, 180, 7)), { cls: 'ln', amp: 0.4, n: 'a2toldo' }) +
      G('a2puerta', T(P.poli([[140, 192], [140, 134], [180, 134], [180, 192]]), { cls: 'ln', amp: 0.4 }) + T(P.linea(160, 134, 160, 192, 3), { cls: 'ln fino', amp: 0.3 })) +
      G('a2vi', T(P.rect(86, 130, 38, 34, 2), { cls: 'ln fino', amp: 0.4 })) +
      G('a2vd', T(P.rect(196, 130, 38, 34, 2), { cls: 'ln fino', amp: 0.4 })),
    detalle(q, L) {
      cae(q('a2toldo'), L, 0.1)
      pon(q('a2puerta'), { ox: 160, oy: 192, sy: Math.max(0, rebota(tramo(L, 0.3, 0.7))) })
      brota(q('a2vi'), L, 0.55, 105, 147)
      brota(q('a2vd'), L, 0.67, 215, 147)
      ;[0, 1, 2].forEach((i) => brota(q('a2a' + i), L, 0.85 + i * 0.14, 119 + i * 38, 53))
      luzDe(q, L, 160, 8, 1.3, 1.15)
      polvo(q, L, 66, 254)
    },
    punto: (L) => {
      const g = golpe(L, 0.6, 0.25)
      return { x: 160, y: 8, sx: 1 + 0.3 * g, sy: 1 - 0.25 * g }
    },
  },
]

/** «¿Hasta dónde quiere llegar?»: el local se construye con el nivel. viewBox="44 -22 240 232". */
export function alcanceVivo(svg, inicial = 0) {
  const lineas = (s) => rayos(s, [[0, 0, -9 * (s === 'pi' ? 1 : -1), -7], [0, 0, -12 * (s === 'pi' ? 1 : -1), 0], [0, 0, -8 * (s === 'pi' ? 1 : -1), 6]])
  return figuraViva(svg, ALCANCE, { inicial, centro: [164, 94], despues: G('polvoi', lineas('pi')) + G('polvod', lineas('pd')) + G('luz', corona('a-rayos', 7, 13, 23)) })
}

// ── «Antes de cerrar» ───────────────────────────────────────────────────────────────────────

/**
 * La libreta, en detalle. Una mano con lápiz espera a un lado, golpeteando. Cada respuesta
 * trae la mano a su renglón: escribe, y luego palomea si «también le pasa» o tacha si no.
 * La goma del lápiz es el punto azul. `valores` es lo ya contestado: true, false o null por
 * renglón. Devuelve { pon(i, valor, t) }. viewBox="0 0 240 200".
 */
export function rondaVivo(svg, valores = []) {
  const N = Math.max(1, Math.min(3, valores.length || 3))
  const Y = [68, 108, 148]
  const REPOSO = [196, 176]
  const est = Array.from({ length: N }, (_, i) => ({ v: valores[i] ?? null, t: -9 }))
  const garabato = (y) => P.suave(Array.from({ length: 9 }, (_, k) => [78 + k * 12.5, y + (k % 2 ? -2.6 : 2.2) * (k && k < 8 ? 1 : 0.3)]))
  let ultima = -1
  let sale = REPOSO // dónde estaba la punta cuando le llegó trabajo

  monta(svg, {
    dur: Infinity,
    cartel: 2,
    svg: () =>
      G(
        'cam',
        G(
          'hoja',
          T(P.rect(40, 32, 172, 156, 6), { cls: 'blq', amp: 0.5 }) +
            T(P.rect(34, 26, 172, 156, 6), { cls: 'ln tapa', amp: 0.6 }) +
            T(Array.from({ length: 9 }, (_, k) => P.arco(50 + k * 17.5, 26, 4.6, 150, 390, 6)), { cls: 'ln fino', amp: 0.2 }) +
            T(P.linea(48, 46, 120, 46, 4), { cls: 'ln fino tenue', amp: 0.3 }) +
            Array.from({ length: N }, (_, i) => {
              const y = Y[i]
              return (
                T(P.rect(50, y - 8, 15, 15, 3), { cls: 'ln fino', amp: 0.25 }) +
                T(P.linea(76, y + 10, 192, y + 10, 5), { cls: 'ln fino tenue', amp: 0.3 }) +
                T(garabato(y), { cls: 'ln tz', amp: 0.5, n: 're' + i }) +
                T(P.poli([[52, y], [56.5, y + 5], [67, y - 8]]), { cls: 'ln ln-azul tz', amp: 0.3, n: 'ok' + i }) +
                T(P.poli([[72, y + 5], [110, y - 5], [146, y + 4], [184, y - 5]]), { cls: 'ln tz', amp: 0.4, n: 'ta' + i })
              )
            }).join(''),
        ) +
          // la mano con el lápiz: el origen es la punta
          G(
            'mano',
            T(D(capsula([34, 14], [150, 150], 19)), { cls: 'ln tapa', amp: 0.5 }) +
              T(D(capsula([3, -5], [29, -50], 6.4, 3)), { cls: 'ln tapa', amp: 0.25 }) +
              T(P.poli([[3.6, -8.2], [0, 0], [6.6, -4.4]], true), { cls: 'ln lleno', amp: 0.1 }) +
              `<g transform="translate(30 12) rotate(-58)">${manoSvg('lm')}</g>` +
              T(P.linea(24.6, -45.4, 30.2, -42.2, 2), { cls: 'ln fino', amp: 0.1 }) +
              '<circle class="azul" cx="30" cy="-51.5" r="4.6"/>',
          ),
      ),
    paso(q, t) {
      let punta = [REPOSO[0], REPOSO[1] - 5 * (salto(tramo(t % 2.6, 0.2, 0.42)) + salto(tramo(t % 2.6, 0.46, 0.68)))]
      let aprieta = 0
      let tacha = 0
      est.forEach((e, i) => {
        const k = t - e.t
        const y = Y[i]
        const hay = e.v !== null
        // 0 va al renglón · 0.3 escribe · 0.85 brinca a la marca · 0.95 palomea o tacha · 1.25 se va
        traza(q('re' + i), hay ? suave(tramo(k, 0.3, 0.82)) : 0)
        traza(q('ok' + i), e.v === true ? suave(tramo(k, 0.97, 1.22)) : 0)
        traza(q('ta' + i), e.v === false ? suave(tramo(k, 0.97, 1.2)) : 0)
        agita(q('re' + i), 1 + 1.5 * (k > 0.3 && k < 0.85 ? 1 : 0))
        if (i !== ultima || k > 1.65 || !hay) return
        const va = rebota(tramo(k, 0, 0.3))
        const escribe = tramo(k, 0.3, 0.82)
        const marca = e.v ? [[52, y], [56.5, y + 5], [67, y - 8]] : [[72, y + 5], [110, y - 5], [146, y + 4], [184, y - 5]]
        let p = [mezcla(sale[0], 78, va), mezcla(sale[1], y, va)]
        if (k >= 0.3) p = [mezcla(78, 178, suave(escribe)) + 0, y + 2.4 * Math.sin(k * 46) * (escribe < 1 ? 1 : 0)]
        if (k >= 0.82) {
          const b = brinco(tramo(k, 0.82, 0.97), 9)
          p = [mezcla(178, marca[0][0], suave(tramo(k, 0.82, 0.97))), mezcla(y, marca[0][1], suave(tramo(k, 0.82, 0.97))) + b.dy]
        }
        if (k >= 0.97) p = sobre(abierta(marca, 16), suave(tramo(k, 0.97, 1.21)))
        if (k >= 1.25) {
          const r = suave(tramo(k, 1.25, 1.65))
          const fin = marca[marca.length - 1]
          p = [mezcla(fin[0], REPOSO[0], r), mezcla(fin[1], REPOSO[1], r) - 12 * salto(r)]
        }
        punta = p
        aprieta = k >= 0.3 && k < 1.22 ? 1 : 0
        if (e.v === false) tacha = golpe(k, 1.0, 0.3)
      })
      pon(q('mano'), { x: punta[0], y: punta[1], r: -4 * aprieta + 2 * Math.sin(t * 1.7) * (1 - aprieta) })
      pon(q('hoja'), { ox: 120, oy: 104, r: -3 + 1.2 * tacha * Math.sin(t * 40) })
      camara(q('cam'), 120 + 2.2 * tacha * Math.sin(t * 70), 100, 1, 120, 100)
    },
  })

  return {
    /** El renglón `i` quedó en `v` (true: también le pasa, false: no). */
    pon(i, v, t) {
      if (!est[i] || est[i].v === v) return
      const tt = t ?? ahora()
      // de dónde sale la mano: del reposo, o de donde la dejó el renglón anterior si iba de regreso
      sale = REPOSO
      est[i] = { v, t: tt }
      ultima = i
    },
  }
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
