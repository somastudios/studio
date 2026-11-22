import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words, rise, fade, pop, swap, put } from '../core/fx.js'
import { scopeGlyph } from '../icons/icons.js'
import { C } from '../content/es.js'

// El alcance es cuántos anillos se construyen alrededor del punto: uno, dos o tres.
const I = C.s8.items
const R = [88, 150, 212]
const NODES = [1, 3, 5]

const orbit = (r, n, i) =>
  Array.from({ length: n }, (_, k) => {
    const a = ((40 + i * 55 + (k * 360) / n) * Math.PI) / 180
    return `<circle cx="${(Math.cos(a) * r).toFixed(2)}" cy="${(Math.sin(a) * r).toFixed(2)}" r="5"/>`
  }).join('')

const detailHtml = (i) => `<p class="s8-tag">${I[i].tag}</p><p class="s8-dt">${I[i].text}</p>`

export default {
  id: 'alcances',
  theme: 'ink',
  title: C.s8.nav,
  html: () => `
    <div class="scene-inner s8">
      <header class="s8-head">
        <h2 class="t-display s8-h">${words(C.s8.title)}</h2>
        <p class="t-body s8-body">${C.s8.body}</p>
      </header>
      <div class="s8-pick">
        <div class="s8-list" role="radiogroup" aria-label="${C.s8.title}">
          ${I.map(
            (it, i) => `<button type="button" class="s8-item" role="radio" aria-checked="false" data-i="${i}">
              <span class="s8-glyph">${scopeGlyph(i + 1)}</span><span class="t-display s8-name">${it.name}</span>
            </button>`,
          ).join('')}
        </div>
        <div class="s8-detail-wrap"><div class="s8-detail" aria-live="polite"></div></div>
      </div>
      <p class="t-label s8-note">${C.s8.note}</p>
      <div class="s8-vis" aria-hidden="true">
        <div class="s8-box">
          <svg viewBox="-240 -240 480 480">
            ${R.map((r, i) => boil(P.circle(0, 0, r), { amp: r * 0.0075, cls: 's8-ghost', seed: 800 + i })).join('')}
            ${R.map((r, i) => boil(P.circle(0, 0, r), { amp: r * 0.0075, cls: 'draw s8-ring', seed: 800 + i })).join('')}
            ${R.map((r, i) => `<g class="s8-orbit">${orbit(r, NODES[i], i)}</g>`).join('')}
          </svg>
          <i class="s8-a" data-dot></i>
          ${I.map((it, i) => `<span class="t-label s8-lab" style="top:${(((240 - R[i]) / 480) * 100).toFixed(3)}%"><span class="s8-lab-in">${it.name}</span></span>`).join('')}
        </div>
      </div>
    </div>`,
  setup(el, { dot, deck }) {
    const items = $$(el, '.s8-item')
    const rings = $$(el, '.s8-ring')
    const orbits = $$(el, '.s8-orbit')
    const labs = $$(el, '.s8-lab')
    const detail = $(el, '.s8-detail')
    let sel = 0
    let tweens = []

    const mark = (i) => {
      items.forEach((b, k) => b.setAttribute('aria-checked', String(k === i)))
      orbits.forEach((o, k) => o.classList.toggle('is-on', k <= i))
      labs.forEach((o, k) => o.classList.toggle('is-on', k <= i))
    }

    function select(i) {
      if (deck.busy || i === sel || i < 0 || i >= I.length) return
      const grow = i > sel
      sel = i
      mark(i)
      tweens.forEach((t) => t.kill())
      tweens = rings.map((ring, k) =>
        gsap.to(ring, {
          '--draw': k <= i ? 0 : 1.06,
          duration: k <= i ? 1.1 : 0.5,
          ease: k <= i ? 'expo.inOut' : 'power2.in',
          delay: grow ? k * 0.12 : (rings.length - 1 - k) * 0.08,
        }),
      )
      swap(detail, detailHtml(i))
      dot.pulse(1.18)
    }

    items.forEach((b, i) => b.addEventListener('click', () => select(i)))

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s8-h .wi'), 0, { stagger: 0.08 })
    pop(tl, $$(el, '.s8-ghost'), 0.1, { from: 0.86, duration: 1.1, stagger: 0.1 })
    tl.fromTo(rings[0], { '--draw': 1.06 }, { '--draw': 0, duration: 1.2, ease: 'expo.inOut' }, 0.5)
    fade(tl, $$(el, '.s8-lab-in'), 0.6, { y: 0, duration: 0.6, stagger: 0.1 })
    fade(tl, [$(el, '.s8-body'), $(el, '.s8-list'), $(el, '.s8-detail-wrap'), $(el, '.s8-note')], 0.5, { stagger: 0.08 })

    return {
      enter: tl,
      anchor: () => $(el, '.s8-a'),
      reset() {
        sel = 0
        mark(0)
        put(detail, detailHtml(0))
        tweens.forEach((t) => t.kill())
        tweens = []
        gsap.set(rings, { '--draw': 1.06 })
        gsap.set(rings[0], { '--draw': 0 })
      },
      key(e) {
        if (e.key === 'ArrowDown') return select(sel + 1), true
        if (e.key === 'ArrowUp') return select(sel - 1), true
        return false
      },
    }
  },
}
