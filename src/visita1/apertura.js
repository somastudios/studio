import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words, wordsDot, rise, fade, pad } from '../core/fx.js'
import { ringBtn, icon } from '../icons/icons.js'
import { C } from '../content/es.js'
import { V1 } from '../content/visita.js'
import { AREA } from '../content/base.js'
import { esc } from '../app/util.js'
import { escena, tx, linea } from './base.js'
import { lienzo, montaTrazos } from './trazos.js'

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

/** El acuerdo: quiénes somos y tres compromisos que le quitan al cliente la razón para defenderse. */
export const acuerdo = (E) =>
  escena({
    id: 'acuerdo',
    theme: 'paper',
    title: V1.acuerdo.nav,
    pinta(el, { dot, deck, dir }) {
      const T = V1.acuerdo
      const quienes = E.presentadores()
      let paso = dir < 0 ? T.puntos.length - 1 : 0
      el.innerHTML = `
        <div class="scene-inner va">
          <header class="va-cab">
            <h2 class="t-display va-h">${T.titulo.map((t) => `<span class="ln">${words(t)}</span>`).join('')}</h2>
            <p class="va-somos">${esc(T.somos)}</p>
            <ul class="va-quienes ${quienes.length === 2 ? 'va-quienes--2' : ''}">
              ${quienes.map((q) => `<li><span class="t-name va-nombre">${esc(q.nombre)}</span><span class="t-body va-linea">${esc(q.linea || '')}</span></li>`).join('')}
            </ul>
            <div class="va-tv">${['precio', 'ritmo', 'no'].map((n) => lienzo(n)).join('')}</div>
          </header>
          <ol class="va-puntos">
            ${T.puntos
              .map(
                (p, i) => `<li><button type="button" class="va-punto" data-i="${i}" aria-pressed="false">
                  <i class="va-a"></i>
                  <span class="t-label va-n">${pad(i + 1)}</span>
                  <span class="va-tx"><span class="t-display va-t">${esc(p.t)}</span><span class="t-body va-d">${tx(p.d, { negocio: E.negocio })}</span></span>
                </button></li>`,
              )
              .join('')}
          </ol>
        </div>`
      const puntos = $$(el, '.va-punto')
      const anclas = puntos.map((b) => $(b, '.va-a'))
      // Cada compromiso tiene su dibujo: solo se ve (y solo se calcula) el del que está activo.
      const dibujos = $$(el, '.va-tv svg')
      montaTrazos(el)
      const marca = () => {
        puntos.forEach((b, k) => b.setAttribute('aria-pressed', String(k === paso)) || b.classList.toggle('es-visto', k < paso))
        dibujos.forEach((d, k) => d.classList.toggle('es-activo', k === paso))
      }
      const ir = (i) => {
        if (deck.busy || i === paso || i < 0 || i >= puntos.length) return false
        paso = i
        marca()
        dot.to(anclas[i], { duration: 0.7, ease: 'expo.inOut' })
        return true
      }
      marca()
      puntos.forEach((b, i) => b.addEventListener('click', () => ir(i)))
      const tl = linea()
      rise(tl, $$(el, '.va-h .wi'), 0, { stagger: 0.08 })
      fade(tl, [$(el, '.va-somos'), ...$$(el, '.va-quienes li')], 0.4)
      fade(tl, $(el, '.va-tv'), 0.9)
      tl.fromTo(puntos, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, 0.5)
      return {
        tl,
        anchor: () => anclas[paso],
        next: () => ir(paso + 1),
        prev: () => ir(paso - 1),
        key: (e) => (e.key === 'ArrowDown' ? (ir(paso + 1), true) : e.key === 'ArrowUp' ? (ir(paso - 1), true) : false),
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
