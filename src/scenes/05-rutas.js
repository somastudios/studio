import gsap from 'gsap'
import { boil, guide, P } from '../core/boil.js'
import { $, $$, words, rise, fade, swap, put } from '../core/fx.js'
import { C } from '../content/es.js'

// La misma lógica condicional del motor de soluciones, a la vista:
// la respuesta a cada pregunta habilita o descarta la siguiente, y el punto
// recorre la ruta que resulta.
const Y = [55, 165, 275, 385]
const trace = (y) => P.curve(26, 220, 92, 220, 84, y, 141, y, 14)
const ride = (y) => P.curve(14, 220, 92, 220, 84, y, 150, y, 16)

export default {
  id: 'rutas',
  theme: 'paper',
  title: C.s5.nav,
  html: () => `
    <div class="scene-inner s5">
      <header class="s5-head">
        <p class="t-label s5-kicker">${C.s5.kicker}</p>
        <h2 class="t-display s5-h">${C.s5.title.map((t) => `<span class="ln">${words(t)}</span>`).join(' ')}</h2>
      </header>
      <div class="s5-ctrl">
        <p class="s5-problem"><span class="t-label">${C.s5.problemLabel}</span><span class="s5-problem-t">${C.s5.problem}</span></p>
        ${C.s5.questions
          .map(
            (q) => `<div class="s5-q" data-q="${q.key}"><div class="s5-q-in">
              <p class="t-body">${q.text}</p>
              <div class="seg" role="radiogroup" aria-label="${q.text}">
                <button type="button" role="radio" data-v="1" aria-checked="true">${C.s5.yes}</button>
                <button type="button" role="radio" data-v="0" aria-checked="false">${C.s5.no}</button>
              </div>
            </div></div>`,
          )
          .join('')}
        <p class="t-label s5-tag" aria-live="polite">${C.s5.tag}</p>
      </div>
      <div class="s5-map">
        <div class="s5-svgwrap">
          <svg viewBox="0 0 160 440" aria-hidden="true">
            ${Y.map((y, i) => boil(trace(y), { amp: 1, cls: 's5-ghost', seed: 500 + i })).join('')}
            ${Y.map((y, i) => boil(trace(y), { amp: 1, cls: 'draw s5-live', seed: 500 + i })).join('')}
            ${boil(P.circle(14, 220, 11.5, 10), { amp: 0.7, cls: 's5-origin' })}
            ${Y.map((y) => `<path class="s5-guide" d="${guide(ride(y))}"/>`).join('')}
          </svg>
          <i class="s5-a s5-a-origin" data-dot></i>
          ${Y.map((y) => `<i class="s5-a s5-a-end" style="top:${(y / 440) * 100}%"></i>`).join('')}
        </div>
        <ol class="s5-routes">
          ${C.s5.routes.map((r) => `<li class="s5-route"><div class="s5-route-in"><p class="t-name s5-route-n">${r.name}</p><p class="t-body s5-route-t">${r.text}</p></div></li>`).join('')}
        </ol>
      </div>
      <p class="t-body s5-desc" aria-hidden="true"></p>
    </div>`,
  setup(el, { dot, deck }) {
    const qs = $$(el, '.s5-q')
    const tag = $(el, '.s5-tag')
    const rows = $$(el, '.s5-route')
    const live = $$(el, '.s5-live')
    const guides = $$(el, '.s5-guide')
    const origin = $(el, '.s5-a-origin')
    const ends = $$(el, '.s5-a-end')
    const desc = $(el, '.s5-desc')
    const st = { self: true, waiter: true, kitchen: true }
    let cur = 0
    let anchor = origin
    let run = null

    const route = () => (st.self ? 0 : st.waiter ? 1 : st.kitchen ? 2 : 3)

    function controls(animate = true) {
      const off = { self: false, waiter: st.self, kitchen: st.self || st.waiter }
      qs.forEach((q) => {
        const k = q.dataset.q
        q.classList.toggle('is-off', off[k])
        q.inert = off[k]
        $$(q, '[role=radio]').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.v === '1') === st[k])))
      })
      const r = route()
      rows.forEach((row, k) => row.classList.toggle('is-on', k === r))
      tag.classList.toggle('is-on', r === 1)
      // en vertical la descripción de la ruta vive en su propio bloque
      if (desc.dataset.r !== String(r)) {
        desc.dataset.r = r
        animate ? swap(desc, C.s5.routes[r].text) : put(desc, C.s5.routes[r].text)
      }
      return r
    }

    // El punto vuelve al origen y recorre la ruta nueva mientras se traza.
    function travel(from, to) {
      run?.kill()
      anchor = ends[to]
      run = gsap.timeline()
      if (from !== null) {
        run.to(live[from], { '--draw': 1.06, duration: 0.35, ease: 'power2.in' }, 0)
        run.add(() => dot.to(origin, { duration: 0.42, ease: 'power3.inOut' }), 0)
      }
      const t = from === null ? 0 : 0.44
      run.fromTo(live[to], { '--draw': 1.06 }, { '--draw': 0, duration: 0.95, ease: 'power2.inOut' }, t)
      run.add(() => dot.along(guides[to], ends[to], { duration: 0.95, ease: 'power2.inOut' }), t)
    }

    qs.forEach((q) =>
      q.addEventListener('click', (e) => {
        const b = e.target.closest('[role=radio]')
        if (!b || deck.busy) return
        st[q.dataset.q] = b.dataset.v === '1'
        const r = controls()
        if (r !== cur) {
          const from = cur
          cur = r
          travel(from, r)
        }
      }),
    )

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s5-h .wi'), 0, { stagger: 0.06 })
    fade(tl, [$(el, '.s5-kicker'), $(el, '.s5-problem'), ...$$(el, '.s5-q-in')], 0.35, { stagger: 0.08 })
    fade(tl, [...$$(el, '.s5-ghost'), $(el, '.s5-origin')], 0.5, { y: 0, duration: 0.6 })
    tl.fromTo($$(el, '.s5-route-in'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, 0.6)
    tl.add(() => travel(null, cur), 1.1)

    return {
      enter: tl,
      anchor: () => anchor,
      reset() {
        run?.kill()
        st.self = st.waiter = st.kitchen = true
        cur = controls(false)
        anchor = origin
        gsap.set(live, { '--draw': 1.06 })
      },
      leave() {
        run?.kill()
      },
    }
  },
}
