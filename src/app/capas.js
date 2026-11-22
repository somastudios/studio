import { esc } from './util.js'

// Capas que se abren encima de todo: diálogos, avisos breves y la capa de las demos.
// Mientras haya una abierta, la presentación de abajo no responde al teclado ni a la rueda.

export const capas = { abiertas: 0 }

const raiz = () => {
  let r = document.getElementById('capas')
  if (!r) {
    r = document.createElement('div')
    r.id = 'capas'
    document.body.appendChild(r)
  }
  return r
}

/**
 * Abre una capa a pantalla completa. Devuelve { el, cerrar }.
 * `alCerrar` se llama una sola vez, sin importar cómo se haya cerrado.
 */
export function abrirCapa({ clase = '', html = '', alCerrar, cierraConEscape = true } = {}) {
  const el = document.createElement('div')
  el.className = `capa ${clase}`
  el.innerHTML = html
  raiz().appendChild(el)
  capas.abiertas++
  let cerrada = false
  const tecla = (e) => {
    if (e.key === 'Escape' && cierraConEscape && el === raiz().lastElementChild) {
      e.stopPropagation()
      cerrar()
    }
  }
  addEventListener('keydown', tecla, true)
  function cerrar(valor) {
    if (cerrada) return
    cerrada = true
    removeEventListener('keydown', tecla, true)
    capas.abiertas = Math.max(0, capas.abiertas - 1)
    el.classList.add('sale')
    setTimeout(() => el.remove(), 220)
    alCerrar?.(valor)
  }
  requestAnimationFrame(() => el.classList.add('entra'))
  return { el, cerrar }
}

/**
 * Diálogo con contenido propio. Resuelve con el valor que se pase a `cerrar`,
 * o `undefined` si la persona lo descarta.
 *   const r = await dialogo({ titulo, html, acciones: [{ id: 'ok', texto: 'Guardar', pri: true }], alAbrir(el, cerrar) {} })
 */
export function dialogo({ titulo = '', html = '', acciones = [], ancho = 520, alAbrir, antesDeCerrar } = {}) {
  return new Promise((resolver) => {
    const c = abrirCapa({
      clase: 'capa-dialogo',
      html: `<div class="dlg" role="dialog" aria-modal="true" style="--ancho:${ancho}px">
        <header class="dlg-cab"><h2 class="dlg-titulo">${esc(titulo)}</h2><button type="button" class="dlg-x" aria-label="Cerrar">×</button></header>
        <div class="dlg-cuerpo">${html}</div>
        ${
          acciones.length
            ? `<footer class="dlg-pie">${acciones
                .map((a) => `<button type="button" class="a-btn ${a.pri ? 'a-btn--pri' : ''} ${a.peligro ? 'a-btn--peligro' : ''}" data-accion="${esc(a.id)}">${esc(a.texto)}</button>`)
                .join('')}</footer>`
            : ''
        }
      </div>`,
      alCerrar: resolver,
    })
    const dlg = c.el.querySelector('.dlg')
    c.el.addEventListener('pointerdown', (e) => e.target === c.el && c.cerrar())
    c.el.querySelector('.dlg-x').addEventListener('click', () => c.cerrar())
    dlg.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-accion]')
      if (!b) return
      const id = b.dataset.accion
      if (antesDeCerrar) {
        const r = await antesDeCerrar(id, dlg)
        if (r === false) return
        return c.cerrar(r === undefined ? id : r)
      }
      c.cerrar(id)
    })
    alAbrir?.(dlg, c.cerrar)
    const primero = dlg.querySelector('[autofocus], input, textarea, select, .a-btn--pri')
    setTimeout(() => primero?.focus({ preventScroll: true }), 60)
  })
}

/** Pregunta de sí o no. Resuelve true solo si la persona confirma. */
export async function confirmar({ titulo, texto = '', si = 'Sí, continuar', no = 'Cancelar', peligro = false }) {
  const r = await dialogo({
    titulo,
    html: texto ? `<p class="dlg-texto">${esc(texto)}</p>` : '',
    ancho: 440,
    acciones: [
      { id: 'no', texto: no },
      { id: 'si', texto: si, pri: !peligro, peligro },
    ],
  })
  return r === 'si'
}

/** Aviso breve al pie de la pantalla. */
export function aviso(texto, { tipo = '', ms = 3200 } = {}) {
  let z = document.getElementById('avisos')
  if (!z) {
    z = document.createElement('div')
    z.id = 'avisos'
    z.setAttribute('aria-live', 'polite')
    document.body.appendChild(z)
  }
  const el = document.createElement('div')
  el.className = `aviso ${tipo ? 'aviso--' + tipo : ''}`
  el.textContent = texto
  z.appendChild(el)
  requestAnimationFrame(() => el.classList.add('entra'))
  setTimeout(() => {
    el.classList.remove('entra')
    setTimeout(() => el.remove(), 300)
  }, ms)
}

/** Lee los campos con `name` de un contenedor y devuelve un objeto. */
export function leerCampos(el) {
  const o = {}
  el.querySelectorAll('[name]').forEach((c) => {
    if (c.type === 'checkbox') o[c.name] = c.checked
    else if (c.type === 'radio') {
      if (c.checked) o[c.name] = c.value
    } else if (c.type === 'number') o[c.name] = c.value === '' ? null : Number(c.value)
    else o[c.name] = c.value.trim()
  })
  return o
}
