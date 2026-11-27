import Trazo from '../core/trazo-vivo.js'

// Los bucles de trazo vivo de la primera visita. Cada compromiso de «Antes de empezar» tiene
// el suyo: dicen lo mismo que el texto, sin palabras.
//
//   precio — «Hoy no vendemos nada»: la etiqueta del precio se tacha y se cae; el punto baja
//            por el hilo y se queda colgado en su lugar.
//   ritmo  — «Usted marca el ritmo»: el reloj corre, alguien pone pausa y el punto espera
//            sin prisa; la pausa se vuelve «seguir» y el reloj continúa.
//   no     — «Puede decir que no»: sale un «NO» grande y el punto contesta con una palomita.
//
// Cómo se hacen y cómo se revisan: skill soma-animation.

const { P, D, T, G, monta, remuestra, mezclaPts, corre, tramo, suave, acelera, rebota, salto, golpe, brinco, pon, traza, forma, punto } = Trazo

const ETIQUETA = [[62, 44], [80, 28], [98, 44], [98, 88], [62, 88]]
const BARRA_1 = remuestra([[108, 48], [115, 48], [115, 74], [108, 74]], 24)
const BARRA_2 = remuestra([[123, 48], [130, 48], [130, 74], [123, 74]], 24)
const SEGUIR_1 = remuestra([[108, 46], [119, 53.5], [119, 68.5], [108, 76]], 24)
const SEGUIR_2 = remuestra([[119, 53.5], [130, 61], [130, 61], [119, 68.5]], 24)
const GLOBO = [[34, 20], [80, 20], [90, 29], [90, 55], [81, 64], [54, 64], [42, 77], [45, 64], [35, 64], [25, 55], [25, 29]]
const GLOBITO = [[92, 54], [116, 54], [121, 59], [121, 73], [116, 78], [114, 78], [121, 88], [108, 78], [92, 78], [87, 73], [87, 59]]

export const BUCLES = {
  precio: {
    dur: 4.6,
    cartel: 3.5,
    svg: () =>
      T(P.linea(66, 4, 94, 4, 3), { cls: 'ln', amp: 0.3 }) +
      T(P.linea(80, 4, 80, 32, 4), { cls: 'ln fino', amp: 0.3, n: 'hilo' }) +
      G(
        'etiqueta',
        T(P.poli(corre(ETIQUETA, 5, 5), true), { cls: 'blq' }) +
          T(P.poli(ETIQUETA, true), { cls: 'ln tapa' }) +
          T(P.circ(80, 39, 3, 8), { cls: 'ln fino', amp: 0.2 }) +
          T([P.suave([[87, 57], [80, 54], [73, 58], [79, 65], [87, 70], [80, 78], [72, 74]]), P.linea(80, 50, 80, 82, 3)], { cls: 'ln fino', amp: 0.3 }) +
          T(P.linea(58, 86, 102, 46, 4), { cls: 'ln ln-azul tz', amp: 0.4, n: 'tacha' }),
      ) +
      punto(6),
    paso(q, t) {
      // la etiqueta baja colgada, se mece, la tachan, toma vuelo y se cae
      const llega = rebota(tramo(t, 0.05, 0.6))
      const mece = 7 * Math.sin(t * 2.3) * (1 - tramo(t, 1.85, 2.0))
      const vuelo = salto(tramo(t, 1.78, 1.98))
      const cae = acelera(tramo(t, 1.98, 2.45))
      traza(q('tacha'), suave(tramo(t, 1.1, 1.45)))
      pon(q('etiqueta'), { ox: 80, oy: 4, r: mece + 26 * cae, y: -110 * (1 - llega) - 3 * vuelo + 135 * cae, o: cae >= 1 ? 0 : 1 })
      // el hilo se sacude al soltarla; luego se mece con el punto colgado
      const colgado = suave(tramo(t, 2.6, 3.1)) * (1 - suave(tramo(t, 4.15, 4.55)))
      const giro = mece + 16 * golpe(t, 1.98, 0.8) * Math.sin((t - 1.98) * 17) + 6 * Math.sin(t * 2.3) * tramo(t, 3.1, 3.5)
      pon(q('hilo'), { ox: 80, oy: 4, r: giro })
      const largo = 6 + 30 * colgado
      const a = (-giro * Math.PI) / 180
      const bote = brinco(tramo(t, 3.1, 3.45), 5)
      // el punto solo existe mientras baja, cuelga y vuelve a subir
      pon(q('pt'), { x: 80 + Math.sin(a) * largo, y: 4 + Math.cos(a) * largo + bote.dy, sx: bote.sx, sy: bote.sy, o: tramo(t, 2.55, 2.7) * (1 - tramo(t, 4.45, 4.58)) })
    },
  },

  ritmo: {
    dur: 4.6,
    cartel: 2.2,
    svg: () =>
      T(P.circ(69, 65, 27, 18), { cls: 'blq' }) +
      T(P.circ(64, 60, 27, 18), { cls: 'ln tapa' }) +
      T([P.linea(64, 37, 64, 41.5, 3), P.linea(87, 60, 82.5, 60, 3), P.linea(64, 83, 64, 78.5, 3), P.linea(41, 60, 45.5, 60, 3)], { cls: 'ln fino tenue', amp: 0.2 }) +
      G('aguja', T(P.linea(0, 2, 0, -19, 3), { cls: 'ln', amp: 0.3 })) +
      '<circle class="lleno" cx="64" cy="60" r="2.8"/>' +
      T(D(BARRA_1), { cls: 'lleno', amp: 0.4, n: 'b1' }) +
      T(D(BARRA_2), { cls: 'lleno', amp: 0.4, n: 'b2' }) +
      punto(5.5),
    paso(q, t) {
      // corre, se detiene pasándose tantito y más tarde sigue: da la vuelta completa en el bucle
      const frenon = 7 * golpe(t, 1.3, 0.4) * Math.sin((t - 1.3) * 22)
      pon(q('aguja'), { x: 64, y: 60, r: 150 * tramo(t, 0, 1.3) + frenon + 210 * tramo(t, 3.15, 4.6) })
      // la pausa aparece, y cuando toca seguir se vuelve la flecha
      const m = suave(tramo(t, 2.75, 3.1))
      const s = rebota(tramo(t, 1.22, 1.55)) * (1 - suave(tramo(t, 3.6, 3.95)))
      forma(q('b1'), mezclaPts(BARRA_1, SEGUIR_1, m))
      forma(q('b2'), mezclaPts(BARRA_2, SEGUIR_2, m))
      pon(q('b1'), { ox: 119, oy: 61, sx: s })
      pon(q('b2'), { ox: 119, oy: 61, sx: s })
      // el punto espera sin prisa y brinca cuando se sigue
      const espera = tramo(t, 1.4, 1.7) * (1 - tramo(t, 2.9, 3.1))
      const b = brinco(tramo(t, 3.12, 3.52), 13)
      pon(q('pt'), { x: 119, y: 99 + 1.6 * Math.sin(t * 3.2) * espera + b.dy + 5.5 * (1 - b.sy), sx: b.sx, sy: b.sy })
    },
  },

  no: {
    dur: 4.6,
    cartel: 2.6,
    svg: () =>
      G(
        'globo',
        T(P.suave(corre(GLOBO, 5, 5), true), { cls: 'blq' }) +
          T(P.suave(GLOBO, true), { cls: 'ln tapa' }) +
          T([P.poli([[42, 52], [42, 32], [56, 52], [56, 32]]), P.elipse(71, 42, 7.5, 10, 12)], { cls: 'ln', amp: 0.5 }),
      ) +
      G('ok', T(P.suave(GLOBITO, true), { cls: 'ln fino tapa', amp: 0.5 }) + T(P.poli([[97, 66], [102, 71.5], [111, 60]]), { cls: 'ln ln-azul tz', amp: 0.3, n: 'palomita' })) +
      punto(6),
    paso(q, t) {
      const fuera = 1 - suave(tramo(t, 3.9, 4.3))
      const sale = rebota(tramo(t, 0.3, 0.65))
      pon(q('globo'), { ox: 42, oy: 77, sx: sale * fuera, r: 3 * golpe(t, 0.55, 0.5) * Math.sin((t - 0.55) * 20) })
      // el punto se sorprende un instante y contesta tranquilo
      const susto = brinco(tramo(t, 0.8, 1.15), 7)
      pon(q('pt'), { x: 129, y: 101 + susto.dy + 6 * (1 - susto.sy) + 1.2 * Math.sin(t * 2.8) * tramo(t, 2.2, 2.5), sx: susto.sx, sy: susto.sy })
      pon(q('ok'), { ox: 121, oy: 88, sx: rebota(tramo(t, 1.5, 1.82)) * fuera })
      traza(q('palomita'), suave(tramo(t, 1.86, 2.2)))
    },
  },
}

/** El <svg> vacío de un bucle; `montaTrazos` lo llena y lo echa a andar. */
export const lienzo = (nombre, cls = '') => `<svg class="tv ${cls}" data-tv="${nombre}" viewBox="0 0 160 120" aria-hidden="true"></svg>`

/** Monta todos los bucles que haya dentro de `raiz`. Los que dejan de estar en la página se sueltan solos. */
export function montaTrazos(raiz) {
  raiz.querySelectorAll('svg[data-tv]').forEach((svg) => BUCLES[svg.dataset.tv] && monta(svg, BUCLES[svg.dataset.tv]))
}
