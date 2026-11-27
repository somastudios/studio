import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words } from '../core/fx.js'
import { ringBtn } from '../icons/icons.js'
import { icoNicho } from '../icons/render.js'
import { C } from '../content/es.js'
import { V1 } from '../content/visita.js'
import { esc, fecha, mayus } from '../app/util.js'
import { cortoGiro, hayCorto } from './cortos-giro.js'
import { escena, tx, linea } from './base.js'

// La portada de una visita. Dos tiempos, solo con las flechas. El protagonista es el punto
// azul de la presentación (el mismo que luego abre cada escena), así que todo lo que pasa aquí
// lo provoca él.
//
// Tiempo 0 · El punto llega (solo, 2.4 s)
//   0.15  El punto cae desde arriba del cuadro, estirándose con la velocidad.
//   0.62  Impacto en el centro: se aplasta y tiembla como gelatina, la cámara se sacude,
//         saltan chispas azules y dos ondas se abren. La onda grande se vuelve el aro de Soma,
//         con rebote elástico: el aro nace del golpe.
//   0.66  Rebota una vez, más chico, y se asienta.
//   0.70  El golpe empuja las letras: suben en ola desde el aro hacia afuera (Studio, A, M,
//         O, S) y luego el lema, palabra por palabra.
//
// Tiempo 1 · Escribe su nombre (→, 1.95 s)
//   0.00  El punto se agacha para tomar vuelo; el aro recula.
//   0.20  Salta en un arco alto por encima de SOMA. Cada letra que queda debajo de él se cae,
//         pateada, en el orden en que pasa.
//   0.88  Aterriza a la izquierda, se aplasta y la cámara tiembla.
//   0.96  Se desliza a lo largo del renglón como una pluma: cada letra del nombre brota justo
//         cuando él pasa, y él se va encogiendo.
//   1.62  Frena donde va el punto final, se comprime y se queda: «LA CASONA.»
//         En el aro vacío, mientras tanto, el icono del giro se dibuja trazo por trazo y
//         luego cobra vida.
//
// ← hace el camino de regreso con su propia física (no es la película al revés): borra el
// nombre deslizándose, se agacha, salta sobre el hueco de SOMA levantando cada letra a su paso
// y cae de nuevo en el aro.
//
// Para revisarla: node scripts/portada.cjs <puerto> <carpeta>.

const tope = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const tramo = (t, a, b) => tope((t - a) / (b - a))
const mezcla = (a, b, p) => a + (b - a) * p
const salto = (p) => 4 * p * (1 - p)
const suave = (x) => x * x * (3 - 2 * x)
const curva = (s, [x0, y0], [x1, y1], [x2, y2], [x3, y3]) => {
  const m = 1 - s
  return [m * m * m * x0 + 3 * m * m * s * x1 + 3 * m * s * s * x2 + s * s * s * x3, m * m * m * y0 + 3 * m * m * s * y1 + 3 * m * s * s * y2 + s * s * s * y3]
}
const centro = (r) => [r.left + r.width / 2, r.top + r.height / 2]

/**
 * El recorrido del punto: tramos en el tiempo (quieto, cae, arco, línea) y pulsos que lo
 * deforman (se agacha, golpe, frena). `en(t)` devuelve dónde está, su tamaño y su forma.
 * En el aire se estira en la dirección en que va; al tocar algo se aplasta sin perder el piso.
 */
function recorrido(tramos, pulsos = []) {
  const fin = tramos[tramos.length - 1].t1
  const pos = (t) => {
    t = Math.max(0, Math.min(fin, t))
    const g = tramos.find((x) => t <= x.t1) || tramos[tramos.length - 1]
    const u = tramo(t, g.t0, g.t1)
    if (g.k === 'cae') return { x: mezcla(g.a[0], g.b[0], u * u), y: mezcla(g.a[1], g.b[1], u * u), d: g.d }
    if (g.k === 'arco') {
      const e = suave(u)
      const [x, y] = curva(e, ...g.P)
      return { x, y, d: mezcla(g.d0, g.d1, e) }
    }
    if (g.k === 'linea') return { x: mezcla(g.a[0], g.b[0], u), y: mezcla(g.a[1], g.b[1], u), d: mezcla(g.d0, g.d1, u) }
    return { x: g.p[0], y: g.p[1], d: g.d }
  }
  const en = (t) => {
    const p = pos(t)
    const h = 1 / 120
    const a = pos(t - h)
    const b = pos(t + h)
    const vx = (b.x - a.x) / (2 * h)
    const vy = (b.y - a.y) / (2 * h)
    const v = Math.hypot(vx, vy)
    let q = 0 // aplastado de arriba abajo (negativo: estirado)
    let qx = 0 // comprimido de lado
    for (const g of pulsos) {
      if (g.k === 'agacha') q += g.f * 0.34 * salto(tramo(t, g.t, g.t + g.dur))
      else if (t >= g.t) {
        const z = t - g.t
        const m = g.f * Math.exp(-z * 9) * Math.cos(z * 30)
        if (g.k === 'golpe') q += 0.42 * m
        else qx += 0.32 * m
      }
    }
    let r = 0
    let sx = 1
    let sy = 1
    if (Math.abs(q) > 0.004 || Math.abs(qx) > 0.004) {
      sy = 1 - q
      sx = 1 / sy
      sx *= 1 - qx
      sy /= 1 - qx
      p.y += (p.d / 2) * (1 - sy) // la base se queda en el piso
    } else if (v > 40) {
      const k = 0.42 * tope(v / 2800)
      r = (Math.atan2(vy, vx) * 180) / Math.PI
      sx = 1 + k
      sy = 1 / (1 + k)
    }
    return { ...p, r, sx, sy }
  }
  /** El primer instante entre t0 y t1 en que el punto cruza la x dada. */
  const cuando = (x, t0, t1) => {
    const x0 = pos(t0).x
    const izq = pos(t1).x < x0
    for (let k = 0; k <= 240; k++) {
      const t = mezcla(t0, t1, k / 240)
      if (izq ? pos(t).x <= x : pos(t).x >= x) return t
    }
    return (izq ? x > x0 : x < x0) ? t0 : t1
  }
  return { en, pos, fin, cuando }
}

/** Las letras de un texto, cada una detrás de su máscara. Con `punto`, el punto final al último. */
const letras = (t, punto = false) => {
  const pals = String(t).trim().split(/\s+/)
  return pals
    .map((w, i) => `<span class="s0p-pal">${[...w].map((c) => `<span class="w"><span class="wi">${esc(c)}</span></span>`).join('')}${punto && i === pals.length - 1 ? '<i class="period" data-dot></i>' : ''}</span>`)
    .join(' ')
}

const CHISPAS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 + 0.31
  const r0 = i % 2 ? 44 : 40
  const r1 = r0 + (i % 3 === 0 ? 17 : 12)
  return `<line x1="${(Math.cos(a) * r0).toFixed(1)}" y1="${(Math.sin(a) * r0).toFixed(1)}" x2="${(Math.cos(a) * r1).toFixed(1)}" y2="${(Math.sin(a) * r1).toFixed(1)}"/>`
}).join('')

export const portada = (E, T = V1.portada) =>
  escena({
    id: 'portada',
    theme: 'ink',
    title: C.s0.nav,
    pinta(el, { dot, deck, dir, reduced }) {
      let paso = dir < 0 ? 1 : 0
      const llega = dir > 0 // la primera vez: el punto cae del cielo
      const giro = E.prospecto.nicho_otro || E.nicho.nombre
      const conCorto = hayCorto(E.nicho.familia)
      el.innerHTML = `
        <div class="scene-inner s0">
          <p class="t-label s0-kicker">${tx(T.kicker, { negocio: E.negocio })}</p>
          <div class="s0-logo" aria-hidden="true">
            <svg class="s0-aro" viewBox="-100 -100 200 200">${boil(P.circle(0, 0, 89.75, 44), { amp: 0.42, cls: 'draw s0-ring' })}</svg>
            <svg class="s0-ondas" viewBox="-100 -100 200 200"><circle class="s0-onda" r="36"/><circle class="s0-onda" r="36"/><g class="s0-chispas">${CHISPAS}</g></svg>
            <i class="s0-dot" data-dot></i>
            <div class="s0p-giro" ${conCorto ? 'hidden' : ''}>${icoNicho(E.nicho.icono)}</div>
            ${conCorto ? '<svg class="tv cine s0p-cine" viewBox="0 0 200 200"></svg>' : ''}
          </div>
          <div class="s0-text">
            <h1 class="s0-word"><span class="t-display s0-soma">${letras(C.brand)}</span><span class="s0-studio">${words(C.studio)}</span></h1>
            <p class="s0-lema">${words(T.lema)}</p>
            <p class="t-body s0-sub">${esc(T.sub)}</p>
            ${ringBtn(T.cta, { act: 'next', cls: 's0-cta' })}
          </div>
          <div class="s0p">
            <p class="s0p-k"><i class="s0p-barra"></i><span>${esc(T.para || 'Esta visita es para')}</span></p>
            <h2 class="t-display s0p-nombre">${letras(E.negocio, true)}</h2>
            <ul class="s0p-meta"><li class="s0p-chip">${esc(giro)}</li><li class="s0p-chip">${esc(mayus(fecha(new Date(), 'larga')))}</li></ul>
          </div>
        </div>`

      const inner = $(el, '.s0')
      const soma = $$(el, '.s0-word .wi') // S O M A Studio
      const lema = $$(el, '.s0-lema .wi')
      const sueltos = [$(el, '.s0-kicker'), $(el, '.s0-sub'), $(el, '.s0-cta')]
      const nombre = $(el, '.s0p-nombre')
      const letrasN = $$(nombre, '.wi')
      const [rotulo, meta] = [$(el, '.s0p-k'), $(el, '.s0p-meta')]
      const icono = $(el, '.s0p-giro')
      const trazos = $$(icono, '.boil')
      const aro = $(el, '.s0-aro')
      const ondas = $$(el, '.s0-onda')
      const chispas = $(el, '.s0-chispas')
      const centroAro = $(el, '.s0-dot')
      const final = $(nombre, '.period')
      const cine = $(el, '.s0p-cine')
      const corto = cine ? cortoGiro(cine, E.nicho.familia) : null
      const verGiro = cine || icono

      // El icono se dibuja trazo por trazo: cada trazo mide 1 y se destapa con --draw.
      trazos.forEach((g) => {
        g.classList.add('draw')
        $$(g, 'path').forEach((p) => p.setAttribute('pathLength', '1'))
      })

      // El nombre más grande que quepa junto al aro: en dos renglones, o en tres si es largo.
      const renglones = E.negocio.length > 16 ? 3 : 2
      function ajusta() {
        nombre.style.fontSize = ''
        let px = parseFloat(getComputedStyle(nombre).fontSize)
        const caja = $(el, '.s0p')
        for (let k = 0; k < 40; k++) {
          const alto = parseFloat(getComputedStyle(nombre).lineHeight) || px * 0.82
          if (nombre.scrollWidth <= caja.clientWidth + 1 && nombre.offsetHeight <= alto * (renglones + 0.15)) break
          px *= 0.94
          nombre.style.fontSize = `${px.toFixed(1)}px`
        }
      }
      ajusta()

      // Cada tiempo, quieto y en su sitio.
      function fijo(k) {
        gsap.set([...soma, ...lema], { yPercent: k ? 150 : 0 })
        gsap.set(sueltos, { autoAlpha: k ? 0 : 1, y: 0 })
        gsap.set(letrasN, { yPercent: k ? 0 : 118 })
        gsap.set([rotulo, meta], { autoAlpha: k ? 1 : 0, y: 0 })
        gsap.set(verGiro, { autoAlpha: k ? 1 : 0, scale: 1 })
        gsap.set(trazos, { '--draw': k ? 0 : 1.06 })
        gsap.set(aro, { autoAlpha: 1, scale: 1 })
        gsap.set([...ondas, chispas], { autoAlpha: 0 })
        icono.classList.toggle('vivo', !!k)
      }
      fijo(paso)

      // El punto lo mueve esta escena mientras sea suya: si el deck ya lo mandó a otra
      // escena (por el índice, por ejemplo), lo suelta.
      const mueve = (s) => {
        const a = dot.anchor
        if (a && !el.contains(a)) return
        dot.set(s)
      }
      // La pantalla puede cambiar de tamaño a media animación (al ponerse en pantalla completa):
      // en cada cuadro se mide dónde está de verdad el destino y se corrige el recorrido.
      const conduce = (tl, rec, ancla, at = 0) => {
        const pr = { t: 0 }
        const base = sitio(ancla)
        const ajustado = (s) => {
          const [x, y] = sitio(ancla)
          return { ...s, x: s.x + x - base[0], y: s.y + y - base[1] }
        }
        tl.fromTo(pr, { t: 0 }, { t: rec.fin, duration: rec.fin, ease: 'none', onUpdate: () => mueve(ajustado(rec.en(pr.t))), onComplete: () => dot.snap(ancla) }, at)
      }
      const tiembla = (tl, at, f = 6) =>
        tl
          .to(inner, { keyframes: [{ x: -f * 0.5, y: f, duration: 0.045 }, { x: f * 0.5, y: -f * 0.7, duration: 0.05 }, { x: -f * 0.2, y: f * 0.35, duration: 0.05 }, { x: 0, y: 0, duration: 0.08 }], ease: 'none' }, at)
          .set(inner, { clearProps: 'transform' }, at + 0.25)
      const sitio = (e) => centro(e.getBoundingClientRect())

      // ── La llegada ──
      function llegada(tl) {
        const [ax, ay] = sitio(centroAro)
        const d = centroAro.getBoundingClientRect().width
        const GOLPE = 0.62
        const rec = recorrido(
          [
            { k: 'en', t0: 0, t1: 0.15, p: [ax, -d], d },
            { k: 'cae', t0: 0.15, t1: GOLPE, a: [ax, -d], b: [ax, ay], d },
            { k: 'en', t0: GOLPE, t1: 0.66, p: [ax, ay], d },
            { k: 'arco', t0: 0.66, t1: 1.02, P: [[ax, ay], [ax, ay - d * 0.62], [ax, ay - d * 0.62], [ax, ay]], d0: d, d1: d },
            { k: 'en', t0: 1.02, t1: 2.4, p: [ax, ay], d },
          ],
          [
            { k: 'golpe', t: GOLPE, f: 1 },
            { k: 'golpe', t: 1.02, f: 0.45 },
          ],
        )
        conduce(tl, rec, centroAro)
        // el aro nace del golpe, las ondas se abren y saltan chispas
        tl.fromTo(aro, { autoAlpha: 0, scale: 0.34 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.42)', immediateRender: true }, GOLPE)
        ondas.forEach((o, i) => tl.fromTo(o, { autoAlpha: 0.7, attr: { r: 36 } }, { autoAlpha: 0, attr: { r: i ? 150 : 118 }, duration: i ? 1.3 : 0.95, ease: 'expo.out', immediateRender: false }, GOLPE + i * 0.08))
        tl.fromTo(chispas, { autoAlpha: 1, scale: 0.85, rotation: 0, transformOrigin: '0px 0px' }, { autoAlpha: 0, scale: 1.75, rotation: 14, duration: 0.55, ease: 'expo.out', immediateRender: false }, GOLPE)
        tl.set(chispas, { autoAlpha: 0 }, 0)
        tiembla(tl, GOLPE, 7)
        // el golpe empuja las letras: suben en ola desde el aro hacia afuera
        tl.fromTo(soma, { yPercent: 118 }, { yPercent: 0, duration: 0.75, ease: 'back.out(1.9)', stagger: { each: 0.075, from: 'end' } }, GOLPE + 0.08)
        tl.fromTo(lema, { yPercent: 118 }, { yPercent: 0, duration: 0.85, ease: 'expo.out', stagger: 0.04 }, 1.25)
        tl.fromTo(sueltos, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, 1.55)
      }

      // ── De Soma al nombre del negocio ──
      function escribe(tl) {
        const [ax, ay] = sitio(centroAro)
        const dA = centroAro.getBoundingClientRect().width
        const [bx, by] = sitio(final)
        const dB = final.getBoundingClientRect().width
        const dM = mezcla(dA, dB, 0.55)
        const lx = nombre.getBoundingClientRect().left + dM * 0.55
        const tope0 = Math.min(...soma.map((x) => x.parentNode.getBoundingClientRect().top))
        const cima = Math.max(innerHeight * 0.06 + dA / 2, tope0 - dA * 0.75)
        const yc = ((cima - (ay + by) / 8) * 8) / 6
        const rec = recorrido(
          [
            { k: 'en', t0: 0, t1: 0.2, p: [ax, ay], d: dA },
            { k: 'arco', t0: 0.2, t1: 0.88, P: [[ax, ay], [ax - innerWidth * 0.05, yc], [lx + innerWidth * 0.22, yc], [lx, by]], d0: dA, d1: dM },
            { k: 'en', t0: 0.88, t1: 0.96, p: [lx, by], d: dM },
            { k: 'linea', t0: 0.96, t1: 1.62, a: [lx, by], b: [bx, by], d0: dM, d1: dB },
            { k: 'en', t0: 1.62, t1: 1.95, p: [bx, by], d: dB },
          ],
          [
            { k: 'agacha', t: 0, dur: 0.22, f: 1 },
            { k: 'golpe', t: 0.88, f: 0.8 },
            { k: 'frena', t: 1.62, f: 0.7 },
          ],
        )
        conduce(tl, rec, final)
        // el aro recula cuando el punto se impulsa
        tl.to(aro, { scale: 0.95, duration: 0.18, ease: 'power2.out' }, 0).to(aro, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' }, 0.2)
        // cada letra de SOMA (y del lema) se cae cuando el punto pasa por encima
        ;[...soma, ...lema].forEach((w) => {
          const t = rec.cuando(sitio(w.parentNode)[0], 0.2, 0.88)
          tl.to(w, { keyframes: [{ yPercent: -16, duration: 0.07, ease: 'power1.out' }, { yPercent: 150, duration: 0.34, ease: 'power2.in' }] }, t - 0.04)
        })
        sueltos.forEach((x) => tl.to(x, { autoAlpha: 0, y: 14, duration: 0.3, ease: 'power2.in' }, rec.cuando(sitio(x)[0], 0.2, 0.88)))
        tiembla(tl, 0.88, 4)
        // cada letra del nombre brota cuando el punto pasa por ella
        letrasN.forEach((w) => tl.fromTo(w, { yPercent: 118 }, { yPercent: 0, duration: 0.55, ease: 'back.out(2.2)' }, rec.cuando(sitio(w.parentNode)[0], 0.96, 1.62) - 0.07))
        tl.fromTo(rotulo, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.9)
        tl.fromTo(meta, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.6)
        // en el aro vacío se dibuja el giro, trazo por trazo, y luego cobra vida
        if (corto) {
          tl.call(() => corto.desde(), null, 0.3)
          tl.fromTo(cine, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, 0.3)
        } else {
          tl.set(icono, { autoAlpha: 1 }, 0.3)
          tl.fromTo(trazos, { '--draw': 1.06 }, { '--draw': 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.11 }, 0.32)
          tl.call(() => icono.classList.add('vivo'), null, 1.25)
        }
      }

      // ── Del nombre de regreso a Soma ──
      function borra(tl) {
        const [ax, ay] = sitio(centroAro)
        const dA = centroAro.getBoundingClientRect().width
        const [bx, by] = sitio(final)
        const dB = final.getBoundingClientRect().width
        const dM = mezcla(dA, dB, 0.55)
        const lx = nombre.getBoundingClientRect().left + dM * 0.55
        const tope0 = Math.min(...soma.map((x) => x.parentNode.getBoundingClientRect().top))
        const cima = Math.max(innerHeight * 0.06 + dA / 2, tope0 - dA * 0.75)
        const yc = ((cima - (ay + by) / 8) * 8) / 6
        const rec = recorrido(
          [
            { k: 'en', t0: 0, t1: 0.14, p: [bx, by], d: dB },
            { k: 'linea', t0: 0.14, t1: 0.74, a: [bx, by], b: [lx, by], d0: dB, d1: dM },
            { k: 'en', t0: 0.74, t1: 0.98, p: [lx, by], d: dM },
            { k: 'arco', t0: 0.98, t1: 1.66, P: [[lx, by], [lx + innerWidth * 0.22, yc], [ax - innerWidth * 0.05, yc], [ax, ay]], d0: dM, d1: dA },
            { k: 'en', t0: 1.66, t1: 2.0, p: [ax, ay], d: dA },
          ],
          [
            { k: 'agacha', t: 0, dur: 0.14, f: 0.45 },
            { k: 'frena', t: 0.74, f: 0.5 },
            { k: 'agacha', t: 0.76, dur: 0.24, f: 1 },
            { k: 'golpe', t: 1.66, f: 0.75 },
          ],
        )
        conduce(tl, rec, centroAro)
        // el icono se desdibuja y el nombre se borra a su paso
        tl.call(() => icono.classList.remove('vivo'), null, 0)
        tl.to(trazos, { '--draw': 1.06, duration: 0.4, ease: 'power2.in', stagger: { each: 0.06, from: 'end' } }, 0)
        if (cine) tl.to(cine, { autoAlpha: 0, scale: 0.6, duration: 0.45, ease: 'back.in(1.6)' }, 0)
        tl.set(icono, { autoAlpha: 0 }, 0.75)
        tl.to(meta, { autoAlpha: 0, y: 10, duration: 0.3, ease: 'power2.in' }, 0)
        letrasN.forEach((w) => tl.to(w, { keyframes: [{ yPercent: -14, duration: 0.07, ease: 'power1.out' }, { yPercent: 125, duration: 0.3, ease: 'power2.in' }] }, rec.cuando(sitio(w.parentNode)[0], 0.14, 0.74) - 0.04))
        tl.to(rotulo, { autoAlpha: 0, y: 10, duration: 0.3, ease: 'power2.in' }, 0.7)
        // SOMA se levanta detrás del punto, letra por letra
        ;[...soma, ...lema].forEach((w) => tl.fromTo(w, { yPercent: 150 }, { yPercent: 0, duration: 0.6, ease: 'back.out(2)' }, rec.cuando(sitio(w.parentNode)[0], 0.98, 1.66) - 0.03))
        tl.fromTo(sueltos, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 1.55)
        // el aro recibe al punto
        tl.to(aro, { scale: 0.94, duration: 0.12, ease: 'power2.out' }, 1.66).to(aro, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' }, 1.78)
      }

      // ── La entrada a la escena ──
      const tl = linea()
      if (paso === 0 && llega) llegada(tl)
      else if (paso === 0) {
        tl.fromTo(soma, { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'back.out(1.7)', stagger: { each: 0.06, from: 'end' } }, 0.2)
        tl.fromTo(lema, { yPercent: 118 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.035 }, 0.6)
        tl.fromTo(sueltos, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.9)
      } else {
        // se llega de vuelta desde la escena siguiente: el punto ya viene al punto final
        tl.fromTo(letrasN, { yPercent: 118 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.035 }, 0.3)
        tl.fromTo([rotulo, meta], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.2 }, 0.5)
        if (corto) {
          tl.call(() => corto.desde(), null, 0.3)
          tl.fromTo(cine, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, 0.3)
        } else tl.fromTo(trazos, { '--draw': 1.06 }, { '--draw': 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.1 }, 0.5)
      }

      let cambio = null
      function cambia(k) {
        tl.progress(1)
        cambio?.progress(1)
        paso = k
        if (reduced) {
          fijo(k)
          dot.snap(k ? final : centroAro)
          return
        }
        cambio = gsap.timeline()
        ;(k ? escribe : borra)(cambio)
      }
      // Si se cambia de escena con un movimiento a medias, primero se termina.
      const termina = () => {
        if (cambio?.isActive()) cambio.progress(1)
        if (tl.isActive()) tl.progress(1)
        return false
      }

      // En desarrollo, la animación en curso queda a la mano para revisarla (scripts/portada.cjs).
      if (import.meta.env.DEV) window.__portada = { actual: () => (cambio && cambio.progress() < 1 ? cambio : tl) }

      return {
        tl,
        anchor: () => (paso ? final : centroAro),
        next: () => (paso === 0 && !deck.busy ? (cambia(1), true) : termina()),
        prev: () => (paso === 1 && !deck.busy ? (cambia(0), true) : termina()),
        resize: ajusta,
        leave() {
          cambio?.kill()
          gsap.set(inner, { clearProps: 'transform' })
        },
      }
    },
  })
