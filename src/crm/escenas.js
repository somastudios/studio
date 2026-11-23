import { pelicula, canvasDe } from './pixel.js'
import { peliPuertas } from './peli-puertas.js'
import { peliClientes } from './peli-clientes.js'
import { peliCobrado } from './peli-cobrado.js'
import { peliCobro } from './peli-cobro.js'

// Las películas de «Hoy». Cada una cuenta, en pixel art y con cortes de cámara, lo que mide
// su ficha. Cada película vive en su archivo; el reparto y la utilería, en reparto.js.
//
//   puertas   Prospectos en proceso: Dalí y Alex van de puerta en puerta.
//   agentes   Clientes: llegan de traje y lentes oscuros, exigen, y se van contentos.
//   billetes  Cobrado este mes: cae el pago y llueven billetes de 500.
//   cobro     Por cobrar o por vencer: el plazo corre, Dalí avisa y el cliente paga.

const ESCENAS = { puertas: peliPuertas, agentes: peliClientes, billetes: peliCobrado, cobro: peliCobro }

/** El canvas de una escena. La película se arma la primera vez que se pide. */
export function escena(nombre) {
  if (!pelicula(nombre)) ESCENAS[nombre]()
  return canvasDe(nombre)
}

// Para las herramientas que revisan las películas cuadro por cuadro.
export { pelicula, pinta } from './pixel.js'
