import { esc as _esc, dinero as _dinero } from '../app/util.js'

// Herramientas compartidas por todas las demos. Una demo es una pantalla que parece un producto
// real: se puede tocar, responde y usa el nombre del negocio y datos de su giro.

export const esc = _esc
export const dinero = _dinero

/** Escucha clics delegados: toca(el, '[data-mas]', (boton, evento) => …) */
export function toca(el, selector, fn) {
  el.addEventListener('click', (e) => {
    const t = e.target.closest(selector)
    if (t && el.contains(t)) fn(t, e)
  })
}

/** Aviso breve dentro de la pantalla de la demo. */
export function toast(raiz, texto, ms = 2200) {
  raiz.querySelector('.dk-toast')?.remove()
  const t = document.createElement('div')
  t.className = 'dk-toast'
  t.textContent = texto
  raiz.appendChild(t)
  requestAnimationFrame(() => t.classList.add('entra'))
  setTimeout(() => {
    t.classList.remove('entra')
    setTimeout(() => t.remove(), 250)
  }, ms)
}

/** Hoja que sube desde abajo. Devuelve { el, cerrar }. Se cierra al tocar fuera o un [data-cerrar]. */
export function hoja(raiz, html) {
  const velo = document.createElement('div')
  velo.className = 'dk-velo'
  velo.innerHTML = `<div class="dk-hoja" data-rueda>${html}</div>`
  raiz.appendChild(velo)
  requestAnimationFrame(() => velo.classList.add('entra'))
  const cerrar = () => {
    velo.classList.remove('entra')
    setTimeout(() => velo.remove(), 260)
  }
  velo.addEventListener('click', (e) => {
    if (e.target === velo || e.target.closest('[data-cerrar]')) cerrar()
  })
  return { el: velo.firstElementChild, cerrar }
}

export const iniciales = (nombre) =>
  String(nombre || '')
    .replace(/^(Sra?\.|Don|Doña|Ing\.|Lic\.|Dra?\.|Familia)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

/** "2:41 p. m." */
export const hora = (d = new Date()) => new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)

/** Hace n minutos, como hora. */
export const haceMin = (n) => hora(new Date(Date.now() - n * 60000))
export const enMin = (n) => hora(new Date(Date.now() + n * 60000))

/** Temporizadores que se limpian juntos al cerrar la demo. */
export function relojes() {
  const ids = new Set()
  return {
    en(ms, fn) {
      const id = setTimeout(() => {
        ids.delete(id)
        fn()
      }, ms)
      ids.add(id)
      return id
    },
    cada(ms, fn) {
      const id = setInterval(fn, ms)
      ids.add(id)
      return id
    },
    limpia() {
      ids.forEach((id) => {
        clearTimeout(id)
        clearInterval(id)
      })
      ids.clear()
    },
  }
}

/** Anima un número hasta su valor. */
export function cuenta(el, hasta, { ms = 700, formato = (n) => String(Math.round(n)) } = {}) {
  const desde = Number(el.dataset.v || 0)
  const t0 = performance.now()
  el.dataset.v = hasta
  const paso = (t) => {
    const p = Math.min(1, (t - t0) / ms)
    const e = 1 - Math.pow(1 - p, 3)
    el.textContent = formato(desde + (hasta - desde) * e)
    if (p < 1 && el.isConnected) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}

/** Color estable para un texto: sirve para avatares y mosaicos de producto. */
export function tono(texto) {
  let h = 0
  for (const c of String(texto)) h = (h * 31 + c.charCodeAt(0)) % 360
  return `hsl(${h} 42% 88%)`
}

/** Agrupa una lista por una clave. Devuelve [[clave, elementos], …] en orden de aparición. */
export function porGrupo(lista, clave) {
  const m = new Map()
  for (const x of lista) {
    const k = typeof clave === 'function' ? clave(x) : x[clave]
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(x)
  }
  return [...m.entries()]
}
