import { ruta } from '../app/router.js'
import { vistaHoy, vistaProspectos, vistaAgenda, vistaCobranza, vistaSistemas } from './vistas.js'
import { vistaExpediente } from './expediente.js'
import { vistaAjustes } from './ajustes.js'

export function registrarCrm() {
  ruta('/crm', vistaHoy)
  ruta('/crm/prospectos', vistaProspectos)
  ruta('/crm/prospecto/:id', vistaExpediente)
  ruta('/crm/agenda', vistaAgenda)
  ruta('/crm/cobranza', vistaCobranza)
  ruta('/crm/sistemas', vistaSistemas)
  ruta('/crm/ajustes', vistaAjustes)
}
