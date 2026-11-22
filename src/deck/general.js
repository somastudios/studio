import { montarDeck } from './montar.js'
import { ir } from '../app/router.js'

import portada from '../scenes/00-portada.js'
import premisa from '../scenes/01-premisa.js'
import donde from '../scenes/02-donde.js'
import causa from '../scenes/03-causa.js'
import metodo from '../scenes/04-metodo.js'
import rutas from '../scenes/05-rutas.js'
import construimos from '../scenes/06-construimos.js'
import principios from '../scenes/07-principios.js'
import alcances from '../scenes/08-alcances.js'
import siguiente from '../scenes/09-siguiente.js'

// La presentación general: las diez escenas originales, para cuando no hubo tiempo
// de preparar una visita o se quiere contar qué es Soma sin hablar de un negocio en particular.

export function vistaGeneral() {
  const scenes = [portada, premisa, donde, causa, metodo, rutas, construimos, principios, alcances, siguiente]
  const d = montarDeck({ scenes, alSalir: () => ir('/') })
  return () => d.destruir()
}
