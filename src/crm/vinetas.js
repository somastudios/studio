import gsap from 'gsap'
import { boil, P } from '../core/boil.js'

// Viñetas: la animación que encabeza cada sección del CRM. Cada una es una sola pieza
// continua, sin cortes: una forma protagonista se va transformando (el pin se vuelve puerta,
// la puerta expediente; el billete teléfono, el teléfono tarjeta…) y alrededor de ella pasa
// lo que la sección cuenta. Formas planas para lo importante y trazo a mano para el detalle.
//
// Una viñeta es { color, svg, anima(tl, el) }. El dibujo va dentro de una «cámara» que
// deriva despacio todo el tiempo.

const W = 240
const H = 100
const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const TINTA = '#050506'
const PAPEL = '#efece4'
const AZUL = '#216fff'
const AMARILLO = '#ffcb1f'

// ───────────────────────── Dibujo ─────────────────────────

/** Un trazo que hierve y se dibuja. */
const T = (formas, grosor = 2.4, cls = '') => boil(formas, { amp: 0.45, cls: `draw ${cls}`, attrs: `stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round"` })

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

// ── Formas que se transforman. Todas son contornos cerrados con el mismo número de puntos,
// que empiezan arriba y giran igual: así cualquiera puede volverse cualquier otra.
const N = 72

function remuestra(pts) {
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    area += a[0] * b[1] - b[0] * a[1]
  }
  if (area < 0) pts = pts.slice().reverse()
  const largos = pts.map((p, i) => Math.hypot(pts[(i + 1) % pts.length][0] - p[0], pts[(i + 1) % pts.length][1] - p[1]))
  const total = largos.reduce((s, l) => s + l, 0)
  const out = []
  let i = 0
  let acumulado = 0
  for (let k = 0; k < N; k++) {
    const meta = (k / N) * total
    while (acumulado + largos[i] < meta) acumulado += largos[i++]
    const t = (meta - acumulado) / (largos[i] || 1)
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  // Que todas empiecen en su punto más alto, cerca del centro.
  const cx = out.reduce((s, p) => s + p[0], 0) / N
  let mejor = 0
  out.forEach((p, k) => {
    const m = out[mejor]
    if (p[1] < m[1] - 0.4 || (Math.abs(p[1] - m[1]) <= 0.4 && Math.abs(p[0] - cx) < Math.abs(m[0] - cx))) mejor = k
  })
  return out.slice(mejor).concat(out.slice(0, mejor))
}

const F = {
  circ: (cx, cy, r) => remuestra(Array.from({ length: 48 }, (_, i) => [cx + Math.cos((i / 48) * 6.2832) * r, cy + Math.sin((i / 48) * 6.2832) * r])),
  rect(x, y, w, h, r = 4) {
    const pts = []
    const esquina = (cx, cy, a0) => {
      for (let i = 0; i <= 5; i++) {
        const a = ((a0 + i * 18) * Math.PI) / 180
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
      }
    }
    esquina(x + w - r, y + r, -90)
    esquina(x + w - r, y + h - r, 0)
    esquina(x + r, y + h - r, 90)
    esquina(x + r, y + r, 180)
    return remuestra(pts)
  },
  /** Un pin de mapa con la punta en (x, y). */
  gota(x, y, s = 1) {
    const pts = []
    for (let a = 135; a <= 405; a += 9) pts.push([x + Math.cos((a * Math.PI) / 180) * 9 * s, y - 17 * s + Math.sin((a * Math.PI) / 180) * 9 * s])
    pts.push([x, y])
    return remuestra(pts)
  },
  /** Un recibo: la orilla de abajo, en zigzag. */
  recibo(x, y, w, h) {
    const pts = [[x, y], [x + w, y], [x + w, y + h]]
    for (let i = 1; i <= 7; i++) pts.push([x + w - (w * i) / 8, y + h - (i % 2 ? 6 : 0)])
    pts.push([x, y + h])
    return remuestra(pts)
  },
  engrane(cx, cy, r0, r1, n = 10) {
    const pts = []
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 360
      for (const [da, r] of [[-7, r1], [7, r1], [11, r0], [25, r0]]) pts.push([cx + Math.cos(((a + da) * Math.PI) / 180) * r, cy + Math.sin(((a + da) * Math.PI) / 180) * r])
    }
    return remuestra(pts)
  },
}
const aD = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`

const estrella = (cx, cy, r) => `<polygon points="${Array.from({ length: 10 }, (_, i) => `${(cx + Math.cos(-1.5708 + (i / 10) * 6.2832) * (i % 2 ? r * 0.45 : r)).toFixed(1)},${(cy + Math.sin(-1.5708 + (i / 10) * 6.2832) * (i % 2 ? r * 0.45 : r)).toFixed(1)}`).join(' ')}"/>`
const CORAZON = 'M0 6C-9 -1 -9 -8 -4.5 -8C-2 -8 0 -6 0 -4C0 -6 2 -8 4.5 -8C9 -8 9 -1 0 6Z'
const PALOMA = 'M-8 0L-2 6L9 -7'
const sello = (x, y, r = 14, cls = '') => `<g class="${cls}" transform="translate(${x} ${y})"><g><circle r="${r}" fill="${AZUL}"/><path d="${PALOMA}" transform="scale(${(r / 16).toFixed(2)})" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></g>`
const globo = (x, y, w, h, cls, dentro = '', cola = 0.3) => {
  // La orilla de abajo: un tramo, el pico y el otro tramo.
  const a = Math.max(2, Math.round((w - 19) * (1 - cola)))
  const b = Math.max(2, w - 19 - a)
  return `<g class="${cls}" transform="translate(${x} ${y})"><g><path fill="#fff" d="M6 0h${w - 12}a6 6 0 0 1 6 6v${h - 12}a6 6 0 0 1 -6 6h-${a}l-7 8v-8h-${b}a6 6 0 0 1 -6 -6v-${h - 12}a6 6 0 0 1 6 -6Z"/>${dentro}</g></g>`
}

// El reparto, en chiquito: los mismos de las películas.
const GENTE = {
  dali: { ropa: TINTA, piel: '#fbdcc0', pelo: `<path fill="#4d2f1c" d="M-7.6 -27.5a7.6 7.6 0 0 1 15.2 0c-2.4 -3.4 -5 -4 -7.6 -1.6c-2.6 -2.4 -5.2 -1.8 -7.6 1.6Z"/>` },
  alex: {
    ropa: '#1d3f8f',
    piel: '#f0c49c',
    pelo: `<g fill="#17141d"><circle cx="-4.5" cy="-32" r="4.6"/><circle cx="2.5" cy="-33.6" r="5"/><circle cx="7" cy="-30" r="3.6"/><circle cx="-7.6" cy="-28.6" r="3"/></g><path fill="none" stroke="${TINTA}" stroke-width="1.1" d="M-5.8 -28.2h4.4v3.4h-4.4ZM1.4 -28.2h4.4v3.4h-4.4ZM-1.4 -26.6h2.8"/>`,
  },
  otro: { ropa: AMARILLO, piel: '#c68a5c', pelo: `<path fill="#8d8f9a" d="M-7.4 -28a7.4 7.4 0 0 1 14.8 0c-4 -2.6 -10.8 -2.6 -14.8 0Z"/>` },
  clienta: { ropa: '#ff574a', piel: '#fbdcc0', pelo: `<path fill="#c9790a" d="M-8 -24a8 8 0 0 1 16 0v3c-1 -5 -3 -7 -8 -7s-7 2 -8 7Z"/><circle cx="0" cy="-36" r="3.4" fill="#c9790a"/>` },
}
const persona = (x, base, quien, cls = '') => {
  const g = GENTE[quien]
  return `<g class="vn-p ${cls}" transform="translate(${x} ${base})"><g><rect x="-8" y="-20" width="16" height="20" rx="7" fill="${g.ropa}"/><circle cy="-27" r="7" fill="${g.piel}"/>${g.pelo}${quien === 'alex' ? '' : `<circle cx="-2.6" cy="-26.6" r="0.95" fill="${TINTA}"/><circle cx="2.6" cy="-26.6" r="0.95" fill="${TINTA}"/>`}<path d="M-2.4 -23.4q2.4 2 4.8 0" fill="none" stroke="${TINTA}" stroke-width="1" stroke-linecap="round"/></g></g>`
}

// ───────────────────────── Animación ─────────────────────────

const q = (r, s) => r.querySelectorAll(s)
const dibuja = (tl, els, t, d = 0.9, e = 0.08) => tl.fromTo(els, { '--draw': 1.06 }, { '--draw': 0, duration: d, ease: 'expo.inOut', stagger: e }, t)
const entra = (tl, els, t, d = 0.3, e = 0.05) => tl.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: d, stagger: e }, t)
const sale = (tl, els, t, d = 0.3) => tl.to(els, { autoAlpha: 0, duration: d }, t)
const brota = (tl, els, t, e = 0.1, origen = '50% 50%') => tl.fromTo(els, { scale: 0, autoAlpha: 1, transformOrigin: origen }, { scale: 1, duration: 0.5, ease: 'back.out(2.6)', stagger: e }, t)
const brinca = (tl, els, t, n = 3, alto = 5) => tl.to(els, { y: -alto, duration: 0.16, yoyo: true, repeat: n * 2 - 1, ease: 'power1.out', stagger: 0.08 }, t)
const tiembla = (tl, els, t) => tl.to(els, { keyframes: { x: [0, -2, 2, -2, 2, 0] }, duration: 0.4, ease: 'none' }, t)
const viaja = (tl, el, pts, t, d = 2.2, ease = 'power1.inOut') => tl.fromTo(el, { x: pts[0][0], y: pts[0][1] }, { keyframes: pts.slice(1).map(([x, y]) => ({ x, y })), duration: d, ease }, t)

/**
 * La protagonista se vuelve otra forma. Todas las formas tienen los mismos puntos, así que
 * GSAP puede llevar el trazo de una a otra número por número (y funciona también al saltar
 * a un momento cualquiera de la animación).
 */
const morfa = (tl, el, A, B, t, d = 0.8, ease = 'expo.inOut') => tl.fromTo(el, { attr: { d: aD(A) } }, { attr: { d: aD(B) }, duration: d, ease, immediateRender: false }, t)
/** La forma con la que empieza cada vuelta. */
const empieza = (tl, el, A) => tl.set(el, { attr: { d: aD(A) } }, 0)

// ───────────────────────── Las viñetas ─────────────────────────

const RUTA = [[28, 84], [70, 52], [118, 60], [168, 32], [196, 46]]
const S = {
  pin: F.gota(196, 46),
  puerta: F.rect(164, 22, 36, 60, 3),
  ficha: F.rect(72, 14, 96, 68, 7),
  punto: F.circ(120, 50, 3),
  billete: F.rect(66, 28, 108, 46, 4),
  telefono: F.rect(98, 8, 44, 84, 9),
  tarjeta: F.rect(70, 24, 100, 54, 8),
  recibo: F.recibo(86, 8, 68, 82),
  celda: F.rect(133, 53, 15, 11, 2),
  reloj: F.circ(120, 50, 35),
  lugar: F.gota(120, 86, 1.9),
  ventana: F.rect(52, 12, 136, 76, 7),
  nodo: F.rect(170, 18, 30, 22, 4),
  engrane: F.engrane(112, 52, 21, 29),
  tablero: F.rect(60, 14, 120, 72, 10),
  candado: F.rect(96, 44, 48, 40, 7),
}

const VINETAS = {
  // Prospectos: la ruta de visitas → la puerta → nos abren y dicen que sí → el expediente.
  prospectos: {
    color: 'azul',
    svg: `<g class="mapa">${T([P.line(0, 28, 240, 20), P.line(0, 72, 240, 80), P.line(58, 0, 50, 100), P.line(150, 0, 162, 100)], 1.1, 'vn-t')}
        ${T(poli(RUTA), 2.4, 'vn-w ruta')}
        ${[[70, 52], [168, 32]].map(([x, y]) => `<g transform="translate(${x} ${y})"><g class="pin"><path fill="#fff" d="M0 0C-7 -9 -9 -13 -9 -17a9 9 0 1 1 18 0c0 4 -2 8 -9 17Z"/><circle cy="-17" r="3.2" fill="${TINTA}"/></g></g>`).join('')}
        <g class="viajero"><circle r="6.5" fill="#fff"/><circle r="3.6" fill="${TINTA}"/></g></g>
      ${T([P.line(16, 82, 232, 82)], 2.4, 'vn-w suelo')}
      ${persona(182, 82, 'otro', 'dueno')}
      <path class="vn-h" fill="#fff" d="${aD(S.pin)}"/>
      <g class="hoja-d"><circle cx="170" cy="54" r="2.4" fill="${TINTA}"/>${T([caja(169, 28, 26, 20), caja(169, 56, 26, 20)], 1.6, 'vn-k')}</g>
      <g class="toc">${T([P.arc(158, 50, 6, 130, 230), P.arc(154, 50, 12, 135, 225)], 2.2, 'vn-w')}</g>
      <g class="duo">${persona(98, 82, 'alex')}${persona(122, 82, 'dali')}</g>
      ${globo(84, 12, 50, 26, 'globo-n', T([P.line(10, 9, 40, 9), P.line(10, 17, 30, 17)], 2, 'vn-k'))}
      ${globo(160, 2, 36, 26, 'globo-d', `<path transform="translate(18 14) scale(0.9)" fill="#ff574a" d="${CORAZON}"/>`, 0.6)}
      <g class="exp"><circle class="avatar" cx="94" cy="34" r="10" fill="${TINTA}"/>${T([P.line(112, 29, 156, 29), P.line(112, 40, 142, 40)], 2.6, 'vn-k renglon')}
        ${[88, 104, 120, 136, 152].map((x) => `<circle class="etapa" cx="${x}" cy="64" r="4.6" fill="rgb(5 5 6 / 0.16)"/>`).join('')}
        ${T([P.line(88, 64, 152, 64)], 1.4, 'vn-k renglon')}
        <circle class="avance" cy="64" r="5.4" fill="${AZUL}"/>
        <g transform="translate(166 18)"><g class="premio" fill="${AMARILLO}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round">${estrella(0, 0, 13)}</g></g></g>`,
    anima(tl, el) {
      const h = el.querySelector('.vn-h')
      empieza(tl, h, S.pin)
      // 1 · El mapa: la ruta se traza y el punto va de visita en visita.
      dibuja(tl, q(el, '.mapa .vn-t'), 0, 0.8)
      dibuja(tl, q(el, '.ruta'), 0.1, 2.3, 0)
      viaja(tl, q(el, '.viajero'), RUTA, 0.1, 2.3)
      brota(tl, q(el, '.pin'), 0.6, 0.85, '50% 100%')
      brota(tl, h, 2.05, 0, '50% 100%')
      // 2 · El último pin se vuelve puerta. Llegan los dos, tocan, y les abren.
      sale(tl, q(el, '.mapa'), 2.7, 0.45)
      morfa(tl, h, S.pin, S.puerta, 2.8)
      dibuja(tl, q(el, '.suelo'), 3.1, 0.7)
      entra(tl, q(el, '.hoja-d'), 3.5)
      dibuja(tl, q(el, '.hoja-d .draw'), 3.5, 0.5)
      entra(tl, q(el, '.dueno'), 3.5, 0.1)
      tl.fromTo(q(el, '.duo'), { x: -130, autoAlpha: 1 }, { x: 0, duration: 1, ease: 'power2.out' }, 3.4)
      tl.to(q(el, '.duo .vn-p > g'), { y: -2.5, duration: 0.14, yoyo: true, repeat: 5, stagger: 0.07 }, 3.45)
      tl.fromTo(q(el, '.toc'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.13, yoyo: true, repeat: 3 }, 4.5)
      tiembla(tl, [h, ...q(el, '.hoja-d')], 4.5)
      tl.to([h, ...q(el, '.hoja-d')], { scaleX: 0.16, svgOrigin: '164 52', duration: 0.5, ease: 'back.out(1.4)' }, 5.1)
      brota(tl, q(el, '.globo-n > g'), 5.5, 0, '20% 100%')
      dibuja(tl, q(el, '.globo-n .draw'), 5.6, 0.5, 0.12)
      brota(tl, q(el, '.globo-d > g'), 6.3, 0, '70% 100%')
      brinca(tl, q(el, '.duo .vn-p > g'), 6.5)
      // 3 · La puerta se vuelve su expediente.
      sale(tl, [...q(el, '.globo-n, .globo-d, .dueno, .suelo, .hoja-d')], 7.4)
      tl.to(q(el, '.duo'), { x: -40, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 7.4)
      tl.to(h, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 7.45)
      morfa(tl, h, S.puerta, S.ficha, 7.7)
      brota(tl, q(el, '.avatar'), 8.3)
      dibuja(tl, q(el, '.renglon'), 8.4, 0.5, 0.14)
      entra(tl, q(el, '.etapa'), 8.7, 0.2, 0.07)
      tl.fromTo(q(el, '.avance'), { x: 88, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 9)
      tl.to(q(el, '.avance'), { x: 104, duration: 0.35, ease: 'back.out(2)' }, 9.3).to(q(el, '.avance'), { x: 120, duration: 0.35, ease: 'back.out(2)' }, 9.8)
      tl.fromTo(q(el, '.premio'), { scale: 2.6, autoAlpha: 0, rotation: 40, transformOrigin: '50% 50%' }, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.28, ease: 'power3.in' }, 10.2)
      tiembla(tl, h, 10.48)
      // Y de vuelta al mapa.
      sale(tl, q(el, '.exp'), 11.4)
      morfa(tl, h, S.ficha, S.punto, 11.5, 0.6)
      sale(tl, h, 11.95, 0.2)
      tl.to({}, { duration: 0.3 }, 12.1)
    },
  },

  // Cobranza: en efectivo → por transferencia → con tarjeta → el recibo, y todos contentos.
  cobranza: {
    color: 'verde',
    svg: `<path class="vn-h" fill="#fff" d="${aD(S.billete)}"/>
      <g class="b1">${T([caja(72, 34, 96, 34)], 1.6, 'vn-k')}<circle cx="120" cy="51" r="11" fill="${TINTA}"/><path transform="translate(120 51) scale(0.8)" d="M4 -6C-6 -9 -7 -1 0 0C7 1 6 9 -4 6M0 -10V10" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="82" cy="43" r="2.4" fill="${TINTA}"/><circle cx="158" cy="59" r="2.4" fill="${TINTA}"/></g>
      ${[78, 68, 58].map((y) => `<g transform="translate(200 ${y})"><g class="moneda"><ellipse rx="13" ry="5.5" fill="${AMARILLO}" stroke="${TINTA}" stroke-width="2"/></g></g>`).join('')}
      <g class="b2"><rect x="112" y="13" width="16" height="3" rx="1.5" fill="${TINTA}"/><circle cx="120" cy="30" r="6.5" fill="${TINTA}"/><circle cx="120" cy="72" r="6.5" fill="${AZUL}"/>${T([P.line(120, 40, 120, 60), P.line(115, 55, 120, 61), P.line(125, 55, 120, 61)], 2.2, 'vn-k flecha')}</g>
      <g class="soma" transform="translate(206 50)"><g><circle r="14" fill="#fff"/><circle r="6.5" fill="${AZUL}"/></g></g>
      ${[0, 1].map(() => `<circle class="vuela" r="6" fill="${AMARILLO}" stroke="${TINTA}" stroke-width="2"/>`).join('')}
      <g class="b3"><rect x="70" y="35" width="100" height="10" fill="${TINTA}"/><rect x="80" y="52" width="15" height="11" rx="2.5" fill="${AMARILLO}" stroke="${TINTA}" stroke-width="1.6"/>${T([P.line(104, 58, 122, 58), P.line(128, 58, 146, 58), P.line(80, 70, 112, 70)], 2.4, 'vn-k cifra')}</g>
      <g class="wifi">${T([P.arc(196, 34, 7, 215, 325), P.arc(196, 34, 14, 215, 325), P.arc(196, 34, 21, 215, 325)], 2.6, 'vn-w')}<circle cx="196" cy="34" r="2.6" fill="#fff"/></g>
      <circle class="toque" cx="152" cy="64" r="5" fill="none" stroke="${AZUL}" stroke-width="2.6"/>
      ${sello(152, 64, 12, 'ok3')}
      <g class="b4">${T([P.line(96, 22, 144, 22), P.line(96, 33, 132, 33), P.line(96, 44, 140, 44)], 2.2, 'vn-k renglon')}${T([P.line(96, 62, 144, 62)], 3.4, 'vn-k renglon')}</g>
      ${sello(146, 76, 11, 'ok4')}
      ${persona(44, 90, 'clienta', 'feliz')}${persona(196, 90, 'dali', 'feliz')}
      ${[[62, 40], [178, 38]].map(([x, y]) => `<path class="amor" transform="translate(${x} ${y})" fill="#fff" d="${CORAZON}"/>`).join('')}`,
    anima(tl, el) {
      const h = el.querySelector('.vn-h')
      empieza(tl, h, S.billete)
      // 1 · En efectivo: el billete llega y las monedas caen a su lado.
      tl.fromTo(h, { x: -200, rotation: -16, autoAlpha: 1, svgOrigin: '120 51' }, { x: 0, rotation: 0, duration: 0.9, ease: 'back.out(1.2)' }, 0)
      entra(tl, q(el, '.b1'), 0.75)
      dibuja(tl, q(el, '.b1 .draw'), 0.75, 0.6)
      tl.fromTo(q(el, '.moneda'), { y: -110, autoAlpha: 1 }, { y: 0, duration: 0.7, ease: 'bounce.out', stagger: 0.2 }, 1.1)
      // 2 · El billete se vuelve teléfono: por transferencia.
      sale(tl, [...q(el, '.b1, .moneda')], 2.9)
      morfa(tl, h, S.billete, S.telefono, 3)
      entra(tl, q(el, '.b2'), 3.7)
      dibuja(tl, q(el, '.flecha'), 3.9, 0.6, 0.05)
      brota(tl, q(el, '.soma > g'), 4)
      q(el, '.vuela').forEach((c, i) => {
        const t = 4.6 + i * 0.7
        tl.set(c, { autoAlpha: 0 }, 0).set(c, { autoAlpha: 1 }, t)
        viaja(tl, c, [[142, 50], [160, 26], [186, 30], [206, 50]], t, 0.6, 'power1.in')
        tl.set(c, { autoAlpha: 0 }, t + 0.6)
        tl.to(q(el, '.soma > g'), { scale: 1.25, duration: 0.13, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, t + 0.58)
      })
      // 3 · El teléfono se vuelve tarjeta: por internet.
      sale(tl, [...q(el, '.b2, .soma')], 6.3)
      morfa(tl, h, S.telefono, S.tarjeta, 6.4)
      tl.to(h, { rotation: -5, svgOrigin: '120 51', duration: 0.7, ease: 'expo.inOut' }, 6.4)
      tl.fromTo(q(el, '.b3'), { autoAlpha: 0, rotation: -5, svgOrigin: '120 51' }, { autoAlpha: 1, duration: 0.3 }, 7.1)
      dibuja(tl, q(el, '.cifra'), 7.2, 0.5, 0.1)
      entra(tl, q(el, '.wifi'), 7.5, 0.1)
      dibuja(tl, q(el, '.wifi .draw'), 7.5, 0.3, 0.14)
      tl.fromTo(q(el, '.wifi .boil'), { opacity: 1 }, { opacity: 0.25, duration: 0.3, yoyo: true, repeat: 3, stagger: 0.12 }, 8)
      tl.set(q(el, '.toque'), { autoAlpha: 0 }, 0)
      tl.fromTo(q(el, '.toque'), { attr: { r: 5 }, autoAlpha: 1 }, { attr: { r: 20 }, autoAlpha: 0, duration: 0.6, ease: 'power1.out', immediateRender: false }, 8.4)
      brota(tl, q(el, '.ok3 > g'), 8.7)
      // 4 · La tarjeta se vuelve recibo. Y todos contentos.
      sale(tl, [...q(el, '.b3, .wifi, .ok3')], 9.6)
      tl.to(h, { rotation: 0, duration: 0.7, ease: 'expo.inOut' }, 9.7)
      morfa(tl, h, S.tarjeta, S.recibo, 9.7)
      dibuja(tl, q(el, '.renglon'), 10.4, 0.4, 0.13)
      brota(tl, q(el, '.ok4 > g'), 11)
      brota(tl, q(el, '.feliz > g'), 11.1, 0.15, '50% 100%')
      brinca(tl, q(el, '.feliz > g'), 11.7, 3, 6)
      tl.fromTo(q(el, '.amor'), { autoAlpha: 0, y: 10, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, y: -12, scale: 1.1, duration: 0.9, ease: 'power1.out', stagger: 0.2 }, 11.6)
      sale(tl, q(el, '.amor'), 12.6, 0.2)
      sale(tl, [...q(el, '.b4, .ok4, .feliz')], 12.9)
      tl.to(h, { x: 220, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 12.9)
      tl.to({}, { duration: 0.2 }, 13.4)
    },
  },

  // Agenda: el día en el calendario → la hora en el reloj → el lugar donde se encuentran.
  agenda: {
    color: 'amarillo',
    svg: `<g class="cal"><rect x="62" y="10" width="116" height="80" rx="6" fill="#fff"/><path d="M62 26V16a6 6 0 0 1 6 -6h104a6 6 0 0 1 6 6v10Z" fill="${TINTA}"/><rect x="82" y="5" width="4" height="11" rx="2" fill="${TINTA}"/><rect x="154" y="5" width="4" height="11" rx="2" fill="${TINTA}"/>
        ${Array.from({ length: 15 }, (_, i) => (i === 8 ? '' : `<rect class="celda" x="${70 + (i % 5) * 21}" y="${36 + Math.floor(i / 5) * 17}" width="15" height="11" rx="2" fill="rgb(5 5 6 / 0.13)"/>`)).join('')}</g>
      <path class="vn-h" fill="rgb(5 5 6 / 0.13)" d="${aD(S.celda)}"/>
      <circle class="salta" r="5.5" fill="${AZUL}"/>
      <g class="rel">${T([P.circle(120, 50, 36, 28)], 3, 'vn-k')}${Array.from({ length: 12 }, (_, i) => `<line class="tic" x1="120" y1="${i % 3 ? 20 : 19}" x2="120" y2="${i % 3 ? 23 : 25}" stroke="${TINTA}" stroke-width="2" stroke-linecap="round" transform="rotate(${i * 30} 120 50)"/>`).join('')}
        <line class="hora" x1="120" y1="53" x2="120" y2="34" stroke="${TINTA}" stroke-width="5" stroke-linecap="round"/><line class="min" x1="120" y1="54" x2="120" y2="24" stroke="${TINTA}" stroke-width="3.2" stroke-linecap="round"/><circle cx="120" cy="50" r="4" fill="${AZUL}"/></g>
      <g class="timbre">${T([P.arc(162, 24, 7, -60, 40), P.arc(166, 22, 13, -55, 35)], 2.4, 'vn-k')}${T([P.arc(78, 24, 7, 140, 240), P.arc(74, 22, 13, 145, 235)], 2.4, 'vn-k')}</g>
      ${T([P.line(20, 88, 220, 88)], 2.4, 'vn-k suelo')}
      <circle class="ojo" cx="120" cy="53.7" r="6.6" fill="#fff"/>
      <g class="izq">${persona(84, 88, 'alex')}</g><g class="der">${persona(156, 88, 'otro')}</g>
      ${globo(56, 22, 30, 22, 'gl-a', `<circle cx="9" cy="11" r="2" fill="${TINTA}"/><circle cx="15" cy="11" r="2" fill="${TINTA}"/><circle cx="21" cy="11" r="2" fill="${TINTA}"/>`, 0.7)}
      ${sello(174, 30, 12, 'ok')}`,
    anima(tl, el) {
      const h = el.querySelector('.vn-h')
      empieza(tl, h, S.celda)
      // 1 · El mes: el punto brinca de día en día hasta el de la cita.
      tl.fromTo([...q(el, '.cal'), h], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0)
      tl.fromTo(h, { fill: 'rgba(5,5,6,0.13)' }, { fill: AZUL, duration: 0.2 }, 2.55)
      const paradas = [[77.5, 41.5], [98.5, 41.5], [119.5, 58.5], [140.5, 58.5]]
      tl.fromTo(q(el, '.salta'), { x: paradas[0][0], y: paradas[0][1], autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.5)
      paradas.slice(1).forEach(([x, y], i) => {
        tl.to(q(el, '.salta'), { x, duration: 0.42, ease: 'power1.inOut' }, 0.9 + i * 0.55)
        tl.to(q(el, '.salta'), { keyframes: [{ y: Math.min(y, paradas[i][1]) - 13, ease: 'power2.out' }, { y, ease: 'power2.in' }], duration: 0.42 }, 0.9 + i * 0.55)
      })
      sale(tl, q(el, '.salta'), 2.5, 0.15)
      // 2 · Ese día se vuelve reloj: la hora.
      tl.to(q(el, '.cal'), { autoAlpha: 0, scale: 0.92, transformOrigin: '50% 50%', duration: 0.45 }, 3)
      morfa(tl, h, S.celda, S.reloj, 3.1)
      tl.to(h, { fill: '#ffffff', duration: 0.6 }, 3.2)
      dibuja(tl, q(el, '.rel .draw'), 3.6, 0.7)
      entra(tl, q(el, '.rel'), 3.7, 0.2)
      tl.fromTo(q(el, '.tic'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, stagger: 0.03 }, 3.8)
      tl.fromTo(q(el, '.min'), { rotation: 0, svgOrigin: '120 50' }, { rotation: 720, duration: 1.8, ease: 'power3.inOut' }, 3.9)
      tl.fromTo(q(el, '.hora'), { rotation: 30, svgOrigin: '120 50' }, { rotation: 150, duration: 1.8, ease: 'power3.inOut' }, 3.9)
      tl.fromTo(q(el, '.timbre'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, yoyo: true, repeat: 5 }, 5.75)
      dibuja(tl, q(el, '.timbre .draw'), 5.7, 0.2, 0.02)
      tiembla(tl, [h, ...q(el, '.rel')], 5.75)
      // 3 · El reloj se vuelve el lugar. Y ahí se encuentran.
      sale(tl, [...q(el, '.rel, .timbre')], 6.6)
      morfa(tl, h, S.reloj, S.lugar, 6.7)
      tl.to(h, { fill: AZUL, duration: 0.6 }, 6.8)
      brota(tl, q(el, '.ojo'), 7.4)
      dibuja(tl, q(el, '.suelo'), 7.2, 0.7)
      tl.fromTo(q(el, '.izq'), { x: -120, autoAlpha: 1 }, { x: 0, duration: 0.9, ease: 'power2.out' }, 7.5)
      tl.fromTo(q(el, '.der'), { x: 120, autoAlpha: 1 }, { x: 0, duration: 0.9, ease: 'power2.out' }, 7.6)
      tl.to(q(el, '.izq .vn-p > g, .der .vn-p > g'), { y: -2.5, duration: 0.14, yoyo: true, repeat: 5, stagger: 0.05 }, 7.55)
      brota(tl, q(el, '.gl-a > g'), 8.6, 0, '80% 100%')
      brota(tl, q(el, '.ok > g'), 9.3)
      brinca(tl, q(el, '.izq .vn-p > g, .der .vn-p > g'), 9.4)
      sale(tl, [...q(el, '.izq, .der, .gl-a, .ok, .suelo, .ojo')], 10.7)
      morfa(tl, h, S.lugar, S.punto, 10.8, 0.6)
      sale(tl, h, 11.25, 0.2)
      tl.to({}, { duration: 0.3 }, 11.4)
    },
  },

  // Sistemas: se construye → también en el celular → es uno más de la red que cuidamos.
  sistemas: {
    color: 'tinta',
    svg: `${T([P.line(120, 54, 44, 30), P.line(120, 54, 56, 84), P.line(120, 54, 192, 82), P.line(120, 54, 185, 30)], 1.6, 'vn-w hilo')}
      ${[[44, 28], [56, 84], [192, 82]].map(([x, y]) => `<g transform="translate(${x} ${y})"><g class="vecino"><rect x="-14" y="-10" width="28" height="20" rx="4" fill="#fff"/><rect x="-14" y="-10" width="28" height="6" rx="3" fill="${TINTA}"/><circle class="luz" cx="7" cy="3" r="3" fill="#5d5f6b"/></g></g>`).join('')}
      <path class="vn-h" fill="#fff" d="${aD(S.ventana)}"/>
      <g class="v1">${T([P.line(52, 28, 188, 28)], 2, 'vn-k')}${[62, 71, 80].map((x) => `<circle class="bolita" cx="${x}" cy="20" r="2.6" fill="${TINTA}"/>`).join('')}
        <rect class="bloque" x="62" y="36" width="54" height="26" rx="4" fill="${AZUL}"/>${T([P.line(126, 40, 178, 40), P.line(126, 50, 166, 50), P.line(126, 60, 172, 60)], 2.4, 'vn-k texto')}<rect class="bloque" x="62" y="70" width="116" height="9" rx="4" fill="rgb(5 5 6 / 0.14)"/></g>
      <g class="v2"><rect x="112" y="13" width="16" height="3" rx="1.5" fill="${TINTA}"/><rect class="bloque2" x="105" y="24" width="30" height="18" rx="3" fill="${AZUL}"/>${T([P.line(105, 50, 135, 50), P.line(105, 58, 127, 58)], 2.2, 'vn-k texto2')}
        ${T(poli([[104, 74], [112, 74], [116, 66], [121, 82], [126, 71], [129, 74], [136, 74]], false, 5), 2.2, 'vn-azul latido')}</g>
      <g class="v3"><rect x="170" y="18" width="30" height="7" rx="3.5" fill="${TINTA}"/><circle class="estado" cx="185" cy="32" r="4.4" fill="#1fce6d"/></g>
      <g class="soma" transform="translate(120 54)"><g><circle r="13" fill="#fff"/><circle r="6" fill="${AZUL}"/></g></g>
      ${[0, 1, 2, 3].map(() => `<circle class="pulso" r="3.4" fill="#5d95ff"/>`).join('')}
      <circle class="alarma" cx="185" cy="29" r="12" fill="none" stroke="#ff574a" stroke-width="2.4"/>
      ${sello(206, 12, 9, 'ok')}`,
    anima(tl, el) {
      const h = el.querySelector('.vn-h')
      empieza(tl, h, S.ventana)
      // 1 · El sistema se construye, pieza por pieza.
      tl.fromTo(h, { scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%' }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0)
      entra(tl, q(el, '.v1'), 0.5, 0.1)
      dibuja(tl, q(el, '.v1 > .draw'), 0.5, 0.5)
      brota(tl, q(el, '.bolita'), 0.7, 0.08)
      brota(tl, q(el, '.bloque'), 1.1, 0.7, '0% 50%')
      dibuja(tl, q(el, '.texto'), 1.4, 0.5, 0.14)
      // 2 · La ventana se vuelve teléfono: el mismo sistema, en la mano.
      sale(tl, q(el, '.v1'), 2.9)
      morfa(tl, h, S.ventana, S.telefono, 3)
      entra(tl, q(el, '.v2'), 3.7, 0.1)
      brota(tl, q(el, '.bloque2'), 3.8, 0, '50% 0%')
      dibuja(tl, q(el, '.texto2'), 4, 0.4, 0.12)
      dibuja(tl, q(el, '.latido'), 4.4, 0.9, 0)
      // 3 · El teléfono se vuelve uno más de la red. Uno avisa que algo anda mal… y se arregla desde aquí.
      sale(tl, q(el, '.v2'), 5.4)
      morfa(tl, h, S.telefono, S.nodo, 5.5, 0.7)
      brota(tl, q(el, '.soma > g'), 5.9)
      dibuja(tl, q(el, '.hilo'), 6, 0.6, 0.08)
      brota(tl, q(el, '.vecino'), 6.2, 0.1)
      entra(tl, q(el, '.v3'), 6.2)
      const destinos = [[44, 30], [56, 84], [192, 82], [185, 30]]
      const luces = [...q(el, '.luz')]
      q(el, '.pulso').forEach((c, i) => {
        tl.set(c, { autoAlpha: 0 }, 0)
        tl.fromTo(c, { x: 120, y: 54, autoAlpha: 1 }, { x: destinos[i][0], y: destinos[i][1], duration: 0.6, ease: 'power1.in', immediateRender: false }, 6.9 + i * 0.12)
        tl.set(c, { autoAlpha: 0 }, 7.5 + i * 0.12)
        if (luces[i]) tl.fromTo(luces[i], { fill: '#5d5f6b' }, { fill: '#1fce6d', duration: 0.12, yoyo: true, repeat: 3, immediateRender: false }, 7.5 + i * 0.12)
      })
      tl.to(q(el, '.estado'), { fill: '#ff574a', duration: 0.15 }, 8.1)
      tiembla(tl, [h, ...q(el, '.v3')], 8.1)
      tl.set(q(el, '.alarma'), { autoAlpha: 0 }, 0)
      tl.fromTo(q(el, '.alarma'), { attr: { r: 8 }, autoAlpha: 0.9 }, { attr: { r: 30 }, autoAlpha: 0, duration: 0.6, ease: 'power1.out', repeat: 1, immediateRender: false }, 8.1)
      const cura = q(el, '.pulso')[3]
      tl.fromTo(cura, { x: 120, y: 54, autoAlpha: 1 }, { x: 185, y: 30, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, 9.3)
      tl.set(cura, { autoAlpha: 0 }, 10)
      tl.to(q(el, '.estado'), { fill: '#1fce6d', duration: 0.2 }, 10)
      brota(tl, q(el, '.ok > g'), 10.1)
      sale(tl, [...q(el, '.v3, .soma, .hilo, .vecino, .ok')], 11.3)
      sale(tl, h, 11.3)
      tl.to({}, { duration: 0.3 }, 11.6)
    },
  },

  // Ajustes: el engrane → el tablero de controles → el candado que guarda las llaves.
  ajustes: {
    color: 'papel',
    svg: `<g class="chico" transform="translate(160 30)"><g>${T([P.circle(0, 0, 12, 12), P.circle(0, 0, 4, 6), ...Array.from({ length: 7 }, (_, i) => P.line(Math.cos((i / 7) * 6.283) * 12, Math.sin((i / 7) * 6.283) * 12, Math.cos((i / 7) * 6.283) * 18, Math.sin((i / 7) * 6.283) * 18, 2))], 2.4, 'vn-k')}</g></g>
      <g class="arco">${T([P.arc(120, 44, 15, 180, 360, 12), P.line(105, 44, 105, 52), P.line(135, 44, 135, 52)], 3.2, 'vn-k')}</g>
      <path class="vn-h" fill="${TINTA}" d="${aD(S.engrane)}"/>
      <g class="eje"><circle cx="112" cy="52" r="9" fill="${PAPEL}"/><circle cx="112" cy="52" r="3.6" fill="${AZUL}"/></g>
      <g class="t1">${[30, 50, 70].map((y) => `<line x1="76" y1="${y}" x2="164" y2="${y}" stroke="rgb(239 236 228 / 0.3)" stroke-width="4" stroke-linecap="round"/><line class="lleno" x1="76" y1="${y}" x2="76" y2="${y}" stroke="${AZUL}" stroke-width="4" stroke-linecap="round"/><circle class="perilla" cx="76" cy="${y}" r="6.5" fill="${PAPEL}"/>`).join('')}</g>
      <g class="t2"><circle cx="120" cy="60" r="5" fill="${PAPEL}"/><rect x="118" y="60" width="4" height="12" rx="2" fill="${PAPEL}"/></g>
      <g class="llave"><g>${T([P.circle(40, 64, 9, 12), P.line(49, 64, 86, 64), P.line(76, 64, 76, 71), P.line(83, 64, 83, 70)], 2.8, 'vn-k')}</g></g>
      <g class="chispas" transform="translate(120 20)">${T([P.line(-13, 2, -21, -4), P.line(0, -4, 0, -13), P.line(13, 2, 21, -4)], 2.4, 'vn-azul')}</g>`,
    anima(tl, el) {
      const h = el.querySelector('.vn-h')
      empieza(tl, h, S.engrane)
      // 1 · Los engranes: uno mueve al otro.
      tl.fromTo(h, { scale: 0, autoAlpha: 1, rotation: -90, svgOrigin: '112 52' }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' }, 0)
      brota(tl, q(el, '.eje'), 0.3)
      dibuja(tl, q(el, '.chico .draw'), 0.3, 0.8)
      tl.to(h, { rotation: 144, duration: 2.3, ease: 'power1.inOut' }, 0.7)
      tl.fromTo(q(el, '.chico > g'), { rotation: 0, transformOrigin: '50% 50%' }, { rotation: -206, duration: 2.3, ease: 'power1.inOut' }, 0.7)
      // 2 · El engrane se vuelve tablero: los controles se acomodan.
      sale(tl, [...q(el, '.eje, .chico')], 3)
      tl.set(h, { rotation: 0 }, 3.1)
      morfa(tl, h, S.engrane, S.tablero, 3.1)
      entra(tl, q(el, '.t1'), 3.8)
      const metas = [64, 30, 78]
      q(el, '.perilla').forEach((c, i) => {
        tl.fromTo(c, { x: 0 }, { x: metas[i], duration: 0.8, ease: 'back.out(1.6)' }, 4 + i * 0.3)
        tl.to(c, { x: metas[i] - 20 + i * 14, duration: 0.6, ease: 'power2.inOut' }, 5.4 + i * 0.12)
      })
      q(el, '.lleno').forEach((l, i) => {
        tl.fromTo(l, { attr: { x2: 76 } }, { attr: { x2: 76 + metas[i] }, duration: 0.8, ease: 'back.out(1.6)' }, 4 + i * 0.3)
        tl.to(l, { attr: { x2: 76 + metas[i] - 20 + i * 14 }, duration: 0.6, ease: 'power2.inOut' }, 5.4 + i * 0.12)
      })
      // 3 · El tablero se vuelve candado. La llave entra, gira y abre.
      sale(tl, q(el, '.t1'), 6.5)
      morfa(tl, h, S.tablero, S.candado, 6.6)
      dibuja(tl, q(el, '.arco .draw'), 7.2, 0.5, 0.05)
      brota(tl, q(el, '.t2'), 7.3)
      dibuja(tl, q(el, '.llave .draw'), 7.4, 0.5, 0.05)
      tl.fromTo(q(el, '.llave'), { x: -50 }, { x: 22, duration: 0.8, ease: 'power3.out' }, 7.7)
      tl.fromTo(q(el, '.llave > g'), { scaleY: 1, svgOrigin: '60 64' }, { keyframes: { scaleY: [1, 0.15, 1] }, duration: 0.45, ease: 'power1.inOut' }, 8.6)
      tl.fromTo(q(el, '.arco'), { y: 0, rotation: 0, svgOrigin: '135 52' }, { y: -8, rotation: 16, duration: 0.4, ease: 'back.out(3)' }, 9.05)
      dibuja(tl, q(el, '.chispas .draw'), 9.2, 0.3, 0.05)
      tl.fromTo(q(el, '.chispas'), { autoAlpha: 1 }, { autoAlpha: 0.2, duration: 0.25, yoyo: true, repeat: 3 }, 9.5)
      sale(tl, [...q(el, '.arco, .t2, .llave, .chispas')], 10.6)
      sale(tl, h, 10.6)
      tl.to({}, { duration: 0.3 }, 10.9)
    },
  },
}

// ───────────────────────── Marcado y arranque ─────────────────────────

/** El marcado de una viñeta. Siempre sale idéntico (los trazos usan la semilla de la vista). */
export function vineta(nombre) {
  const v = VINETAS[nombre]
  if (!v) return ''
  return `<div class="vn vn--${v.color}" data-vn="${nombre}" aria-hidden="true"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><g class="vn-cam">${v.svg}</g></svg></div>`
}

function arma(el) {
  const v = VINETAS[el.dataset.vn]
  const tl = gsap.timeline({ repeat: -1 })
  v.anima(tl, el)
  // La cámara deriva despacio de principio a fin: nunca está quieta.
  tl.fromTo(el.querySelector('.vn-cam'), { scale: 1.07, x: -5, y: 2, svgOrigin: `${W / 2} ${H / 2}` }, { scale: 1, x: 4, y: -1, duration: tl.duration(), ease: 'sine.inOut' }, 0)
  el._tl = tl
}

/** Echa a andar las viñetas que haya en la vista. Las que ya corren, siguen. */
export function animaVinetas(raiz) {
  raiz.querySelectorAll('[data-vn]').forEach((el) => {
    if (el._tl) return
    arma(el)
    // Quien pidió menos movimiento ve la primera escena, quieta.
    if (reducido) el._tl.pause(2.5)
  })
}
