import { ruta } from '../app/router.js'
import { vistaEntrar } from './entrar.js'
import { vistaPresala } from './presala.js'
import { vistaCierre } from './cierre.js'
import { vistaVisita1 } from '../visita1/index.js'
import { vistaVisita2 } from '../visita2/index.js'
import { registrarCrm } from '../crm/rutas.js'
import { ir } from '../app/router.js'

// Rutas internas: lo que usa el equipo.
export function registrarInterno() {
  ruta('/entrar', vistaEntrar)
  ruta('/', () => void ir('/crm', { reemplazar: true }))
  ruta('/presala', vistaPresala)
  ruta('/visita/:id/cierre', vistaCierre)
  ruta('/visita/:id', vistaVisita1)
  ruta('/visita2/:id', vistaVisita2)
  registrarCrm()
}
