import { ruta } from '../app/router.js'
import { abrirApp } from '../app/vista.js'

// Rutas internas. Provisional: se completa con presala, visitas y CRM.
export function registrarInterno() {
  const inicio = () => {
    const app = abrirApp({ tema: 'ink' })
    app.innerHTML = `<div class="a-pagina"><h1 class="a-h1">Soma</h1><p class="a-p" style="margin-top:12px">En construcción.</p><div class="a-fila" style="margin-top:20px"><a class="a-btn" href="#/general">Presentación general</a><a class="a-btn" href="#/demos">Demos</a><a class="a-btn" href="#/iconos">Iconos</a></div></div>`
  }
  ruta('/', inicio)
  ruta('/entrar', inicio)
}
