import './styles/main.css'
import './styles/scenes.css'
import './styles/app.css'
import './styles/demo.css'
import './styles/interno.css'
import './styles/crm.css'
import './styles/hoy.css'
import './styles/crm-volumen.css'
import './styles/visita.css'

import { ruta, iniciarRutas, conGuardia } from './app/router.js'
import { iniciarSesion, sesion } from './app/sesion.js'
import { vistaGeneral } from './deck/general.js'
import { vistaDemos, vistaDemoSuelta, vistaIconos } from './app/galerias.js'
import { registrarInterno } from './interno/rutas.js'

// Arranque. Una sola página con varias caras:
//   #/general            la presentación general de Soma
//   #/demo/…             una demo suelta (la que el cliente abre en su teléfono)
//   #/entrar             acceso del equipo
//   #/ …                 lo interno: inicio, presala, visitas y CRM (ver src/interno/rutas.js)

const PUBLICAS = [/^\/general$/, /^\/demo\//, /^\/entrar$/]

conGuardia((camino) => {
  if (PUBLICAS.some((re) => re.test(camino))) return null
  return sesion.dentro ? null : '/entrar'
})

ruta('/general', vistaGeneral)
ruta('/demo/:modulo/:vista', vistaDemoSuelta)
ruta('/demos', vistaDemos)
ruta('/iconos', vistaIconos)
registrarInterno()

iniciarSesion().finally(iniciarRutas)
