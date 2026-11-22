import gsap from 'gsap'
import { C } from '../content/es.js'
import { ringBtn } from '../icons/icons.js'
import { $, $$, pad, words } from './fx.js'

// HUD e índice. El HUD se dibuja en blanco con mezcla "difference": se invierte
// solo sobre tinta o papel, y cuando el iris pasa por debajo se invierte justo en su borde.

export function createHud({ root, menuEl, dot, scenes, reduced }) {
  let deck = null
  const n = scenes.length
  const touch = matchMedia('(hover: none)').matches

  root.innerHTML = `
    <div class="hud-top">
      <button type="button" class="hud-brand" data-act="home" aria-label="Volver a la portada"><b>${C.brand}</b> ${C.studio}</button>
      <button type="button" class="hud-menu" data-act="menu" aria-expanded="false" aria-controls="menu">
        <span class="hud-menu-label t-label">${C.ui.index}</span>
        <svg class="hud-prog" viewBox="0 0 32 32" aria-hidden="true">
          <circle class="hud-prog-track" cx="16" cy="16" r="12.5"/>
          <circle class="hud-prog-arc" cx="16" cy="16" r="12.5" pathLength="1" transform="rotate(-90 16 16)"/>
        </svg>
      </button>
    </div>
    <div class="hud-bottom">
      <div class="hud-count" aria-live="polite">
        <span class="hud-num-mask"><span class="hud-num t-display">00</span></span>
        <span class="hud-total t-label">/ ${pad(n - 1)}</span>
        <span class="hud-title t-label"></span>
      </div>
      <p class="hud-hint t-label">${touch ? C.ui.hintTouch : C.ui.hintKeys}</p>
      <div class="hud-nav">
        ${ringBtn('', { act: 'prev', dir: 'left', aria: C.ui.prev, cls: 'hud-prev' })}
        ${ringBtn('', { act: 'next', dir: 'right', aria: C.ui.next, cls: 'hud-next' })}
      </div>
    </div>`

  menuEl.innerHTML = `
    <div class="menu-inner">
      <ol class="menu-list">
        ${scenes
          .map(
            (s, i) => `<li><button type="button" class="menu-item" data-i="${i}">
              <i class="menu-anchor"></i>
              <span class="menu-num t-label">${pad(i)}</span>
              <span class="menu-title t-display">${words(s.title)}</span>
            </button></li>`,
          )
          .join('')}
      </ol>
    </div>`

  const brand = $(root, '.hud-brand')
  const num = $(root, '.hud-num')
  const title = $(root, '.hud-title')
  const arc = $(root, '.hud-prog-arc')
  const menuBtn = $(root, '.hud-menu')
  const menuLabel = $(root, '.hud-menu-label')
  const prevBtn = $(root, '.hud-prev')
  const nextBtn = $(root, '.hud-next')
  const hint = $(root, '.hud-hint')
  const items = $$(menuEl, '.menu-item')
  const anchors = items.map((b) => $(b, '.menu-anchor'))

  let open = false
  let moving = false
  let hinted = false
  const clip = { r: 0, x: 0, y: 0 }
  const renderClip = () => {
    menuEl.style.clipPath = `circle(${clip.r.toFixed(1)}px at ${clip.x.toFixed(1)}px ${clip.y.toFixed(1)}px)`
  }
  const reach = (x, y) => Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 4
  const btnCenter = () => {
    const r = $(root, '.hud-prog').getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  function update(i, from, dir) {
    root.classList.toggle('is-cover', i === 0)
    brand.tabIndex = i === 0 ? -1 : 0 // en la portada la marca del HUD no existe, tampoco para el teclado
    title.textContent = scenes[i].title
    prevBtn.disabled = i === 0
    nextBtn.disabled = i === n - 1
    gsap.to(arc, { '--p': i / (n - 1), duration: reduced ? 0 : 1, ease: 'expo.inOut' })
    items.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')))
    if (from >= 0 && !reduced) {
      gsap
        .timeline()
        .to(num, { yPercent: -110 * dir, duration: 0.3, ease: 'power2.in' })
        .add(() => (num.textContent = pad(i)))
        .fromTo(num, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.7, ease: 'expo.out' })
    } else {
      num.textContent = pad(i)
    }
    if (from >= 0 && !hinted) {
      hinted = true
      gsap.to(hint, { autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
    }
  }

  function openMenu() {
    if (open || moving || deck.busy) return
    open = moving = true
    menuEl.classList.add('is-open')
    menuEl.inert = false
    root.classList.add('is-menu')
    menuBtn.setAttribute('aria-expanded', 'true')
    menuLabel.textContent = C.ui.close
    const c = btnCenter()
    Object.assign(clip, { x: c.x, y: c.y, r: 0 })
    const R = reach(c.x, c.y)
    const cur = deck.index
    if (reduced) {
      dot.snap(anchors[cur])
      moving = false
      items[cur].focus({ preventScroll: true })
      return
    }
    renderClip()
    gsap.to(clip, {
      r: R,
      duration: 0.95,
      ease: 'expo.inOut',
      onUpdate: renderClip,
      onComplete() {
        moving = false
        menuEl.style.clipPath = '' // abierto del todo: sin recorte, para que un cambio de tamaño no lo descubra
      },
    })
    gsap.fromTo($$(menuEl, '.wi'), { yPercent: 118 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03, delay: 0.32 })
    gsap.fromTo($$(menuEl, '.menu-num'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.03, delay: 0.45 })
    dot.to(anchors[cur], { duration: 0.95, ease: 'expo.inOut' })
    gsap.delayedCall(0.5, () => open && items[deck.index].focus({ preventScroll: true }))
  }

  function closeMenu(jump = null) {
    if (!open || moving) return
    moving = true
    const jumped = jump !== null && jump !== deck.index
    if (jumped) deck.go(jump, { instant: true })
    const target = deck.measureAnchor()
    const c = jumped ? target : btnCenter()
    const done = () => {
      open = moving = false
      menuEl.classList.remove('is-open')
      menuEl.inert = true
      menuEl.style.clipPath = ''
      root.classList.remove('is-menu')
      menuBtn.setAttribute('aria-expanded', 'false')
      menuLabel.textContent = C.ui.index
      menuBtn.focus({ preventScroll: true })
    }
    if (reduced) {
      done()
      dot.snap(deck.anchor())
      if (jumped) deck.playEnter()
      return
    }
    Object.assign(clip, { x: c.x, y: c.y, r: reach(c.x, c.y) })
    renderClip()
    gsap.to(clip, { r: 0, duration: 0.95, ease: 'expo.inOut', onUpdate: renderClip, onComplete: done })
    dot.to(deck.anchor(), { to: target, duration: 0.95, ease: 'expo.inOut' })
    if (jumped) deck.playEnter(0.4)
  }

  // El punto es el cursor del índice.
  const point = (i) => {
    if (!open || moving) return
    dot.to(anchors[i], { duration: 0.5, ease: 'expo.out' })
  }
  items.forEach((b, i) => {
    b.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && point(i))
    b.addEventListener('focus', () => point(i))
    b.addEventListener('click', () => closeMenu(i))
  })
  $(menuEl, '.menu-list').addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && point(deck.index))

  function key(e) {
    const k = e.key
    const cur = Math.max(0, items.indexOf(document.activeElement))
    const cols = getComputedStyle($(menuEl, '.menu-list')).gridAutoFlow.includes('column') ? 2 : 1
    const half = Math.ceil(n / cols)
    let to = null
    if (k === 'Escape' || k === 'm' || k === 'M') closeMenu()
    else if (k === 'ArrowDown') to = (cur + 1) % n
    else if (k === 'ArrowUp') to = (cur - 1 + n) % n
    else if (cols === 2 && k === 'ArrowRight') to = Math.min(n - 1, cur + half)
    else if (cols === 2 && k === 'ArrowLeft') to = Math.max(0, cur - half)
    else if (k === 'Home') to = 0
    else if (k === 'End') to = n - 1
    else if (/^[0-9]$/.test(k) && +k < n) closeMenu(+k)
    else return // Tab, Enter, espacio y el resto conservan su comportamiento
    if (to !== null) items[to].focus({ preventScroll: true })
    e.preventDefault()
  }

  return {
    bind: (d) => (deck = d),
    update,
    key,
    get isOpen() {
      return open
    },
    open: openMenu,
    close: closeMenu,
    toggle: () => (open ? closeMenu() : openMenu()),
  }
}
