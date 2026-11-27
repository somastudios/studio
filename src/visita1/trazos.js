import Trazo from '../core/trazo-vivo.js'

// El dibujo grande de «Antes de empezar». Es uno solo, y su figura principal se transforma
// con cada compromiso:
//
//   0 · «Hoy no vendemos nada»   la etiqueta del precio. El punto tacha el signo de pesos, el
//                                 precio se borra y en su lugar quedan renglones: venimos a anotar.
//   1 · «Usted marca el ritmo»   la etiqueta se vuelve reloj. Corre, alguien pone pausa, el
//                                 punto espera sin prisa, y la pausa se vuelve «seguir».
//   2 · «Puede decir que no»     el reloj se vuelve globo de diálogo. Se escribe un NO grande y
//                                 el punto contesta con una palomita.
//
// Entre uno y otro no hay corte: lo que rodeaba a la figura se desvanece, la figura cambia de
// forma, el punto viaja a su nuevo lugar y lo nuevo se dibuja. Cómo se hace y cómo se revisa:
// skill soma-animation.

const { P, D, T, G, monta, remuestra, circulo, mezclaPts, corre, tramo, mezcla, suave, rebota, elastico, salto, golpe, brinco, pon, traza, ve, forma, agita, punto } = Trazo

const N = 96
const ETIQUETA = remuestra([[160, 40], [204, 80], [204, 196], [116, 196], [116, 80]], N)
const RELOJ = circulo(150, 122, 66, N)
const GLOBO = remuestra([[150, 44], [212, 44], [232, 64], [232, 136], [212, 156], [130, 156], [98, 192], [108, 156], [88, 156], [68, 136], [68, 64], [88, 44]], N)
const BARRA_1 = remuestra([[238, 92], [252, 92], [252, 152], [238, 152]], 24)
const BARRA_2 = remuestra([[264, 92], [278, 92], [278, 152], [264, 152]], 24)
const SEGUIR_1 = remuestra([[238, 88], [260, 105], [260, 139], [238, 156]], 24)
const SEGUIR_2 = remuestra([[260, 105], [282, 122], [282, 122], [260, 139]], 24)
const HOYO = [160, 66]
const TACHA = [[108, 186], [212, 92]]
const va = (a, b, p) => [mezcla(a[0], b[0], p), mezcla(a[1], b[1], p)]
const quieto = (x, y) => ({ x, y, sx: 1, sy: 1 })
/** Un brinco de a hasta b: devuelve dónde va el punto y cómo se deforma. */
const arco = (a, b, p, alto) => {
  const j = brinco(p, alto)
  const [x, y] = va(a, b, suave(p))
  return { x, y: y + j.dy, sx: j.sx, sy: j.sy }
}

const PASOS = [
  {
    // La etiqueta cuelga y se mece. El punto toma vuelo, tacha el precio y se queda de botón.
    dur: 5.6,
    forma: ETIQUETA,
    giro: (L) => ({ ox: 160, oy: -14, r: 5 * Math.sin(L * 2.1) + 4 * golpe(L, 1.9, 0.5) * Math.sin((L - 1.9) * 20) }),
    svg: () =>
      T(P.linea(160, -14, 160, 40, 4), { cls: 'ln fino', amp: 0.4 }) +
      T(P.circ(HOYO[0], HOYO[1], 6.5, 10), { cls: 'ln fino', amp: 0.25 }) +
      T(P.suave([[180, 104], [160, 96], [141, 107], [158, 125], [180, 139], [160, 159], [139, 149]]), { cls: 'ln tz', amp: 0.5, n: 's1' }) +
      T(P.linea(160, 86, 160, 170, 4), { cls: 'ln tz', amp: 0.4, n: 's2' }) +
      T(P.linea(TACHA[0][0], TACHA[0][1], TACHA[1][0], TACHA[1][1], 5), { cls: 'ln ln-azul tz', amp: 0.5, n: 'tacha' }) +
      [[112, 188], [134, 188], [156, 172]].map(([y, x], i) => T(P.linea(132, y, x, y, 4), { cls: 'ln fino tz', amp: 0.4, n: 'n' + i })).join(''),
    detalle(q, L) {
      const borra = suave(tramo(L, 2.55, 2.95))
      traza(q('s1'), suave(tramo(L, 0.1, 0.6)) * (1 - borra))
      traza(q('s2'), suave(tramo(L, 0.4, 0.75)) * (1 - borra))
      traza(q('tacha'), suave(tramo(L, 1.55, 1.9)) * (1 - borra))
      const fin = 1 - suave(tramo(L, 4.9, 5.4))
      ;[0, 1, 2].forEach((i) => traza(q('n' + i), suave(tramo(L, 3.05 + i * 0.26, 3.55 + i * 0.26)) * fin))
    },
    punto(L) {
      const sale = [96, 200]
      if (L < 0.6) return quieto(...HOYO)
      if (L < 1.1) return arco(HOYO, sale, tramo(L, 0.6, 1.1), 30)
      if (L < 1.55) {
        // toma vuelo: se echa atrás sobre la misma línea que va a trazar
        const v = salto(tramo(L, 1.36, 1.55))
        return { x: sale[0] - 8 * v, y: sale[1] + 7 * v, sx: 1 - 0.15 * v, sy: 1 + 0.15 * v }
      }
      if (L < 1.9) {
        const p = suave(tramo(L, 1.55, 1.9))
        const [x, y] = va(sale, TACHA[1], p)
        return { x, y, sx: 1 + 0.3 * salto(p), sy: 1 - 0.2 * salto(p) }
      }
      if (L < 2.5) return arco(TACHA[1], HOYO, tramo(L, 1.9, 2.5), 34)
      return quieto(...HOYO)
    },
  },
  {
    // El reloj corre, se detiene pasándose tantito y más tarde sigue.
    dur: 5.2,
    forma: RELOJ,
    giro: (L) => ({ ox: 150, oy: 122, r: 2.5 * golpe(L, 1.42, 0.35) * Math.sin((L - 1.42) * 24) }),
    svg: () =>
      T([P.linea(150, 66, 150, 77, 3), P.linea(206, 122, 195, 122, 3), P.linea(150, 178, 150, 167, 3), P.linea(94, 122, 105, 122, 3)], { cls: 'ln fino tenue', amp: 0.3 }) +
      G('aguja', T(P.linea(0, 6, 0, -46, 4), { cls: 'ln', amp: 0.4 })) +
      '<circle class="lleno" cx="150" cy="122" r="5.5"/>' +
      T(D(BARRA_1), { cls: 'lleno', amp: 0.5, n: 'b1' }) +
      T(D(BARRA_2), { cls: 'lleno', amp: 0.5, n: 'b2' }),
    detalle(q, L) {
      const frenon = 7 * golpe(L, 1.4, 0.4) * Math.sin((L - 1.4) * 22)
      pon(q('aguja'), { x: 150, y: 122, r: 150 * tramo(L, 0, 1.4) + frenon + 210 * tramo(L, 3.5, 5.2) })
      // la pausa aparece; cuando toca seguir, las dos barras se juntan en una flecha
      const m = suave(tramo(L, 3.05, 3.4))
      const s = rebota(tramo(L, 1.3, 1.65)) * (1 - suave(tramo(L, 4.0, 4.35)))
      forma(q('b1'), mezclaPts(BARRA_1, SEGUIR_1, m))
      forma(q('b2'), mezclaPts(BARRA_2, SEGUIR_2, m))
      pon(q('b1'), { ox: 258, oy: 122, sx: s })
      pon(q('b2'), { ox: 258, oy: 122, sx: s })
    },
    punto(L) {
      const espera = tramo(L, 1.5, 1.8) * (1 - tramo(L, 3.2, 3.4))
      const b = brinco(tramo(L, 3.42, 3.86), 26)
      return { x: 258, y: 204 + 2.6 * Math.sin(L * 3.2) * espera + b.dy + 9 * (1 - b.sy), sx: b.sx, sy: b.sy }
    },
  },
  {
    // Se escribe el NO, el globo se sacude y el punto contesta tranquilo.
    dur: 5.4,
    forma: GLOBO,
    giro: (L) => ({ ox: 98, oy: 192, r: 3 * golpe(L, 0.92, 0.5) * Math.sin((L - 0.92) * 20) }),
    svg: () =>
      T(P.poli([[112, 128], [112, 72], [150, 128], [150, 72]]), { cls: 'ln tz', amp: 0.6, n: 'ene' }) +
      T(P.elipse(187, 100, 19, 28, 16), { cls: 'ln tz', amp: 0.6, n: 'o' }) +
      G(
        'ok',
        T(P.suave([[212, 166], [262, 166], [272, 176], [272, 200], [262, 210], [258, 210], [274, 230], [246, 210], [212, 210], [202, 200], [202, 176]], true), { cls: 'ln fino tapa', amp: 0.6 }) +
          T(P.poli([[222, 188], [233, 199.5], [253, 176]]), { cls: 'ln ln-azul tz', amp: 0.4, n: 'palomita' }),
      ),
    detalle(q, L) {
      const fin = 1 - suave(tramo(L, 4.6, 5.1))
      traza(q('ene'), suave(tramo(L, 0.15, 0.62)) * fin)
      traza(q('o'), suave(tramo(L, 0.52, 0.92)) * fin)
      pon(q('ok'), { ox: 274, oy: 230, sx: rebota(tramo(L, 1.75, 2.08)) * fin })
      traza(q('palomita'), suave(tramo(L, 2.12, 2.46)))
    },
    punto(L) {
      const susto = brinco(tramo(L, 1.0, 1.38), 14)
      return { x: 292, y: 224 + susto.dy + 9 * (1 - susto.sy) + 2 * Math.sin(L * 2.8) * tramo(L, 2.5, 2.8), sx: susto.sx, sy: susto.sy }
    },
  },
]

/**
 * Echa a andar el dibujo en un <svg viewBox="0 0 320 240"> vacío. Devuelve { ir(i, t) }: al
 * llamarlo, la figura se transforma a la del compromiso `i`. `t` (opcional) es el segundo del
 * reloj en que empieza el cambio; sirve para revisarlo con Trazo.fija().
 */
export function acuerdoVivo(svg, inicial = 0) {
  let de = inicial
  let a = inicial
  let t0 = null
  let sale = null // dónde estaba el punto cuando empezó el cambio
  let ultimo = PASOS[inicial].punto(0)

  monta(svg, {
    dur: Infinity,
    cartel: 4,
    svg: () =>
      T(D(corre(PASOS[inicial].forma, 8, 8)), { cls: 'blq', n: 'sombra' }) +
      T(D(PASOS[inicial].forma), { cls: 'ln tapa', n: 'figura' }) +
      PASOS.map((p, k) => G('d' + k, p.svg())).join('') +
      punto(9.5),
    paso(q, t) {
      if (t0 === null) t0 = t
      const u = t - t0
      const cambia = de !== a
      // lo de antes se desvanece, la figura cambia y se pasa un poco, lo nuevo se dibuja
      const pts = cambia ? mezclaPts(PASOS[de].forma, PASOS[a].forma, elastico(tramo(u, 0.12, 0.98))) : PASOS[a].forma
      const presente = suave(tramo(u, cambia ? 0.6 : 0.15, cambia ? 0.98 : 0.6))
      const L = Math.max(0, u - (cambia ? 0.8 : 0.3)) % PASOS[a].dur
      const g = PASOS[a].giro(L)
      const giro = { ox: g.ox, oy: g.oy, r: g.r * presente }
      forma(q('figura'), pts)
      forma(q('sombra'), corre(pts, 8, 8))
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
      // el punto: en su lugar dentro del paso (gira con la figura) o viajando hacia él
      const fin = PASOS[a].punto(L)
      const rad = (giro.r * Math.PI) / 180
      const dx = fin.x - giro.ox
      const dy = fin.y - giro.oy
      fin.x = giro.ox + dx * Math.cos(rad) - dy * Math.sin(rad)
      fin.y = giro.oy + dx * Math.sin(rad) + dy * Math.cos(rad)
      let pos = fin
      if (cambia && sale && u < 0.85) {
        const p = tramo(u, 0.05, 0.85)
        const j = brinco(p, 34)
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
    ir(i, t) {
      if (i === a || !PASOS[i]) return
      de = a
      a = i
      sale = { ...ultimo }
      t0 = t ?? performance.now() / 1000
    },
  }
}
