import gsap from 'gsap'
import { boil, P } from '../core/boil.js'

// Viñetas: la ilustración animada que encabeza cada sección del CRM. Trazo a mano sobre una
// tarjeta de color, tres planos por viñeta (general, detalle, otra perspectiva) y, entre plano
// y plano, un iris que cierra y abre, como la cortina del CRM.
//
// Cada plano declara su dibujo (svg), su movimiento de cámara y su animación:
//   cam: [escala, x, y, giro] de inicio → [escala, x, y] de fin
//   anima(tl, g, t): agrega a la línea de tiempo lo que pasa dentro del plano

const W = 240
const H = 100
const DURA = 3.6
const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

// ───────────────────────── Utilería de dibujo ─────────────────────────

/** Un trazo que hierve y se dibuja. */
const T = (formas, grosor = 2.4, cls = '') => boil(formas, { amp: 0.45, cls: `draw ${cls}`, attrs: `stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round"` })

/** Una línea quebrada con puntos intermedios, para que el trazo tiemble parejo. */
function poli(pts, cerrado = false, paso = 13) {
  const out = []
  const n = pts.length
  for (let i = 0; i < n - (cerrado ? 0 : 1); i++) {
    const a = pts[i]
    const b = pts[(i + 1) % n]
    const k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / paso))
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k])
  }
  if (!cerrado) out.push(pts[n - 1])
  return { pts: out, closed: cerrado }
}
const caja = (x, y, w, h) => poli([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true)
const estrella = (cx, cy, r) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2
    const rr = i % 2 ? r * 0.45 : r
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`
  })
  return `<polygon points="${pts.join(' ')}"/>`
}
const CORAZON = 'M0 6C-9 -1 -9 -8 -4.5 -8C-2 -8 0 -6 0 -4C0 -6 2 -8 4.5 -8C9 -8 9 -1 0 6Z'
const PALOMA = 'M-8 0L-2 6L9 -7'

// Atajos de animación.
const dibuja = (tl, els, t, d = 0.9, e = 0.1) => tl.fromTo(els, { '--draw': 1.06 }, { '--draw': 0, duration: d, ease: 'expo.inOut', stagger: e }, t)
const brota = (tl, els, t, e = 0.12) => tl.fromTo(els, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.55, ease: 'back.out(2.6)', stagger: e }, t)
const q = (g, s) => g.querySelectorAll(s)

// El lenguaje común: una cuadrícula tenue de fondo, una ruta que se traza, el punto que la
// recorre y marcas que brotan a su paso. Como un mapa que se va explicando solo.
const REJILLA = (cls = 'vn-t') => T([P.line(0, 26, 240, 20), P.line(0, 74, 240, 80), P.line(56, 0, 48, 100), P.line(124, 0, 120, 100), P.line(190, 0, 198, 100)], 1.1, cls)
const RUTA = (pts, cls = 'vn-w', grosor = 2.6) => T(poli(pts), grosor, `${cls} vn-ruta`)
const VIAJERO = (cls = '') => `<g class="vn-viajero ${cls}"><circle class="vn-va" r="6.5"/><circle class="vn-vb" r="3.6"/></g>`
const MARCA = (x, y, cls = '') => `<g class="vn-marca-g" transform="translate(${x} ${y})"><g class="vn-brote ${cls}"><circle class="vn-ma" r="7"/><circle class="vn-mb" r="3"/></g></g>`
const BANDERA = (x, y) => `<g transform="translate(${x} ${y})"><g class="vn-brote"><line class="vn-asta" x1="0" y1="0" x2="0" y2="-17"/><path class="vn-tela" d="M0 -17h12l-3 4l3 4H0Z"/></g></g>`
const MONEDA = (x, y) => `<g transform="translate(${x} ${y})"><g class="vn-brote"><circle class="vn-famarillo" r="7.5"/><path class="vn-pesos" transform="scale(0.55)" d="M4 -6C-6 -9 -7 -1 0 0C7 1 6 9 -4 6M0 -10V10"/></g></g>`
const enArco = (cx, cy, r, a0, a1, n = 14) => Array.from({ length: n + 1 }, (_, i) => ({ x: cx + Math.cos(((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180) * r, y: cy + Math.sin(((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180) * r }))
const enCurva = (p0, p1, p2, p3, n = 14) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const m = 1 - t
    return { x: m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], y: m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1] }
  })
/** El punto recorre una lista de puntos. */
const viaja = (tl, el, pts, t, d = 2.2, ease = 'power1.inOut') => {
  const P0 = pts.map((p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p))
  tl.fromTo(el, { x: P0[0].x, y: P0[0].y }, { keyframes: P0.slice(1).map((p) => ({ x: p.x, y: p.y })), duration: d, ease }, t)
}
/** Las marcas brotan una tras otra, a tiempo con el paso del punto. */
const brotan = (tl, els, t, cada = 0.7) => tl.fromTo(els, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: cada }, t)

// ───────────────────────── Las viñetas ─────────────────────────

const VINETAS = {
  // Prospectos: del mapa, a la puerta, al embudo.
  prospectos: {
    color: 'azul',
    planos: [
      {
        // Desde arriba: el mapa. El punto recorre la ruta de visita en visita.
        cam: [1.22, -16, 6, 0, 1.08, 10, -3],
        svg: `${T([P.line(0, 28, 240, 20), P.line(0, 72, 240, 80), P.line(58, 0, 50, 100), P.line(150, 0, 162, 100)], 1.1, 'vn-t')}
          ${T(poli([[28, 84], [70, 52], [118, 60], [168, 32], [214, 46]]), 2.4, 'vn-w vn-ruta')}
          ${[[70, 52], [168, 32], [214, 46]].map(([x, y]) => `<g class="vn-pin" transform="translate(${x} ${y})"><g><path class="vn-fw" d="M0 0C-7 -9 -9 -13 -9 -17a9 9 0 1 1 18 0c0 4 -2 8 -9 17Z"/><circle class="vn-fk" cy="-17" r="3.2"/></g></g>`).join('')}
          <g class="vn-viajero"><circle class="vn-fw" r="6.5"/><circle class="vn-fk" r="3.6"/></g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2.2, 0)
          tl.fromTo(q(g, '.vn-pin > g'), { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.7 }, t + 0.55)
          tl.fromTo(q(g, '.vn-viajero'), { x: 28, y: 84 }, { keyframes: [{ x: 70, y: 52 }, { x: 118, y: 60 }, { x: 168, y: 32 }, { x: 214, y: 46 }], duration: 2.2, ease: 'power1.inOut' }, t + 0.1)
        },
      },
      {
        // De cerca: la cuadra. El punto llega al local, toca, y le dicen que sí.
        cam: [1.3, 26, -8, 0, 1.12, -10, 0],
        svg: `${T([caja(14, 8, 62, 30), caja(92, 8, 54, 30), caja(162, 8, 64, 30), caja(14, 62, 84, 32)], 1.3, 'vn-t')}
          <rect class="vn-local" x="116" y="62" width="110" height="32" rx="3"/>
          ${T([caja(116, 62, 110, 32)], 2.2, 'vn-w')}
          ${RUTA([[0, 50], [60, 50], [100, 51], [136, 50], [150, 56]])}
          <circle class="vn-onda2" cx="150" cy="58" r="6"/><circle class="vn-onda2" cx="150" cy="58" r="6"/>
          <g transform="translate(150 44)"><g class="vn-brote"><path class="vn-fw" d="M0 0C-7 -9 -9 -13 -9 -17a9 9 0 1 1 18 0c0 4 -2 8 -9 17Z"/><path class="vn-corazon" transform="translate(0 -17) scale(0.62)" d="${CORAZON}"/></g></g>
          ${VIAJERO()}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8, 0.06)
          dibuja(tl, q(g, '.vn-w:not(.vn-ruta)'), t, 0.7)
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 1.5, 0)
          viaja(tl, q(g, '.vn-viajero'), [[0, 50], [60, 50], [100, 51], [136, 50], [150, 56]], t + 0.1, 1.5)
          q(g, '.vn-onda2').forEach((c, i) => tl.fromTo(c, { attr: { r: 6 }, autoAlpha: 0.9 }, { attr: { r: 30 }, autoAlpha: 0, duration: 0.7, ease: 'power1.out', immediateRender: false }, t + 1.6 + i * 0.35))
          tl.fromTo(q(g, '.vn-local'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 2.1)
          brotan(tl, q(g, '.vn-brote'), t + 2.3)
        },
      },
      {
        // Las estaciones: de «por visitar» a «cliente». El punto las recorre y la última es estrella.
        cam: [1.18, -14, 4, -3, 1.04, 8, 0],
        svg: `${REJILLA()}
          ${RUTA([[20, 72], [66, 46], [112, 62], [158, 34], [206, 48]], 'vn-w', 3)}
          ${[[20, 72], [66, 46], [112, 62], [158, 34]].map(([x, y]) => MARCA(x, y)).join('')}
          <g transform="translate(206 48)"><g class="vn-brote vn-famarillo">${estrella(0, 0, 13)}</g></g>
          ${VIAJERO()}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2.3, 0)
          viaja(tl, q(g, '.vn-viajero'), [[20, 72], [66, 46], [112, 62], [158, 34], [206, 48]], t + 0.1, 2.3)
          tl.fromTo(q(g, '.vn-brote'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.56 }, t + 0.15)
          tl.to(q(g, '.vn-viajero'), { autoAlpha: 0, duration: 0.2 }, t + 2.4).set(q(g, '.vn-viajero'), { autoAlpha: 1 }, t)
        },
      },
    ],
  },

  // Agenda: la semana, el día y el encuentro.
  agenda: {
    color: 'amarillo',
    planos: [
      {
        // La semana, de lado a lado: el punto la recorre y cada cita deja su bandera.
        cam: [1.2, -14, 2, 0, 1.06, 10, -2],
        svg: `${T([P.line(10, 80, 230, 80)], 2.2, 'vn-k')}
          ${T(Array.from({ length: 8 }, (_, i) => P.line(16 + i * 30, 76, 16 + i * 30, 86, 2)), 1.6, 'vn-k')}
          ${REJILLA('vn-t2')}
          ${RUTA([[16, 64], [52, 40], [88, 58], [124, 28], [160, 52], [196, 34], [226, 46]], 'vn-k')}
          ${[[52, 40], [124, 28], [196, 34]].map(([x, y]) => BANDERA(x, y)).join('')}
          ${VIAJERO('vn-viajero--azul')}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k:not(.vn-ruta)'), t - 0.2, 0.7, 0.03)
          dibuja(tl, q(g, '.vn-t2'), t - 0.1, 0.8)
          const pts = [[16, 64], [52, 40], [88, 58], [124, 28], [160, 52], [196, 34], [226, 46]]
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2.4, 0)
          viaja(tl, q(g, '.vn-viajero'), pts, t + 0.1, 2.4)
          brotan(tl, q(g, '.vn-brote'), t + 0.55, 0.8)
        },
      },
      {
        // El día: el sol recorre su arco, de la mañana a la tarde, y pasa por cada cita.
        cam: [1.32, 0, 10, 0, 1.08, 0, 0],
        svg: `${T([P.line(20, 88, 220, 88)], 2.2, 'vn-k')}
          ${T([P.arc(120, 88, 78, 180, 360, 26)], 1.4, 'vn-t2')}
          ${Array.from({ length: 9 }, (_, i) => `<line class="vn-marca" x1="120" y1="2" x2="120" y2="7" transform="rotate(${-80 + i * 20} 120 88)"/>`).join('')}
          ${T([P.arc(120, 88, 78, 180, 360, 26)], 3, 'vn-k vn-ruta')}
          ${[232, 300].map((a) => BANDERA(120 + Math.cos((a * Math.PI) / 180) * 78, 88 + Math.sin((a * Math.PI) / 180) * 78)).join('')}
          <g class="vn-viajero"><circle class="vn-fw" r="9"/><circle class="vn-fazul" r="5"/></g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k:not(.vn-ruta), .vn-t2'), t - 0.2, 0.7, 0.05)
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2.5, 0)
          viaja(tl, q(g, '.vn-viajero'), enArco(120, 88, 78, 180, 360, 18), t + 0.1, 2.5, 'sine.inOut')
          brotan(tl, q(g, '.vn-brote'), t + 0.95, 0.95)
        },
      },
      {
        // El encuentro: dos caminos que llegan al mismo punto. Cita confirmada.
        cam: [1.08, 0, 0, 3, 1.26, 0, 2],
        svg: `${REJILLA('vn-t2')}
          ${T([P.curve(8, 86, 50, 86, 70, 50, 120, 50, 16)], 2.8, 'vn-k vn-ruta')}
          ${T([P.curve(232, 14, 190, 14, 170, 50, 120, 50, 16)], 2.8, 'vn-azul vn-ruta')}
          <g class="vn-viajero vn-ida"><circle class="vn-fw" r="6.5"/><circle class="vn-fk" r="3.6"/></g>
          <g class="vn-viajero vn-vuelta"><circle class="vn-fw" r="6.5"/><circle class="vn-fazul" r="3.6"/></g>
          <circle class="vn-onda3" cx="120" cy="50" r="8"/>
          <g class="vn-sello" transform="translate(120 50)"><circle class="vn-fazul" r="16"/><path class="vn-palo" d="${PALOMA}"/></g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t2'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 1.7, 0)
          viaja(tl, q(g, '.vn-ida'), enCurva([8, 86], [50, 86], [70, 50], [120, 50]), t + 0.1, 1.7)
          viaja(tl, q(g, '.vn-vuelta'), enCurva([232, 14], [190, 14], [170, 50], [120, 50]), t + 0.1, 1.7)
          tl.fromTo(q(g, '.vn-onda3'), { attr: { r: 8 }, autoAlpha: 0.9 }, { attr: { r: 46 }, autoAlpha: 0, duration: 0.8, ease: 'power1.out', immediateRender: false }, t + 1.75)
          tl.fromTo(q(g, '.vn-sello'), { scale: 0, rotation: -50, svgOrigin: '120 50' }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.6)' }, t + 1.8)
        },
      },
    ],
  },

  // Cobranza: la gráfica, el anillo y el cobro que llega.
  cobranza: {
    color: 'verde',
    planos: [
      {
        // La gráfica se traza sola, con el punto en la punta; en cada pico, una moneda.
        cam: [1.22, -14, -6, 0, 1.06, 8, 2],
        svg: `${T([P.line(0, 86, 240, 86), P.line(0, 62, 240, 62), P.line(0, 38, 240, 38), P.line(0, 14, 240, 14)], 1.1, 'vn-t')}
          ${RUTA([[14, 82], [50, 66], [82, 72], [118, 46], [150, 54], [186, 26], [228, 12]], 'vn-w', 3)}
          ${[[50, 66], [118, 46], [186, 26]].map(([x, y]) => MONEDA(x, y - 13)).join('')}
          ${VIAJERO()}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8, 0.08)
          const pts = [[14, 82], [50, 66], [82, 72], [118, 46], [150, 54], [186, 26], [228, 12]]
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2.4, 0)
          viaja(tl, q(g, '.vn-viajero'), pts, t + 0.1, 2.4)
          brotan(tl, q(g, '.vn-brote'), t + 0.5, 0.8)
        },
      },
      {
        // De cerca: el anillo se llena. Cuánto va al corriente.
        cam: [1.42, 0, 0, -20, 1.1, 0, 0],
        svg: `${T([P.circle(120, 50, 34, 26)], 1.4, 'vn-t')}
          ${T([P.arc(120, 50, 34, -90, 205, 26)], 6, 'vn-w vn-ruta')}
          ${VIAJERO()}
          <g class="vn-sello" transform="translate(120 50)"><circle class="vn-fw" r="15"/><path class="vn-palo vn-palo--k" d="${PALOMA}"/></g>
          <g transform="translate(176 20)"><g class="vn-brote vn-famarillo">${estrella(0, 0, 8)}</g></g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2, 0)
          viaja(tl, q(g, '.vn-viajero'), enArco(120, 50, 34, -90, 205, 20), t + 0.1, 2, 'sine.inOut')
          tl.fromTo(q(g, '.vn-sello'), { scale: 0, svgOrigin: '120 50' }, { scale: 1, duration: 0.55, ease: 'back.out(2.8)' }, t + 1.9)
          tl.fromTo(q(g, '.vn-brote'), { scale: 0, rotation: -90, transformOrigin: '50% 50%' }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.8)' }, t + 2.25)
        },
      },
      {
        // El cobro llega: las monedas viajan del cliente a Soma, una tras otra.
        cam: [1.05, 10, 4, 2, 1.18, -8, -2],
        svg: `${REJILLA()}
          ${T([P.curve(34, 74, 90, 96, 150, 2, 206, 30, 18)], 2.6, 'vn-w vn-ruta')}
          ${MARCA(34, 74)}
          <g class="vn-soma" transform="translate(206 30)"><circle class="vn-fw" r="15"/><circle class="vn-fazul" r="6.5"/></g>
          ${[0, 1, 2].map(() => `<g class="vn-corre"><circle class="vn-famarillo" r="6.5"/></g>`).join('')}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t, 1, 0)
          brotan(tl, q(g, '.vn-brote'), t + 0.1)
          const camino = enCurva([34, 74], [90, 96], [150, 2], [206, 30], 16)
          q(g, '.vn-corre').forEach((c, i) => {
            const t0 = t + 0.7 + i * 0.6
            tl.set(c, { autoAlpha: 0 }, t)
            tl.set(c, { autoAlpha: 1 }, t0)
            viaja(tl, c, camino, t0, 0.9, 'power1.in')
            tl.set(c, { autoAlpha: 0 }, t0 + 0.9)
            tl.fromTo(q(g, '.vn-soma'), { scale: 1, svgOrigin: '206 30' }, { scale: 1.25, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }, t0 + 0.88)
          })
        },
      },
    ],
  },

  // Sistemas: la red, el pulso y el arreglo a distancia.
  sistemas: {
    color: 'tinta',
    planos: [
      {
        // La red, desde arriba: Soma al centro y la señal viajando a cada sistema.
        cam: [1.24, 0, 0, -6, 1.04, 0, 0],
        svg: `${REJILLA()}
          ${[[40, 22], [202, 26], [188, 80], [48, 76]].map(([x, y]) => T([P.line(120, 50, x, y)], 2, 'vn-w vn-ruta')).join('')}
          ${[[40, 22], [202, 26], [188, 80], [48, 76]].map(([x, y]) => `<g transform="translate(${x} ${y})"><g class="vn-brote"><rect class="vn-fw" x="-12" y="-9" width="24" height="18" rx="3"/><rect class="vn-fk" x="-12" y="-9" width="24" height="5" rx="2"/><circle class="vn-luz" cx="6" cy="3" r="2.6"/></g></g>`).join('')}
          ${[0, 1, 2, 3].map(() => `<circle class="vn-pulso" r="3.4"/>`).join('')}
          <circle class="vn-fw" cx="120" cy="50" r="13"/><circle class="vn-fazul" cx="120" cy="50" r="6"/>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t, 0.8, 0.1)
          tl.fromTo(q(g, '.vn-brote'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2.6)', stagger: 0.1 }, t + 0.3)
          const destinos = [[40, 22], [202, 26], [188, 80], [48, 76]]
          const luces = q(g, '.vn-luz')
          q(g, '.vn-pulso').forEach((c, i) => {
            for (const vuelta of [0, 1]) {
              const t0 = t + 0.9 + i * 0.16 + vuelta * 1.05
              tl.fromTo(c, { x: 120, y: 50, autoAlpha: 1 }, { x: destinos[i][0], y: destinos[i][1], duration: 0.6, ease: 'power1.in' }, t0)
              tl.set(c, { autoAlpha: 0 }, t0 + 0.6)
              tl.fromTo(luces[i], { fill: '#5d5f6b' }, { fill: '#1fce6d', duration: 0.12, yoyo: true, repeat: 3 }, t0 + 0.6)
            }
            tl.set(c, { autoAlpha: 0 }, t)
          })
        },
      },
      {
        // De cerca: el pulso. Mientras late, el sistema está vivo.
        cam: [1.36, 30, 0, 0, 1.12, -24, 0],
        svg: `${T([P.line(0, 20, 240, 20), P.line(0, 50, 240, 50), P.line(0, 80, 240, 80), ...[30, 80, 130, 180, 230].map((x) => P.line(x, 0, x, 100))], 1, 'vn-t')}
          ${T(poli([[0, 54], [58, 54], [70, 54], [80, 26], [92, 82], [104, 42], [114, 54], [162, 54], [174, 38], [184, 68], [194, 54], [240, 54]], false, 8), 3, 'vn-azul vn-ruta')}
          ${VIAJERO()}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.7, 0.03)
          const pts = [[0, 54], [58, 54], [70, 54], [80, 26], [92, 82], [104, 42], [114, 54], [162, 54], [174, 38], [184, 68], [194, 54], [240, 54]]
          dibuja(tl, q(g, '.vn-ruta'), t + 0.1, 2.5, 0)
          viaja(tl, q(g, '.vn-viajero'), pts, t + 0.1, 2.5, 'none')
        },
      },
      {
        // El arreglo a distancia: un sistema avisa que algo anda mal, llega la señal, y vuelve.
        cam: [1.04, 4, 0, 0, 1.14, -4, 0],
        svg: `${REJILLA()}
          ${RUTA([[44, 60], [96, 60], [120, 38], [172, 38]], 'vn-w')}
          <g class="vn-soma" transform="translate(44 60)"><circle class="vn-fw" r="13"/><circle class="vn-fazul" r="6"/></g>
          <g class="vn-enfermo" transform="translate(172 38)"><rect class="vn-fw" x="-17" y="-13" width="34" height="26" rx="4"/><rect class="vn-fk" x="-17" y="-13" width="34" height="7" rx="3"/><circle class="vn-estado" cy="4" r="6"/><path class="vn-palo vn-cura" transform="translate(0 4) scale(0.55)" d="${PALOMA}"/></g>
          <circle class="vn-onda2" cx="172" cy="38" r="10"/>
          <circle class="vn-pulso" r="4"/>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t - 0.2, 0.8)
          dibuja(tl, q(g, '.vn-ruta'), t, 0.9, 0)
          tl.fromTo(q(g, '.vn-enfermo'), { x: 0 }, { keyframes: { x: [0, -2, 2, -2, 2, 0] }, duration: 0.45, ease: 'none', repeat: 1, repeatDelay: 0.2 }, t + 0.2)
          tl.fromTo(q(g, '.vn-estado'), { fill: '#ff574a' }, { fill: '#1fce6d', duration: 0.25 }, t + 2.05)
          tl.fromTo(q(g, '.vn-cura'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, t + 2.1)
          viaja(tl, q(g, '.vn-pulso'), [[44, 60], [96, 60], [120, 38], [172, 38]], t + 1.1, 0.9, 'power1.inOut')
          tl.set(q(g, '.vn-pulso'), { autoAlpha: 0 }, t).set(q(g, '.vn-pulso'), { autoAlpha: 1 }, t + 1.1).set(q(g, '.vn-pulso'), { autoAlpha: 0 }, t + 2)
          tl.fromTo(q(g, '.vn-onda2'), { attr: { r: 10 }, autoAlpha: 0.9 }, { attr: { r: 44 }, autoAlpha: 0, duration: 0.8, ease: 'power1.out', immediateRender: false }, t + 2.05)
        },
      },
    ],
  },

  // Ajustes: los engranes, los controles y la llave.
  ajustes: {
    color: 'papel',
    planos: [
      {
        // Detalle: dos engranes que se mueven uno al otro.
        cam: [1.3, 8, 0, 0, 1.08, -4, 0],
        svg: `<g class="vn-engrane" transform="translate(98 56)"><g>${T([P.circle(0, 0, 24, 20), P.circle(0, 0, 8, 9), ...Array.from({ length: 10 }, (_, i) => P.line(Math.cos((i / 10) * 6.283) * 24, Math.sin((i / 10) * 6.283) * 24, Math.cos((i / 10) * 6.283) * 32, Math.sin((i / 10) * 6.283) * 32, 2))], 2.6, 'vn-k')}</g></g>
          <g class="vn-engrane vn-engrane--b" transform="translate(152 34)"><g>${T([P.circle(0, 0, 14, 14), P.circle(0, 0, 5, 7), ...Array.from({ length: 7 }, (_, i) => P.line(Math.cos((i / 7) * 6.283) * 14, Math.sin((i / 7) * 6.283) * 14, Math.cos((i / 7) * 6.283) * 21, Math.sin((i / 7) * 6.283) * 21, 2))], 2.4, 'vn-k')}</g></g>
          <circle class="vn-fazul" cx="98" cy="56" r="3.6"/>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.9, 0.1)
          tl.fromTo(q(g, '.vn-engrane:not(.vn-engrane--b) > g'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: 150, duration: 3.4, ease: 'power1.inOut' }, t)
          tl.fromTo(q(g, '.vn-engrane--b > g'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: -214, duration: 3.4, ease: 'power1.inOut' }, t)
        },
      },
      {
        // De frente: los controles se acomodan.
        cam: [1.05, 0, 0, -3, 1.18, 0, 0],
        svg: `${[26, 50, 74].map((y) => T([P.line(56, y, 184, y)], 2.4, 'vn-k')).join('')}
          ${[[26, 0], [50, 1], [74, 2]].map(([y, i]) => `<line class="vn-lleno" data-i="${i}" x1="56" y1="${y}" x2="56" y2="${y}"/><circle class="vn-perilla ${i === 1 ? 'vn-fazul' : 'vn-fk'}" data-i="${i}" cx="56" cy="${y}" r="7.5"/>`).join('')}`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.6, 0.1)
          const metas = [92, 58, 112]
          q(g, '.vn-perilla').forEach((c, i) => {
            tl.fromTo(c, { x: 0 }, { x: metas[i], duration: 0.8, ease: 'back.out(1.6)' }, t + 0.4 + i * 0.35)
            tl.to(c, { x: metas[i] - 22 + i * 16, duration: 0.6, ease: 'power2.inOut' }, t + 1.9 + i * 0.15)
          })
          q(g, '.vn-lleno').forEach((l, i) => {
            tl.fromTo(l, { attr: { x2: 56 } }, { attr: { x2: 56 + metas[i] }, duration: 0.8, ease: 'back.out(1.6)' }, t + 0.4 + i * 0.35)
            tl.to(l, { attr: { x2: 56 + metas[i] - 22 + i * 16 }, duration: 0.6, ease: 'power2.inOut' }, t + 1.9 + i * 0.15)
          })
        },
      },
      {
        // Detalle: la llave entra, gira y el candado se abre.
        cam: [1.3, 0, 4, 0, 1.06, 0, 0],
        svg: `<g class="vn-arco">${T([P.arc(150, 44, 15, 180, 360, 12), P.line(135, 44, 135, 54), P.line(165, 44, 165, 54)], 3, 'vn-k')}</g>
          <rect class="vn-fk" x="126" y="52" width="48" height="36" rx="6"/>
          <circle class="vn-fpapel" cx="150" cy="68" r="5"/>
          <g class="vn-llave"><g>${T([P.circle(60, 68, 10, 12), P.line(70, 68, 112, 68), P.line(100, 68, 100, 76), P.line(108, 68, 108, 75)], 2.8, 'vn-k')}</g></g>
          <g class="vn-brillos" transform="translate(150 22)">${T([P.line(-14, 2, -22, -4), P.line(0, -4, 0, -13), P.line(14, 2, 22, -4)], 2.4, 'vn-azul')}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.6, 0.04)
          tl.fromTo(q(g, '.vn-llave'), { x: -46 }, { x: 34, duration: 0.8, ease: 'power3.out' }, t + 0.3)
          // La llave gira sobre su propio eje: se ve como que se adelgaza y vuelve.
          tl.fromTo(q(g, '.vn-llave > g'), { scaleY: 1, svgOrigin: '90 68' }, { keyframes: { scaleY: [1, 0.15, 1] }, duration: 0.45, ease: 'power1.inOut' }, t + 1.3)
          tl.fromTo(q(g, '.vn-arco'), { y: 0, rotation: 0, svgOrigin: '165 54' }, { y: -9, rotation: 14, duration: 0.4, ease: 'back.out(3)' }, t + 1.75)
          tl.fromTo(q(g, '.vn-brillos'), { autoAlpha: 0, scale: 0.5, svgOrigin: '150 22' }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(3)', yoyo: true, repeat: 1, repeatDelay: 0.5 }, t + 2)
        },
      },
    ],
  },
}

// ───────────────────────── Marcado y animación ─────────────────────────

// Dónde cierra y abre el iris en cada corte: nunca dos veces en el mismo sitio.
const IRIS = [
  [120, 50],
  [196, 22],
  [44, 78],
]

/** El marcado de una viñeta. Siempre sale idéntico (los trazos usan la semilla de la vista). */
export function vineta(nombre) {
  const v = VINETAS[nombre]
  if (!v) return ''
  return `<div class="vn vn--${v.color}" data-vn="${nombre}" aria-hidden="true"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${v.planos.map((p) => `<g class="vn-plano">${p.svg}</g>`).join('')}<circle class="vn-iris" cx="120" cy="50" r="0"/></svg></div>`
}

function arma(el) {
  const v = VINETAS[el.dataset.vn]
  const planos = [...el.querySelectorAll('.vn-plano')]
  const iris = el.querySelector('.vn-iris')
  const tl = gsap.timeline({ repeat: -1 })
  v.planos.forEach((p, i) => {
    const g = planos[i]
    const t = i * DURA
    const [s0, x0, y0, r0, s1, x1, y1] = p.cam
    tl.set(planos, { autoAlpha: 0 }, t)
    tl.set(g, { autoAlpha: 1 }, t)
    // La cámara nunca está quieta: empuja, se aleja o se desliza durante todo el plano.
    tl.fromTo(g, { scale: s0, x: x0, y: y0, rotation: r0, svgOrigin: `${W / 2} ${H / 2}` }, { scale: s1, x: x1, y: y1, rotation: 0, duration: DURA, ease: 'sine.inOut' }, t)
    p.anima(tl, g, t + 0.3)
    // El iris abre al entrar y cierra al salir.
    const [ax, ay] = IRIS[i % IRIS.length]
    const [cx, cy] = IRIS[(i + 1) % IRIS.length]
    tl.set(iris, { attr: { cx: ax, cy: ay } }, t)
    tl.fromTo(iris, { attr: { r: 150 } }, { attr: { r: 0 }, duration: 0.5, ease: 'expo.out' }, t)
    tl.set(iris, { attr: { cx, cy } }, t + DURA - 0.32)
    tl.fromTo(iris, { attr: { r: 0 } }, { attr: { r: 150 }, duration: 0.3, ease: 'power2.in', immediateRender: false }, t + DURA - 0.31)
  })
  el._tl = tl
}

/** Echa a andar las viñetas que haya en la vista. Las que ya corren, siguen. */
export function animaVinetas(raiz) {
  if (reducido) return
  raiz.querySelectorAll('[data-vn]').forEach((el) => {
    if (!el._tl) arma(el)
  })
}
