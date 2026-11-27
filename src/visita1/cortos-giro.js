import Trazo from '../core/trazo-vivo.js'

// Los cortos del aro de la portada: uno por familia de giro. Se ven dentro del aro de Soma,
// en una ventana redonda, en lugar del icono. Lienzo de 200 × 200, centro (100, 100), lo que se
// ve es el círculo de radio 80.
//
// Comida y bebida · «Su cocina» (9.2 s, en bucle)
//   1 · La orden   La comanda sube al cuadro y sus renglones se escriben solos. El punto cae
//                  sobre ella como sello: pedido confirmado.
//   2 · La cocina  La comanda toma vuelo y se vuelve campana sobre el plato, tapando al punto.
//                  Sale vapor; la campana tiembla de lo que hierve.
//   3 · Servido    La campana se agacha, sale volando de lado y deja ver al punto servido en el
//                  plato. Brinca de gusto y el telón se abre desde él.
//
// Las familias que todavía no tienen corto usan el icono de su giro, dibujado a mano.

const { P, D, T, G, monta, remuestra, mezclaPts, corre, tramo, mezcla, suave, frena, acelera, rebota, elastico, salto, golpe, brinco, pon, traza, ve, forma, agita, punto, corona } = Trazo

const N = 96
const TICKET_V = [[68, 34], [132, 34], [132, 150], [125, 143], [118, 150], [111, 143], [104, 150], [97, 143], [90, 150], [83, 143], [76, 150], [68, 143]]
const TICKET = remuestra(TICKET_V, N)
const arcoPts = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => [cx + Math.cos(Math.PI + (i / (n - 1)) * Math.PI) * r, cy + Math.sin(Math.PI + (i / (n - 1)) * Math.PI) * r])
const CAMPANA = remuestra([...arcoPts(100, 132, 50, 26), [150, 132], [50, 132]], N)
const VAPOR = [0, 1, 2].map((k) => {
  const x = 84 + k * 16
  return P.suave(Array.from({ length: 7 }, (_, i) => [x + 4 * Math.sin(i * 1.3 + k), 66 - i * 7]))
})

const COMIDA = {
  cartel: 7.6,
  abre: [100, 124],
  cierra: [100, 124],
  planos: [
    {
      nombre: 'La orden',
      dur: 3.0,
      svg: () =>
        G(
          'c1t',
          T(D(corre(TICKET, 6, 6)), { cls: 'blq' }) +
            T(D(TICKET), { cls: 'ln tapa' }) +
            [58, 74, 90].map((y, i) => T(P.linea(80, y, i === 2 ? 106 : 120, y), { cls: 'ln fino tz', amp: 0.4, n: 'c1r' + i })).join('') +
            T(P.linea(80, 112, 98, 112), { cls: 'ln tz', amp: 0.4, n: 'c1tot' }),
        ) +
        corona('c1ray', 8, 15, 24) +
        punto(10, 'c1pt'),
      paso(q, t) {
        pon(q('c1t'), { y: 150 * (1 - rebota(tramo(t, 0, 0.6))) })
        ;[0, 1, 2].forEach((i) => traza(q('c1r' + i), suave(tramo(t, 0.55 + i * 0.25, 0.9 + i * 0.25)) * (1 - suave(tramo(t, 2.55, 2.85)))))
        traza(q('c1tot'), suave(tramo(t, 1.3, 1.55)) * (1 - suave(tramo(t, 2.55, 2.85))))
        // el punto cae como sello sobre la comanda
        const cae = acelera(tramo(t, 1.55, 1.85))
        const pega = golpe(t, 1.85, 0.22)
        const vuelo = salto(tramo(t, 2.75, 3.0))
        pon(q('c1pt'), { x: 112, y: mezcla(-20, 120, cae) - 6 * vuelo, sx: 1 + 0.35 * pega - 0.1 * vuelo, sy: 1 - 0.36 * pega + 0.14 * vuelo, o: tramo(t, 1.5, 1.56) })
        pon(q('c1ray'), { x: 112, y: 120, sx: mezcla(0.6, 1.25, frena(tramo(t, 1.85, 2.3))), o: golpe(t, 1.85, 0.45) })
      },
    },
    {
      nombre: 'La cocina',
      dur: 3.2,
      svg: () =>
        T(P.elipse(100, 134, 64, 7, 18), { cls: 'ln tz', amp: 0.5, n: 'c2plato' }) +
        punto(10, 'c2pt') +
        T(D(corre(TICKET, 6, 6)), { cls: 'blq', n: 'c2blq' }) +
        T(D(TICKET), { cls: 'ln tapa', n: 'c2forma' }) +
        G('c2perilla', T(P.circ(0, 0, 6, 10), { cls: 'ln tapa', amp: 0.25 })) +
        VAPOR.map((v, k) => T(v, { cls: 'ln fino tz', amp: 0.6, n: 'c2v' + k })).join(''),
      paso(q, t) {
        // toma vuelo y se vuelve campana
        const vuelo = salto(tramo(t, 0, 0.25))
        const m = elastico(tramo(t, 0.22, 1.25))
        const pts = mezclaPts(TICKET, CAMPANA, m)
        forma(q('c2forma'), pts)
        forma(q('c2blq'), corre(pts, 6, 6))
        // hierve: la campana tiembla y el trazo se agita
        const hierve = tramo(t, 1.8, 2.2)
        const tiembla = hierve * 1.6 * Math.sin(t * 38)
        pon(q('c2forma'), { ox: 100, oy: 132, sy: 1 - 0.06 * vuelo, r: tiembla })
        pon(q('c2blq'), { ox: 100, oy: 132, sy: 1 - 0.06 * vuelo, r: tiembla })
        agita(q('c2forma'), 1 + 1.4 * hierve)
        traza(q('c2plato'), suave(tramo(t, 0.9, 1.35)))
        pon(q('c2perilla'), { x: 100, y: 77 + 0.6 * tiembla, sx: rebota(tramo(t, 1.15, 1.45)) })
        // el punto queda tapado en el plato
        pon(q('c2pt'), { x: 100, y: 124 })
        VAPOR.forEach((_, k) => {
          const c = ((t - 1.5 - k * 0.32) % 1.2 + 1.2) % 1.2
          const el = q('c2v' + k)
          traza(el, t < 1.5 + k * 0.32 ? 0 : suave(tope(c / 0.7)))
          pon(el, { y: -18 * (c / 1.2), o: 1 - tope((c - 0.7) / 0.5) })
        })
      },
    },
    {
      nombre: 'Servido',
      dur: 3.0,
      svg: () =>
        T(P.elipse(100, 134, 64, 7, 18), { cls: 'ln', amp: 0.5 }) +
        corona('c3ray', 9, 16, 26) +
        punto(10, 'c3pt') +
        G('c3campana', T(D(corre(CAMPANA, 6, 6)), { cls: 'blq' }) + T(D(CAMPANA), { cls: 'ln tapa' }) + T(P.circ(100, 77, 6, 10), { cls: 'ln tapa', amp: 0.25 })) +
        VAPOR.map((v, k) => T(v, { cls: 'ln fino tz', amp: 0.6, n: 'c3v' + k })).join(''),
      paso(q, t) {
        // se agacha, sale volando de lado y gira
        const agacha = salto(tramo(t, 0.1, 0.3))
        const sale = acelera(tramo(t, 0.3, 0.85))
        pon(q('c3campana'), { ox: 100, oy: 132, y: 4 * agacha - 150 * sale, x: 90 * sale, r: 40 * sale, sy: 1 - 0.07 * agacha })
        // el punto servido brinca de gusto
        const b1 = brinco(tramo(t, 0.75, 1.2), 26)
        const b2 = brinco(tramo(t, 1.2, 1.5), 9)
        const b = b1.dy ? b1 : b2
        pon(q('c3pt'), { x: 100, y: 124 + b.dy + 10 * (1 - b.sy), sx: b.sx, sy: b.sy })
        pon(q('c3ray'), { x: 100, y: 124, sx: mezcla(0.6, 1.25, frena(tramo(t, 0.75, 1.3))), o: golpe(t, 0.75, 0.5) })
        VAPOR.forEach((_, k) => {
          const el = q('c3v' + k)
          const c = tramo(t, 1.3 + k * 0.18, 2.4 + k * 0.18)
          traza(el, suave(tope(c * 1.6)))
          pon(el, { y: 50 - 22 * c, o: 1 - tope((c - 0.6) / 0.4) })
        })
      },
    },
  ],
}
function tope(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

const CORTOS = { comida: COMIDA }

/** ¿Esta familia de giro ya tiene su corto? */
export const hayCorto = (familia) => !!CORTOS[familia]

/** Monta el corto de una familia en un <svg viewBox="0 0 200 200"> vacío. `desde(t)` lo reinicia en el segundo `t` del reloj. */
export function cortoGiro(svg, familia) {
  const obra = CORTOS[familia]
  if (!obra) return null
  const corto = { ...obra, t0: 0 }
  monta(svg, corto)
  return {
    desde(t = performance.now() / 1000) {
      corto.t0 = t
    },
  }
}
