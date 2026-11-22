import gsap from 'gsap'
import { boil, P } from './boil.js'

// El punto: un solo elemento que nunca desaparece.
// Cada escena le ofrece un "ancla" (un elemento del DOM) y el punto viaja a su
// centro y adopta su diámetro. Solo se anima con transform.

const BASE = 240

export function createDot(el) {
  el.innerHTML = `<svg viewBox="-100 -100 200 200" width="${BASE}" height="${BASE}">${boil(P.circle(0, 0, 98.5, 30), {
    amp: 0.6,
    cls: 'dot-shape',
  })}</svg>`
  const shape = el.firstElementChild
  const state = { x: innerWidth / 2, y: innerHeight / 2, d: 0 }
  let anchor = null
  let tween = null

  const apply = () => {
    el.style.transform = `translate3d(${state.x}px,${state.y}px,0) scale(${Math.max(state.d, 0) / BASE})`
  }

  const measure = (target) => {
    const r = target.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.width }
  }

  const api = {
    state,
    measure,
    get anchor() {
      return anchor
    },
    /** Viaja al ancla. `to` permite pasar una medida tomada antes (cuando el ancla aún no está en su sitio final). */
    to(target, { to, duration = 0.9, ease = 'expo.inOut', delay = 0, onComplete } = {}) {
      anchor = target
      const m = to || measure(target)
      tween?.kill()
      tween = gsap.to(state, { x: m.x, y: m.y, d: m.d, duration, ease, delay, onUpdate: apply, onComplete })
      return tween
    },
    /** Se coloca en el ancla sin animar (resize, seguimiento por cuadro). */
    snap(target = anchor) {
      if (!target) return
      anchor = target
      tween?.kill()
      Object.assign(state, measure(target))
      apply()
    },
    set(v) {
      tween?.kill()
      Object.assign(state, v)
      apply()
    },
    /** Recorre un <path> SVG y termina en el ancla `end`. */
    along(path, end, { duration = 0.9, ease = 'power2.inOut', onComplete } = {}) {
      anchor = end
      tween?.kill()
      const len = path.getTotalLength()
      const m = path.getScreenCTM()
      const d0 = state.d
      const d1 = measure(end).d
      const p = { t: 0 }
      tween = gsap.to(p, {
        t: 1,
        duration,
        ease,
        onUpdate() {
          const pt = path.getPointAtLength(len * p.t)
          state.x = pt.x * m.a + pt.y * m.c + m.e
          state.y = pt.x * m.b + pt.y * m.d + m.f
          state.d = d0 + (d1 - d0) * p.t
          apply()
        },
        onComplete() {
          api.snap(end)
          onComplete?.()
        },
      })
      return tween
    },
    /** Un latido corto: confirma una selección. */
    pulse(amount = 1.35) {
      gsap.fromTo(shape, { scale: amount }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: true })
    },
  }
  apply()
  return api
}
