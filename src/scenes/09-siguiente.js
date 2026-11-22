import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words, rise, fade } from '../core/fx.js'
import { ringBtn } from '../icons/icons.js'
import { C, CONTACT } from '../content/es.js'

// Cierre: el punto vuelve a su anillo. El logo, ahora sobre papel.
const contact = Object.entries(CONTACT).filter(([, v]) => v && v.trim())

export default {
  id: 'siguiente',
  theme: 'paper',
  title: C.s9.nav,
  html: () => `
    <div class="scene-inner s9">
      <div class="s9-logo" aria-hidden="true">
        <svg viewBox="-100 -100 200 200">${boil(P.circle(0, 0, 89.75, 44), { amp: 0.42, cls: 'draw s9-ring' })}</svg>
        <i class="s9-dot" data-dot></i>
      </div>
      <div class="s9-text">
        <h2 class="t-display s9-h">${C.s9.title.map((t) => `<span class="ln">${words(t)}</span>`).join(' ')}</h2>
        <p class="t-body s9-body">${C.s9.body}</p>
        <div class="s9-cols">
          <ol class="s9-steps">
            ${C.s9.steps.map((s) => `<li><span class="t-label">${s.when}</span><span class="t-name">${s.what}</span></li>`).join('')}
          </ol>
          ${
            contact.length
              ? `<ul class="s9-contact selectable">${contact
                  .map(([k, v]) => `<li><span class="t-label">${C.s9.contactLabels[k]}</span><span class="s9-cv">${v}</span></li>`)
                  .join('')}</ul>`
              : ''
          }
        </div>
        <div class="s9-foot">${ringBtn(C.s9.restart, { act: 'home', dir: 'left' })}</div>
      </div>
      <p class="t-label s9-lema">${C.s9.lema}</p>
    </div>`,
  setup(el) {
    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s9-h .wi'), 0, { stagger: 0.09, duration: 1.15 })
    tl.fromTo($(el, '.s9-ring'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.6, ease: 'expo.inOut' }, 0.1)
    fade(tl, [$(el, '.s9-body'), ...$$(el, '.s9-steps li'), ...$$(el, '.s9-contact li'), $(el, '.s9-foot'), $(el, '.s9-lema')], 0.55, { stagger: 0.08 })
    return { enter: tl, anchor: () => $(el, '.s9-dot') }
  },
}
