import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words, wordsDot, rise, fade } from '../core/fx.js'
import { C } from '../content/es.js'

// Solo el punto, sin anillo: primero el problema, la solución viene después.
// El punto es el punto final del titular.
export default {
  id: 'premisa',
  theme: 'paper',
  title: C.s1.nav,
  html: () => `
    <div class="scene-inner s1">
      <div class="s1-qs">
        <div class="s1-q s1-old">
          <p class="t-label">${C.s1.oldLabel}</p>
          <p class="s1-qt"><span class="strike">${C.s1.old}<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">${boil(P.line(0, 5, 100, 5, 7), {
            amp: 0.9,
            cls: 'draw',
          })}</svg></span></p>
        </div>
        <div class="s1-q s1-ours">
          <p class="t-label">${C.s1.oursLabel}</p>
          <p class="s1-qt">${C.s1.ours}</p>
        </div>
      </div>
      <p class="t-body s1-body">${C.s1.body}</p>
      <h2 class="t-display s1-h"><span class="ln">${words(C.s1.title[0])}</span><span class="ln">${wordsDot(C.s1.title[1])}</span></h2>
    </div>`,
  setup(el) {
    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s1-h .wi'), 0, { stagger: 0.09, duration: 1.2 })
    fade(tl, $(el, '.s1-old'), 0.35)
    tl.fromTo($(el, '.strike .boil'), { '--draw': 1.06 }, { '--draw': 0, duration: 0.7, ease: 'power3.inOut' }, 1)
    fade(tl, $(el, '.s1-ours'), 1.45)
    fade(tl, $(el, '.s1-body'), 1.7)
    return { enter: tl, anchor: () => $(el, '.period') }
  },
}
