import gsap from 'gsap'
import { createDeck } from '../core/deck.js'
import { createDot } from '../core/dot.js'
import { createHud } from '../core/hud.js'
import { capas } from '../app/capas.js'

// Monta una presentación con la lista de escenas que se le pase y devuelve cómo desmontarla.
// Es el mismo motor de siempre (iris, punto, HUD, índice), ahora reutilizable: la presentación
// general, la primera visita y la segunda son tres listas de escenas distintas.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduced) gsap.globalTimeline.timeScale(40)

const esCampo = (t) => t instanceof Element && !!t.closest('input, textarea, select, [contenteditable="true"]')

/**
 * @param {object} o
 * @param {Array}  o.scenes       Escenas ({ id, theme, title, html(), setup(el, ctx) }).
 * @param {number} [o.inicial]    Escena en la que arranca.
 * @param {string} [o.titulo]     Título de la pestaña.
 * @param {(i:number, from:number)=>void} [o.alCambiar]
 * @param {()=>void} [o.alSalir]  Si existe, Escape (dos veces) llama a esto.
 * @param {string} [o.extraHud]   HTML que se agrega junto al botón de índice.
 */
export function montarDeck({ scenes, inicial = 0, titulo = 'Soma Studio', alCambiar, alSalir, extraHud = '' }) {
  document.body.dataset.modo = 'deck'
  const stage = document.getElementById('stage')
  const band = document.getElementById('band')
  const hudEl = document.getElementById('hud')
  const menuEl = document.getElementById('menu')
  const dotEl = document.getElementById('dot')
  stage.innerHTML = ''
  stage.appendChild(band)

  const ctl = new AbortController()
  const on = (obj, ev, fn, opts = {}) => obj.addEventListener(ev, fn, { ...opts, signal: ctl.signal })

  const dot = createDot(dotEl)
  const hud = createHud({ root: hudEl, menuEl, dot, scenes, reduced })
  if (extraHud) hudEl.querySelector('.hud-menu').insertAdjacentHTML('beforebegin', `<div class="hud-extra">${extraHud}</div>`)

  const deck = createDeck({
    stage,
    band,
    dot,
    scenes,
    reduced,
    onChange(i, from, dir) {
      hud.update(i, from, dir)
      document.title = i === 0 ? titulo : `${scenes[i].title} · ${titulo}`
      alCambiar?.(i, from)
    },
  })
  hud.bind(deck)

  const libre = () => !capas.abiertas

  on(document, 'click', (e) => {
    const b = e.target.closest('[data-act]')
    if (!b || !libre()) return
    const act = b.dataset.act
    if (act === 'menu') return hud.toggle()
    if (hud.isOpen) return act === 'home' ? hud.close(0) : undefined
    if (act === 'next') deck.next()
    else if (act === 'prev') deck.prev()
    else if (act === 'home') deck.go(0)
    else if (act === 'salir') alSalir?.()
  })

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  let escAt = 0
  on(window, 'keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !libre()) return
    const k = e.key
    if (esCampo(e.target)) {
      if (k === 'Escape') e.target.blur()
      return
    }
    if (hud.isOpen) return hud.key(e)
    if (k === 'Escape' && alSalir) {
      // Dos Escape seguidos: salir. Uno solo no hace nada, para que no pase por accidente frente al cliente.
      const t = performance.now()
      if (t - escAt < 900) alSalir()
      escAt = t
      return
    }
    if (k === 'm' || k === 'M') return hud.open()
    if (k === 'f' || k === 'F') return fullscreen()
    if (deck.key(e)) return e.preventDefault()
    const onControl = e.target instanceof Element && e.target.closest('button, a, input')
    if (k === 'ArrowRight' || k === 'PageDown') deck.next()
    else if (k === 'ArrowLeft' || k === 'PageUp') deck.prev()
    else if (k === ' ' || k === 'Enter') {
      if (onControl) return
      e.shiftKey ? deck.prev() : deck.next()
    } else if (k === 'Home') deck.go(0)
    else if (k === 'End') deck.go(scenes.length - 1)
    else return
    e.preventDefault()
  })

  // Rueda: un gesto, un capítulo. Dentro de una zona con desplazamiento propio, la rueda es de esa zona.
  let wheelAt = 0
  let wheelLock = 0
  on(
    window,
    'wheel',
    (e) => {
      const now = performance.now()
      const fresh = now - wheelAt > 160
      wheelAt = now
      if (!libre() || (e.target instanceof Element && e.target.closest('[data-rueda]'))) return
      if (!fresh || now < wheelLock || hud.isOpen || Math.abs(e.deltaY) < 6) return
      wheelLock = now + 700
      e.deltaY > 0 ? deck.next() : deck.prev()
    },
    { passive: true },
  )

  let touch = null
  on(window, 'pointerdown', (e) => {
    const libreDeGesto = !(e.target instanceof Element && e.target.closest('[data-rueda], input, textarea'))
    touch = e.pointerType === 'touch' && libreDeGesto ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null
  })
  on(window, 'pointerup', (e) => {
    if (!touch || e.pointerId !== touch.id || hud.isOpen || !libre()) return
    const dx = e.clientX - touch.x
    const dy = e.clientY - touch.y
    touch = null
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    dx < 0 ? deck.next() : deck.prev()
  })

  let raf = 0
  on(window, 'resize', () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      deck.resize()
      if (!deck.busy) dot.snap()
    })
  })

  const fonts = document.fonts
    ? Promise.all([document.fonts.load('800 16px Archivo'), document.fonts.load('650 16px Archivo')])
        .then(() => document.fonts.ready)
        .catch(() => {})
    : Promise.resolve()

  let vivo = true
  fonts.then(() => vivo && deck.go(Math.max(0, Math.min(scenes.length - 1, inicial))))

  return {
    deck,
    hud,
    dot,
    reduced,
    destruir() {
      vivo = false
      ctl.abort()
      gsap.killTweensOf(dot.state)
      stage.innerHTML = ''
      stage.appendChild(band)
      band.style.display = 'none'
      hudEl.innerHTML = ''
      hudEl.className = ''
      menuEl.innerHTML = ''
      menuEl.classList.remove('is-open')
      menuEl.inert = true
      dotEl.innerHTML = ''
      document.title = 'Soma Studio'
      if (document.fullscreenElement) document.exitFullscreen?.()
    },
  }
}
