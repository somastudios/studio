/* Trazo vivo · el motor
   Líneas que tiemblan como dibujadas a mano y se calculan de nuevo en cada cuadro, a 60 por
   segundo. Sin dependencias. Deja todo en `window.Trazo`:

     const { P, T, G, monta, tramo, suave, pon, traza } = Trazo
     monta(document.querySelector('#lienzo'), { dur: 4, cartel: 2, svg: () => ..., paso(q, t) { ... } })

   Lee SKILL.md para el oficio (cómo se cuenta, cómo se actúa, cómo se revisa). */
;(function (global) {
  // ═══════════════ Motor ═══════════════
  const TAU = Math.PI * 2
  const TRESES = 8 // dibujos por segundo en el modo «En treses»
  let modo = 'suave'

  function azar(semilla) {
    let a = semilla >>> 0
    return () => {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const F = (n) => Math.round(n * 100) / 100
  const grados = (g) => (g * Math.PI) / 180
  const igual = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6
  const tramos = (a, b, cada = 20) => Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / cada))

  /** Formas: devuelven { pts, closed }. Ángulos en grados, 0° a la derecha y −90° arriba. */
  const P = {
    circ(cx, cy, r, n) {
      return P.elipse(cx, cy, r, r, n || Math.max(8, Math.round(7 + r * 0.5)))
    },
    elipse(cx, cy, rx, ry, n = 14) {
      return { pts: elipsePts(cx, cy, rx, ry, n), closed: true }
    },
    arco(cx, cy, r, a0, a1, n = 8) {
      return { pts: Array.from({ length: n }, (_, i) => [cx + Math.cos(grados(a0 + ((a1 - a0) * i) / (n - 1))) * r, cy + Math.sin(grados(a0 + ((a1 - a0) * i) / (n - 1))) * r]), closed: false }
    },
    linea(x1, y1, x2, y2, n) {
      n = n || tramos([x1, y1], [x2, y2], 16) + 2
      return { pts: Array.from({ length: n }, (_, i) => [x1 + ((x2 - x1) * i) / (n - 1), y1 + ((y2 - y1) * i) / (n - 1)]), closed: false }
    },
    curva(x0, y0, x1, y1, x2, y2, x3, y3, n = 12) {
      return { pts: Array.from({ length: n }, (_, i) => bezier(i / (n - 1), x0, y0, x1, y1, x2, y2, x3, y3)), closed: false }
    },
    /** Pasa por los puntos, redondeando. */
    suave(pts, closed = false) {
      return { pts, closed }
    },
    /** Esquinas vivas: cada vértice va dos veces y los lados largos se parten para que tiemblen. */
    poli(v, closed = false) {
      const pts = []
      const n = v.length
      for (let i = 0; i < (closed ? n : n - 1); i++) {
        const a = v[i]
        const b = v[(i + 1) % n]
        pts.push([a[0], a[1]])
        if (i > 0 || closed) pts.push([a[0], a[1]])
        const k = tramos(a, b)
        for (let j = 1; j < k; j++) pts.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k])
      }
      if (!closed) pts.push([v[n - 1][0], v[n - 1][1]])
      return { pts, closed }
    },
    rect(x, y, w, h, r = 5) {
      const pts = []
      const borde = [
        [x + r, y, x + w - r, y, x + w - r, y + r, -45],
        [x + w, y + r, x + w, y + h - r, x + w - r, y + h - r, 45],
        [x + w - r, y + h, x + r, y + h, x + r, y + h - r, 135],
        [x, y + h - r, x, y + r, x + r, y + r, 225],
      ]
      for (const [x1, y1, x2, y2, cx, cy, a] of borde) {
        const k = tramos([x1, y1], [x2, y2], 22)
        for (let j = 0; j <= k; j++) pts.push([x1 + ((x2 - x1) * j) / k, y1 + ((y2 - y1) * j) / k])
        pts.push([cx + Math.cos(grados(a)) * r, cy + Math.sin(grados(a)) * r])
      }
      return { pts, closed: true }
    },
  }

  function bezier(t, x0, y0, x1, y1, x2, y2, x3, y3) {
    const m = 1 - t
    return [m * m * m * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x3, m * m * m * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y3]
  }

  // Puntos sueltos, para las formas que cambian. Todas empiezan arriba y giran igual, así
  // cualquiera puede volverse cualquier otra si tienen el mismo número de puntos.
  function elipsePts(cx, cy, rx, ry, n = 16) {
    return Array.from({ length: n }, (_, i) => [cx + Math.sin((i / n) * TAU) * rx, cy - Math.cos((i / n) * TAU) * ry])
  }
  const circulo = (cx, cy, r, n = 16) => elipsePts(cx, cy, r, r, n)
  /** Una cápsula de a hasta b (un antebrazo, un dedo). */
  function capsula(a, b, ancho, n = 5) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0])
    const r = ancho / 2
    const pts = []
    for (let i = 0; i <= n; i++) pts.push([b[0] + Math.cos(ang - Math.PI / 2 + (i / n) * Math.PI) * r, b[1] + Math.sin(ang - Math.PI / 2 + (i / n) * Math.PI) * r])
    for (let i = 0; i <= n; i++) pts.push([a[0] + Math.cos(ang + Math.PI / 2 + (i / n) * Math.PI) * r, a[1] + Math.sin(ang + Math.PI / 2 + (i / n) * Math.PI) * r])
    return pts
  }
  /** Reparte n puntos a lo largo de un polígono cerrado, desde su primer vértice. */
  function remuestra(v, n) {
    const m = v.length
    const L = v.map((a, i) => Math.hypot(v[(i + 1) % m][0] - a[0], v[(i + 1) % m][1] - a[1]))
    const total = L.reduce((x, y) => x + y, 0)
    const out = []
    let k = 0
    let antes = 0
    for (let j = 0; j < n; j++) {
      const s = (j / n) * total
      while (k < m - 1 && antes + L[k] < s) antes += L[k++]
      const u = L[k] ? (s - antes) / L[k] : 0
      const a = v[k]
      const b = v[(k + 1) % m]
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u])
    }
    return out
  }
  /** Los vértices de un rectángulo de esquinas redondas, desde arriba a la izquierda. */
  function rectPts(x, y, w, h, r) {
    const v = []
    const esquina = (cx, cy, a0) => {
      for (let i = 1; i < 5; i++) v.push([cx + Math.cos(grados(a0 + i * 18)) * r, cy + Math.sin(grados(a0 + i * 18)) * r])
    }
    v.push([x + r, y], [x + w - r, y])
    esquina(x + w - r, y + r, -90)
    v.push([x + w, y + r], [x + w, y + h - r])
    esquina(x + w - r, y + h - r, 0)
    v.push([x + w - r, y + h], [x + r, y + h])
    esquina(x + r, y + h - r, 90)
    v.push([x, y + h - r], [x, y + r])
    esquina(x + r, y + r, 180)
    return v
  }
  const mezclaPts = (A, B, p) => A.map((a, i) => [a[0] + (B[i][0] - a[0]) * p, a[1] + (B[i][1] - a[1]) * p])
  const corre = (A, dx, dy) => A.map(([x, y]) => [x + dx, y + dy])
  const D = (pts, closed = true) => ({ pts, closed })

  /** Por cada punto: por dónde pasa la línea ahí y cuánto puede moverse. */
  function nudosDe(pts, closed) {
    const n = pts.length
    const s = [0]
    let L = 0
    for (let i = 1; i < n; i++) s.push((L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])))
    if (closed) L += Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1])
    const vecino = (i, paso) => {
      let j = i
      for (let k = 0; k < n; k++) {
        j += paso
        if (closed) j = (j + n) % n
        else if (j < 0 || j >= n) return pts[i]
        if (!igual(pts[j], pts[i])) return pts[j]
      }
      return pts[i]
    }
    return pts.map((p, i) => {
      const a = vecino(i, -1)
      const b = vecino(i, 1)
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      const punta = !closed && (i === 0 || i === n - 1) ? 0.45 : 1
      return [p[0], p[1], (b[0] - a[0]) / l, (b[1] - a[1]) / l, (s[i] / (L || 1)) * TAU, punta]
    })
  }

  function prepara({ pts, closed }, amp, r) {
    const giro = () => (r() < 0.5 ? -1 : 1)
    return {
      nudos: nudosDe(pts, closed),
      closed,
      amp,
      // cuántas ondas caben en la línea (enteras si es cerrada, para que empate)
      k: closed ? [2 + Math.floor(r() * 2), 5 + Math.floor(r() * 3), 9 + Math.floor(r() * 4)] : [0.55 + r() * 0.8, 1.9 + r() * 1.4, 3.7 + r() * 2],
      // dónde empieza cada una
      f: [r() * TAU, r() * TAU, r() * TAU, r() * TAU],
      // qué tan rápido corre (vueltas por segundo): dos lentas y una rápida
      v: [giro() * (0.85 + r() * 0.4) * TAU, giro() * (1.5 + r() * 0.8) * TAU, giro() * (2.7 + r() * 0.9) * TAU],
    }
  }

  /** El `d` de una o varias formas en el instante h. `fuerza` multiplica el temblor. */
  function dibuja(lista, h, fuerza = 1) {
    let d = ''
    for (const { nudos, closed, amp, k, f, v } of lista) {
      const n = nudos.length
      const q = nudos.map(([x, y, tx, ty, t, punta]) => {
        const a = amp * punta * fuerza
        const lado = a * (0.58 * Math.sin(k[0] * t + f[0] + v[0] * h) + 0.28 * Math.sin(k[1] * t + f[1] + v[1] * h) + 0.14 * Math.sin(k[2] * t + f[2] + v[2] * h))
        const largo = a * 0.35 * Math.sin(k[0] * t + f[3] + v[0] * h * 0.7)
        return [x - ty * lado + tx * largo, y + tx * lado + ty * largo]
      })
      const g = (i) => (closed ? q[((i % n) + n) % n] : q[Math.max(0, Math.min(n - 1, i))])
      d += `M${F(q[0][0])} ${F(q[0][1])}`
      for (let i = 0; i < (closed ? n : n - 1); i++) {
        const p0 = g(i - 1)
        const p1 = g(i)
        const p2 = g(i + 1)
        const p3 = g(i + 2)
        if (igual(p1, p2)) continue
        d += `C${F(p1[0] + (p2[0] - p0[0]) / 6)} ${F(p1[1] + (p2[1] - p0[1]) / 6)} ${F(p2[0] - (p3[0] - p1[0]) / 6)} ${F(p2[1] - (p3[1] - p1[1]) / 6)} ${F(p2[0])} ${F(p2[1])}`
      }
      if (closed) d += 'Z'
    }
    return d
  }

  const VIVOS = new Map()
  let serie = 1

  /** Un trazo vivo, listo para insertar. `n` le pone nombre para moverlo desde la escena. */
  function T(formas, { amp = 0.9, cls = 'ln', n = '' } = {}) {
    const id = serie++
    const r = azar(id * 7919)
    const lista = (Array.isArray(formas) ? formas : [formas]).map((f) => prepara(f, amp, r))
    VIVOS.set(String(id), lista)
    return `<path class="${cls}" data-hv="${id}"${n ? ` data-n="${n}"` : ''} pathLength="1" d="${dibuja(lista, 0)}"/>`
  }

  const G = (n, dentro) => `<g data-n="${n}">${dentro}</g>`

  // ═══════════════ Para animar ═══════════════
  const tope = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
  const tramo = (t, a, b) => tope((t - a) / (b - a))
  const mezcla = (a, b, p) => a + (b - a) * p
  const suave = (x) => x * x * (3 - 2 * x)
  const frena = (x) => 1 - Math.pow(1 - x, 3)
  const acelera = (x) => x * x
  /** Llega y se pasa un poco antes de asentarse. */
  const rebota = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2))
  /** Llega, se pasa y vibra hasta quedarse quieto. */
  const elastico = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (TAU / 3)) + 1)
  /** 0 → 1 → 0: un brinco, o tomar vuelo. */
  const salto = (p) => 4 * p * (1 - p)
  /** 1 justo en `c` y baja a 0 en `largo` segundos: un golpe. */
  const golpe = (t, c, largo = 0.3) => (t < c ? 0 : 1 - tope((t - c) / largo))
  /** Sube y baja alrededor de `c`: un parpadeo. */
  const campana = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w)
  /** Un brinco con cuerpo: se aplasta al despegar y al caer, se estira en el aire. */
  function brinco(p, alto) {
    if (p <= 0 || p >= 1) return { dy: 0, sx: 1, sy: 1 }
    const piso = Math.max(0, 1 - p / 0.16, 1 - (1 - p) / 0.16)
    const sy = 1 + 0.2 * salto(p) - 0.3 * piso
    return { dy: -alto * salto(p), sx: 1 / sy, sy }
  }
  /** Lo que se sacude la cámara después de un golpe en `c`. */
  const sacude = (t, c, fuerza = 2.4, largo = 0.32) => fuerza * golpe(t, c, largo) * Math.sin((t - c) * 70)

  function pon(el, { x = 0, y = 0, r = 0, sx = 1, sy = sx, ox = 0, oy = 0, o } = {}) {
    el.setAttribute('transform', `translate(${F(x + ox)} ${F(y + oy)}) rotate(${F(r)}) scale(${F(sx)} ${F(sy)}) translate(${-ox} ${-oy})`)
    if (o !== undefined) el.style.opacity = F(o)
  }
  /** Encuadra: (x, y) queda al centro del cuadro, con acercamiento z. (cx, cy) es el centro del lienzo: 160, 100 en uno de 320 × 200. */
  const camara = (el, x, y, z = 1, cx = 160, cy = 100) => el.setAttribute('transform', `translate(${cx} ${cy}) scale(${F(z)}) translate(${F(-x)} ${F(-y)})`)
  const traza = (el, p) => (el.style.strokeDashoffset = F(1.06 * (1 - p)))
  const ve = (el, o) => (el.style.opacity = F(o))
  /** Cambia los puntos de un trazo (siempre el mismo número): se mueve, se deforma o se vuelve otra cosa. */
  const forma = (el, pts) => (el._v.lista[0].nudos = nudosDe(pts, el._v.lista[0].closed))
  /** Qué tan fuerte hierve ese trazo (1 es lo normal). */
  const agita = (el, f) => (el._v.fuerza = f)
  const ojo = (el, x, y, rx, ry) => {
    el.setAttribute('cx', F(x))
    el.setAttribute('cy', F(y))
    el.setAttribute('rx', F(rx))
    el.setAttribute('ry', F(Math.max(0.3, ry)))
  }

  const punto = (r = 5, n = 'pt') => G(n, T(P.circ(0, 0, r), { cls: 'azul', amp: 0.4 }))
  const rayos = (n, lineas) => G(n, T(lineas.map(([a, b, c, d]) => P.linea(a, b, c, d, 3)), { cls: 'ln fino', amp: 0.3 }))
  /** Rayos alrededor de (0, 0), de r0 a r1. */
  const corona = (n, k, r0, r1) => rayos(n, Array.from({ length: k }, (_, i) => [Math.cos((i / k) * TAU + 0.3) * r0, Math.sin((i / k) * TAU + 0.3) * r0, Math.cos((i / k) * TAU + 0.3) * r1, Math.sin((i / k) * TAU + 0.3) * r1]))

  // ═══════════════ La mano ═══════════════
  // Un puño visto de frente, con la muñeca en (0, 0) y los nudillos hacia arriba: la palma,
  // las tres rayas que separan los dedos, la línea donde se doblan, el pulgar cruzado por
  // delante y el índice, que puede estirarse.
  const PALMA = [[-10.5, 3.5], [-12.2, -8], [-10.8, -19], [-5.2, -24.2], [1.2, -24.9], [7.5, -23.7], [11.5, -18.4], [12.4, -8], [10.4, 3.5], [0, 5.5]]
  const indice = (e) => capsula([-7.8, -18], [-7.8, -19 - 27 * e], 7.6, 4)
  function manoSvg(k) {
    return G(
      k,
      T(D(indice(0)), { cls: 'ln tapa', amp: 0.25, n: k + 'i' }) +
        T(P.suave(PALMA, true), { cls: 'ln tapa', amp: 0.35 }) +
        T([P.linea(-4.8, -23.6, -5.2, -14.2, 3), P.linea(1.2, -24.4, 1, -14.5, 3), P.linea(7, -23.2, 7.2, -14.7, 3)], { cls: 'ln fino', amp: 0.15 }) +
        T(P.suave([[-10.8, -14.6], [-7.9, -13.3], [-5.1, -14.2], [-2, -13.3], [1, -14.5], [4.2, -13.5], [7.2, -14.7], [9.7, -13.7], [11.8, -15.2]]), { cls: 'ln fino', amp: 0.15 }) +
        T(D(capsula([-11.3, -1.2], [1.6, -8.4], 7.4, 4)), { cls: 'ln tapa', amp: 0.25 }),
    )
  }

  // ═══════════════ Proyector ═══════════════
  // Cada <svg> montado es un lienzo. Un solo bucle de animación los mueve a todos; lo que no
  // está a la vista no se calcula.
  const LIENZOS = []
  const DE = new Map()
  const reducido = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  const ojos = 'IntersectionObserver' in global ? new IntersectionObserver((vistos) => vistos.forEach((v) => DE.get(v.target) && (DE.get(v.target).visto = v.isIntersecting)), { rootMargin: '120px' }) : null
  let fijo = null
  let andando = false

  /**
   * Monta una obra en un <svg> vacío y la echa a andar. Una obra es:
   *  · un bucle  { dur, cartel, svg(), paso(q, t) }
   *  · un corto  { planos: [{ nombre, dur, svg(), paso(q, t) }], cartel, abre: [x, y], cierra: [x, y] }
   * `q(nombre)` devuelve el elemento con ese `data-n`. En un corto, `t` son los segundos desde
   * que empezó ese plano. `cartel` es el instante que se muestra quieto si la persona pidió
   * menos movimiento. `abre` y `cierra` son opcionales: de dónde sale y a dónde llega el telón.
   * `alAvanzar(i, avance, planos)` sirve para pintar una pista de tiempo propia.
   */
  function monta(svg, obra, { alAvanzar } = {}) {
    const corto = obra.planos ? obra : null
    if (corto) {
      corto.dur = corto.planos.reduce((s, p) => s + p.dur, 0)
      svg.innerHTML = corto.planos.map((p, i) => `<g data-plano="${i}">${p.svg()}</g>`).join('') + (corto.cierra || corto.abre ? '<circle class="telon" data-n="telon" r="0"/>' : '')
    } else svg.innerHTML = obra.svg()
    const cache = new Map()
    const q = (n) => cache.get(n) || (cache.set(n, svg.querySelector(`[data-n="${n}"]`)), cache.get(n))
    const vivos = [...svg.querySelectorAll('[data-hv]')].map((el) => {
      const g = el.closest('[data-plano]')
      return (el._v = { el, lista: VIVOS.get(el.dataset.hv), fuerza: 1, plano: g ? +g.dataset.plano : -1 })
    })
    const l = { svg, q, vivos, corto, bucle: corto ? null : obra, visto: true, plano: -1, grupos: [...svg.querySelectorAll('[data-plano]')], alAvanzar }
    LIENZOS.push(l)
    DE.set(svg, l)
    if (ojos) ojos.observe(svg)
    if (reducido || fijo !== null) pinta(fijo || 0, true)
    else if (!andando) {
      andando = true
      requestAnimationFrame(cuadro)
    }
    return l
  }

  /** Un corto en el instante s: encuentra el plano, lo muestra, lo mueve y corre el telón. */
  function proyecta(l, s) {
    const c = l.corto
    const u = s % c.dur
    let t = u
    let i = 0
    while (i < c.planos.length - 1 && t >= c.planos[i].dur) t -= c.planos[i++].dur
    if (l.plano !== i) {
      l.grupos.forEach((g, k) => (g.style.display = k === i ? '' : 'none'))
      l.plano = i
    }
    c.planos[i].paso(l.q, t)
    if (l.alAvanzar) l.alAvanzar(i, t / c.planos[i].dur, c.planos)
    const telon = l.q('telon')
    if (!telon) return
    // El telón es el punto: al final crece desde donde quedó y al empezar se encoge hasta
    // donde va a pasar lo primero.
    const abre = c.abre ? 1 - frena(tramo(u, 0, 0.55)) : 0
    const cierra = c.cierra ? acelera(tramo(u, c.dur - 0.5, c.dur)) : 0
    const [x, y] = cierra > 0 ? c.cierra : c.abre || c.cierra
    telon.setAttribute('cx', x)
    telon.setAttribute('cy', y)
    telon.setAttribute('r', F(400 * Math.max(abre, cierra)))
  }

  /** Pinta todo en el instante s (segundos). */
  function pinta(s, todo) {
    const hervor = modo === 'quieto' ? 0 : modo === 'treses' ? Math.floor(s * TRESES) * 7.31 : s
    const quieto = reducido && fijo === null
    for (let k = LIENZOS.length - 1; k >= 0; k--) {
      const l = LIENZOS[k]
      if (!l.svg.isConnected) {
        LIENZOS.splice(k, 1)
        DE.delete(l.svg)
        continue
      }
      if (!l.visto && !todo) continue
      if (l.corto) proyecta(l, quieto ? l.corto.cartel || 0 : s)
      else l.bucle.paso(l.q, quieto ? l.bucle.cartel || 0 : s % l.bucle.dur)
      for (const v of l.vivos) if (v.plano < 0 || v.plano === l.plano) v.el.setAttribute('d', dibuja(v.lista, hervor, v.fuerza))
    }
  }
  function cuadro(ms) {
    if (fijo !== null) return
    pinta(ms / 1000)
    if (LIENZOS.length) requestAnimationFrame(cuadro)
    else andando = false
  }

  global.Trazo = {
    // formas y trazos
    P, D, T, G, elipsePts, circulo, capsula, remuestra, rectPts, mezclaPts, corre, bezier,
    // tiempo
    tope, tramo, mezcla, suave, frena, acelera, rebota, elastico, salto, golpe, campana, brinco, sacude,
    // mover
    pon, camara, traza, ve, forma, agita, ojo,
    // piezas hechas
    punto, rayos, corona, manoSvg, indice,
    // utilería
    TAU, F, grados,
    monta,
    /** 'suave' (60 cuadros), 'treses' (8 dibujos por segundo) o 'quieto'. */
    modo(v) {
      modo = v
      if (reducido || fijo !== null) pinta(fijo || 0, true)
    },
    /** Detiene todo en el segundo s: para revisar un instante o fotografiarlo. */
    fija(s) {
      fijo = s
      pinta(s, true)
    },
    sigue() {
      fijo = null
      andando = true
      requestAnimationFrame(cuadro)
    },
  }
})(window)
