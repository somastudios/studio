import gsap from 'gsap'
import { boil, P } from './boil.js'
import { icoProceso } from '../icons/render.js'
import { esc } from '../app/util.js'

// El dibujo de una solución: tres momentos unidos por un trazo que hierve.
// Cada momento es un anillo con su icono y una línea de texto.

/** HTML de un flujo. `pasos` = [{ ico, t }]. */
export function flujo(pasos) {
  return `<div class="fl" style="--n:${pasos.length}">
    ${pasos
      .map(
        (p, i) => `<div class="fl-paso">
          ${i ? `<svg class="fl-linea" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">${boil(P.line(0, 5, 100, 5, 6), { amp: 0.9, cls: 'draw' })}</svg>` : ''}
          <span class="fl-nodo"><svg viewBox="0 0 48 48" aria-hidden="true">${boil(P.circle(24, 24, 21.5, 14), { amp: 0.45, cls: 'draw', attrs: 'stroke-width="1.4"' })}</svg><span class="fl-ico">${icoProceso(p.ico)}</span></span>
          <p class="fl-t"><span class="t-label fl-num">0${i + 1}</span>${esc(p.t)}</p>
        </div>`,
      )
      .join('')}
  </div>`
}

/** Anima la entrada de un flujo ya insertado en `el`. */
export function animaFlujo(el) {
  const tl = gsap.timeline()
  el.querySelectorAll('.fl-paso').forEach((p, i) => {
    const at = i * 0.32
    const linea = p.querySelector('.fl-linea .boil')
    if (linea) tl.fromTo(linea, { '--draw': 1.06 }, { '--draw': 0, duration: 0.5, ease: 'power2.inOut' }, at - 0.12)
    tl.fromTo(p.querySelector('.fl-nodo .boil'), { '--draw': 1.06 }, { '--draw': 0, duration: 0.7, ease: 'expo.inOut' }, at)
    tl.fromTo(p.querySelector('.fl-ico'), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, at + 0.2)
    tl.fromTo(p.querySelector('.fl-t'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, at + 0.25)
  })
  return tl
}
