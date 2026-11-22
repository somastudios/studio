import gsap from 'gsap'
import { esc, plantilla } from '../app/util.js'

// Base de las escenas dinámicas. A diferencia de las escenas fijas de la presentación general,
// estas se vuelven a pintar cada vez que se entra a ellas, porque dependen de lo que el cliente
// ha ido respondiendo.

/**
 * escena({ id, theme, title, pinta(el, ctx) })
 * `pinta` dibuja el contenido y devuelve { tl, anchor(), next?, prev?, key?, leave?, resize? }.
 * ctx trae { dot, deck, reduced, dir, on(selector, fn), alEscribir(selector, fn) }.
 */
export function escena({ id, theme, title, pinta }) {
  return {
    id,
    theme,
    title,
    html: () => '',
    setup(el, base) {
      let cur = null
      let ctl = null
      return {
        get enter() {
          return cur.tl
        },
        anchor: () => cur.anchor(),
        reset(dir) {
          ctl?.abort()
          cur?.leave?.()
          cur?.tl?.kill()
          ctl = new AbortController()
          const on = (sel, fn) =>
            el.addEventListener(
              'click',
              (e) => {
                const t = e.target.closest(sel)
                if (t && el.contains(t) && !base.deck.busy) fn(t, e)
              },
              { signal: ctl.signal },
            )
          const alEscribir = (sel, fn) =>
            el.addEventListener(
              'input',
              (e) => {
                if (e.target.matches(sel)) fn(e.target, e)
              },
              { signal: ctl.signal },
            )
          cur = pinta(el, { ...base, dir, on, alEscribir })
          if (!cur.tl) cur.tl = gsap.timeline({ paused: true })
        },
        leave() {
          cur?.leave?.()
        },
        next: () => cur?.next?.() || false,
        prev: () => cur?.prev?.() || false,
        key: (e) => cur?.key?.(e) || false,
        resize: () => cur?.resize?.(),
      }
    },
  }
}

/** Texto de plantilla ya escapado. */
export const tx = (s, datos) => esc(plantilla(s, datos))

/** Línea de tiempo en pausa: la entrada de cada escena. */
export const linea = () => gsap.timeline({ paused: true })
