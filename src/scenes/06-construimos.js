import gsap from 'gsap'
import { $, $$, pad, words, rise, fade, swap, put } from '../core/fx.js'
import { C } from '../content/es.js'

// Un menú: diez capacidades y el punto como cursor.
const I = C.s6.items
const N = I.length

const detailHtml = (i) => `<p class="t-label">${pad(i + 1)} / ${pad(N)}</p><p class="s6-dt">${I[i].text}</p>`

export default {
  id: 'construimos',
  theme: 'ink',
  title: C.s6.nav,
  html: () => `
    <div class="scene-inner s6">
      <header class="s6-head">
        <h2 class="t-display s6-h">${C.s6.title.map((t) => `<span class="ln">${words(t)}</span>`).join(' ')}</h2>
      </header>
      <div class="s6-detail-wrap"><div class="s6-detail" aria-live="polite"></div></div>
      <p class="t-body s6-note">${C.s6.note}</p>
      <ol class="s6-list">
        ${I.map(
          (it, i) => `<li><button type="button" class="s6-item" data-i="${i}" aria-pressed="false">
            <i class="s6-a"></i><span class="t-label s6-n">${pad(i + 1)}</span><span class="t-display s6-name">${it.name}</span>
          </button></li>`,
        ).join('')}
      </ol>
    </div>`,
  setup(el, { dot, deck }) {
    const items = $$(el, '.s6-item')
    const anchors = items.map((b) => $(b, '.s6-a'))
    const detail = $(el, '.s6-detail')
    let sel = 0

    const mark = (i) => items.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)))

    function select(i) {
      if (deck.busy || i === sel) return
      sel = i
      mark(i)
      dot.to(anchors[i], { duration: 0.5, ease: 'expo.out' })
      swap(detail, detailHtml(i))
    }

    items.forEach((b, i) => {
      b.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && select(i))
      b.addEventListener('focus', () => select(i))
      b.addEventListener('click', () => select(i))
    })

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s6-h .wi'), 0, { stagger: 0.08 })
    tl.fromTo($$(el, '.s6-list li'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04 }, 0.25)
    fade(tl, [$(el, '.s6-detail-wrap'), $(el, '.s6-note')], 0.6)

    return {
      enter: tl,
      anchor: () => anchors[sel],
      reset() {
        sel = 0
        mark(0)
        put(detail, detailHtml(0))
      },
      key(e) {
        if (e.key === 'ArrowDown') return select((sel + 1) % N), true
        if (e.key === 'ArrowUp') return select((sel + N - 1) % N), true
        return false
      },
    }
  },
}
