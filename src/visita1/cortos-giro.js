import Trazo from '../core/trazo-vivo.js'
import { CUERPO, muneca, bocaPts, actua, gente } from './reparto-trazo.js'

// Los cortos del aro de la portada: uno por familia de giro. Se ven dentro del aro de Soma, en
// una ventana redonda, en lugar del icono. Lienzo de 200 × 200; se ve el círculo de radio 80.
// Son cortos como los de la galería (docs/soma-animation.html): un personaje que actúa, cortes
// de cámara y una historia de tres planos.
//
// Comida y bebida · «Las comandas» (10.6 s, en bucle)
//   1 · Se juntan       Plano medio. El cocinero está tranquilo. Empiezan a llegar comandas, cada
//                       vez más seguido. Las sigue con los ojos, se le suben las cejas, se
//                       encoge, le escurre una gota. Una se le resbala y se cae: no lo cree.
//   2 · Llega el punto  Detalle de las comandas revueltas. El punto cae en medio, las sacude
//                       y se acomodan solas en una pantalla, una por una. El punto se queda de
//                       aviso en la esquina.
//   3 · En orden        Plano medio. La pantalla se encoge hasta ser su tableta. El cocinero la
//                       mira, suspira, sonríe, la toca con el dedo y presume con los ojos
//                       cerrados. Al final la tableta se va y él baja la mano: vuelve a empezar.
//
// Las demás familias cuentan lo mismo con su propia gente y lo que a ellos se les junta: a la
// tendera, preguntas de «¿tiene…?»; al barbero, citas a la misma hora; a la doctora,
// expedientes; al recepcionista, llaves; a cualquier otro negocio, papelitos. `corto(persona,
// cosa)` arma los tres planos con quien actúa y lo que se le junta.

const { P, D, T, G, monta, rectPts, corre, capsula, circulo, tramo, mezcla, suave, frena, acelera, rebota, salto, golpe, campana, brinco, sacude, pon, traza, ve, forma, camara, punto, corona, manoSvg, indice } = Trazo

// ── El cocinero: las mismas piezas que la persona de la galería, con gorro y filipina ──
function cocinero(k) {
  const w = muneca(0)
  return (
    T(P.suave(corre(CUERPO, 6, 6), true), { cls: 'blq', n: k + 'tblq' }) +
    T(P.suave(CUERPO, true), { cls: 'ln tapa', n: k + 'torso' }) +
    T(P.suave(CUERPO, true), { cls: 'tapa', n: k + 'tinte' }) +
    T([P.poli([[137, 146], [150, 161], [163, 146]]), P.linea(150, 161, 150, 210, 4)], { cls: 'ln fino', amp: 0.3 }) +
    T([P.circ(142, 172, 2, 6), P.circ(158, 172, 2, 6)], { cls: 'ln fino', amp: 0.15 }) +
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
        // el gorro: la copa esponjada y su banda
        G(
          k + 'pelo',
          T(P.suave([[127, 62], [118, 50], [123, 36], [137, 33], [150, 25], [163, 33], [177, 36], [182, 50], [173, 62]], true), { cls: 'ln tapa', amp: 0.9 }) +
            T(P.rect(126, 58, 48, 14, 3), { cls: 'ln tapa', amp: 0.4 }) +
            T([P.linea(140, 40, 141, 52, 3), P.linea(160, 40, 159, 52, 3)], { cls: 'ln fino tenue', amp: 0.3 }),
        ) +
        G(k + 'ci', T(P.linea(-6.5, 0.8, 6.5, -1.2, 3), { cls: 'ln', amp: 0.3 })) +
        G(k + 'cd', T(P.linea(-6.5, -1.2, 6.5, 0.8, 3), { cls: 'ln', amp: 0.3 })) +
        G(k + 'lentes', ''),
    ) +
    T(D(capsula([219, 207], w, 18)), { cls: 'ln tapa', amp: 0.5, n: k + 'ante' }) +
    T(D(capsula([219, 207], w, 18)), { cls: 'tapa', amp: 0.5, n: k + 'manga' }) +
    manoSvg(k + 'm')
  )
}
/** El cocinero en la ventana redonda: la cabeza queda en (100, 106). */
const enVentana = (dentro) => `<g transform="translate(-50 6)">${dentro}</g>`
/** Hacia dónde mirar para ver el punto (x, y) de la ventana. */
const hacia = (x, y, f = 3.2) => {
  const d = Math.hypot(x - 100, y - 104) || 1
  return [((x - 100) / d) * f, ((y - 104) / d) * f]
}
const papel = (n, w, h) =>
  G(
    n,
    T(P.poli([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], true), { cls: 'ln fino tapa', amp: 0.35 }) +
      T([P.linea(-w / 2 + 4, -h / 2 + 7, w / 2 - 4, -h / 2 + 7, 3), P.linea(-w / 2 + 4, -h / 2 + 14, w / 2 - 8, -h / 2 + 14, 3)], { cls: 'ln fino tenue', amp: 0.2 }),
  )

// Plano 1: dónde se pega cada comanda, cuánto se ladea y cuándo llega.
const SITIOS = [[42, 88, -8], [158, 82, 7], [47, 126, 6], [154, 122, -9], [60, 54, -14], [143, 52, 12]]
const LLEGA = [0.7, 1.3, 1.8, 2.2, 2.5, 2.75]
const CAE = 3.15
// Plano 2: revueltas, y en su lugar dentro de la pantalla.
const REVUELTAS = [[62, 72, -18], [130, 64, 14], [94, 104, -6], [146, 114, 22], [60, 130, 10], [110, 140, -12]]
const EN_ORDEN = [[69, 82], [100, 82], [131, 82], [69, 122], [100, 122], [131, 122]]
const PANTALLA = [44, 54, 112, 96]
const TABLETA = [126, 41, 48, 34]
const ESCONDIDA = [20, 70, 0]

const corto = (persona, cosa) => ({
  cartel: 9,
  planos: [
    {
      nombre: 'Se juntan',
      dur: 4.4,
      svg: () => G('k1cam', enVentana(persona('k')) + SITIOS.map((_, i) => cosa('k1p' + i, 20, 26)).join('')),
      paso(q, t) {
        camara(q('k1cam'), 100, 100, 1 + 0.07 * suave(tramo(t, 0, 4.4)), 100, 100)
        const cuantas = LLEGA.filter((x) => t >= x).length
        const agobio = suave(tramo(t, 0.7, 2.9))
        const cae = acelera(tramo(t, CAE, CAE + 0.75))
        let ojos = [0, 0.6]
        SITIOS.forEach(([x, y, r], i) => {
          const entra = frena(tramo(t, LLEGA[i] - 0.05, LLEGA[i] + 0.28))
          const lado = x < 100 ? -1 : 1
          const nervio = agobio * 2.2 * Math.sin(t * 27 + i * 1.9)
          const suelta = i === 4 ? cae : 0
          const px = x + lado * 46 * (1 - entra) - 10 * suelta
          const py = y + 175 * suelta
          pon(q('k1p' + i), { x: px, y: py, r: r + nervio + 150 * suelta, sx: rebota(tramo(t, LLEGA[i], LLEGA[i] + 0.3)), o: t < LLEGA[i] - 0.05 ? 0 : 1 })
          if (i === cuantas - 1) ojos = hacia(x, y)
          if (i === 4 && t > CAE) ojos = hacia(px, Math.min(py, 170), 3.6)
        })
        const nocree = golpe(t, CAE + 0.12, 0.6)
        actua(q, 'k', {
          gira: 2.5 * Math.sin(t * 1.2) * (1 - agobio) + 3 * agobio * Math.sin(t * 2.6) + 4 * nocree,
          dy: 3.5 * agobio,
          sy: 1 - 0.025 * agobio,
          mira: ojos,
          abre: (1 + 0.5 * agobio + 0.25 * nocree) * (1 - 0.92 * campana(t, 2.02, 0.08)) * (1 - 0.92 * campana(t, CAE + 0.1, 0.08)),
          cejas: [-5 * agobio - 2 * nocree, -7 * agobio, -5 * agobio - 2 * nocree, 7 * agobio],
          boca: [0.6 * Math.sin(t * 3) * agobio, mezcla(0.95, -0.6, agobio), 0.5 * tramo(t, 2.3, 2.8) + 0.4 * nocree],
          brazo: 0.5,
          mano: ESCONDIDA,
          pelo: 2 * Math.sin(t * 1.2 - 0.4) + 2.4 * agobio * Math.sin(t * 2.6 - 0.5) - 5 * nocree,
          gota: t > 2.55 ? tramo(t, 2.55, 3.7) : -1,
          resp: 0.012 * Math.sin(t * (1.8 + 3 * agobio)),
        })
      },
    },
    {
      nombre: 'Llega el punto',
      dur: 2.6,
      svg: () =>
        G(
          'k2cam',
          T(P.rect(PANTALLA[0] + 6, PANTALLA[1] + 6, PANTALLA[2], PANTALLA[3], 10), { cls: 'blq', n: 'k2blq' }) +
            T(P.rect(...PANTALLA, 10), { cls: 'ln tapa tz', n: 'k2marco' }) +
            REVUELTAS.map((_, i) => cosa('k2p' + i, 26, 34)).join('') +
            corona('k2ray', 10, 16, 28) +
            punto(10, 'k2pt'),
        ),
      paso(q, t) {
        const GOLPE = 0.5
        camara(q('k2cam'), 100 + sacude(t, GOLPE, 3), 100 + sacude(t, GOLPE, 2.2), 1.05, 100, 100)
        const empuje = golpe(t, GOLPE, 0.32)
        REVUELTAS.forEach(([x, y, r], i) => {
          // el golpe las avienta hacia afuera; luego cada una vuela a su lugar y se pasa tantito
          const d = Math.hypot(x - 100, y - 100) || 1
          const va = rebota(tramo(t, 0.85 + 0.1 * i, 1.4 + 0.1 * i))
          const nervio = (1 - tramo(t, GOLPE, 0.9)) * 2.4 * Math.sin(t * 27 + i * 1.9)
          pon(q('k2p' + i), {
            x: mezcla(x + ((x - 100) / d) * 10 * empuje, EN_ORDEN[i][0], va),
            y: mezcla(y + ((y - 100) / d) * 10 * empuje, EN_ORDEN[i][1], va) - 9 * salto(tramo(t, 0.85 + 0.1 * i, 1.4 + 0.1 * i)),
            r: mezcla(r + nervio + 12 * empuje * (i % 2 ? 1 : -1), 0, va),
          })
        })
        // la pantalla se dibuja alrededor cuando ya van llegando
        traza(q('k2marco'), suave(tramo(t, 1.3, 2.0)))
        ve(q('k2blq'), tramo(t, 1.8, 2.1))
        // el punto cae estirado, se aplasta y brinca a la esquina, de aviso
        const u = tramo(t, 0.1, GOLPE)
        const brinca = tramo(t, 1.1, 1.6)
        const b = brinco(brinca, 30)
        const estira = t < GOLPE ? 0.3 * u : 0
        const fin = [PANTALLA[0] + PANTALLA[2] - 3, PANTALLA[1] + 3]
        const s = mezcla(1, 0.72, brinca)
        const queda = golpe(t, 1.6, 0.2)
        pon(q('k2pt'), {
          x: mezcla(100, fin[0], suave(brinca)),
          y: mezcla(mezcla(-26, 100, acelera(u)), fin[1], suave(brinca)) + b.dy + 5 * empuje,
          sx: s * b.sx * (1 + 0.36 * empuje + 0.25 * queda - estira * 0.5),
          sy: s * b.sy * (1 - 0.38 * empuje - 0.25 * queda + estira),
        })
        pon(q('k2ray'), { x: 100, y: 100, sx: mezcla(0.6, 1.3, frena(tramo(t, GOLPE, GOLPE + 0.5))), o: golpe(t, GOLPE, 0.5) })
      },
    },
    {
      nombre: 'En orden',
      dur: 3.6,
      svg: () =>
        G(
          'k3cam',
          enVentana(persona('c')) +
            T(D(rectPts(...PANTALLA, 10)), { cls: 'blq', n: 'k3blq' }) +
            T(D(rectPts(...PANTALLA, 10)), { cls: 'ln tapa', n: 'k3tab' }) +
            [0, 1, 2].map((j) => T(D([[0, 0], [1, 0], [2, 0], [3, 0]], false), { cls: 'ln fino', amp: 0.3, n: 'k3r' + j })).join('') +
            corona('k3ray', 7, 9, 15) +
            punto(7.2, 'k3pt'),
        ),
      paso(q, t) {
        camara(q('k3cam'), 100, 100, mezcla(1.05, 1, suave(tramo(t, 0, 1.2))), 100, 100)
        // la pantalla se encoge hasta ser su tableta; al final se va
        const chica = rebota(tramo(t, 0.1, 0.95))
        const seva = acelera(tramo(t, 3.05, 3.5))
        const toque = golpe(t, 2.3, 0.22)
        const r = PANTALLA.map((v, k) => mezcla(v, TABLETA[k], chica))
        r[0] += 90 * seva
        r[1] -= 30 * seva + 2 * toque
        const pts = rectPts(r[0], r[1], r[2], r[3], mezcla(10, 6, chica))
        forma(q('k3tab'), pts)
        forma(q('k3blq'), corre(pts, mezcla(6, 4, chica), mezcla(6, 4, chica)))
        ;[0, 1, 2].forEach((j) => {
          const y = r[1] + r[3] * (0.3 + 0.2 * j)
          const x0 = r[0] + r[2] * 0.16
          const x1 = r[0] + r[2] * (0.84 - 0.16 * j)
          forma(q('k3r' + j), [0, 1, 2, 3].map((k) => [mezcla(x0, x1, k / 3), y]))
        })
        const aviso = [r[0] + r[2] - 2, r[1] + 2]
        pon(q('k3pt'), { x: aviso[0], y: aviso[1], sx: 1 + 0.4 * toque })
        pon(q('k3ray'), { x: aviso[0], y: aviso[1], sx: mezcla(0.7, 1.4, frena(tramo(t, 2.3, 2.7))), o: golpe(t, 2.3, 0.4) })
        // el cocinero: la mira, suspira, sonríe, la toca con el dedo y presume
        const alivio = suave(tramo(t, 0.6, 1.3))
        const suspiro = salto(tramo(t, 1.0, 1.6))
        const sube = rebota(tramo(t, 1.5, 2.05)) * (1 - suave(tramo(t, 3.0, 3.45)))
        const presume = suave(tramo(t, 2.45, 2.7)) * (1 - suave(tramo(t, 3.0, 3.25)))
        const vuelve = suave(tramo(t, 3.05, 3.5))
        const tab = hacia(r[0] + r[2] / 2, r[1] + r[3] / 2)
        actua(q, 'c', {
          gira: mezcla(4, -3, alivio) * (1 - vuelve) + 2.2 * presume * Math.sin(t * 7.5),
          dy: 3.5 * (1 - alivio) + 2 * suspiro,
          sy: 1 - 0.025 * (1 - alivio) - 0.02 * suspiro,
          mira: [tab[0] * (1 - vuelve), mezcla(tab[1], 0.6, vuelve)],
          abre: mezcla(1.5, 1, alivio) * (1 - 0.92 * campana(t, 0.75, 0.08)) * (1 - 0.92 * campana(t, 3.3, 0.08)),
          feliz: presume,
          cejas: [mezcla(-5, 0, alivio) - 2.5 * presume, mezcla(-7, 0, alivio), mezcla(-5, 0, alivio) - 2.5 * presume, mezcla(7, 0, alivio)],
          boca: [0, mezcla(-0.6, 1.25, rebota(tramo(t, 0.9, 1.5))) * (1 - 0.25 * vuelve), 0.45 * suspiro],
          brazo: 0.5,
          dedo: frena(tramo(t, 1.75, 2.0)) * (1 - tramo(t, 2.95, 3.1)),
          mano: [mezcla(ESCONDIDA[0], 2, sube), mezcla(ESCONDIDA[1], -14, sube) - 4 * toque, 18 * sube],
          pelo: -6 * salto(tramo(t, 0.6, 0.95)) + 3 * presume * Math.sin(t * 7.5 - 1),
          rubor: presume,
          resp: 0.012 * Math.sin(t * 1.8) - 0.035 * suspiro,
        })
      },
    },
  ],
})

// ── La gente de las otras familias: mismo cuerpo, otro pelo y otra ropa ──
const pelo = (pts, mas = '') => T(P.suave(pts, true), { cls: 'ln cabello', amp: 0.7 }) + mas
const fino = (formas) => T(formas, { cls: 'ln fino', amp: 0.3 })

// tiendas: la tendera, de chongo y mandil
const tendera = (k) =>
  gente(k, {
    pelo: T(P.circ(150, 50, 13, 10), { cls: 'ln cabello', amp: 0.5 }) + pelo([[115, 100], [114, 80], [124, 65], [140, 58], [160, 58], [176, 65], [186, 80], [185, 100], [178, 84], [164, 74], [150, 72], [136, 74], [122, 84]]),
    pecho: T(P.poli([[134, 152], [166, 152], [172, 212], [128, 212]], true), { cls: 'ln fino tapa', amp: 0.3 }) + fino([P.linea(136, 152, 140, 146, 3), P.linea(164, 152, 160, 146, 3), P.linea(140, 182, 160, 182, 3)]),
  })
// cuidado: el barbero, de copete y bigote, con el peine en la bolsa
const barbero = (k) =>
  gente(k, {
    pelo:
      pelo([[116, 98], [114, 78], [122, 62], [138, 52], [158, 48], [176, 56], [186, 72], [186, 96], [180, 84], [170, 76], [150, 78], [132, 74], [124, 84]]) +
      T(P.suave([[135, 116], [143, 111.5], [150, 114], [157, 111.5], [165, 116], [157, 116.5], [150, 116], [143, 116.5]], true), { cls: 'ln fino cabello', amp: 0.2 }),
    pecho: fino([P.poli([[137, 146], [150, 161], [163, 146]]), P.rect(160, 172, 17, 18, 2), P.linea(164, 172, 164, 165, 2), P.linea(168.5, 172, 168.5, 165, 2), P.linea(173, 172, 173, 165, 2)]),
    ropa: 'tapa',
  })
// salud: la doctora, de melena, bata y estetoscopio
const doctora = (k) =>
  gente(k, {
    pelo:
      pelo([[113, 90], [108, 112], [112, 134], [122, 136], [118, 118], [119, 100]]) +
      pelo([[187, 90], [192, 112], [188, 134], [178, 136], [182, 118], [181, 100]]) +
      pelo([[114, 96], [113, 78], [122, 63], [140, 56], [160, 56], [178, 63], [187, 78], [186, 96], [180, 82], [166, 72], [150, 76], [134, 72], [120, 82]]),
    pecho: fino([P.poli([[137, 146], [146, 174], [150, 161]]), P.poli([[163, 146], [154, 174], [150, 161]]), P.linea(150, 174, 150, 212, 4), P.suave([[132, 152], [128, 172], [138, 188], [150, 187]]), P.circ(154, 187, 4, 7)]),
    ropa: 'tapa',
  })
// estancia: el recepcionista, bien peinado, de chaleco y moño
const recepcionista = (k) =>
  gente(k, {
    pelo: pelo([[116, 98], [115, 78], [126, 62], [146, 56], [166, 58], [180, 68], [186, 84], [185, 98], [176, 80], [160, 70], [140, 72], [126, 82]]),
    pecho: T([P.poli([[150, 153], [137, 146], [137, 160]], true), P.poli([[150, 153], [163, 146], [163, 160]], true)], { cls: 'ln fino cabello', amp: 0.2 }) + fino([P.linea(138, 162, 150, 204, 4), P.linea(162, 162, 150, 204, 4)]),
  })
// otro: el dueño de «Antes de empezar», pelo corto y camisa de cuello
const dueno = (k) =>
  gente(k, {
    pelo: pelo([[116, 99], [115, 80], [124, 66], [140, 59], [157, 58], [171, 63], [182, 75], [185, 96], [179, 86], [168, 77], [152, 74], [136, 78], [125, 88]]),
    pecho: fino([P.poli([[137, 146], [146, 159], [150, 151]]), P.poli([[163, 146], [154, 159], [150, 151]]), P.linea(150, 159, 150, 210, 4)]),
  })

// ── Lo que se le junta a cada quien (cabe en una caja de w × h, centrada) ──
const caja = (n, contorno, dentro) => G(n, T(P.poli(contorno, true), { cls: 'ln fino tapa', amp: 0.35 }) + dentro)
// una pregunta: «¿tiene…?»
const pregunta = (n, w, h) =>
  caja(n, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 4], [-w / 8, h / 4], [-w / 3, h / 2], [-w / 4, h / 4], [-w / 2, h / 4]], T(P.arco(0, -h * 0.22, w * 0.17, 190, 415, 6), { cls: 'ln fino', amp: 0.15 }) + `<circle class="lleno" cx="0" cy="${(h * 0.1).toFixed(1)}" r="1.3"/>`)
// una cita: tarjeta con su reloj
const cita = (n, w, h) =>
  caja(n, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], T(P.circ(0, -h * 0.08, w * 0.3, 9), { cls: 'ln fino', amp: 0.15 }) + T([P.linea(0, -h * 0.08, 0, -h * 0.08 - w * 0.2, 2), P.linea(0, -h * 0.08, w * 0.14, -h * 0.08 + 1, 2), P.linea(-w / 2 + 4, h / 2 - 5, w / 2 - 4, h / 2 - 5, 3)], { cls: 'ln fino tenue', amp: 0.15 }))
// un expediente: la carpeta con su pestaña
const carpeta = (n, w, h) =>
  caja(n, [[-w / 2, -h / 2], [-w / 8, -h / 2], [0, -h / 2 + 5], [w / 2, -h / 2 + 5], [w / 2, h / 2], [-w / 2, h / 2]], T([P.linea(-w / 2 + 4, -h / 2 + 12, w / 2 - 4, -h / 2 + 12, 3), P.linea(-w / 2 + 4, -h / 2 + 19, w / 2 - 9, -h / 2 + 19, 3)], { cls: 'ln fino tenue', amp: 0.2 }))
// una llave con su número
const llave = (n, w, h) =>
  caja(n, [[-w / 2, -h / 2 + 4], [0, -h / 2], [w / 2, -h / 2 + 4], [w / 2, h / 2], [-w / 2, h / 2]], T(P.circ(0, -h / 2 + 7, 2.2, 6), { cls: 'ln fino', amp: 0.1 }) + T([P.circ(-w * 0.14, h * 0.12, w * 0.15, 7), P.linea(-w * 0.14 + w * 0.15, h * 0.12, w * 0.32, h * 0.12, 3), P.linea(w * 0.22, h * 0.12, w * 0.22, h * 0.26, 2)], { cls: 'ln fino', amp: 0.15 }))
// un papelito pegado, con la esquina doblada
const papelito = (n, w, h) =>
  caja(n, [[-w / 2, -h / 2 + 2], [w / 2, -h / 2 + 2], [w / 2, h / 4], [w / 5, h / 2 - 2], [-w / 2, h / 2 - 2]], T([P.poli([[w / 2, h / 4], [w / 5, h / 4], [w / 5, h / 2 - 2]]), P.linea(-w / 2 + 4, -h / 2 + 9, w / 2 - 4, -h / 2 + 9, 3), P.linea(-w / 2 + 4, -h / 2 + 16, w / 2 - 8, -h / 2 + 16, 3)], { cls: 'ln fino tenue', amp: 0.2 }))

const CORTOS = {
  comida: corto(cocinero, papel),
  tiendas: corto(tendera, pregunta),
  cuidado: corto(barbero, cita),
  salud: corto(doctora, carpeta),
  estancia: corto(recepcionista, llave),
  otro: corto(dueno, papelito),
}

/** Las familias que tienen corto (para revisarlos). */
export const FAMILIAS_CON_CORTO = Object.keys(CORTOS)

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
