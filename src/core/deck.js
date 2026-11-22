import gsap from 'gsap'

// La baraja: una escena visible a la vez y una sola transición, el iris.
// Avanzar abre el anillo desde donde está el punto; retroceder lo cierra sobre
// el lugar al que el punto regresa.

const DURATION = 1.15
const BAND = 1.26 // el borde del iris: un anillo con la proporción del logo
const COLORS = { ink: '#050506', paper: '#efece4' }

export function createDeck({ stage, band, dot, scenes, reduced, onChange }) {
  const n = scenes.length
  const els = []
  const apis = []
  let index = -1
  let busy = false

  scenes.forEach((s) => {
    const el = document.createElement('section')
    el.className = `scene s-${s.id}`
    el.dataset.theme = s.theme
    el.setAttribute('aria-label', s.title)
    el.inert = true
    el.innerHTML = s.html()
    stage.appendChild(el)
    els.push(el)
  })

  const deck = {
    n,
    scenes,
    get index() {
      return index
    },
    get busy() {
      return busy
    },
    go,
    next,
    prev,
    anchor: () => apis[index].anchor(),
    measureAnchor,
    playEnter,
    resize() {
      if (index < 0) return
      apis[index].resize?.()
    },
    key: (e) => (index >= 0 && !busy ? apis[index].key?.(e) : false),
  }

  scenes.forEach((s, i) => apis.push(s.setup(els[i], { dot, deck, reduced })))

  function activate(i) {
    els[i].classList.add('is-on')
    els[i].inert = false
  }

  function deactivate(i) {
    const el = els[i]
    el.classList.remove('is-on')
    el.inert = true
    el.style.clipPath = ''
    el.style.zIndex = ''
    apis[i].leave?.()
  }

  /** Mide el ancla de la escena actual con su entrada ya resuelta. */
  function measureAnchor() {
    const tl = apis[index].enter
    const pr = tl.progress()
    tl.progress(1, true)
    const m = dot.measure(apis[index].anchor())
    tl.progress(pr, true)
    return m
  }

  function playEnter(delay = 0) {
    const tl = apis[index].enter
    if (reduced) return tl.progress(1)
    gsap.delayedCall(delay, () => tl.play(0))
  }

  function go(i, { instant = false } = {}) {
    if (busy || i === index || i < 0 || i >= n) return false
    const from = index
    const dir = from < 0 || i > from ? 1 : -1
    const api = apis[i]
    const inEl = els[i]

    activate(i)
    api.reset?.(dir)
    const tl = api.enter
    index = i
    onChange?.(i, from, dir)

    tl.progress(1, true)
    const target = dot.measure(api.anchor())
    tl.progress(0, true).pause()

    // Primera carga: el punto nace en su sitio.
    if (from < 0) {
      if (reduced) {
        dot.snap(api.anchor())
        tl.progress(1)
        dot.snap(api.anchor())
        return true
      }
      dot.set({ x: target.x, y: target.y, d: 0 })
      dot.to(api.anchor(), { to: target, duration: 1.3, ease: 'expo.out', delay: 0.15 })
      tl.play(0)
      return true
    }

    // Cambio bajo el índice: quien llama se encarga del punto y de la entrada.
    if (instant) {
      deactivate(from)
      return true
    }

    if (reduced) {
      deactivate(from)
      tl.progress(1)
      dot.snap(api.anchor())
      return true
    }

    busy = true
    const c = dir > 0 ? { x: dot.state.x, y: dot.state.y } : { x: target.x, y: target.y }
    const R = Math.hypot(Math.max(c.x, innerWidth - c.x), Math.max(c.y, innerHeight - c.y)) + 4
    const outEl = els[from]
    const top = dir > 0 ? inEl : outEl
    const bottom = dir > 0 ? outEl : inEl
    top.style.zIndex = 3
    bottom.style.zIndex = 1

    // Entre escenas del mismo tono el borde contrasta; entre tonos distintos
    // toma el color que llega, y el color entra antes que el contenido.
    const same = scenes[i].theme === scenes[from].theme
    band.style.background = COLORS[same ? (scenes[i].theme === 'ink' ? 'paper' : 'ink') : scenes[i].theme]
    band.style.display = 'block'

    const p = { r: dir > 0 ? 0 : R }
    const at = `at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px`
    const render = () => {
      top.style.clipPath = `circle(${p.r.toFixed(1)}px ${at})`
      band.style.clipPath = `circle(${(p.r * BAND).toFixed(1)}px ${at})`
    }
    render()
    gsap.to(p, {
      r: dir > 0 ? R : 0,
      duration: DURATION,
      ease: 'expo.inOut',
      onUpdate: render,
      onComplete() {
        deactivate(from)
        inEl.style.clipPath = ''
        inEl.style.zIndex = ''
        band.style.display = 'none'
        busy = false
      },
    })
    dot.to(api.anchor(), { to: target, duration: DURATION, ease: 'expo.inOut' })
    gsap.delayedCall(DURATION * (dir > 0 ? 0.46 : 0.34), () => tl.play(0))
    return true
  }

  function next() {
    if (busy || index < 0) return
    if (apis[index].next?.()) return
    go(index + 1)
  }

  function prev() {
    if (busy || index < 0) return
    if (apis[index].prev?.()) return
    go(index - 1)
  }

  return deck
}
