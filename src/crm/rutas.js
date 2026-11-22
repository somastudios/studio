import { ruta } from '../app/router.js'
import { abrirApp } from '../app/vista.js'

export function registrarCrm() {
  const inicio = () => {
    const app = abrirApp({ tema: 'paper' })
    app.innerHTML = `<div class="a-pagina"><h1 class="a-h1">CRM</h1><div class="a-fila" style="margin-top:20px"><a class="a-btn a-btn--pri" href="#/presala">Nueva visita</a><a class="a-btn" href="#/demos">Demos</a></div></div>`
  }
  ruta('/crm', inicio)
  ruta('/crm/prospecto/:id', inicio)
}
