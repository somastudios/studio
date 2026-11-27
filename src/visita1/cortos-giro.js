import Trazo from '../core/trazo-vivo.js'

// Los cortos del aro de la portada: uno por familia de giro. Se ven dentro del aro de Soma,
// en una ventana redonda, en lugar del icono. Lienzo de 200 × 200, centro (100, 100), lo que se
// ve es el círculo de radio 80.
//
// Comida y bebida · «Su cocina» (9.4 s, en bucle sin costura)
//   1 · La orden   La comanda sube meciéndose y sus renglones se escriben solos. El punto cae
//                  desde arriba como sello: la comanda se hunde, se sacude y saltan rayos.
//   2 · La cocina  La comanda toma vuelo y se vuelve campana sobre el plato, tapando al punto.
//                  Hierve: la campana brinca sobre el plato, se le escapan bocanadas por los
//                  lados y sube vapor.
//   3 · Servido    La campana se agacha y sale volando de lado; el punto queda servido y brinca
//                  de gusto. Al final se agacha, salta hacia arriba y sale del cuadro, y el
//                  plato se borra: en el plano 1 vuelve a caer desde arriba, como sello.
//
// La cámara se acerca despacio durante los dos primeros planos y se abre en el tercero, así el
// bucle empata. Sin telón: el azul grande ya es el punto de la portada.
//
// Las familias que todavía no tienen corto usan el icono de su giro, dibujado a mano.

const { P, D, T, G, monta, remuestra, mezclaPts, corre, tramo, mezcla, suave, frena, acelera, rebota, elastico, salto, golpe, brinco, pon, traza, ve, forma, agita, camara, punto, corona } = Trazo

const tope = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const N = 96
const TICKET_V = [[68, 34], [132, 34], [132, 150], [125, 143], [118, 150], [111, 143], [104, 150], [97, 143], [90, 150], [83, 143], [76, 150], [68, 143]]
const TICKET = remuestra(TICKET_V, N)
const arcoPts = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => [cx + Math.cos(Math.PI + (i / (n - 1)) * Math.PI) * r, cy + Math.sin(Math.PI + (i / (n - 1)) * Math.PI) * r])
const CAMPANA = remuestra([...arcoPts(100, 132, 50, 26), [150, 132], [50, 132]], N)
const VAPOR = [0, 1, 2].map((k) => {
  const x = 84 + k * 16
  return P.suave(Array.from({ length: 7 }, (_, i) => [x + 4 * Math.sin(i * 1.3 + k), 66 - i * 7]))
})
/** La cámara del corto: centro del lienzo, un poco arriba del plato. */
const encuadra = (el, z) => camara(el, 100, 100 + 6 * (z - 1) * 4, z, 100, 100)

const COMIDA = {
  cartel: 8,
  planos: [
    {
      nombre: 'La orden',
      dur: 3.0,
      svg: () =>
        G(
          'c1cam',
          G(
            'c1t',
            T(D(corre(TICKET, 6, 6)), { cls: 'blq' }) +
              T(D(TICKET), { cls: 'ln tapa' }) +
              [58, 74, 90].map((y, i) => T(P.linea(80, y, i === 2 ? 106 : 120, y), { cls: 'ln fino tz', amp: 0.4, n: 'c1r' + i })).join('') +
              T(P.linea(80, 112, 98, 112), { cls: 'ln tz', amp: 0.4, n: 'c1tot' }),
          ) +
            corona('c1ray', 8, 15, 24) +
            punto(10, 'c1pt'),
        ),
      paso(q, t) {
        encuadra(q('c1cam'), 1 + 0.05 * suave(tramo(t, 0, 3)))
        // la comanda sube meciéndose; el sello la hunde y la deja temblando
        const llega = rebota(tramo(t, 0, 0.65))
        const pega = golpe(t, 1.85, 0.22)
        const tiembla = golpe(t, 1.85, 0.7) * Math.sin((t - 1.85) * 24)
        pon(q('c1t'), { ox: 100, oy: 150, y: 150 * (1 - llega) + 4 * pega, r: 5 * (1 - llega) + 2.6 * tiembla, sy: 1 - 0.035 * pega })
        const borra = 1 - suave(tramo(t, 2.5, 2.8))
        ;[0, 1, 2].forEach((i) => traza(q('c1r' + i), suave(tramo(t, 0.55 + i * 0.25, 0.9 + i * 0.25)) * borra))
        traza(q('c1tot'), suave(tramo(t, 1.3, 1.55)) * borra)
        // el punto cae como sello, estirado por la velocidad
        const u = tramo(t, 1.55, 1.85)
        const cae = acelera(u)
        const estira = 0.28 * salto(u) * (u < 1 ? 1 : 0)
        const vuelo = salto(tramo(t, 2.75, 3.0))
        pon(q('c1pt'), { x: 112, y: mezcla(-20, 120, cae) + 4 * pega - 6 * vuelo, sx: 1 + 0.35 * pega - estira * 0.5 - 0.1 * vuelo, sy: 1 - 0.36 * pega + estira + 0.14 * vuelo, o: tramo(t, 1.5, 1.56) })
        pon(q('c1ray'), { x: 112, y: 120, sx: mezcla(0.6, 1.25, frena(tramo(t, 1.85, 2.3))), o: golpe(t, 1.85, 0.45) })
      },
    },
    {
      nombre: 'La cocina',
      dur: 3.2,
      svg: () =>
        G(
          'c2cam',
          T(P.elipse(100, 134, 64, 7, 18), { cls: 'ln tz', amp: 0.5, n: 'c2plato' }) +
            punto(10, 'c2pt') +
            G('c2b0', T(P.circ(0, 0, 7, 9), { cls: 'ln fino', amp: 0.5 })) +
            G('c2b1', T(P.circ(0, 0, 7, 9), { cls: 'ln fino', amp: 0.5 })) +
            T(D(corre(TICKET, 6, 6)), { cls: 'blq', n: 'c2blq' }) +
            T(D(TICKET), { cls: 'ln tapa', n: 'c2forma' }) +
            G('c2perilla', T(P.circ(0, 0, 6, 10), { cls: 'ln tapa', amp: 0.25 })) +
            VAPOR.map((v, k) => T(v, { cls: 'ln fino tz', amp: 0.6, n: 'c2v' + k })).join(''),
        ),
      paso(q, t) {
        encuadra(q('c2cam'), 1.05 + 0.05 * suave(tramo(t, 0, 3.2)))
        // toma vuelo y se vuelve campana
        const vuelo = salto(tramo(t, 0, 0.25))
        const m = elastico(tramo(t, 0.22, 1.25))
        const pts = mezclaPts(TICKET, CAMPANA, m)
        forma(q('c2forma'), pts)
        forma(q('c2blq'), corre(pts, 6, 6))
        // hierve: la presión levanta la campana a brinquitos, cada vez más seguido
        const hierve = suave(tramo(t, 1.7, 2.3))
        const latido = Math.max(0, Math.sin(t * (9 + 5 * hierve)))
        const sube = hierve * 3.4 * latido
        const ladea = hierve * 2 * Math.sin(t * 31)
        const cuerpo = { ox: 100, oy: 132, y: -sube, sy: 1 - 0.06 * vuelo, r: ladea }
        pon(q('c2forma'), cuerpo)
        pon(q('c2blq'), cuerpo)
        agita(q('c2forma'), 1 + 1.4 * hierve)
        traza(q('c2plato'), suave(tramo(t, 0.9, 1.35)))
        pon(q('c2perilla'), { x: 100 + 0.5 * ladea, y: 77 - sube * 1.5, sx: rebota(tramo(t, 1.15, 1.45)) })
        // el punto se acomoda en el plato mientras la campana lo tapa
        const va = suave(tramo(t, 0.15, 0.7))
        // (ya tapado se encoge tantito, para no asomar cuando la campana brinca)
        const tapado = suave(tramo(t, 0.9, 1.3))
        pon(q('c2pt'), { x: mezcla(112, 100, va), y: mezcla(120, 124, va) - 7 * salto(tramo(t, 0.15, 0.7)) - 4 * tapado, sx: 1 - 0.2 * tapado })
        // se le escapan bocanadas por los lados, alternadas
        ;[0, 1].forEach((k) => {
          const c = (((t - 1.9 - k * 0.3) % 0.6) + 0.6) % 0.6 / 0.6
          const lado = k ? 1 : -1
          pon(q('c2b' + k), { x: 100 + lado * (54 + 16 * frena(c)), y: 128 - 12 * c, sx: 0.3 + 0.9 * frena(c), o: t < 1.9 + k * 0.3 ? 0 : hierve * (1 - c) })
        })
        VAPOR.forEach((_, k) => {
          const c = (((t - 1.5 - k * 0.32) % 1.2) + 1.2) % 1.2
          const el = q('c2v' + k)
          traza(el, t < 1.5 + k * 0.32 ? 0 : suave(tope(c / 0.7)))
          pon(el, { y: -18 * (c / 1.2), o: 1 - tope((c - 0.7) / 0.5) })
        })
      },
    },
    {
      nombre: 'Servido',
      dur: 3.2,
      svg: () =>
        G(
          'c3cam',
          T(P.elipse(100, 134, 64, 7, 18), { cls: 'ln tz', amp: 0.5, n: 'c3plato' }) +
            corona('c3ray', 9, 16, 26) +
            punto(10, 'c3pt') +
            G('c3campana', T(D(corre(CAMPANA, 6, 6)), { cls: 'blq' }) + T(D(CAMPANA), { cls: 'ln tapa' }) + T(P.circ(100, 77, 6, 10), { cls: 'ln tapa', amp: 0.25 })) +
            VAPOR.map((v, k) => T(v, { cls: 'ln fino tz', amp: 0.6, n: 'c3v' + k })).join(''),
        ),
      paso(q, t) {
        // la cámara se abre: el plato respira y el bucle empata con el plano 1
        encuadra(q('c3cam'), mezcla(1.1, 1, suave(tramo(t, 0.2, 2.6))))
        // la campana se agacha, sale volando de lado y gira
        const agacha = salto(tramo(t, 0.1, 0.3))
        const sale = acelera(tramo(t, 0.3, 0.85))
        pon(q('c3campana'), { ox: 100, oy: 132, y: 4 * agacha - 150 * sale, x: 90 * sale, r: 40 * sale, sy: 1 - 0.07 * agacha })
        // el punto servido brinca de gusto; al final toma vuelo y sale por arriba
        const b1 = brinco(tramo(t, 0.75, 1.2), 26)
        const b2 = brinco(tramo(t, 1.2, 1.5), 9)
        const b = b1.dy ? b1 : b2
        const vuelo = salto(tramo(t, 2.45, 2.72))
        const u = tramo(t, 2.68, 3.05)
        const sube = acelera(u)
        const estira = u > 0 ? 0.3 * (1 - 0.5 * u) : 0
        const crece = mezcla(0.8, 1, rebota(tramo(t, 0.3, 0.7))) // recupera su tamaño al destaparse
        pon(q('c3pt'), {
          x: 100,
          y: 124 - 4 * (1 - tramo(t, 0.3, 0.6)) + b.dy + 10 * (1 - b.sy) + 3.4 * vuelo - 190 * sube,
          sx: crece * b.sx * (1 + 0.3 * vuelo) * (1 - estira * 0.5),
          sy: crece * b.sy * (1 - 0.34 * vuelo) * (1 + estira),
        })
        pon(q('c3ray'), { x: 100, y: 124, sx: mezcla(0.6, 1.25, frena(tramo(t, 0.75, 1.3))), o: golpe(t, 0.75, 0.5) })
        // el plato se hunde tantito con cada caída y se borra cuando el punto se va
        const peso = golpe(t, 1.2, 0.18) + 0.5 * golpe(t, 1.5, 0.15) + 0.8 * vuelo
        pon(q('c3plato'), { y: 1.6 * peso })
        traza(q('c3plato'), 1 - suave(tramo(t, 2.75, 3.15)))
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
