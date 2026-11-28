import Trazo from '../core/trazo-vivo.js'

// El reparto de trazo vivo: la persona de medio cuerpo que sale en los cortos y la función que
// la pone a actuar. Es el mismo código de la galería (docs/soma-animation.html): `persona(k)` es
// Alex; otros personajes (el cocinero de cortos-giro.js) usan los mismos nombres de piezas para
// que `actua` los mueva igual. Coordenadas de un cuadro de 320 × 200, con la cabeza en (150, 100).

const { P, D, T, G, corre, capsula, circulo, mezcla, grados, salto, pon, ve, forma, ojo, manoSvg, indice } = Trazo

export const CODO = [219, 207]
/** Dónde queda la muñeca: 0 es el puño en la barbilla y 1 el brazo en alto. */
export const muneca = (p) => {
  const a = grados(mezcla(-125.5, -76, p))
  const l = mezcla(70, 84, p)
  return [CODO[0] + Math.cos(a) * l, CODO[1] + Math.sin(a) * l]
}
export const CUERPO = [[78, 214], [86, 178], [108, 158], [132, 147], [150, 145], [168, 147], [192, 158], [214, 178], [222, 214]]
const US = [-1, -0.6, -0.2, 0.2, 0.6, 1]
/** La boca: m la corre de lado, s la curva (sonrisa o mueca) y ab la abre. */
export function bocaPts(m, s, ab) {
  const x = (u) => 150 + m * 3 + u * (7 + 1.6 * Math.max(0, s))
  const arriba = (u) => 120.5 + s * (4.6 * (1 - u * u) - 2.2) * (1 - 0.75 * ab) - m * u
  return [...US.map((u) => [x(u), arriba(u)]), ...US.slice().reverse().map((u) => [x(u), arriba(u) + ab * 9 * (1 - u * u)])]
}
// El pelo: una mata china más ancha que la cabeza. Por arriba, un arco de rizos; por abajo,
// el fleco, con un mechón que cae entre las cejas.
const MATA = [
  ...Array.from({ length: 31 }, (_, i) => {
    const a = grados(172 + (196 * i) / 30)
    const rizo = 1 + 0.065 * Math.cos(i * 1.9)
    return [150 + Math.cos(a) * 45 * rizo, 86 + Math.sin(a) * 40 * rizo]
  }),
  [187, 101], [182, 92], [176, 80], [168, 76], [160, 80], [154, 87], [149, 79], [141, 75], [132, 80], [124, 78], [118, 92], [113, 101],
]
const RIZOS = [[126, 63, 7, 150, 400], [146, 55, 8, 180, 425], [168, 58, 7, 200, 440], [185, 73, 6, 220, 450], [114, 77, 6, 120, 360], [158, 70, 5.5, 160, 380], [137, 71, 5, 200, 420]]

/** La persona, de medio cuerpo: Alex. `k` es el prefijo de sus nombres (sale en dos planos). */
export function persona(k) {
  const w = muneca(0)
  return (
    T(P.suave(corre(CUERPO, 6, 6), true), { cls: 'blq', n: k + 'tblq' }) +
    T(P.suave(CUERPO, true), { cls: 'ln tapa', n: k + 'torso' }) +
    T(P.suave(CUERPO, true), { cls: 'blq', n: k + 'tinte' }) +
    T([P.suave([[133, 148], [150, 157], [167, 148]]), P.suave([[137, 145.5], [150, 152], [163, 145.5]])], { cls: 'ln fino', amp: 0.3 }) +
    T([P.linea(139, 128, 138, 146, 3), P.linea(161, 128, 162, 146, 3)], { cls: 'ln', amp: 0.4 }) +
    G(
      k + 'cab',
      T([P.arco(117.5, 104, 5.6, 105, 255, 5), P.arco(182.5, 104, 5.6, -75, 75, 5)], { cls: 'ln', amp: 0.3 }) +
        T(P.circ(150, 100, 34, 18), { cls: 'ln tapa', amp: 0.8 }) +
        T(P.suave([[150.5, 104], [147.4, 110.6], [151, 112.4]]), { cls: 'ln fino', amp: 0.2 }) +
        `<ellipse class="lleno" data-n="${k}oi"/><ellipse class="lleno" data-n="${k}od"/>` +
        G(k + 'fi', T(P.arco(0, 2, 4.4, 205, 335, 5), { cls: 'ln fino', amp: 0.15 })) +
        G(k + 'fd', T(P.arco(0, 2, 4.4, 205, 335, 5), { cls: 'ln fino', amp: 0.15 })) +
        T(D(bocaPts(0, 0, 0)), { cls: 'ln fino boca', amp: 0.2, n: k + 'boca' }) +
        T([P.linea(123.5, 113, 126.5, 108.5, 3), P.linea(128.5, 115, 131.5, 110.5, 3), P.linea(168.5, 110.5, 171.5, 115, 3), P.linea(173.5, 108.5, 176.5, 113, 3)], { cls: 'ln fino tenue', amp: 0.15, n: k + 'rub' }) +
        G(k + 'gota', T(P.suave([[0, -5.2], [2.7, -0.4], [2.3, 2.8], [0, 4], [-2.3, 2.8], [-2.7, -0.4]], true), { cls: 'ln fino tapa', amp: 0.15 })) +
        G(k + 'pelo', T(P.suave(MATA, true), { cls: 'ln cabello', amp: 1 }) + T(RIZOS.map((r) => P.arco(...r, 7)), { cls: 'ln fino rizo', amp: 0.5 })) +
        G(k + 'ci', T(P.linea(-6.5, 0.8, 6.5, -1.2, 3), { cls: 'ln', amp: 0.3 })) +
        G(k + 'cd', T(P.linea(-6.5, -1.2, 6.5, 0.8, 3), { cls: 'ln', amp: 0.3 })) +
        // los lentes: dos armazones, el puente y las patas hasta las orejas
        G(
          k + 'lentes',
          T([P.rect(129.5, 90.5, 19, 15, 4), P.rect(151.5, 90.5, 19, 15, 4)], { cls: 'ln', amp: 0.35 }) +
            T([P.suave([[148.5, 96], [150, 94.6], [151.5, 96]]), P.linea(129.5, 94.5, 118.5, 96, 3), P.linea(170.5, 94.5, 181.5, 96, 3)], { cls: 'ln fino', amp: 0.2 }),
        ),
    ) +
    T(D(capsula(CODO, w, 18)), { cls: 'ln tapa', amp: 0.5, n: k + 'ante' }) +
    T(D(capsula(CODO, w, 18)), { cls: 'blq', amp: 0.5, n: k + 'manga' }) +
    manoSvg(k + 'm')
  )
}

/** Pone a la persona en una pose. Lo que no se da queda en reposo. */
export function actua(q, k, { gira = 0, dy = 0, sy = 1, mira = [0, 0], abre = 1, feliz = 0, cejas = [0, 0, 0, 0], boca = [0, 0, 0], brazo = 0, dedo = 0, mano = [0, 0, 0], pelo = 0, lentes = [0, 0], rubor = 0, gota = -1, resp = 0 } = {}) {
  const [ai, ad] = Array.isArray(abre) ? abre : [abre, abre]
  pon(q(k + 'cab'), { r: gira, y: dy, ox: 150, oy: 136, sx: 2 - sy, sy })
  ojo(q(k + 'oi'), 139 + mira[0], 98 + mira[1], 3.1 + 0.3 * Math.max(0, ai - 1), 3.1 * ai)
  ojo(q(k + 'od'), 161 + mira[0], 98 + mira[1], 3.1 + 0.3 * Math.max(0, ad - 1), 3.1 * ad)
  ve(q(k + 'oi'), 1 - feliz)
  ve(q(k + 'od'), 1 - feliz)
  pon(q(k + 'fi'), { x: 139, y: 98, o: feliz })
  pon(q(k + 'fd'), { x: 161, y: 98, o: feliz })
  pon(q(k + 'ci'), { x: 138, y: 84.5 + cejas[0], r: cejas[1] })
  pon(q(k + 'cd'), { x: 162, y: 84.5 + cejas[2], r: cejas[3] })
  forma(q(k + 'boca'), bocaPts(boca[0], boca[1], boca[2] || 0))
  pon(q(k + 'pelo'), { r: pelo, ox: 150, oy: 84 })
  pon(q(k + 'lentes'), { y: lentes[0], r: lentes[1], ox: 150, oy: 98 })
  ve(q(k + 'rub'), rubor)
  pon(q(k + 'gota'), { x: 177.5, y: 104 + 15 * Math.max(0, gota), o: gota < 0 ? 0 : salto(Math.min(1, gota)) ** 0.4 })
  for (const n of ['torso', 'tblq', 'tinte']) pon(q(k + n), { ox: 150, oy: 214, sx: 1, sy: 1 + resp })
  const w = muneca(brazo)
  w[0] += mano[0]
  w[1] += mano[1]
  forma(q(k + 'ante'), capsula(CODO, w, 18))
  forma(q(k + 'manga'), capsula(CODO, w, 18))
  pon(q(k + 'm'), { x: w[0], y: w[1], r: mezcla(-39, 3, brazo) + mano[2] })
  forma(q(k + 'mi'), indice(dedo))
}

/**
 * Una persona cualquiera, de medio cuerpo, con las mismas piezas que `persona` (así `actua` la
 * mueve igual). `pelo` es lo que va en la cabeza (pelo, gorro), `pecho` lo que va sobre la ropa
 * (cuello, botones) y `ropa` la clase del relleno de la ropa ('blq' oscura, 'tapa' clara).
 */
export function gente(k, { pelo = '', pecho = '', ropa = 'blq' } = {}) {
  const w = muneca(0)
  return (
    T(P.suave(corre(CUERPO, 6, 6), true), { cls: 'blq', n: k + 'tblq' }) +
    T(P.suave(CUERPO, true), { cls: 'ln tapa', n: k + 'torso' }) +
    T(P.suave(CUERPO, true), { cls: ropa, n: k + 'tinte' }) +
    pecho +
    T([P.linea(139, 128, 138, 146, 3), P.linea(161, 128, 162, 146, 3)], { cls: 'ln', amp: 0.4 }) +
    G(
      k + 'cab',
      T([P.arco(117.5, 104, 5.6, 105, 255, 5), P.arco(182.5, 104, 5.6, -75, 75, 5)], { cls: 'ln', amp: 0.3 }) +
        T(P.circ(150, 100, 34, 18), { cls: 'ln tapa', amp: 0.8 }) +
        T(P.suave([[150.5, 102], [147.4, 109], [151, 111]]), { cls: 'ln fino', amp: 0.2 }) +
        `<ellipse class="lleno" data-n="${k}oi"/><ellipse class="lleno" data-n="${k}od"/>` +
        G(k + 'fi', T(P.arco(0, 2, 4.4, 205, 335, 5), { cls: 'ln fino', amp: 0.15 })) +
        G(k + 'fd', T(P.arco(0, 2, 4.4, 205, 335, 5), { cls: 'ln fino', amp: 0.15 })) +
        T(D(bocaPts(0, 0, 0)), { cls: 'ln fino boca', amp: 0.2, n: k + 'boca' }) +
        T([P.linea(123.5, 113, 126.5, 108.5, 3), P.linea(128.5, 115, 131.5, 110.5, 3), P.linea(168.5, 110.5, 171.5, 115, 3), P.linea(173.5, 108.5, 176.5, 113, 3)], { cls: 'ln fino tenue', amp: 0.15, n: k + 'rub' }) +
        G(k + 'gota', T(P.suave([[0, -5.2], [2.7, -0.4], [2.3, 2.8], [0, 4], [-2.3, 2.8], [-2.7, -0.4]], true), { cls: 'ln fino tapa', amp: 0.15 })) +
        G(k + 'pelo', pelo) +
        G(k + 'ci', T(P.linea(-6.5, 0.8, 6.5, -1.2, 3), { cls: 'ln', amp: 0.3 })) +
        G(k + 'cd', T(P.linea(-6.5, -1.2, 6.5, 0.8, 3), { cls: 'ln', amp: 0.3 })) +
        G(k + 'lentes', ''),
    ) +
    T(D(capsula(CODO, w, 18)), { cls: 'ln tapa', amp: 0.5, n: k + 'ante' }) +
    T(D(capsula(CODO, w, 18)), { cls: ropa, amp: 0.5, n: k + 'manga' }) +
    manoSvg(k + 'm')
  )
}

/** Mezcla dos poses de `actua` (mismas llaves): para pasar de una actuación a otra sin brinco. */
export function mezclaPose(A, B, p) {
  const o = {}
  for (const k in B) {
    const a = A[k] ?? B[k]
    const b = B[k]
    o[k] = Array.isArray(b) ? b.map((v, i) => mezcla((Array.isArray(a) ? a[i] : a) ?? v, v, p)) : mezcla(a, b, p)
  }
  return o
}
