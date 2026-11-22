// Utilidades para las vistas internas (las que no son presentación).

/** Muestra la capa de aplicación con el tema dado y devuelve su contenedor, ya vacío. */
export function abrirApp({ tema = 'paper', titulo = 'Soma Studio' } = {}) {
  document.body.dataset.modo = 'app'
  const app = document.getElementById('app')
  app.dataset.theme = tema
  app.className = ''
  app.innerHTML = ''
  app.scrollTop = 0
  document.title = titulo
  return app
}

/** Escucha clics delegados dentro de un contenedor: alTocar(el, '[data-x]', (boton, evento) => …) */
export function alTocar(el, selector, fn) {
  const h = (e) => {
    const t = e.target.closest(selector)
    if (t && el.contains(t)) fn(t, e)
  }
  el.addEventListener('click', h)
  return () => el.removeEventListener('click', h)
}
