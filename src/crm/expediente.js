import { store } from '../data/store.js'
import { archivos } from '../data/archivos.js'
import { sesion } from '../app/sesion.js'
import { ir } from '../app/router.js'
import { alTocar } from '../app/vista.js'
import { confirmar, aviso } from '../app/capas.js'
import { esc, dia, fecha, dinero, relativo, duracion, enlaceWhatsApp, telBonito } from '../app/util.js'
import { ETAPAS } from '../data/esquema.js'
import { SOL } from '../content/soluciones.js'
import { AREA } from '../content/base.js'
import { V1 } from '../content/visita.js'
import { marco } from './marco.js'
import { estadoMembresia, nombreModalidad, precioPlazo, activarMembresia } from './cobranza.js'
import { editarProspecto, editarCita, avisar, dlgPago, editarMembresia, editarPropuesta, editarSistema } from './dialogos.js'
import { giro, filaCita, filaSistema, accionesSistema, vacio } from './vistas.js'
import { ANIMOS, RESULTADOS } from '../interno/cierre.js'

// El expediente de un prospecto: lo que dijo, lo que se le propuso, lo que tiene y lo que debe.

const PESTANAS = [
  ['resumen', 'Resumen'],
  ['visitas', 'Visitas'],
  ['propuesta', 'Propuesta'],
  ['cuenta', 'Sistema y cobro'],
  ['bitacora', 'Bitácora'],
]

export function vistaExpediente({ id, consulta }) {
  let pestana = consulta.t || 'resumen'
  if (!store.uno('prospectos', id)) return void ir('/crm/prospectos')

  const m = marco('prospectos', (main) => {
    const p = store.uno('prospectos', id)
    if (!p) return void ir('/crm/prospectos')
    const visitas = store.lista('visitas', { prospecto_id: id }).sort((a, b) => (b.inicio || '').localeCompare(a.inicio || ''))
    const hallazgos = store.lista('hallazgos', { prospecto_id: id }).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    const citas = store.lista('citas', (c) => c.prospecto_id === id && c.estado !== 'cancelada').sort((a, b) => (a.inicio || '9').localeCompare(b.inicio || '9'))
    const propuesta = store.lista('propuestas', { prospecto_id: id }).sort((a, b) => (b.creado || '').localeCompare(a.creado || ''))[0] || null
    const sistemas = store.lista('sistemas', { prospecto_id: id })
    const membresias = store.lista('membresias', { prospecto_id: id })
    const pagos = store.lista('pagos', { prospecto_id: id }).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
    const bitacora = store.lista('bitacora', { prospecto_id: id }).sort((a, b) => (b.creado || '').localeCompare(a.creado || ''))
    const forma = V1.alcance.formas.find((f) => f.id === p.modalidad_interes)?.t

    const resumen = () => {
      const vistos = hallazgos.filter((h) => h.estado !== 'mencionado')
      const mencionados = hallazgos.filter((h) => h.estado === 'mencionado')
      const proxima = citas.find((c) => c.estado !== 'hecha')
      return `
        <div class="crm-dos">
          <section>
            <div class="a-seccion-cab"><h2 class="a-h2">Lo que dijo</h2><span class="a-k">${vistos.length} ${vistos.length === 1 ? 'problema' : 'problemas'}</span></div>
            ${
              vistos.length
                ? `<ol class="crm-hallazgos">${vistos
                    .map((h) => {
                      const s = SOL[h.elegida]
                      const interes = (h.rutas || []).filter((r) => r.reaccion === 'interesa' && r.sol !== h.elegida).map((r) => SOL[r.sol]?.nombre).filter(Boolean)
                      const no = (h.rutas || []).filter((r) => r.reaccion === 'no').map((r) => SOL[r.sol]?.nombre).filter(Boolean)
                      return `<li><p class="a-k">${esc(AREA[h.area]?.nombre || 'Dicho por el cliente')}</p><p class="a-h3">${esc(h.titulo)}</p>
                        <p class="crm-ruta">${s ? `Le interesó: ${esc(s.nombre)}` : h.a_medida ? 'Pide una solución a la medida' : 'Sin ruta elegida todavía'}</p>
                        ${interes.length ? `<p class="a-item-s">También le interesó: ${interes.map(esc).join(', ')}</p>` : ''}
                        ${no.length ? `<p class="a-item-s">No le convenció: ${no.map(esc).join(', ')}</p>` : ''}
                        ${h.etiquetas?.length ? `<p class="a-item-s">${h.etiquetas.map(esc).join(' · ')}</p>` : ''}
                        ${h.nota ? `<p class="crm-cita-texto">«${esc(h.nota)}»</p>` : ''}</li>`
                    })
                    .join('')}</ol>`
                : vacio('Todavía no hay diagnóstico', 'Aparece aquí al terminar la primera visita: qué problemas reconoció, qué respondió y qué ruta le interesó.', `<a class="a-btn a-btn--pri" href="#/presala?p=${id}">Preparar la visita</a>`)
            }
            ${mencionados.length ? `<p class="a-k" style="margin-top:20px">También mencionó</p><p class="a-p">${mencionados.map((h) => esc(h.titulo)).join(' · ')}</p>` : ''}
          </section>
          <aside class="a-pila">
            <div class="a-tarjeta"><p class="a-k">Siguiente paso</p>
              ${proxima ? `<p class="a-h3" style="margin-top:6px">${proxima.inicio ? `${esc(fecha(proxima.inicio, 'larga'))}, ${esc(fecha(proxima.inicio, 'hora'))}` : 'Cita por acordar por mensaje'}</p><p class="a-item-s">${proxima.inicio ? esc(relativo(proxima.inicio)) : ''}</p>` : `<p class="a-h3" style="margin-top:6px">${esc(p.proxima_accion || 'Sin siguiente paso definido')}</p>${p.proxima_fecha ? `<p class="a-item-s">${esc(fecha(p.proxima_fecha, 'larga'))}</p>` : ''}`}
              <div class="a-fila" style="margin-top:12px"><button type="button" class="a-btn a-btn--ch" data-cita-nueva>Agendar</button>${p.telefono ? `<button type="button" class="a-btn a-btn--ch" data-seguimiento>Escribirle</button>` : ''}</div>
            </div>
            <div class="a-tarjeta"><p class="a-k">Contacto</p>
              <dl class="a-datos" style="margin-top:8px">
                <dt>Persona</dt><dd>${esc(p.contacto || '—')}${p.puesto ? `, ${esc(p.puesto)}` : ''}</dd>
                <dt>WhatsApp</dt><dd>${p.telefono ? `<a class="a-enlace" target="_blank" rel="noopener" href="${esc(enlaceWhatsApp(p.telefono))}">${esc(telBonito(p.telefono))}</a>` : '—'}</dd>
                ${p.correo ? `<dt>Correo</dt><dd class="selectable">${esc(p.correo)}</dd>` : ''}
                ${p.direccion ? `<dt>Dirección</dt><dd>${esc(p.direccion)}</dd>` : ''}
              </dl>
            </div>
            <div class="a-tarjeta"><p class="a-k">Hasta dónde quiere llegar</p>
              <dl class="a-datos" style="margin-top:8px">
                <dt>Alcance</dt><dd>${esc(p.alcance || '—')}</dd>
                <dt>Presupuesto</dt><dd>${esc(p.presupuesto || '—')}</dd>
                <dt>Forma de pago</dt><dd>${esc(forma || '—')}</dd>
              </dl>
            </div>
            ${p.notas ? `<div class="a-tarjeta"><p class="a-k">Notas</p><p style="margin-top:6px;white-space:pre-wrap">${esc(p.notas)}</p></div>` : ''}
          </aside>
        </div>`
    }

    const lasVisitas = () =>
      visitas.length
        ? visitas
            .map((v) => {
              const quienes = (store.ajuste('presentadores') || []).filter((x) => (v.presentadores || []).includes(x.id)).map((x) => x.nombre)
              const min = v.inicio && v.fin ? Math.round((new Date(v.fin) - new Date(v.inicio)) / 60000) : null
              return `<div class="a-tarjeta crm-visita" data-visita="${v.id}">
                <div class="a-entre"><div><p class="a-k">${v.tipo === 2 ? 'Segunda visita' : 'Primera visita'}${quienes.length ? ` · ${quienes.map(esc).join(' y ')}` : ''}</p><p class="a-h3">${esc(fecha(v.inicio, 'larga'))}${v.inicio ? `, ${esc(fecha(v.inicio, 'hora'))}` : ''}</p></div>
                  <div class="a-fila">${min != null ? `<span class="a-chip a-chip--liso">${min} min</span>` : ''}<span class="a-chip a-chip--${v.estado === 'terminada' ? 'ok' : v.estado === 'en_curso' ? 'azul' : 'alerta'}">${{ terminada: 'Completa', en_curso: 'Sin terminar', salida_rapida: 'Terminó antes' }[v.estado] || 'Sin terminar'}</span></div></div>
                <dl class="a-datos" style="margin-top:12px">
                  <dt>Ánimo</dt><dd>${esc(ANIMOS.find((a) => a.id === v.animo)?.t || '—')}</dd>
                  <dt>En qué quedó</dt><dd>${esc(RESULTADOS.find((r) => r.id === v.resultado)?.t || '—')}</dd>
                  ${v.datos?.correccion ? `<dt>Corrigió</dt><dd>${esc(v.datos.correccion)}</dd>` : ''}
                  ${v.datos?.decision ? `<dt>Decidió</dt><dd>${esc(v.datos.decision)}</dd>` : ''}
                </dl>
                ${v.notas ? `<p style="margin-top:12px;white-space:pre-wrap">${esc(v.notas)}</p>` : ''}
                <div class="a-fila" style="margin-top:12px">
                  ${v.audio_ruta ? `<button type="button" class="a-btn a-btn--ch" data-audio="${esc(v.audio_ruta)}">Escuchar la grabación · ${duracion(v.audio_seg)}</button>` : v.graba ? '<span class="a-item-s">Se pidió grabar, pero no hay audio guardado en este dispositivo ni en la nube.</span>' : ''}
                  ${v.estado === 'en_curso' && v.tipo !== 2 ? `<a class="a-btn a-btn--ch" href="#/visita/${v.id}">Retomar la presentación</a>` : ''}
                  <a class="a-btn a-btn--ch a-btn--fantasma" href="#/visita/${v.id}/cierre">Editar el cierre</a>
                </div>
                <div data-reproductor></div>
              </div>`
            })
            .join('')
        : vacio('Sin visitas todavía', 'Cada visita queda aquí con su fecha, quién fue, cómo estaba la persona y, si se grabó, el audio.', `<a class="a-btn a-btn--pri" href="#/presala?p=${id}">Preparar la visita</a>`)

    const laPropuesta = () => {
      if (!propuesta) return vacio('Todavía no hay propuesta', 'Aquí se prepara la segunda visita: el enlace de la demo que construyeron, lo que incluye y los precios, de contado y con Membresía Soma. Los precios los definen ustedes.', '<button type="button" class="a-btn a-btn--pri" data-propuesta>Preparar la propuesta</button>')
      const a = precioPlazo(propuesta, 1)
      const b = precioPlazo(propuesta, 6)
      const c = precioPlazo(propuesta, 12)
      const lista = propuesta.precio_contado || propuesta.precio_mensual
      return `
        <div class="crm-dos">
          <section>
            <div class="a-seccion-cab"><h2 class="a-h2">${esc(propuesta.titulo || 'Propuesta')}</h2><span class="a-chip a-chip--${propuesta.estado === 'aceptada' ? 'ok' : propuesta.estado === 'presentada' ? 'azul' : 'liso'}">${{ borrador: 'Borrador', lista: 'Lista para presentar', presentada: 'Presentada', aceptada: 'Aceptada', rechazada: 'No avanzó' }[propuesta.estado] || 'Borrador'}</span></div>
            ${propuesta.resumen ? `<p style="margin-top:12px">${esc(propuesta.resumen)}</p>` : ''}
            <dl class="a-datos" style="margin-top:16px">
              <dt>Demo</dt><dd>${propuesta.demo_url ? `<a class="a-enlace" target="_blank" rel="noopener" href="${esc(propuesta.demo_url)}">${esc(propuesta.demo_url)}</a>` : 'Se mostrarán las demos del catálogo que le interesaron'}</dd>
              <dt>Pago único</dt><dd class="a-num">${propuesta.precio_contado ? dinero(propuesta.precio_contado) : '—'}</dd>
              <dt>Membresía</dt><dd class="a-num">${propuesta.precio_mensual ? `${dinero(a.total)} al mes · 6 meses ${dinero(b.total)} · 12 meses ${dinero(c.total)}` : '—'}</dd>
              <dt>Prueba</dt><dd>${propuesta.prueba_dias ? `${propuesta.prueba_dias} días` : 'No se ofrece'}</dd>
              ${propuesta.mantenimiento ? `<dt>Soporte</dt><dd>${esc(propuesta.mantenimiento)}</dd>` : ''}
              ${propuesta.modalidad ? `<dt>El cliente eligió</dt><dd class="a-fuerte">${esc(propuesta.modalidad === 'pensar' ? 'Pensarlo' : nombreModalidad(propuesta.modalidad))}</dd>` : ''}
            </dl>
            ${propuesta.incluye?.length ? `<p class="a-k" style="margin-top:18px">Incluye</p><ul class="crm-puntos">${propuesta.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
            ${propuesta.notas ? `<p class="a-k" style="margin-top:18px">Notas internas</p><p class="a-p">${esc(propuesta.notas)}</p>` : ''}
          </section>
          <aside class="a-pila">
            <div class="a-tarjeta"><p class="a-k">Segunda visita</p>
              <p class="a-p" style="margin-top:6px">${lista ? 'Recapitula lo que dijo, le deja probar su sistema y le presenta las dos formas de pago.' : 'Faltan los precios. Sin ellos, la escena de «Cómo se paga» sale vacía.'}</p>
              <div class="a-fila" style="margin-top:12px"><a class="a-btn a-btn--pri" href="#/visita2/${id}">Presentar</a><button type="button" class="a-btn" data-propuesta>Editar</button></div>
            </div>
            ${
              propuesta.modalidad && propuesta.modalidad !== 'pensar' && !membresias.length
                ? `<div class="a-tarjeta"><p class="a-k">Pendiente</p><p class="a-p" style="margin-top:6px">El cliente eligió ${esc(nombreModalidad(propuesta.modalidad).toLowerCase())}. Actívalo para empezar a llevar sus pagos.</p><button type="button" class="a-btn a-btn--azul" style="margin-top:12px" data-activar>Activar</button></div>`
                : ''
            }
          </aside>
        </div>`
    }

    const laCuenta = () => `
      <section><div class="a-seccion-cab"><h2 class="a-h2">Sistemas</h2><button type="button" class="a-btn a-btn--ch" data-nuevo-sistema>Agregar sistema</button></div>
        ${sistemas.length ? sistemas.map(filaSistema).join('') : `<p class="a-p" style="margin-top:12px">Cuando entregues el sistema, regístralo aquí para administrarlo a distancia y guardar sus accesos.</p>`}
      </section>
      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Membresía y pagos</h2><button type="button" class="a-btn a-btn--ch" data-nueva-membresia>Agregar membresía</button></div>
        ${
          membresias.length
            ? `<div class="a-lista">${membresias
                .map((x) => {
                  const e = estadoMembresia(x)
                  return `<div class="a-item" style="--cols:1.4fr auto auto auto auto" data-membresia="${x.id}"><span><span class="a-item-t">${esc(nombreModalidad(x.modalidad))} · ${dinero(x.monto || 0)}</span><br><span class="a-item-s">Desde ${esc(fecha(x.inicio, 'completa'))}${x.vence ? ` · vence ${esc(fecha(x.vence, 'completa'))}` : ''}${x.auto ? ' · se renueva sola con tarjeta' : ''}</span></span>
                    <span class="a-chip a-chip--${e.chip}">${esc(e.texto)}</span><button type="button" class="a-btn a-btn--ch a-btn--fantasma" data-editar-membresia>Editar</button><button type="button" class="a-btn a-btn--ch" data-avisar>Avisar</button><button type="button" class="a-btn a-btn--ch a-btn--pri" data-pagar>Registrar pago</button></div>`
                })
                .join('')}</div>`
            : `<p class="a-p" style="margin-top:12px">Sin membresía. Se crea cuando el cliente decide, o a mano con «Agregar membresía».</p>`
        }
        ${
          pagos.length
            ? `<p class="a-k crm-dia">Pagos</p><div class="a-lista">${pagos.map((x) => `<div class="a-item" style="--cols:96px 1fr auto auto"><span class="a-item-s a-num">${esc(fecha(x.fecha, 'corta'))}</span><span><span class="a-item-t">${esc(x.concepto || 'Pago')}</span><br><span class="a-item-s">${esc(x.metodo || '')}${x.referencia ? ` · ${esc(x.referencia)}` : ''}${x.cubre_hasta ? ` · cubre hasta ${esc(fecha(x.cubre_hasta, 'corta'))}` : ''}</span></span><span class="a-fuerte a-num">${dinero(x.monto || 0)}</span><span class="a-chip a-chip--${x.estado === 'confirmado' ? 'ok' : x.estado === 'pendiente' ? 'alerta' : 'mal'}">${{ confirmado: 'Pagado', pendiente: 'Pendiente', fallido: 'Falló', reembolsado: 'Reembolsado' }[x.estado] || ''}</span></div>`).join('')}</div>`
            : ''
        }
        <div class="a-fila" style="margin-top:14px"><button type="button" class="a-btn a-btn--ch" data-pago-suelto>Registrar un pago suelto</button></div>
      </section>`

    const laBitacora = () => `
      <form class="crm-nota" data-nota><input class="a-in" name="nota" placeholder="Anotar algo en el expediente" autocomplete="off" /><button type="submit" class="a-btn a-btn--pri">Anotar</button></form>
      ${bitacora.length ? `<ol class="crm-bitacora">${bitacora.map((b) => `<li><span class="a-k">${esc(fecha(b.creado, 'corta'))} · ${esc(fecha(b.creado, 'hora'))}${b.quien ? ` · ${esc(b.quien)}` : ''}</span><p>${esc(b.texto)}</p></li>`).join('')}</ol>` : `<p class="a-p" style="margin-top:16px">Aquí queda el rastro de todo: visitas, avisos, pagos y cambios en sus sistemas.</p>`}`

    main.innerHTML = `
      <p class="a-k"><a class="a-enlace" href="#/crm/prospectos">Prospectos</a> / ${esc(giro(p))}</p>
      <header class="a-cab" style="margin-top:10px">
        <div><h1 class="a-h1">${esc(p.negocio)}</h1></div>
        <div class="a-cab-acc">
          <label class="crm-etapa"><span class="a-k">Etapa</span><select class="a-in" data-etapa>${ETAPAS.map((e) => `<option value="${e.id}" ${(p.etapa || 'nuevo') === e.id ? 'selected' : ''}>${e.nombre}</option>`).join('')}</select></label>
          <button type="button" class="a-btn" data-editar>Editar</button>
          <a class="a-btn a-btn--pri" href="#/presala?p=${id}">Nueva visita</a>
        </div>
      </header>
      <div class="a-tabs" role="tablist">${PESTANAS.map(([k, t]) => `<button type="button" class="a-tab" role="tab" data-tab="${k}" aria-selected="${pestana === k}">${t}</button>`).join('')}</div>
      <div class="crm-cuerpo">${pestana === 'visitas' ? lasVisitas() : pestana === 'propuesta' ? laPropuesta() : pestana === 'cuenta' ? laCuenta() : pestana === 'bitacora' ? laBitacora() : resumen()}</div>
      <div class="crm-peligro"><button type="button" class="a-enlace a-mudo" data-borrar>Eliminar este prospecto</button></div>`
  })

  const P = () => store.uno('prospectos', id)
  const propuestaActual = () => store.lista('propuestas', { prospecto_id: id }).sort((a, b) => (b.creado || '').localeCompare(a.creado || ''))[0] || null
  const deMembresia = (b) => store.uno('membresias', b.closest('[data-membresia]').dataset.membresia)
  const cambio = (e) => {
    if (e.target.matches('[data-etapa]')) {
      store.guardar('prospectos', { id, etapa: e.target.value })
      store.anotar(id, 'etapa', `Pasó a «${ETAPAS.find((x) => x.id === e.target.value)?.nombre}».`, null, sesion.nombre)
    }
  }
  const envio = (e) => {
    if (!e.target.matches('[data-nota]')) return
    e.preventDefault()
    const v = e.target.nota.value.trim()
    if (!v) return
    e.target.nota.value = ''
    e.target.nota.blur()
    store.anotar(id, 'nota', v, null, sesion.nombre)
  }
  m.main.addEventListener('change', cambio)
  m.main.addEventListener('submit', envio)
  const q = [
    alTocar(m.main, '[data-tab]', (b) => {
      pestana = b.dataset.tab
      history.replaceState(null, '', `#/crm/prospecto/${id}?t=${pestana}`)
      m.repinta()
    }),
    alTocar(m.main, '[data-editar]', () => editarProspecto(P())),
    alTocar(m.main, '[data-cita-nueva]', () => editarCita(null, id)),
    alTocar(m.main, '[data-cita]', (b) => editarCita(store.uno('citas', b.dataset.cita))),
    alTocar(m.main, '[data-seguimiento]', () => avisar({ prospecto: P(), tipo: 'seguimiento' })),
    alTocar(m.main, '[data-propuesta]', () => editarPropuesta(propuestaActual(), P())),
    alTocar(m.main, '[data-activar]', () => {
      const pr = propuestaActual()
      activarMembresia({ prospecto: P(), propuesta: pr, modalidad: pr.modalidad, sistema_id: store.lista('sistemas', { prospecto_id: id })[0]?.id || null })
      store.guardar('propuestas', { id: pr.id, estado: 'aceptada' })
      pestana = 'cuenta'
      aviso('Activado. Ya aparece en cobranza.', { tipo: 'ok' })
    }),
    alTocar(m.main, '[data-nuevo-sistema]', () => editarSistema(null, id)),
    ...accionesSistema(m.main),
    alTocar(m.main, '[data-nueva-membresia]', () => editarMembresia(null, P())),
    alTocar(m.main, '[data-editar-membresia]', (b) => editarMembresia(deMembresia(b), P())),
    alTocar(m.main, '[data-avisar]', (b) => avisar({ prospecto: P(), membresia: deMembresia(b) })),
    alTocar(m.main, '[data-pagar]', (b) => dlgPago({ prospecto: P(), membresia: deMembresia(b) })),
    alTocar(m.main, '[data-pago-suelto]', () => dlgPago({ prospecto: P() })),
    alTocar(m.main, '[data-audio]', async (b) => {
      const z = b.closest('[data-visita]').querySelector('[data-reproductor]')
      b.disabled = true
      const url = await archivos.url('grabaciones', b.dataset.audio)
      z.innerHTML = url ? `<audio controls autoplay src="${esc(url)}" style="width:100%;margin-top:12px"></audio>` : `<p class="a-error" style="margin-top:10px">No se encontró el audio. Si se grabó en otro dispositivo, todavía no termina de subir.</p>`
    }),
    alTocar(m.main, '[data-borrar]', async () => {
      if (!(await confirmar({ titulo: `¿Eliminar a ${P().negocio}?`, texto: 'Deja de aparecer en el CRM de todo el equipo, junto con sus visitas y hallazgos. Sus pagos se conservan en cobranza.', si: 'Eliminar', peligro: true }))) return
      for (const t of ['hallazgos', 'visitas', 'citas', 'propuestas']) store.lista(t, { prospecto_id: id }).forEach((x) => store.borrar(t, x.id))
      store.borrar('prospectos', id)
      ir('/crm/prospectos')
    }),
  ]
  return () => {
    m.main.removeEventListener('change', cambio)
    m.main.removeEventListener('submit', envio)
    q.forEach((f) => f())
    m.cerrar()
  }
}

export { dia }
