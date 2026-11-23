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
        // Detalle: la puerta. Tocan, se abre, y adentro hay un sí.
        cam: [1, 0, 0, 0, 1.32, 0, -3],
        svg: `<rect class="vn-fw" x="100" y="16" width="40" height="72"/>
          <path class="vn-corazon" transform="translate(120 52) scale(1.5)" d="${CORAZON}"/>
          <g class="vn-hoja"><rect class="vn-fmadera" x="100" y="16" width="40" height="72"/>${T([caja(100, 16, 40, 72), caja(106, 23, 28, 24), caja(106, 54, 28, 27)], 2, 'vn-k')}<circle class="vn-fk" cx="133" cy="52" r="2.4"/></g>
          ${T(caja(95, 11, 50, 78), 2.6, 'vn-k')}
          ${T([P.line(60, 89, 180, 89)], 2.6, 'vn-k')}
          <g class="vn-toc">${T([P.arc(86, 46, 7, 130, 230), P.arc(82, 46, 13, 135, 225)], 2.2, 'vn-w')}</g>
          <g class="vn-toc">${T([P.arc(154, 46, 7, -50, 50), P.arc(158, 46, 13, -45, 45)], 2.2, 'vn-w')}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.7, 0.05)
          tl.fromTo(q(g, '.vn-toc'), { autoAlpha: 0, scale: 0.7, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.16, repeat: 3, yoyo: true, repeatDelay: 0.06 }, t + 0.35)
          tl.fromTo(q(g, '.vn-hoja'), { scaleX: 1, svgOrigin: '100 52' }, { scaleX: 0.14, duration: 0.6, ease: 'back.out(1.6)' }, t + 1.35)
          tl.fromTo(q(g, '.vn-corazon'), { scale: 0, svgOrigin: '120 52' }, { scale: 1.5, duration: 0.6, ease: 'back.out(3)' }, t + 1.7)
          tl.to(q(g, '.vn-corazon'), { y: -4, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 2.3)
        },
      },
      {
        // De perfil: el embudo. Entran muchos; el que llega al final sale convertido en cliente.
        cam: [1.2, 0, 8, -5, 1.04, 0, 0],
        svg: `${T(poli([[66, 10], [174, 10], [134, 48], [134, 70], [106, 70], [106, 48]], true), 2.6, 'vn-k')}
          ${[78, 96, 112, 128, 146, 162].map((x, i) => `<circle class="vn-gota vn-fw" data-i="${i}" cx="${x}" cy="0" r="4.2"/>`).join('')}
          <g class="vn-premio vn-famarillo" transform="translate(120 86)">${estrella(0, 0, 11)}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.8)
          q(g, '.vn-gota').forEach((c, i) => {
            const pasa = i === 2 || i === 3
            tl.fromTo(c, { y: -12, x: 0, autoAlpha: 1 }, { y: 22, duration: 0.5, ease: 'power2.in' }, t + 0.2 + i * 0.13)
            if (pasa) tl.to(c, { y: 62, x: i === 2 ? 6 : -6, duration: 0.7, ease: 'power1.inOut' }, t + 0.75 + i * 0.13).to(c, { autoAlpha: 0, duration: 0.1 }, t + 1.5 + i * 0.13)
            else tl.to(c, { y: 12 + (i % 2) * 6, x: (i < 3 ? -1 : 1) * (10 + i * 3), autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, t + 0.72 + i * 0.13)
          })
          tl.fromTo(q(g, '.vn-premio'), { scale: 0, rotation: -90, svgOrigin: '120 86' }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.4)' }, t + 2)
        },
      },
    ],
  },

  // Agenda: el calendario, el reloj y el encuentro.
  agenda: {
    color: 'amarillo',
    planos: [
      {
        // De frente: el mes. El punto brinca de día en día hasta el de la cita.
        cam: [1.18, 12, 4, 0, 1.04, -4, 0],
        svg: `<rect class="vn-fw" x="62" y="14" width="116" height="76" rx="6"/>
          <rect class="vn-fk" x="62" y="14" width="116" height="16" rx="6"/>
          ${T([caja(62, 14, 116, 76)], 2.6, 'vn-k')}
          ${T([P.line(84, 8, 84, 20), P.line(156, 8, 156, 20)], 3, 'vn-k')}
          ${Array.from({ length: 15 }, (_, i) => `<rect class="vn-dia" x="${70 + (i % 5) * 21}" y="${36 + Math.floor(i / 5) * 17}" width="15" height="11" rx="2"/>`).join('')}
          <circle class="vn-salta vn-fazul" r="5.5"/>
          <g class="vn-aro">${T([P.circle(140.5, 58.5, 13, 14)], 2.4, 'vn-rojo')}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.7, 0.05)
          tl.fromTo(q(g, '.vn-dia'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, t)
          const paradas = [[77.5, 41.5], [98.5, 41.5], [119.5, 58.5], [140.5, 58.5]]
          tl.set(q(g, '.vn-salta'), { x: paradas[0][0], y: paradas[0][1] }, t)
          paradas.slice(1).forEach(([x, y], i) => {
            tl.to(q(g, '.vn-salta'), { x, duration: 0.42, ease: 'power1.inOut' }, t + 0.6 + i * 0.5)
            tl.to(q(g, '.vn-salta'), { keyframes: [{ y: Math.min(y, paradas[i][1]) - 12, ease: 'power2.out' }, { y, ease: 'power2.in' }], duration: 0.42 }, t + 0.6 + i * 0.5)
          })
          dibuja(tl, q(g, '.vn-rojo'), t + 2.1, 0.6)
        },
      },
      {
        // Detalle: el reloj. Las manecillas corren hasta la hora y suena.
        cam: [1.4, 0, 0, 0, 1.1, 0, 0],
        svg: `<circle class="vn-fw" cx="120" cy="52" r="34"/>
          ${T([P.circle(120, 52, 35, 28)], 3, 'vn-k')}
          ${Array.from({ length: 12 }, (_, i) => `<line class="vn-marca" x1="120" y1="${i % 3 ? 23 : 22}" x2="120" y2="${i % 3 ? 26 : 28}" transform="rotate(${i * 30} 120 52)"/>`).join('')}
          <line class="vn-hora" x1="120" y1="55" x2="120" y2="36"/>
          <line class="vn-min" x1="120" y1="56" x2="120" y2="26"/>
          <circle class="vn-fazul" cx="120" cy="52" r="4"/>
          <g class="vn-timbre">${T([P.arc(160, 26, 7, -60, 40), P.arc(164, 24, 13, -55, 35)], 2.2, 'vn-k')}</g>
          <g class="vn-timbre">${T([P.arc(80, 26, 7, 140, 240), P.arc(76, 24, 13, 145, 235)], 2.2, 'vn-k')}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.7, 0.04)
          tl.fromTo(q(g, '.vn-min'), { rotation: 0, svgOrigin: '120 52' }, { rotation: 720, duration: 1.9, ease: 'power3.inOut' }, t + 0.1)
          tl.fromTo(q(g, '.vn-hora'), { rotation: 30, svgOrigin: '120 52' }, { rotation: 150, duration: 1.9, ease: 'power3.inOut' }, t + 0.1)
          tl.fromTo(q(g, '.vn-timbre'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, repeat: 5, yoyo: true }, t + 2)
          tl.fromTo(g.querySelector('circle.vn-fw'), { x: 0 }, { keyframes: { x: [0, -2, 2, -2, 2, 0] }, duration: 0.5, ease: 'none' }, t + 2)
        },
      },
      {
        // Dos globos que se encuentran: cita confirmada.
        cam: [1.05, 0, 0, 3, 1.2, 0, -2],
        svg: `<g class="vn-globo-a"><path class="vn-fw" d="M22 24h74a8 8 0 0 1 8 8v30a8 8 0 0 1 -8 8H52l-14 14v-14H22a8 8 0 0 1 -8 -8V32a8 8 0 0 1 8 -8Z"/>${T([P.line(28, 40, 88, 40), P.line(28, 53, 66, 53)], 2.4, 'vn-k')}</g>
          <g class="vn-globo-b"><path class="vn-fk" d="M146 20h72a8 8 0 0 1 8 8v30a8 8 0 0 1 -8 8h-16v14l-14 -14h-42a8 8 0 0 1 -8 -8V28a8 8 0 0 1 8 -8Z"/>${T([P.line(152, 36, 212, 36), P.line(152, 49, 192, 49)], 2.4, 'vn-w')}</g>
          <g class="vn-sello" transform="translate(120 52)"><circle class="vn-fazul" r="17"/><path class="vn-palo" d="${PALOMA}"/></g>`,
        anima(tl, g, t) {
          tl.fromTo(q(g, '.vn-globo-a'), { x: -70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.5)' }, t)
          tl.fromTo(q(g, '.vn-globo-b'), { x: 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.5)' }, t + 0.5)
          dibuja(tl, q(g, '.draw'), t + 0.4, 0.6, 0.12)
          tl.fromTo(q(g, '.vn-sello'), { scale: 0, rotation: -40, svgOrigin: '120 52' }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.6)' }, t + 1.7)
          tl.to(q(g, '.vn-globo-a'), { x: 6, duration: 0.3, ease: 'power2.out' }, t + 1.7)
          tl.to(q(g, '.vn-globo-b'), { x: -6, duration: 0.3, ease: 'power2.out' }, t + 1.7)
        },
      },
    ],
  },

  // Cobranza: el recibo, la moneda y las barras.
  cobranza: {
    color: 'verde',
    planos: [
      {
        // Detalle: el recibo sale renglón por renglón y le cae su sello.
        cam: [1.3, 0, 12, 0, 1.08, 0, -2],
        svg: `<g class="vn-papel"><path class="vn-fw" d="M84 6h72v82l-9 -6l-9 6l-9 -6l-9 6l-9 -6l-9 6l-9 -6l-9 6Z"/>
          ${T([P.line(94, 20, 146, 20), P.line(94, 32, 132, 32), P.line(94, 44, 140, 44), P.line(94, 56, 124, 56)], 2.2, 'vn-k vn-renglon')}
          ${T([P.line(94, 70, 146, 70)], 3.4, 'vn-k vn-renglon')}</g>
          ${T([P.line(70, 6, 170, 6)], 4, 'vn-k')}
          <g class="vn-sello" transform="translate(152 66)"><circle class="vn-fazul" r="15"/><path class="vn-palo" d="${PALOMA}"/></g>`,
        anima(tl, g, t) {
          tl.fromTo(q(g, '.vn-papel'), { y: -84 }, { y: 0, duration: 1.5, ease: 'steps(9)' }, t)
          dibuja(tl, q(g, '.vn-renglon'), t + 0.3, 0.4, 0.24)
          tl.fromTo(q(g, '.vn-sello'), { scale: 2.4, autoAlpha: 0, rotation: 20, svgOrigin: '152 66' }, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.3, ease: 'power3.in' }, t + 2)
          tl.fromTo(q(g, '.vn-papel'), { x: 0 }, { keyframes: { x: [0, 2, -2, 1, 0] }, duration: 0.25, ease: 'none' }, t + 2.3)
        },
      },
      {
        // De perfil: la moneda rueda hasta la alcancía.
        cam: [1.05, 14, 0, 0, 1.15, -12, 2],
        svg: `${T([P.line(0, 82, 240, 82)], 2.6, 'vn-k')}
          <rect class="vn-fw" x="170" y="42" width="48" height="40" rx="5"/>
          ${T([caja(170, 42, 48, 40)], 2.6, 'vn-k')}
          ${T([P.line(184, 42, 204, 42)], 4.5, 'vn-k')}
          <g class="vn-moneda"><circle class="vn-famarillo" r="14"/>${T([P.circle(0, 0, 14, 14)], 2.4, 'vn-k')}<path class="vn-pesos" d="M4 -6C-6 -9 -7 -1 0 0C7 1 6 9 -4 6M0 -10V10"/></g>
          <g class="vn-brillos" transform="translate(194 34)">${T([P.line(-12, -6, -18, -10), P.line(0, -9, 0, -17), P.line(12, -6, 18, -10)], 2.2, 'vn-w')}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k'), t - 0.2, 0.7, 0.04)
          tl.fromTo(q(g, '.vn-moneda'), { x: -20, y: 68, rotation: 0 }, { x: 150, rotation: 700, duration: 1.5, ease: 'power1.in' }, t)
          tl.to(q(g, '.vn-moneda'), { keyframes: [{ x: 172, y: 26, ease: 'power2.out' }, { x: 194, y: 30, ease: 'none' }, { x: 194, y: 62, scale: 0.6, ease: 'power2.in' }], rotation: 980, duration: 0.8 }, t + 1.5)
          tl.to(q(g, '.vn-moneda'), { autoAlpha: 0, duration: 0.05 }, t + 2.3)
          tl.fromTo(q(g, '.vn-brillos'), { autoAlpha: 0, scale: 0.4, svgOrigin: '194 34' }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(3)', yoyo: true, repeat: 1, repeatDelay: 0.3 }, t + 2.3)
          tl.set(q(g, '.vn-moneda'), { autoAlpha: 1, scale: 1 }, t)
        },
      },
      {
        // Desde abajo: las barras crecen, mes con mes.
        cam: [1.25, 0, -8, 4, 1.05, 0, 0],
        svg: `${T([P.line(46, 86, 196, 86)], 2.6, 'vn-k')}
          ${[[60, 26], [92, 40], [124, 34], [156, 62]].map(([x, h], i) => `<rect class="vn-barra ${i === 3 ? 'vn-fk' : 'vn-fw'}" x="${x}" y="${86 - h}" width="22" height="${h}" rx="3"/>`).join('')}
          ${T(poli([[60, 52], [100, 38], [134, 44], [178, 12]]), 2.4, 'vn-k vn-tendencia')}
          <g class="vn-premio vn-famarillo" transform="translate(186 10)">${estrella(0, 0, 9)}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-k:not(.vn-tendencia)'), t - 0.2, 0.6)
          tl.fromTo(q(g, '.vn-barra'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.18 }, t + 0.1)
          dibuja(tl, q(g, '.vn-tendencia'), t + 1.1, 0.9, 0)
          tl.fromTo(q(g, '.vn-premio'), { scale: 0, rotation: -120, svgOrigin: '186 10' }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.6)' }, t + 1.9)
        },
      },
    ],
  },

  // Sistemas: la ventana con pulso, la señal y el interruptor.
  sistemas: {
    color: 'tinta',
    planos: [
      {
        // De frente: la ventana del sistema, con su pulso.
        cam: [1.2, -10, 4, 0, 1.06, 6, 0],
        svg: `${T([caja(52, 14, 136, 72)], 2.6, 'vn-w')}
          ${T([P.line(52, 30, 188, 30)], 2, 'vn-w')}
          ${[62, 72, 82].map((x) => `<circle class="vn-fw" cx="${x}" cy="22" r="2.6"/>`).join('')}
          ${T(poli([[62, 60], [96, 60], [104, 44], [114, 76], [124, 52], [132, 60], [178, 60]], false, 9), 2.6, 'vn-azul vn-latido')}
          <circle class="vn-vivo" cx="176" cy="22" r="3.4"/>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-w'), t - 0.2, 0.7, 0.06)
          dibuja(tl, q(g, '.vn-latido'), t + 0.4, 1.1, 0)
          tl.fromTo(q(g, '.vn-latido'), { '--draw': 0 }, { '--draw': -1.06, duration: 0.9, ease: 'power1.in' }, t + 1.6)
          tl.fromTo(q(g, '.vn-vivo'), { autoAlpha: 0.25 }, { autoAlpha: 1, duration: 0.28, repeat: 7, yoyo: true }, t + 0.4)
        },
      },
      {
        // Desde arriba: Soma al centro y cada sistema respondiendo a la señal.
        cam: [1.16, 0, 0, -8, 1, 0, 0],
        svg: `<circle class="vn-onda" cx="120" cy="50" r="10"/><circle class="vn-onda" cx="120" cy="50" r="10"/>
          ${[[62, 26], [182, 28], [172, 76], [68, 74]].map(([x, y]) => `<g class="vn-sat" transform="translate(${x} ${y})"><rect class="vn-fw" x="-11" y="-8" width="22" height="16" rx="3"/><rect class="vn-fk" x="-11" y="-8" width="22" height="5" rx="2"/></g>`).join('')}
          ${T([P.line(120, 50, 70, 30), P.line(120, 50, 174, 31), P.line(120, 50, 166, 72), P.line(120, 50, 76, 70)], 1.4, 'vn-t')}
          <circle class="vn-fw" cx="120" cy="50" r="13"/><circle class="vn-fazul" cx="120" cy="50" r="6"/>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-t'), t, 0.8, 0.08)
          brota(tl, q(g, '.vn-sat'), t + 0.1)
          q(g, '.vn-onda').forEach((c, i) => tl.fromTo(c, { attr: { r: 10 }, autoAlpha: 0.9 }, { attr: { r: 96 }, autoAlpha: 0, duration: 1.4, ease: 'power1.out' }, t + 0.7 + i * 0.9))
          tl.fromTo(q(g, '.vn-sat'), { y: 0 }, { y: -4, duration: 0.18, yoyo: true, repeat: 1, stagger: 0.12 }, t + 1.3)
        },
      },
      {
        // Detalle: el interruptor. Encendido.
        cam: [1, 0, 0, 0, 1.3, -6, 0],
        svg: `<rect class="vn-riel" x="76" y="34" width="88" height="36" rx="18"/>
          ${T([P.arc(94, 52, 18, 90, 270, 12), P.line(94, 34, 146, 34), P.arc(146, 52, 18, -90, 90, 12), P.line(146, 70, 94, 70)], 2.6, 'vn-w')}
          <circle class="vn-perilla vn-fw" cx="94" cy="52" r="13"/>
          <g class="vn-brillos" transform="translate(146 52)">${T([P.line(24, 0, 34, 0), P.line(19, -17, 26, -24), P.line(19, 17, 26, 24)], 2.4, 'vn-azul')}</g>`,
        anima(tl, g, t) {
          dibuja(tl, q(g, '.vn-w'), t - 0.2, 0.7, 0.03)
          tl.fromTo(q(g, '.vn-perilla'), { x: 0 }, { x: 52, duration: 0.5, ease: 'back.out(1.8)' }, t + 1)
          tl.fromTo(q(g, '.vn-riel'), { fill: 'rgba(255,255,255,0.12)' }, { fill: '#216fff', duration: 0.35 }, t + 1.05)
          tl.fromTo(q(g, '.vn-brillos'), { autoAlpha: 0, scale: 0.5, svgOrigin: '146 52' }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, t + 1.4)
          tl.to(q(g, '.vn-brillos'), { autoAlpha: 0.3, duration: 0.3, yoyo: true, repeat: 3 }, t + 1.8)
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
