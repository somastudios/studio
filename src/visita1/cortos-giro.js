import Trazo from '../core/trazo-vivo.js'

// Los cortos del aro de la portada: uno por familia de giro. Se ven dentro del aro de Soma, en
// una ventana redonda, en lugar del icono. Lienzo de 200 × 200; se ve el círculo de radio 80.
//
// Son una sola toma, sin cortes. En pantalla hay tres cosas y nunca desaparecen: cambian de
// papel. Lo que se va no se borra, se vuelve lo que sigue.
//
// Comida y bebida · «Su cocina» (8.4 s, en bucle)
//
//                 La figura                  Los tres renglones        El punto
//   La orden      comanda                    son el texto              cae: es el sello
//   La cocina     se vuelve campana          se despegan: son vapor    sube: es la perilla
//   Servido       se aplasta: es el plato    vapor sobre la comida     cae al plato: la comida
//   La cuenta     se levanta: comanda        bajan: son texto          brinca y vuelve de sello
//
// Cómo se siente continuo:
//   · La figura cambia en ola: la parte de arriba sale primero y la de abajo la sigue, y cada
//     punto se pasa tantito al llegar. No es un fundido de una forma a otra.
//   · Las acciones se enciman: los renglones empiezan a despegarse antes de que la comanda
//     cambie, y el punto ya va en el aire cuando la campana termina de formarse.
//   · Antes de cada cambio todo toma vuelo (se agacha) y al terminar hay un golpe que se nota
//     en tres lugares: el punto se aplasta, la figura se hunde y saltan rayos.
//   · La cámara nunca se queda quieta: deriva despacio y da un empujón en cada transformación.
//
// Las familias que todavía no tienen corto usan el icono de su giro, dibujado a mano.

const { P, D, T, G, monta, remuestra, elipsePts, corre, tramo, mezcla, suave, frena, acelera, rebota, salto, golpe, brinco, pon, forma, agita, camara, punto, corona } = Trazo

const TAU = Math.PI * 2
const tope = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const N = 96

/** Gira la lista para que empiece en el punto de hasta arriba: así todas las figuras empatan. */
const alinea = (pts) => {
  let k = 0
  pts.forEach((p, i) => {
    if (p[1] < pts[k][1] - 0.01 || (Math.abs(p[1] - pts[k][1]) <= 0.01 && Math.abs(p[0] - 100) < Math.abs(pts[k][0] - 100))) k = i
  })
  return [...pts.slice(k), ...pts.slice(0, k)]
}
const arcoPts = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => [cx + Math.cos(Math.PI + (i / (n - 1)) * Math.PI) * r, cy + Math.sin(Math.PI + (i / (n - 1)) * Math.PI) * r])

const COMANDA = alinea(remuestra([[68, 34], [132, 34], [132, 150], [125, 143], [118, 150], [111, 143], [104, 150], [97, 143], [90, 150], [83, 143], [76, 150], [68, 143]], N))
const CAMPANA = alinea(remuestra([...arcoPts(100, 132, 50, 26), [150, 132], [50, 132]], N))
const PLATO = elipsePts(100, 134, 64, 7, N)

// Qué tan tarde sale cada punto de la figura: 0 arriba, 1 abajo.
const ORDEN = Array.from({ length: N }, (_, i) => Math.min(i, N - i) / (N / 2))
/** Llega y se pasa un poco. */
const atras = (x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2)
/** De A a B en ola: lo de arriba sale primero. */
const ola = (A, B, m) =>
  A.map((a, i) => {
    const p = atras(tope(m * 1.45 - 0.45 * ORDEN[i]))
    return [a[0] + (B[i][0] - a[0]) * p, a[1] + (B[i][1] - a[1]) * p]
  })

// Los tres renglones: derechos sobre la comanda, o de vapor subiendo desde `base`.
const RENGLONES = [[58, 120], [74, 120], [90, 106]]
const renglon = (i) => Array.from({ length: 9 }, (_, j) => [mezcla(80, RENGLONES[i][1], j / 8), RENGLONES[i][0]])
const vapor = (i, t, base, alto) =>
  Array.from({ length: 9 }, (_, j) => {
    const u = j / 8
    return [84 + i * 16 + (1.5 + 5.5 * u) * Math.sin(u * 4.4 + i * 1.7 - t * 3.4), base - alto * u]
  })
const entre = (A, B, p) => A.map((a, j) => [mezcla(a[0], B[j][0], p), mezcla(a[1], B[j][1], p)])

const DUR = 8.4
const SELLO = [112, 118]
const PERILLA = [100, 73]
const COMIDA_P = [100, 123]

const COMIDA = {
  cartel: 1,
  svg: () =>
    G(
      'cam',
      G('b0', T(P.circ(0, 0, 7, 9), { cls: 'ln fino', amp: 0.5 })) +
        G('b1', T(P.circ(0, 0, 7, 9), { cls: 'ln fino', amp: 0.5 })) +
        T(D(corre(COMANDA, 6, 6)), { cls: 'blq', n: 'sombra' }) +
        T(D(COMANDA), { cls: 'ln tapa', n: 'figura' }) +
        [0, 1, 2].map((i) => T(D(renglon(i), false), { cls: 'ln fino', amp: 0.4, n: 'h' + i })).join('') +
        corona('ray', 8, 15, 24) +
        punto(10, 'pt'),
    ),
  paso(q, t) {
    // ── los cuatro cambios: cuánto lleva cada uno ──
    const aCampana = tramo(t, 1.9, 2.9)
    const aPlato = tramo(t, 4.4, 5.2)
    const aComanda = tramo(t, 6.7, 7.6)
    const hierve = suave(tramo(t, 3.0, 3.6)) * (1 - tramo(t, 4.1, 4.3))
    const latido = (z) => Math.max(0, Math.sin(z * (9 + 5 * hierve)))

    // ── la figura ──
    const pts = aComanda > 0 ? ola(PLATO, COMANDA, aComanda) : aPlato > 0 ? ola(CAMPANA, PLATO, aPlato) : aCampana > 0 ? ola(COMANDA, CAMPANA, aCampana) : COMANDA
    forma(q('figura'), pts)
    forma(q('sombra'), corre(pts, 6, 6))
    const cambia = salto(aCampana) + salto(aPlato) + salto(aComanda)
    agita(q('figura'), 1 + 1.2 * cambia + 1.2 * hierve)
    // toma vuelo antes de cada cambio; se hunde y tiembla cuando le cae el punto
    const vuelo = 0.06 * salto(tramo(t, 1.68, 1.95)) + 0.09 * salto(tramo(t, 4.15, 4.44)) + 0.05 * salto(tramo(t, 6.5, 6.74))
    const sellazo = golpe(t, 0.45, 0.22)
    const tiembla = golpe(t, 0.45, 0.7) * Math.sin((t - 0.45) * 24)
    const cae = golpe(t, 4.95, 0.2)
    const mece = golpe(t, 4.95, 0.7) * Math.sin((t - 4.95) * 20)
    const esComanda = t < 1.9 || t >= 7.6
    const cuerpo = {
      ox: 100,
      oy: esComanda ? 150 : 134,
      y: 4 * sellazo - 3.4 * hierve * latido(t) + 2.4 * cae,
      r: 2.6 * tiembla + 2 * hierve * Math.sin(t * 31) + 1.8 * mece - 3 * salto(aCampana) + 2 * salto(aComanda),
      sy: 1 - vuelo - 0.035 * sellazo,
    }
    pon(q('figura'), cuerpo)
    pon(q('sombra'), cuerpo)

    // ── los renglones: texto, vapor sobre la campana, vapor sobre la comida y texto otra vez ──
    ;[0, 1, 2].forEach((i) => {
      const sube = suave(tramo(t, 1.78 + 0.13 * i, 2.75 + 0.13 * i))
      const baja = suave(tramo(t, 4.5, 5.25))
      const vuelve = suave(tramo(t, 6.95 + 0.1 * i, 7.9 + 0.1 * i))
      const humo = vapor(i, t, mezcla(60, 106, baja), mezcla(40, 44, baja))
      const el = q('h' + i)
      forma(el, vuelve > 0 ? entre(humo, renglon(i), vuelve) : entre(renglon(i), humo, sube))
      pon(el, sube === 0 || vuelve === 1 ? cuerpo : {})
    })

    // ── el punto: sello, perilla, comida y sello otra vez ──
    let x = SELLO[0]
    let y = SELLO[1]
    let s = 1
    let sx = 1
    let sy = 1
    const aplasta = (k) => {
      sy *= 1 - k
      sx /= 1 - k
      y += 10 * s * k
    }
    const estira = (k) => {
      sy *= 1 + k
      sx /= 1 + k
    }
    if (t < 0.45) {
      // cae desde arriba, estirado por la velocidad
      const u = tramo(t, 0, 0.45)
      y = mezcla(-26, SELLO[1], acelera(u))
      estira(0.3 * u)
    } else if (t < 1.95) {
      aplasta(0.36 * sellazo + 0.24 * salto(tramo(t, 1.72, 1.95)))
      y += 4 * sellazo
    } else if (t < 2.75) {
      // sube en arco a la punta de la campana
      const u = tramo(t, 1.95, 2.75)
      const b = brinco(u, 30)
      x = mezcla(SELLO[0], PERILLA[0], suave(u))
      y = mezcla(SELLO[1], PERILLA[1], suave(u)) + b.dy
      s = mezcla(1, 0.82, u)
      sx = b.sx
      sy = b.sy
    } else if (t < 4.42) {
      // de perilla: brinca con la campana, un instante después y un poco más
      ;[x, y] = PERILLA
      s = 0.82
      y -= 4.6 * hierve * latido(t - 0.05)
      aplasta(0.3 * golpe(t, 2.75, 0.2) + 0.22 * salto(tramo(t, 4.18, 4.42)))
      y += 5 * salto(tramo(t, 4.18, 4.42))
    } else if (t < 4.95) {
      // la campana se aplasta bajo él y cae al plato
      const u = tramo(t, 4.42, 4.95)
      x = PERILLA[0]
      y = mezcla(PERILLA[1], COMIDA_P[1], acelera(u))
      s = mezcla(0.82, 1, u)
      estira(0.26 * u)
    } else if (t < 6.92) {
      ;[x, y] = COMIDA_P
      const b1 = brinco(tramo(t, 5.02, 5.42), 17)
      const b2 = brinco(tramo(t, 5.42, 5.68), 6)
      const b = b1.dy ? b1 : b2
      y += b.dy
      sx = b.sx
      sy = b.sy
      aplasta(0.34 * cae + 0.3 * salto(tramo(t, 6.66, 6.92)))
    } else {
      // brinca hacia arriba y sale del cuadro: vuelve cayendo, como sello
      const u = tramo(t, 6.92, 7.36)
      x = mezcla(COMIDA_P[0], SELLO[0], suave(u))
      y = mezcla(COMIDA_P[1], -30, frena(u) * 0.55 + acelera(u) * 0.45)
      estira(0.3 * (1 - 0.6 * u))
    }
    pon(q('pt'), { x, y, sx: s * sx, sy: s * sy })
    const rayos = t < 3 ? [SELLO, 0.45] : [COMIDA_P, 4.95]
    pon(q('ray'), { x: rayos[0][0], y: rayos[0][1], sx: mezcla(0.6, 1.25, frena(tramo(t, rayos[1], rayos[1] + 0.45))), o: golpe(t, rayos[1], 0.45) })

    // ── las bocanadas que se le escapan a la campana por los lados ──
    ;[0, 1].forEach((k) => {
      const c = ((((t - 3.1 - k * 0.3) % 0.6) + 0.6) % 0.6) / 0.6
      const lado = k ? 1 : -1
      pon(q('b' + k), { x: 100 + lado * (54 + 16 * frena(c)), y: 128 - 12 * c, sx: 0.3 + 0.9 * frena(c), o: hierve * (1 - c) })
    })

    // ── la cámara: sigue a la figura, deriva despacio y empuja en cada cambio ──
    const esCampana = suave(aCampana) * (1 - suave(aPlato))
    const esPlato = suave(aPlato) * (1 - suave(aComanda))
    const cy = 96 + 6 * esCampana + 14 * esPlato
    camara(q('cam'), 100 + 1.5 * Math.sin((t / DUR) * TAU), cy, 1.04 + 0.025 * Math.sin((t / DUR) * TAU * 2) + 0.05 * cambia, 100, 100)
  },
}

const CORTOS = { comida: COMIDA }

/** ¿Esta familia de giro ya tiene su corto? */
export const hayCorto = (familia) => !!CORTOS[familia]

/** Monta el corto de una familia en un <svg viewBox="0 0 200 200"> vacío. `desde(t)` lo reinicia en el segundo `t` del reloj. */
export function cortoGiro(svg, familia) {
  const obra = CORTOS[familia]
  if (!obra) return null
  let t0 = null
  monta(svg, {
    dur: Infinity,
    cartel: obra.cartel,
    svg: obra.svg,
    paso(q, t) {
      if (t0 === null) t0 = t
      obra.paso(q, (((t - t0) % DUR) + DUR) % DUR)
    },
  })
  return {
    desde(t = performance.now() / 1000) {
      t0 = t
    },
  }
}
