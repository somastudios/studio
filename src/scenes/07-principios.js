import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, pad, words, rise, fade, swap, put } from '../core/fx.js'
import { ringBtn } from '../icons/icons.js'
import { C } from '../content/es.js'

// Un dial. Los principios giran sobre un anillo enorme; el punto no se mueve:
// todo lo demás gira a su alrededor.
const I = C.s7.items
const N = I.length
const STEP = 15

export default {
  id: 'principios',
  theme: 'paper',
  title: C.s7.nav,
  html: () => `
    <div class="scene-inner s7">
      <div class="s7-dial">
        <svg class="s7-arc" viewBox="470 -380 150 760" aria-hidden="true">${boil(P.arc(0, 0, 600, -38, 38, 24), { amp: 1.3 })}</svg>
        <div class="s7-wheel">
          ${I.map((it, i) => `<button type="button" class="s7-item t-display" data-i="${i}" data-d="9" style="--i:${i}" tabindex="-1">${it.name}</button>`).join('')}
        </div>
        <i class="s7-a" data-dot></i>
        <div class="s7-text-wrap"><p class="s7-text" aria-live="polite"></p></div>
      </div>
      <header class="s7-head">
        <h2 class="t-display s7-h">${C.s7.title.map((t) => `<span class="ln">${words(t)}</span>`).join(' ')}</h2>
        <p class="t-label s7-idx"></p>
      </header>
      <div class="s7-nav">
        ${ringBtn('', { dir: 'up', aria: 'Principio anterior', cls: 's7-up' })}
        ${ringBtn('', { dir: 'down', aria: 'Principio siguiente', cls: 's7-down' })}
      </div>
    </div>`,
  setup(el, { dot, deck }) {
    const wheel = $(el, '.s7-wheel')
    const items = $$(el, '.s7-item')
    const text = $(el, '.s7-text')
    const idx = $(el, '.s7-idx')
    const up = $(el, '.s7-up')
    const down = $(el, '.s7-down')
    let sel = 0

    const mark = (i) => {
      items.forEach((b, k) => (b.dataset.d = Math.min(9, Math.abs(k - i))))
      idx.textContent = `${pad(i + 1)} / ${pad(N)}`
      up.disabled = i === 0
      down.disabled = i === N - 1
    }

    function select(i) {
      if (deck.busy || i === sel || i < 0 || i >= N) return
      sel = i
      mark(i)
      gsap.to(wheel, { rotation: -i * STEP, duration: 1, ease: 'expo.out', overwrite: true })
      swap(text, I[i].text)
      dot.pulse(1.3)
    }

    items.forEach((b, i) => b.addEventListener('click', () => select(i)))
    up.addEventListener('click', () => select(sel - 1))
    down.addEventListener('click', () => select(sel + 1))

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s7-h .wi'), 0, { stagger: 0.08 })
    tl.fromTo(wheel, { rotation: 42 }, { rotation: 0, duration: 1.6, ease: 'expo.out' }, 0)
    fade(tl, $(el, '.s7-arc'), 0.1, { y: 0 })
    fade(tl, [$(el, '.s7-text-wrap'), idx, $(el, '.s7-nav')], 0.7)

    return {
      enter: tl,
      anchor: () => $(el, '.s7-a'),
      reset() {
        sel = 0
        mark(0)
        put(text, I[0].text)
      },
      key(e) {
        if (e.key === 'ArrowDown') return select(sel + 1), true
        if (e.key === 'ArrowUp') return select(sel - 1), true
        return false
      },
    }
  },
}
