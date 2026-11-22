import { montarDeck } from '../deck/montar.js'
import { ir } from '../app/router.js'
import { confirmar } from '../app/capas.js'
import { ahora, duracion } from '../app/util.js'
import { store } from '../data/store.js'
import { crearEstado } from './estado.js'
import { grabadora } from './grabadora.js'
import { portada, acuerdo, suele } from './apertura.js'
import { diagnostico } from './diagnostico.js'
import { ronda, alcance, expediente, agenda, despedida } from './cierre.js'
import premisa from '../scenes/01-premisa.js'
import metodo from '../scenes/04-metodo.js'

// La primera visita, de principio a fin. Once escenas: abrir sin vender, dejar que el cliente
// señale lo suyo, diagnosticar con él, mostrarle lo que entendimos y salir con una fecha.

export function vistaVisita1({ id }) {
  const E = crearEstado(id)
  if (!E) return void ir('/crm')
  let cerrada = E.visita.estado && E.visita.estado !== 'en_curso'

  async function finalizar(estado = 'terminada') {
    if (cerrada) return
    cerrada = true
    const g = await grabadora.detener().catch(() => null)
    E.ponVisita({ estado, fin: ahora(), ...(g ? { audio_ruta: g.ruta, audio_seg: g.seg } : {}) })
    if (!E.prospecto.etapa || E.prospecto.etapa === 'nuevo') E.ponProspecto({ etapa: 'visitado' })
    store.anotar(E.prospecto.id, 'visita', estado === 'terminada' ? 'Primera visita completada.' : 'La visita terminó antes de llegar al final.', { visita_id: E.visita.id }, E.quien())
    store.sincronizar()
  }

  const scenes = [portada(E), acuerdo(E), premisa, suele(E), diagnostico(E), ronda(E), metodo, alcance(E), expediente(E), agenda(E), despedida(E, { alLlegar: () => finalizar('terminada') })]

  async function salir() {
    if (!cerrada) {
      const ok = await confirmar({ titulo: '¿Terminar la visita aquí?', texto: 'Lo que ya registraste se queda guardado en el expediente.', si: 'Terminar', no: 'Seguir presentando' })
      if (!ok) return
      await finalizar('salida_rapida')
    }
    ir(`/visita/${E.visita.id}/cierre`)
  }

  const d = montarDeck({
    scenes,
    inicial: cerrada ? 0 : E.datos.escena || 0,
    titulo: `${E.negocio} · Soma`,
    alSalir: salir,
    extraHud: `${E.visita.graba ? '<button type="button" class="hud-rec t-label" data-rec aria-label="Pausar o reanudar la grabación"><i></i><span>0:00</span></button>' : ''}<button type="button" class="hud-salir t-label" data-act="salir">Salir</button>`,
    alCambiar(i) {
      E.datos.escena = i
      E.guardaDatos()
    },
  })

  // Grabación: empieza con la presentación. El botón del HUD la pausa.
  let reloj = 0
  const rec = document.querySelector('.hud-rec')
  if (rec && !cerrada) {
    grabadora.iniciar(E.visita.id).then((ok) => {
      if (!ok) rec.classList.add('es-off')
    })
    const pinta = () => {
      rec.querySelector('span').textContent = duracion(grabadora.segundos)
      rec.classList.toggle('es-pausa', !grabadora.grabando)
    }
    reloj = setInterval(pinta, 1000)
    rec.addEventListener('click', () => {
      grabadora.alternar()
      pinta()
    })
  }

  return () => {
    clearInterval(reloj)
    d.destruir()
  }
}
