import gsap from 'gsap'
import { boil, guide, P } from '../core/boil.js'
import { $, $$, pad, words, rise, fade } from '../core/fx.js'
import { ringBtn } from '../icons/icons.js'
import { C } from '../content/es.js'

// Un síntoma, cinco causas. El punto empieza en lo que se ve (el síntoma)
// y baja hasta la causa real.
const K = C.s3.causes
const X = [52, 156, 260, 364, 468]
const link = (x) => P.curve(260, 77, 260, 205, x, 185, x, 318, 12)
const path = (x) => P.curve(260, 46, 260, 200, x, 180, x, 330, 14)

const detailHtml = (i) => `
  <p class="t-label">${pad(i + 1)} · ${C.s3.causeLabel}</p>
  <p class="s3-dt">${K[i].cause}</p>
  <p class="t-label">${C.s3.answerLabel}</p>
  <p class="s3-dt">${K[i].answer}</p>`

export default {
  id: 'causa',
  theme: 'paper',
  title: C.s3.nav,
  html: () => `
    <div class="scene-inner s3">
      <header class="s3-head">
        <h2 class="t-display s3-h">${C.s3.title.map((t) => `<span class="ln">${words(t)}</span>`).join(' ')}</h2>
        <p class="t-body s3-body">${C.s3.body}</p>
      </header>
      <div class="s3-foot">
        <div class="s3-cta">${ringBtn(C.s3.cta, { dir: 'down', cls: 's3-open' })}</div>
        <div class="s3-detail" aria-live="polite"></div>
      </div>
      <div class="s3-dia">
        <p class="t-label s3-ex">${C.ui.example}</p>
        <div class="s3-tree">
          <svg viewBox="0 0 520 400" aria-hidden="true">
            ${X.map((x) => boil(link(x), { amp: 1.5, cls: 'draw s3-link' })).join('')}
            ${boil(P.circle(260, 46, 30, 16), { amp: 0.6, cls: 'draw s3-sym' })}
            ${X.map((x) => boil(P.circle(x, 330, 11.5, 10), { amp: 0.8, cls: 's3-leaf' })).join('')}
            ${X.map((x) => `<path class="s3-guide" d="${guide(path(x))}"/>`).join('')}
          </svg>
          <i class="s3-a s3-a-sym" data-dot></i>
          ${X.map((x) => `<i class="s3-a s3-a-leaf" style="left:${((x / 520) * 100).toFixed(3)}%"></i>`).join('')}
          <div class="s3-sym-lab"><p class="t-label">${C.s3.symptomLabel}</p><p class="t-name">${C.s3.symptom}</p></div>
        </div>
        <div class="s3-causes">
          ${K.map((k, i) => `<button type="button" class="s3-cause" data-i="${i}" aria-pressed="false"><span class="t-label">${pad(i + 1)}</span><span class="t-name">${k.name}</span></button>`).join('')}
        </div>
      </div>
    </div>`,
  setup(el, { dot, deck }) {
    const inner = $(el, '.s3')
    const sym = $(el, '.s3-a-sym')
    const leaves = $$(el, '.s3-a-leaf')
    const guides = $$(el, '.s3-guide')
    const links = $$(el, '.s3-link')
    const rings = $$(el, '.s3-leaf')
    const btns = $$(el, '.s3-cause')
    const detail = $(el, '.s3-detail')
    const cta = $(el, '.s3-cta')
    let open = false
    let sel = 0

    // Abrir: las ramas se trazan y aparecen las causas.
    const tlOpen = gsap.timeline({ paused: true })
    tlOpen
      .fromTo(cta, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 10, duration: 0.3, ease: 'power2.in' }, 0)
      .fromTo(links, { '--draw': 1.06 }, { '--draw': 0, duration: 0.95, ease: 'power3.inOut', stagger: 0.07 }, 0)
      .fromTo(rings, { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.07 }, 0.65)
      .fromTo(btns, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.07 }, 0.75)
      .fromTo(detail, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.9)

    function mark(i) {
      sel = i
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)))
      links.forEach((l, k) => l.classList.toggle('is-on', k === i))
      rings.forEach((l, k) => l.classList.toggle('is-on', k === i))
    }

    function choose(i) {
      if (deck.busy || !open || i === sel) return
      mark(i)
      detail.innerHTML = detailHtml(i)
      gsap.fromTo(detail.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.04, overwrite: true })
      dot.to(leaves[i], { duration: 0.65, ease: 'expo.out' })
    }

    function setOpen(v) {
      if (deck.busy || v === open) return
      open = v
      inner.classList.toggle('is-open', v)
      if (v) {
        mark(sel)
        detail.innerHTML = detailHtml(sel)
        tlOpen.timeScale(1).play()
        dot.along(guides[sel], leaves[sel], { duration: 1.05, ease: 'power3.inOut' })
      } else {
        tlOpen.timeScale(2).reverse()
        dot.to(sym, { duration: 0.75, ease: 'expo.inOut' })
      }
    }

    $(el, '.s3-open').addEventListener('click', () => setOpen(true))
    btns.forEach((b, i) => b.addEventListener('click', () => choose(i)))

    const tl = gsap.timeline({ paused: true })
    rise(tl, $$(el, '.s3-h .wi'), 0, { stagger: 0.07 })
    tl.fromTo($(el, '.s3-sym'), { '--draw': 1.06 }, { '--draw': 0, duration: 1, ease: 'expo.inOut' }, 0.2)
    fade(tl, [$(el, '.s3-sym-lab'), $(el, '.s3-ex'), $(el, '.s3-body'), $(el, '.s3-foot')], 0.6)

    return {
      enter: tl,
      anchor: () => (open ? leaves[sel] : sym),
      reset(dir) {
        open = dir < 0
        sel = 0
        inner.classList.toggle('is-open', open)
        mark(0)
        detail.innerHTML = detailHtml(0)
        tlOpen.pause().progress(open ? 0 : 1, true).progress(open ? 1 : 0, true)
      },
      next() {
        if (open) return false
        setOpen(true)
        return true
      },
      prev() {
        if (!open) return false
        setOpen(false)
        return true
      },
      key(e) {
        if (!open) return false
        if (e.key === 'ArrowDown') return choose((sel + 1) % K.length), true
        if (e.key === 'ArrowUp') return choose((sel + K.length - 1) % K.length), true
        return false
      },
    }
  },
}
