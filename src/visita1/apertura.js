import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words, wordsDot, rise, fade, pad } from '../core/fx.js'
import { ringBtn, icon } from '../icons/icons.js'
import { C } from '../content/es.js'
import { V1 } from '../content/visita.js'
import { AREA } from '../content/base.js'
import { esc } from '../app/util.js'
import { escena, tx, linea } from './base.js'
import { acuerdoVivo } from './trazos.js'

// Las tres primeras escenas de la visita: la portada con el nombre del negocio, el acuerdo
// (por qué no hay que ponerse en guardia) y "lo que suele pasar" (el cliente señala lo suyo).

/** Portada: el logo se traza y aparece para quién es. */
export const portada = (E, T = V1.portada) =>
  escena({
    id: 'portada',
    theme: 'ink',
    title: C.s0.nav,
    pinta(el) {
      el.innerHTML = `
        <div class="scene-inner s0">
          <p class="t-label s0-kicker">${tx(T.kicker, { negocio: E.negocio })}</p>
          <div class="s0-logo" aria-hidden="true">
            <svg viewBox="-100 -100 200 200">${boil(P.circle(0, 0, 89.75, 44), { amp: 0.42, cls: 'draw s0-ring' })}</svg>
            <i class="s0-dot" data-dot></i>
          </div>
          <div class="s0-text">
            <h1 class="s0-word"><span class="t-display s0-soma">${words(C.brand)}</span><span class="s0-studio">${words(C.studio)}</span></h1>
            <p class="s0-lema">${words(T.lema)}</p>
            <p class="t-body s0-sub">${esc(T.sub)}</p>
            ${ringBtn(T.cta, { act: 'next', cls: 's0-cta' })}
          </div>
        </div>`
      const tl = linea()
      tl.fromTo($(el, '.s0-ring'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.7, ease: 'expo.inOut' }, 0.15)
      rise(tl, $$(el, '.s0-word .wi'), 0.55, { stagger: 0.12, duration: 1.25 })
      rise(tl, $$(el, '.s0-lema .wi'), 0.9, { stagger: 0.035 })
      fade(tl, [$(el, '.s0-kicker'), $(el, '.s0-sub'), $(el, '.s0-cta')], 1.2)
      return { tl, anchor: () => $(el, '.s0-dot') }
    },
  })

/**
 * El acuerdo: tres compromisos que le quitan al cliente la razón para defenderse. Se ve uno a
 * la vez, en grande: el texto entra por palabras y el dibujo de la derecha se transforma.
 */
export const acuerdo = (E) =>
  escena({
    id: 'acuerdo',
    theme: 'paper',
    title: V1.acuerdo.nav,
    pinta(el, { dot, deck, dir, reduced }) {
      const T = V1.acuerdo
      const quienes = E.presentadores()
      const n = T.puntos.length
      let paso = dir < 0 ? n - 1 : 0
      el.innerHTML = `
        <div class="scene-inner va">
          <div class="va-izq">
            <p class="t-label va-k"><span>${esc(T.nav)}</span><span class="va-cuenta"></span></p>
            <div class="va-pila">
              ${T.puntos.map((x, k) => `<article class="va-item" data-i="${k}"><h2 class="t-display va-t">${words(x.t)}</h2><p class="t-body va-d">${tx(x.d, { negocio: E.negocio })}</p></article>`).join('')}
            </div>
            <ol class="va-pasos">
              ${T.puntos.map((x, k) => `<li><button type="button" class="va-paso" data-i="${k}" aria-pressed="false" aria-label="${esc(x.t)}"><i class="va-a"></i><span class="t-label">${pad(k + 1)}</span></button></li>`).join('')}
            </ol>
            <footer class="va-pie">
              <p class="va-somos">${esc(T.somos)}</p>
              <ul class="va-quienes">${quienes.map((x) => `<li><span class="t-name va-nombre">${esc(x.nombre)}</span><span class="t-body va-linea">${esc(x.linea || '')}</span></li>`).join('')}</ul>
            </footer>
          </div>
          <div class="va-tv"><svg class="tv cine" viewBox="0 0 320 240" aria-hidden="true"></svg></div>
        </div>`
      const items = $$(el, '.va-item')
      const pasos = $$(el, '.va-paso')
      const anclas = pasos.map((b) => $(b, '.va-a'))
      const vivo = acuerdoVivo($(el, '.va-tv svg'), paso)
      $(el, '.va-tv svg')._vivo = vivo // a la mano para revisarlo cuadro por cuadro
      let texto = null

      // El texto del compromiso: el que se va sube detrás de su máscara y el que llega sube
      // desde abajo, palabra por palabra.
      function muestra(k, previo) {
        pasos.forEach((b, x) => b.setAttribute('aria-pressed', String(x === k)) || b.classList.toggle('es-visto', x < k))
        $(el, '.va-cuenta').textContent = `${pad(k + 1)} / ${pad(n)}`
        texto?.kill()
        items.forEach((it, x) => x !== k && x !== previo && gsap.set(it, { visibility: 'hidden' }))
        const cambia = previo != null && previo !== k
        texto = gsap.timeline()
        if (cambia) {
          const fuera = items[previo]
          texto
            .to($$(fuera, '.wi'), { yPercent: -118, duration: reduced ? 0 : 0.4, ease: 'power3.in', stagger: 0.025 }, 0)
            .to($(fuera, '.va-d'), { autoAlpha: 0, y: -8, duration: reduced ? 0 : 0.28 }, 0)
            .set(fuera, { visibility: 'hidden' })
        }
        const entra = items[k]
        texto
          .set(entra, { visibility: 'visible' }, cambia && !reduced ? 0.3 : 0)
          .fromTo($$(entra, '.wi'), { yPercent: 118 }, { yPercent: 0, duration: reduced ? 0 : 0.95, ease: 'expo.out', stagger: 0.06 }, '<')
          .fromTo($(entra, '.va-d'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.7, ease: 'power3.out' }, '<0.25')
      }
      const ir = (k) => {
        if (deck.busy || k === paso || k < 0 || k >= n) return false
        const previo = paso
        paso = k
        muestra(k, previo)
        vivo.ir(k)
        dot.to(anclas[k], { duration: 0.7, ease: 'expo.inOut' })
        return true
      }
      gsap.set(items, { visibility: 'hidden' })
      pasos.forEach((b, k) => b.addEventListener('click', () => ir(k)))

      const tl = linea()
      fade(tl, [$(el, '.va-k'), $(el, '.va-pasos'), $(el, '.va-pie')], 0.1, { stagger: 0.12 })
      tl.fromTo($(el, '.va-tv'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'expo.out' }, 0.15)
      tl.call(() => muestra(paso, null), null, 0.2)
      return {
        tl,
        anchor: () => anclas[paso],
        next: () => ir(paso + 1),
        prev: () => ir(paso - 1),
        key: (e) => (e.key === 'ArrowDown' ? (ir(paso + 1), true) : e.key === 'ArrowUp' ? (ir(paso - 1), true) : false),
        leave: () => texto?.kill(),
      }
    },
  })

/** Lo que suele pasar: no se le pregunta qué problemas tiene; se le muestran y él corrige. */
export const suele = (E) =>
  escena({
    id: 'suele',
    theme: 'ink',
    title: V1.suele.nav,
    pinta(el, { dot, deck, on }) {
      const T = V1.suele
      const frecuentes = E.nicho.problemas.filter((p) => p.frecuente)
      const otros = E.nicho.problemas.filter((p) => !p.frecuente)
      let abierto = E.datos.marcados.some((id) => otros.some((p) => p.id === id))
      let ultimo = null

      const fila = (p) => `<li><button type="button" class="vs-item" data-p="${esc(p.id)}" aria-pressed="${E.datos.marcados.includes(p.id)}">
        <span class="vs-aro"><svg viewBox="0 0 24 24" aria-hidden="true">${boil(P.circle(12, 12, 9.5, 10), { amp: 0.3, attrs: 'stroke-width="1.35"' })}</svg><i class="vs-a"></i></span>
        ${p.area ? `<span class="vs-ico">${icon(p.area)}</span>` : '<span class="vs-ico"></span>'}
        <span class="vs-tx"><span class="vs-t">${esc(p.titulo)}</span>${p.senal ? `<span class="t-body vs-s">${esc(p.senal)}</span>` : `<span class="t-label vs-s">Lo dijo usted</span>`}</span>
        ${p.area ? `<span class="t-label vs-area">${esc(AREA[p.area]?.nombre || '')}</span>` : ''}
      </button></li>`

      const cuenta = () => {
        const n = E.datos.marcados.length
        return n === 0 ? T.cuenta[0] : n === 1 ? T.cuenta[1] : T.cuenta[2].replace('{n}', n)
      }

      function lista() {
        $(el, '.vs-lista').innerHTML = `
          ${frecuentes.map(fila).join('')}
          ${E.datos.propios.map(fila).join('')}
          ${abierto ? otros.map(fila).join('') : ''}`
        $(el, '.vs-pie').innerHTML = `
          ${otros.length ? `<button type="button" class="t-label vs-mas" data-mas>${abierto ? T.menos : `${T.mas} · ${otros.length}`}</button>` : ''}
          <form class="vs-otra"><input class="v-in" name="otra" autocomplete="off" placeholder="${esc(T.otraPh)}" aria-label="${esc(T.otraPh)}" /><button type="submit" class="t-label vs-agregar">${esc(T.agregar)}</button></form>`
        $(el, '.vs-cuenta').textContent = cuenta()
        $(el, '.vs-otra').addEventListener('submit', (e) => {
          e.preventDefault()
          const v = e.target.otra.value.trim()
          if (!v) return
          ultimo = E.agregaPropio(v)
          lista()
          posar()
        })
      }

      const posar = () => {
        const b = ultimo && $(el, `.vs-item[data-p="${CSS.escape(ultimo)}"][aria-pressed="true"] .vs-a`)
        if (!deck.busy) dot.to(b || $(el, '.period'), { duration: 0.6, ease: 'expo.out' })
      }

      el.innerHTML = `
        <div class="scene-inner vs">
          <header class="vs-cab">
            <h2 class="t-display vs-h"><span class="ln">${words(T.titulo[0])}</span><span class="ln">${wordsDot(T.titulo[1])}</span></h2>
            <p class="t-body vs-intro">${tx(T.intro, { plural: E.plural, negocio: E.negocio })}</p>
            <p class="t-label vs-cuenta" aria-live="polite"></p>
          </header>
          <div class="vs-der"><ul class="vs-lista" data-rueda></ul><div class="vs-pie"></div></div>
        </div>`
      lista()

      on('.vs-item', (b) => {
        const si = E.alterna(b.dataset.p)
        b.setAttribute('aria-pressed', String(si))
        ultimo = si ? b.dataset.p : E.datos.marcados.at(-1) || null
        $(el, '.vs-cuenta').textContent = cuenta()
        posar()
        if (si) dot.pulse(1.25)
      })
      on('[data-mas]', () => {
        abierto = !abierto
        lista()
        gsap.fromTo($$(el, '.vs-item'), { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.4, stagger: 0.02 })
      })

      const tl = linea()
      rise(tl, $$(el, '.vs-h .wi'), 0, { stagger: 0.07 })
      fade(tl, [$(el, '.vs-intro'), $(el, '.vs-cuenta')], 0.4)
      tl.fromTo([...$$(el, '.vs-lista > li'), $(el, '.vs-pie')], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, 0.45)
      return { tl, anchor: () => $(el, '.period') }
    },
  })
