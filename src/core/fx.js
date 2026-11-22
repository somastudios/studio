import gsap from 'gsap'

export const $ = (el, sel) => el.querySelector(sel)
export const $$ = (el, sel) => [...el.querySelectorAll(sel)]
export const pad = (n) => String(n).padStart(2, '0')

/** Envuelve cada palabra en una máscara para revelarla desde abajo. */
export const words = (text) =>
  text
    .split(' ')
    .map((w) => `<span class="w"><span class="wi">${w}</span></span>`)
    .join(' ')

/** Igual que `words`, pero la última palabra termina en el ancla del punto (el punto es el punto final). */
export const wordsDot = (text) => {
  const parts = text.split(' ')
  return parts
    .map((w, i) =>
      i === parts.length - 1
        ? `<span class="w"><span class="wi">${w}</span><i class="period" data-dot></i></span>`
        : `<span class="w"><span class="wi">${w}</span></span>`,
    )
    .join(' ')
}

/**
 * Piezas de entrada reutilizables: mismo vocabulario de movimiento en todas las escenas.
 * Siempre fromTo: el estado final es explícito y no depende de lo que el
 * navegador tenga calculado en ese instante (transiciones CSS en curso, visitas previas).
 */
export const rise = (tl, targets, at = 0, vars = {}) =>
  tl.fromTo(targets, { yPercent: 118 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05, ...vars }, at)

export const fade = (tl, targets, at = 0, { y = 14, ...vars } = {}) =>
  tl.fromTo(targets, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, ...vars }, at)

/** Aparece creciendo desde su centro. */
export const pop = (tl, targets, at = 0, { from = 0.6, ...vars } = {}) =>
  tl.fromTo(
    targets,
    { autoAlpha: 0, scale: from, transformOrigin: '50% 50%' },
    { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out', stagger: 0.05, ...vars },
    at,
  )

export const draw = (tl, targets, at = 0, vars = {}) =>
  tl.fromTo(targets, { '--draw': 1.06 }, { '--draw': 0, duration: 1.1, ease: 'power3.inOut', stagger: 0.08, ...vars }, at)

/** Sustituye contenido con una salida corta y una entrada larga. */
export function swap(el, html) {
  el._sw?.kill()
  el._sw = gsap
    .timeline()
    .to(el, { autoAlpha: 0, y: -8, duration: 0.14, ease: 'power2.in' })
    .add(() => {
      el.innerHTML = html
    })
    .fromTo(el, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' })
}

/** Sustitución inmediata (estado inicial de una escena). */
export function put(el, html) {
  el._sw?.kill()
  el.innerHTML = html
  gsap.set(el, { autoAlpha: 1, y: 0 })
}
