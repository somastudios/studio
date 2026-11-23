import gsap from 'gsap'

// El iris de Soma, el mismo de la presentación: un círculo que crece desde el punto, con un
// anillo de contraste en el borde (la proporción del logo). Aquí vive para que lo usen el CRM
// y los saltos entre pantallas.

export const DURACION = 0.95
export const BANDA = 1.26
export const COLOR = { ink: '#050506', paper: '#efece4' }
export const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export const lejos = (c, x0, y0, w, h) => Math.hypot(Math.max(c.x - x0, x0 + w - c.x), Math.max(c.y - y0, y0 + h - c.y)) + 4

/**
 * Salto entre pantallas de distinto tono (del CRM a la presala y de regreso): el color que
 * llega entra primero, desde donde se tocó; ya cubierto todo, cambia la pantalla y el color
 * se retira. `alCubrir` es quien navega.
 */
export function irisA(desde, tono, alCubrir) {
  if (reducido) return alCubrir()
  document.querySelector('.iris-salto')?.remove()
  const el = document.createElement('div')
  el.className = 'iris-salto'
  el.innerHTML = '<i></i>'
  document.body.appendChild(el)
  const color = el.firstElementChild
  const otro = tono === 'ink' ? 'paper' : 'ink'
  el.style.background = COLOR[otro]
  color.style.background = COLOR[tono]
  const R = lejos(desde, 0, 0, innerWidth, innerHeight)
  const en = `at ${desde.x.toFixed(1)}px ${desde.y.toFixed(1)}px`
  const p = { r: 0 }
  const pinta = () => {
    // El anillo de contraste va por delante; el color nuevo, detrás, con la proporción del logo.
    el.style.clipPath = `circle(${p.r.toFixed(1)}px ${en})`
    color.style.clipPath = `circle(${(p.r / BANDA).toFixed(1)}px ${en})`
  }
  pinta()
  gsap
    .timeline()
    .to(p, { r: R * BANDA, duration: DURACION * 0.72, ease: 'expo.inOut', onUpdate: pinta })
    .add(alCubrir)
    .to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, '+=0.05')
    .add(() => el.remove())
}
