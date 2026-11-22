import { MODS } from './index.js'
import { muestra } from './muestra.js'
import { toast } from './kit.js'
import { vocab } from '../content/base.js'
import { abrirCapa } from '../app/capas.js'
import { esc } from '../app/util.js'

// Anfitrión de demos: dibuja el dispositivo (teléfono, tableta o escritorio), escala la pantalla
// para que quepa y monta el módulo. Se usa en la capa de demo de las visitas, en la galería
// y en la ruta suelta #/demo/… (la que abre el cliente en su propio teléfono).

/** Tamaño lógico de cada dispositivo. Las demos se diseñan en estos píxeles; el anfitrión escala. */
export const DISPOSITIVOS = {
  telefono: { w: 360, h: 740 },
  tableta: { w: 1000, h: 700 },
  escritorio: { w: 1240, h: 760 },
}

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Monta una demo dentro de `contenedor` (que debe tener tamaño propio).
 * `plena`: sin marco, a todo el contenedor (para teléfonos reales).
 */
export function montarDemo(contenedor, { modulo, vista, negocio, nicho, plena = false }) {
  const mod = MODS[modulo]
  const meta = mod?.vistas?.[vista]
  const disp = meta?.dispositivo || 'telefono'
  const { w, h } = DISPOSITIVOS[disp]
  const acento = nicho?.acento || '#216fff'
  const nombre = negocio || 'Su negocio'
  const dominio = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 22)

  contenedor.innerHTML = `
    <div class="dv dv--${disp} ${plena ? 'dv--plena' : ''}">
      <div class="dv-marco">
        ${disp === 'escritorio' ? `<div class="dv-nav"><i></i><i></i><i></i><span class="dv-url">${esc(dominio || 'sunegocio')}.soma.app</span></div>` : ''}
        <div class="dv-pantalla"><div class="dk" style="--dk-acento:${esc(acento)}"></div></div>
      </div>
    </div>`

  const dv = contenedor.firstElementChild
  const marco = dv.querySelector('.dv-marco')
  const pantalla = dv.querySelector('.dv-pantalla')
  const raiz = dv.querySelector('.dk')

  // La pantalla siempre mide w×h por dentro; por fuera se escala al espacio disponible.
  const borde = plena ? 0 : disp === 'telefono' ? 11 : disp === 'tableta' ? 14 : 0
  const barra = disp === 'escritorio' ? 34 : 0
  function ajustar() {
    const cw = contenedor.clientWidth
    const ch = contenedor.clientHeight
    if (!cw || !ch) return
    if (plena) {
      const k = cw / w
      pantalla.style.width = `${w}px`
      pantalla.style.height = `${ch / k}px`
      pantalla.style.transform = `scale(${k})`
      marco.style.width = `${cw}px`
      marco.style.height = `${ch}px`
      return
    }
    const k = Math.min((cw - borde * 2) / w, (ch - borde * 2 - barra) / h, 1.6)
    pantalla.style.width = `${w}px`
    pantalla.style.height = `${h}px`
    pantalla.style.transform = `scale(${k})`
    marco.style.width = `${w * k + borde * 2}px`
    marco.style.height = `${h * k + borde * 2 + barra}px`
    marco.style.setProperty('--k', k)
  }
  const ro = new ResizeObserver(ajustar)
  ro.observe(contenedor)
  ajustar()

  let api = null
  if (!mod || !meta) {
    raiz.innerHTML = `<div class="dk-vacio"><p class="dk-titulo">Esta demostración se está preparando</p><p class="dk-nota">${esc(modulo)} · ${esc(vista)}</p></div>`
  } else {
    try {
      api = mod.montar(raiz, {
        vista,
        negocio: nombre,
        nicho,
        v: vocab(nicho),
        m: muestra(nicho),
        acento,
        reducido,
        avisar: (t) => toast(raiz, t),
      })
    } catch (e) {
      console.error(`[demo ${modulo}/${vista}]`, e)
      raiz.innerHTML = `<div class="dk-vacio"><p class="dk-titulo">No se pudo abrir esta demostración</p></div>`
    }
  }

  return {
    meta,
    destruir() {
      ro.disconnect()
      try {
        api?.destruir?.()
      } catch (e) {
        console.error(e)
      }
      contenedor.innerHTML = ''
    },
  }
}

export const tituloDemo = (modulo, vista) => MODS[modulo]?.vistas?.[vista]?.titulo || ''

/**
 * Abre una demo en una capa sobre lo que haya. `pie` es HTML opcional bajo el dispositivo
 * (las visitas ponen ahí los botones de reacción). Devuelve { el, cerrar }.
 */
export function abrirDemo({ titulo, sub = '', modulo, vista, negocio, nicho, pie = '', alCerrar }) {
  let demo = null
  const capa = abrirCapa({
    clase: 'capa-demo',
    html: `
      <header class="cd-cab">
        <div><p class="t-label cd-k">Demostración · datos de ejemplo</p><h2 class="t-display cd-t">${esc(titulo || tituloDemo(modulo, vista) || 'Demostración')}</h2>${sub ? `<p class="cd-sub">${esc(sub)}</p>` : ''}</div>
        <button type="button" class="cd-x t-label" data-cerrar-demo>Cerrar <span aria-hidden="true">×</span></button>
      </header>
      <div class="cd-zona"></div>
      ${pie ? `<footer class="cd-pie">${pie}</footer>` : ''}`,
    alCerrar: (v) => {
      demo?.destruir()
      alCerrar?.(v)
    },
  })
  demo = montarDemo(capa.el.querySelector('.cd-zona'), { modulo, vista, negocio, nicho })
  capa.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cerrar-demo]')
    if (b) capa.cerrar(b.dataset.cerrarDemo || undefined)
  })
  return capa
}
