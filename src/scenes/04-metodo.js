import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, pad, words, rise, fade } from '../core/fx.js'
import { C } from '../content/es.js'
import { metodoVivo } from '../visita1/trazos-escenas.js'

// Cinco estaciones sobre una línea. El punto es el cabezal: en cada estación
// queda dentro de su anillo, y por un momento esa estación es el logo.
const S = C.s4.steps
const N = S.length
const at = (i) => 10 + i * 20
// desfase del trazo para que el avance termine justo en la estación
const off = (i) => 1.02 - at(i) / 100

export default {
  id: 'metodo',
  theme: 'ink',
  title: C.s4.nav,
  html: () => `
    <div class="scene-inner s4">
      <h2 class="t-display s4-h">${words(C.s4.title)}</h2>
      <div class="s4-track">
        <svg viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
          ${boil(P.line(0, 10, 1000, 10, 24), { amp: 1.5, cls: 's4-base', seed: 400 })}
          ${boil(P.line(0, 10, 1000, 10, 24), { amp: 1.5, cls: 'draw s4-prog', seed: 400 })}
        </svg>
        ${S.map(
          (s, i) => `<button type="button" class="s4-st" data-i="${i}" style="left:${at(i)}%" aria-pressed="false">
            <span class="s4-tick"><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="s4-tick-bg" cx="12" cy="12" r="9.5"/>${boil(P.circle(12, 12, 9.5, 10), {
              amp: 0.3,
              attrs: 'stroke-width="1.35"',
            })}</svg><i></i></span>
            <span class="t-label s4-st-n">${pad(i + 1)}</span>
            <span class="t-name s4-st-name">${s.name}</span>
          </button>`,
        ).join('')}
      </div>
      <div class="s4-stage" aria-live="polite">
        <div class="s4-num-mask"><span class="t-display s4-num">01</span></div>
        <div class="s4-copy">
          <h3 class="t-display s4-name"></h3>
          <p class="t-body s4-text"></p>
        </div>
        <div class="s4-tv"><svg class="tv cine" viewBox="44 0 240 212" aria-hidden="true"></svg></div>
      </div>
    </div>`,
  setup(el, { dot, deck }) {
    const stations = $$(el, '.s4-st')
    const anchors = stations.map((s) => $(s, '.s4-tick i'))
    const prog = $(el, '.s4-prog')
    const num = $(el, '.s4-num')
    const name = $(el, '.s4-name')
    const text = $(el, '.s4-text')
    const copy = $(el, '.s4-copy')
    let step = 0
    let roll = null
    const svg = $(el, '.s4-tv svg')
    const vivo = metodoVivo(svg, 0)
    svg._vivo = vivo

    const mark = (i) => {
      stations.forEach((s, k) => {
        s.setAttribute('aria-pressed', String(k === i))
        s.classList.toggle('is-done', k < i)
      })
    }
    const fill = (i) => {
      num.textContent = pad(i + 1)
      name.textContent = S[i].name
      text.textContent = S[i].text
    }

    function go(i) {
      if (deck.busy || i === step || i < 0 || i >= N) return
      const dir = i > step ? 1 : -1
      step = i
      mark(i)
      vivo.ir(i)
      gsap.to(prog, { '--draw': off(i), duration: 0.95, ease: 'expo.inOut' })
      dot.to(anchors[i], { duration: 0.95, ease: 'expo.inOut' })
      roll?.kill()
      roll = gsap
        .timeline()
        .to(num, { yPercent: -105 * dir, duration: 0.28, ease: 'power2.in' }, 0)
        .to(copy, { autoAlpha: 0, y: -10 * dir, duration: 0.22, ease: 'power2.in' }, 0)
        .add(() => fill(i))
        .fromTo(num, { yPercent: 105 * dir }, { yPercent: 0, duration: 0.85, ease: 'expo.out' })
        .fromTo(copy, { autoAlpha: 0, y: 16 * dir }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '<0.08')
    }

    stations.forEach((s, i) => s.addEventListener('click', () => go(i)))

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s4-h .wi'), 0, { stagger: 0.07 })
    tl.fromTo($(el, '.s4-base'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.2, ease: 'expo.inOut' }, 0.1)
    fade(tl, stations, 0.5, { y: 10, duration: 0.6, ease: 'expo.out' })
    tl.fromTo($(el, '.s4-stage'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 0.45)
    fade(tl, [name, text], 0.7)

    return {
      enter: tl,
      anchor: () => anchors[step],
      reset(dir) {
        roll?.kill()
        step = dir < 0 ? N - 1 : 0
        mark(step)
        fill(step)
        vivo.pon(step)
        gsap.set(num, { yPercent: 0 })
        gsap.set(copy, { autoAlpha: 1, y: 0 })
        gsap.set(prog, { '--draw': off(step) })
      },
      next() {
        if (step >= N - 1) return false
        go(step + 1)
        return true
      },
      prev() {
        if (step <= 0) return false
        go(step - 1)
        return true
      },
    }
  },
}
