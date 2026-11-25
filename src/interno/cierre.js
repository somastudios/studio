import { abrirApp, alTocar } from '../app/vista.js'
import { ir } from '../app/router.js'
import { leerCampos } from '../app/capas.js'
import { esc, duracion } from '../app/util.js'
import { store } from '../data/store.js'
import { sesion } from '../app/sesion.js'

// Al salir del negocio: un minuto para anotar cómo fue, mientras está fresco.
// Esto no lo ve el cliente. Es lo que más ayuda a preparar la demostración.

export const ANIMOS = [
  { id: 'abierto', t: 'Abierto', d: 'Platicó, contó sus problemas.' },
  { id: 'neutral', t: 'Neutral', d: 'Escuchó, sin soltar mucho.' },
  { id: 'cerrado', t: 'Cerrado', d: 'A la defensiva o con prisa.' },
]

export const RESULTADOS = [
  { id: 'agendo', t: 'Agendó la segunda visita' },
  { id: 'avisa', t: 'Quedó de avisar' },
  { id: 'no_decide', t: 'No estaba quien decide' },
  { id: 'mal_momento', t: 'Mal momento: volver otro día' },
  { id: 'no_interesa', t: 'No le interesó' },
]

export function vistaCierre({ id }) {
  const visita = store.uno('visitas', id)
  const prospecto = visita && store.uno('prospectos', visita.prospecto_id)
  if (!prospecto) return void ir('/crm')
  const app = abrirApp({ tema: 'ink', titulo: 'Cierre de visita · Soma' })
  const cita = store.lista('citas', (c) => c.prospecto_id === prospecto.id && c.tipo === 'visita2' && c.estado !== 'cancelada')[0]
  const st = { animo: visita.animo || '', resultado: visita.resultado || (cita ? 'agendo' : '') }
  const n = store.lista('hallazgos', { visita_id: id }).length

  app.innerHTML = `
    <div class="ps">
      <header class="ps-cab"><span class="a-k">Solo para el equipo</span><span class="a-k">${n} ${n === 1 ? 'hallazgo guardado' : 'hallazgos guardados'}${visita.audio_seg ? ` · audio ${duracion(visita.audio_seg)}` : ''}</span></header>
      <h1 class="a-h1 ps-h">¿Cómo te fue en ${esc(prospecto.negocio)}?</h1>
      <p class="a-p">Anota cómo te fue mientras lo recuerdas, con esto se armará su demo.</p>

      <section class="ps-paso"><p class="a-k">¿Cómo estaba la persona?</p>
        <div class="ps-van">${ANIMOS.map((a) => `<button type="button" class="ps-persona" data-animo="${a.id}" aria-pressed="${st.animo === a.id}"><b>${a.t}</b><span>${a.d}</span></button>`).join('')}</div>
      </section>
      <section class="ps-paso"><p class="a-k">¿En qué quedó?</p>
        <div class="ps-opciones">${RESULTADOS.map((r) => `<button type="button" class="a-btn" data-resultado="${r.id}" aria-pressed="${st.resultado === r.id}">${r.t}</button>`).join('')}</div>
      </section>
      <section class="ps-paso"><label class="a-campo"><span>Notas</span><textarea class="a-in" name="notas" rows="5" placeholder="Qué le brilló en los ojos, qué objetó, quién más decide, qué prometiste.">${esc(visita.notas || '')}</textarea></label></section>

      <footer class="ps-pie">
        <button type="button" class="a-btn a-btn--azul a-btn--g" data-guardar>Guardar y ver el expediente</button>
        <button type="button" class="a-btn a-btn--fantasma" data-nueva>Guardar e ir a otra visita</button>
      </footer>
    </div>`

  const guardar = () => {
    const { notas } = leerCampos(app)
    store.guardar('visitas', { id, animo: st.animo || null, resultado: st.resultado || null, notas: notas || null })
    const cambios = {}
    if (st.resultado === 'no_interesa') cambios.etapa = 'perdido'
    if (st.resultado === 'mal_momento' || st.resultado === 'no_decide') cambios.proxima_accion = st.resultado === 'no_decide' ? 'Volver cuando esté quien decide' : 'Volver otro día'
    if (st.resultado === 'avisa') cambios.proxima_accion = 'Dar seguimiento: quedó de avisar'
    if (Object.keys(cambios).length) store.guardar('prospectos', { id: prospecto.id, ...cambios })
    if (notas) store.anotar(prospecto.id, 'nota', notas, { visita_id: id }, sesion.nombre)
    store.sincronizar()
  }
  const marca = (attr, valor) => app.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === valor)))
  const q = [
    alTocar(app, '[data-animo]', (b) => marca('animo', (st.animo = b.dataset.animo))),
    alTocar(app, '[data-resultado]', (b) => marca('resultado', (st.resultado = b.dataset.resultado))),
    alTocar(app, '[data-guardar]', () => {
      guardar()
      ir(`/crm/prospecto/${prospecto.id}`)
    }),
    alTocar(app, '[data-nueva]', () => {
      guardar()
      ir('/presala')
    }),
  ]
  return () => q.forEach((f) => f())
}
