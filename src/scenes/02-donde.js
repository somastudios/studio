import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, pad, words, rise, fade, pop, swap, put } from '../core/fx.js'
import { icon } from '../icons/icons.js'
import { C } from '../content/es.js'

// Ocho áreas alrededor del anillo. El punto sale del centro y se posa en la que
// se elija: ahí es donde el negocio se detiene.
const A = C.s2.areas
const N = A.length
const angle = (i) => -90 + (i * 360) / N
const SIDE = ['t', 'r', 'r', 'r', 'b', 'l', 'l', 'l']
const xy = (i) => {
  const a = (angle(i) * Math.PI) / 180
  return [Math.cos(a), Math.sin(a)]
}

const promptHtml = `<p class="t-label s2-k">${C.s2.prompt}</p>`
const areaHtml = (i) => `
  <p class="t-label s2-k">${pad(i + 1)} / ${pad(N)} · ${C.s2.signals}</p>
  <h3 class="t-name s2-name">${A[i].name}</h3>
  <ul class="t-body s2-signals">${A[i].signals.map((s) => `<li>${s}</li>`).join('')}</ul>`

export default {
  id: 'donde',
  theme: 'ink',
  title: C.s2.nav,
  html: () => `
    <div class="scene-inner s2">
      <header class="s2-head">
        <h2 class="t-display s2-h"><span class="ln">${words(C.s2.title[0])}</span><span class="ln">${words(C.s2.title[1])}</span></h2>
        <p class="t-body s2-intro">${C.s2.intro}</p>
      </header>
      <div class="s2-dia">
        <div class="s2-box">
          <svg viewBox="-100 -100 200 200" aria-hidden="true">
            ${boil(P.circle(0, 0, 100, 40), { amp: 0.75, cls: 'draw s2-ring' })}
            <g class="s2-hand">${boil(P.line(0, 0, 100, 0, 5), { amp: 0.6 })}</g>
            <g class="s2-ticks">${A.map((_, i) => {
              const [x, y] = xy(i)
              return `<circle cx="${(x * 100).toFixed(2)}" cy="${(y * 100).toFixed(2)}" r="1.7"/>`
            }).join('')}</g>
          </svg>
          <i class="s2-anchor" data-dot></i>
          ${A.map((a, i) => {
            const [x, y] = xy(i)
            return `<button type="button" class="s2-node" data-i="${i}" data-side="${SIDE[i]}" aria-pressed="false" style="--x:${x.toFixed(4)};--y:${y.toFixed(4)}">
              <span class="s2-ico">${icon(a.icon)}</span><span class="t-name s2-lab">${a.name}</span>
            </button>`
          }).join('')}
        </div>
      </div>
      <div class="s2-panel-wrap"><div class="s2-panel" aria-live="polite"></div></div>
    </div>`,
  setup(el, { dot, deck }) {
    const anchor = $(el, '.s2-anchor')
    const hand = $(el, '.s2-hand')
    const panel = $(el, '.s2-panel')
    const nodes = $$(el, '.s2-node')
    const st = { ang: -90, len: 0 }
    let sel = -1
    let live = false

    // El ancla recorre el radio; el punto la sigue cuadro a cuadro.
    const place = (follow = true) => {
      const a = (st.ang * Math.PI) / 180
      anchor.style.left = `${50 + Math.cos(a) * 50 * st.len}%`
      anchor.style.top = `${50 + Math.sin(a) * 50 * st.len}%`
      anchor.style.width = `${36 + (7 - 36) * st.len}%`
      gsap.set(hand, { rotation: st.ang, scaleX: Math.max(st.len, 0.0001), svgOrigin: '0 0' })
      if (follow && live && !deck.busy) dot.snap(anchor)
    }

    function select(i) {
      if (i === sel || deck.busy) return
      const first = sel < 0
      sel = i
      nodes.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)))
      gsap.killTweensOf(st)
      if (first) {
        st.ang = angle(i)
        gsap.to(st, { len: 1, duration: 1.1, ease: 'expo.out', onUpdate: place })
      } else {
        const d = ((((angle(i) - st.ang + 180) % 360) + 360) % 360) - 180
        gsap.to(st, { ang: st.ang + d, len: 1, duration: 0.95, ease: 'expo.out', onUpdate: place })
      }
      swap(panel, areaHtml(i))
    }

    nodes.forEach((b, i) => b.addEventListener('click', () => select(i)))

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s2-h .wi'), 0, { stagger: 0.08 })
    tl.fromTo($(el, '.s2-ring'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.3, ease: 'expo.inOut' }, 0.1)
    pop(tl, $$(el, '.s2-ticks circle'), 0.7, { from: 0, duration: 0.5, ease: 'back.out(3)' })
    pop(tl, nodes, 0.75, { from: 0.7 })
    fade(tl, [$(el, '.s2-intro'), $(el, '.s2-panel-wrap')], 0.6)

    return {
      enter: tl,
      anchor: () => anchor,
      reset() {
        gsap.killTweensOf(st)
        sel = -1
        st.ang = -90
        st.len = 0
        live = true
        nodes.forEach((b) => b.setAttribute('aria-pressed', 'false'))
        put(panel, promptHtml)
        place(false)
      },
      leave() {
        live = false
        gsap.killTweensOf(st)
      },
      resize: () => place(false),
      key(e) {
        if (e.key === 'ArrowDown') return select(sel < 0 ? 0 : (sel + 1) % N), true
        if (e.key === 'ArrowUp') return select(sel < 0 ? N - 1 : (sel + N - 1) % N), true
        return false
      },
    }
  },
}
