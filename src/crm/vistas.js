import { store } from '../data/store.js'
import { sesion } from '../app/sesion.js'
import { ir } from '../app/router.js'
import { alTocar } from '../app/vista.js'
import { confirmar, aviso } from '../app/capas.js'
import { esc, dia, fecha, dinero, relativo, diasPara, enlaceCalendario, agrupar, copiar } from '../app/util.js'
import { ETAPAS, METODOS } from '../data/esquema.js'
import { NICHO } from '../content/nichos/index.js'
import { marco } from './marco.js'
import { estadoMembresia, requiereAtencion, resumenCobranza, nombreModalidad, confirmarPago } from './cobranza.js'
import { editarProspecto, editarCita, avisar, dlgPago, editarMembresia, editarSistema, dlgConectar, dlgCredenciales, TIPOS_CITA } from './dialogos.js'

// Las pantallas del CRM, menos el expediente y los ajustes (que tienen su propio archivo).

const etapa = (id) => ETAPAS.find((e) => e.id === id)?.nombre || 'Por visitar'
const chipEtapa = (id) => `<span class="a-chip a-chip--${id === 'cliente' ? 'ok' : id === 'perdido' || id === 'pausa' ? 'mudo' : id === 'propuesta' || id === 'demo' ? 'azul' : 'liso'}">${esc(etapa(id))}</span>`
const giro = (p) => p?.nicho_otro || NICHO[p?.nicho]?.nombre || 'Giro sin definir'
const negocio = (id) => store.uno('prospectos', id)?.negocio || 'Sin prospecto'
const tipoCita = (t) => TIPOS_CITA.find(([k]) => k === t)?.[1] || 'Cita'
const vacio = (t, d, accion = '') => `<div class="a-vacio"><p class="a-vacio-t">${t}</p><p class="a-p">${d}</p>${accion}</div>`
const cifra = (n, e) => `<div class="a-cifra"><p class="a-cifra-n">${n}</p><p class="a-cifra-e">${e}</p></div>`

const filaCita = (c) => `<button type="button" class="a-item" style="--cols:92px 1fr auto" data-cita="${c.id}">
  <span class="a-num a-fuerte">${c.inicio ? esc(fecha(c.inicio, 'hora')) : 'Por acordar'}</span>
  <span><span class="a-item-t">${esc(negocio(c.prospecto_id))}</span><br><span class="a-item-s">${esc(tipoCita(c.tipo))}${c.lugar ? ` · ${esc(c.lugar)}` : ''}</span></span>
  <span class="a-chip a-chip--${c.estado === 'hecha' ? 'ok' : c.estado === 'cancelada' ? 'mudo' : c.estado === 'confirmada' ? 'azul' : 'liso'}">${esc({ pendiente: 'Pendiente', confirmada: 'Confirmada', hecha: 'Hecha', cancelada: 'Cancelada' }[c.estado] || 'Pendiente')}</span>
</button>`

const filaMembresia = (m) => {
  const e = estadoMembresia(m)
  return `<div class="a-item" style="--cols:1.4fr 1fr auto auto" data-membresia="${m.id}">
    <span><a class="a-item-t a-enlace" href="#/crm/prospecto/${m.prospecto_id}">${esc(negocio(m.prospecto_id))}</a><br><span class="a-item-s">${esc(nombreModalidad(m.modalidad))} · ${dinero(m.monto || 0)}${m.vence ? ` · vence ${esc(fecha(m.vence, 'corta'))}` : ''}</span></span>
    <span class="a-chip a-chip--${e.chip}">${esc(e.texto)}</span>
    <button type="button" class="a-btn a-btn--ch" data-avisar>Avisar</button>
    <button type="button" class="a-btn a-btn--ch a-btn--pri" data-pagar>Registrar pago</button>
  </div>`
}

/** Acciones comunes sobre membresías y citas, para cualquier vista que las liste. */
function acciones(main) {
  return [
    alTocar(main, '[data-cita]', (b) => editarCita(store.uno('citas', b.dataset.cita))),
    alTocar(main, '[data-avisar]', (b) => {
      const m = store.uno('membresias', b.closest('[data-membresia]').dataset.membresia)
      avisar({ prospecto: store.uno('prospectos', m.prospecto_id), membresia: m })
    }),
    alTocar(main, '[data-pagar]', (b) => {
      const m = store.uno('membresias', b.closest('[data-membresia]').dataset.membresia)
      dlgPago({ prospecto: store.uno('prospectos', m.prospecto_id), membresia: m })
    }),
    alTocar(main, '[data-editar-membresia]', (b) => {
      const m = store.uno('membresias', b.closest('[data-membresia]').dataset.membresia)
      editarMembresia(m, store.uno('prospectos', m.prospecto_id))
    }),
  ]
}

// ───────────────────────── Hoy ─────────────────────────

export function vistaHoy() {
  const m = marco('hoy', (main) => {
    const hoy = dia()
    const limite = dia(new Date(Date.now() + 7 * 864e5))
    const citas = store.lista('citas', (c) => c.estado !== 'cancelada' && c.estado !== 'hecha' && (!c.inicio || (dia(c.inicio) >= hoy && dia(c.inicio) <= limite))).sort((a, b) => (a.inicio || '9') .localeCompare(b.inicio || '9'))
    const cobrar = store.lista('membresias', requiereAtencion).sort((a, b) => (a.vence || '').localeCompare(b.vence || ''))
    const conCita = new Set(store.lista('citas', (c) => c.estado !== 'cancelada' && c.estado !== 'hecha').map((c) => c.prospecto_id))
    const frios = store.lista('prospectos', (p) => ['visitado', 'demo', 'propuesta'].includes(p.etapa) && !conCita.has(p.id) && diasPara(p.actualizado) <= -5)
    const porVisitar = store.lista('prospectos', { etapa: 'nuevo' }).length
    const r = resumenCobranza()
    const total = store.lista('prospectos').length
    const porDia = [...agrupar(citas, (c) => (c.inicio ? dia(c.inicio) : 'por-acordar'))]
    main.innerHTML = `
      <header class="a-cab">
        <div><p class="a-k">${esc(fecha(new Date(), 'larga'))}</p><h1 class="a-h1">${sesion.nombre ? `Hola, ${esc(sesion.nombre.split(' ')[0])}` : 'Hoy'}</h1></div>
        <div class="a-cab-acc"><a class="a-btn a-btn--pri" href="#/presala">Nueva visita</a><button type="button" class="a-btn" data-nueva-cita>Nueva cita</button></div>
      </header>
      <div class="a-rejilla">
        ${cifra(total - store.lista('prospectos', (p) => ['cliente', 'perdido'].includes(p.etapa)).length, 'Prospectos en proceso')}
        ${cifra(store.lista('prospectos', { etapa: 'cliente' }).length, 'Clientes')}
        ${cifra(dinero(r.cobradoMes), 'Cobrado este mes')}
        ${cifra(r.vencidas.length + r.porVencer.length, 'Por cobrar o por vencer')}
      </div>
      ${
        total === 0
          ? `<section class="a-seccion">${vacio('Aquí va a vivir todo lo que pase con tus prospectos', 'Empieza con una visita: eliges el giro, presentas y, al terminar, el expediente aparece aquí con lo que el cliente dijo.', '<a class="a-btn a-btn--pri" href="#/presala">Preparar la primera visita</a>')}</section>`
          : `
      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Próximos siete días</h2><a class="a-enlace" href="#/crm/agenda">Ver la agenda</a></div>
        ${
          citas.length
            ? porDia.map(([d, lista]) => `<p class="a-k crm-dia">${d === 'por-acordar' ? 'Por acordar por mensaje' : `${esc(fecha(d, 'larga'))} · ${esc(relativo(d))}`}</p><div class="a-lista">${lista.map(filaCita).join('')}</div>`).join('')
            : vacio('Nada agendado esta semana', 'Las citas que apartes al final de una visita aparecen aquí.')
        }
      </section>
      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Por cobrar</h2><a class="a-enlace" href="#/crm/cobranza">Ver cobranza</a></div>
        ${cobrar.length ? `<div class="a-lista">${cobrar.map(filaMembresia).join('')}</div>` : vacio('Nadie debe nada', 'Cuando una membresía esté por vencer o vencida, aparece aquí con el mensaje listo para avisarle.')}
      </section>
      ${
        frios.length
          ? `<section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Se están enfriando</h2><span class="a-k">Sin cita y sin movimiento en 5 días o más</span></div>
              <div class="a-lista">${frios.map((p) => `<a class="a-item" style="--cols:1fr auto auto" href="#/crm/prospecto/${p.id}"><span><span class="a-item-t">${esc(p.negocio)}</span><br><span class="a-item-s">${esc(giro(p))}${p.proxima_accion ? ` · ${esc(p.proxima_accion)}` : ''}</span></span>${chipEtapa(p.etapa)}<span class="a-item-s">${esc(relativo(p.actualizado))}</span></a>`).join('')}</div></section>`
          : ''
      }
      ${porVisitar ? `<p class="a-p" style="margin-top:28px">${porVisitar === 1 ? 'Hay 1 prospecto' : `Hay ${porVisitar} prospectos`} por visitar. <a class="a-enlace" href="#/crm/prospectos">Verlos</a></p>` : ''}`
      }`
  })
  const q = [...acciones(m.main), alTocar(m.main, '[data-nueva-cita]', () => editarCita())]
  return () => {
    q.forEach((f) => f())
    m.cerrar()
  }
}

// ───────────────────────── Prospectos ─────────────────────────

export function vistaProspectos() {
  let filtro = ''
  let busca = ''
  const m = marco('prospectos', (main) => {
    const todos = store.lista('prospectos').sort((a, b) => (b.actualizado || '').localeCompare(a.actualizado || ''))
    const q = busca.trim().toLowerCase()
    const lista = todos.filter((p) => (!filtro || (p.etapa || 'nuevo') === filtro) && (!q || `${p.negocio} ${p.contacto || ''} ${giro(p)}`.toLowerCase().includes(q)))
    const cuenta = (id) => todos.filter((p) => (p.etapa || 'nuevo') === id).length
    const previa = main.querySelector('[data-busca]')
    const teniaFoco = previa && document.activeElement === previa
    main.innerHTML = `
      <header class="a-cab">
        <div><p class="a-k">${todos.length} en total</p><h1 class="a-h1">Prospectos</h1></div>
        <div class="a-cab-acc"><button type="button" class="a-btn" data-nuevo>Agregar sin visita</button><a class="a-btn a-btn--pri" href="#/presala">Nueva visita</a></div>
      </header>
      <div class="a-fila crm-filtros">
        <input class="a-in crm-busca" data-busca type="search" placeholder="Buscar por negocio, contacto o giro" value="${esc(busca)}" />
        <div class="a-fila">
          <button type="button" class="a-chip a-chip--liso crm-f" data-f="" aria-pressed="${!filtro}">Todos</button>
          ${ETAPAS.filter((e) => cuenta(e.id)).map((e) => `<button type="button" class="a-chip a-chip--liso crm-f" data-f="${e.id}" aria-pressed="${filtro === e.id}">${e.nombre} · ${cuenta(e.id)}</button>`).join('')}
        </div>
      </div>
      ${
        lista.length
          ? `<div class="a-lista" style="margin-top:14px">${lista
              .map((p) => {
                const cita = store.lista('citas', (c) => c.prospecto_id === p.id && c.estado !== 'cancelada' && c.estado !== 'hecha' && c.inicio && dia(c.inicio) >= dia()).sort((a, b) => a.inicio.localeCompare(b.inicio))[0]
                return `<a class="a-item" style="--cols:1.5fr 1fr auto" href="#/crm/prospecto/${p.id}">
                  <span><span class="a-item-t">${esc(p.negocio)}</span><br><span class="a-item-s">${esc(giro(p))}${p.contacto ? ` · ${esc(p.contacto)}` : ''}</span></span>
                  <span class="a-item-s">${cita ? `Cita ${esc(relativo(cita.inicio))}, ${esc(fecha(cita.inicio, 'hora'))}` : p.proxima_accion ? esc(p.proxima_accion) : `Movido ${esc(relativo(p.actualizado))}`}</span>
                  ${chipEtapa(p.etapa)}
                </a>`
              })
              .join('')}</div>`
          : todos.length
            ? vacio('Nada coincide con ese filtro', 'Prueba con otra etapa o borra la búsqueda.')
            : vacio('Todavía no hay prospectos', 'El primero aparece aquí cuando termines una visita. También puedes agregar uno a mano si ya platicaste con él.', '<a class="a-btn a-btn--pri" href="#/presala">Preparar una visita</a>')
      }`
    if (teniaFoco) {
      const b = main.querySelector('[data-busca]')
      b.focus()
      b.setSelectionRange(busca.length, busca.length)
    }
  })
  const alEscribir = (e) => {
    if (!e.target.matches('[data-busca]')) return
    busca = e.target.value
    e.target.blur()
    m.repinta()
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const b = m.main.querySelector('[data-busca]')
      b?.focus()
      b?.setSelectionRange(busca.length, busca.length)
    }))
  }
  m.main.addEventListener('input', alEscribir)
  const q = [
    alTocar(m.main, '[data-f]', (b) => {
      filtro = b.dataset.f
      m.repinta()
    }),
    alTocar(m.main, '[data-nuevo]', async () => {
      const p = await editarProspecto()
      if (p) ir(`/crm/prospecto/${p.id}`)
    }),
  ]
  return () => {
    m.main.removeEventListener('input', alEscribir)
    q.forEach((f) => f())
    m.cerrar()
  }
}

// ───────────────────────── Agenda ─────────────────────────

export function vistaAgenda() {
  const m = marco('agenda', (main) => {
    const hoy = dia()
    const citas = store.lista('citas').sort((a, b) => (a.inicio || '').localeCompare(b.inicio || ''))
    const proximas = citas.filter((c) => c.inicio && dia(c.inicio) >= hoy && c.estado !== 'cancelada')
    const sinFecha = citas.filter((c) => !c.inicio && c.estado !== 'cancelada' && c.estado !== 'hecha')
    const pasadas = citas.filter((c) => c.inicio && dia(c.inicio) < hoy).reverse().slice(0, 20)
    const grupo = (lista) =>
      [...agrupar(lista, (c) => dia(c.inicio))]
        .map(
          ([d, L]) => `<p class="a-k crm-dia">${esc(fecha(d, 'larga'))} · ${esc(relativo(d))}</p><div class="a-lista">${L.map(
            (c) => `<div class="crm-cita">${filaCita(c)}<div class="a-fila crm-cita-acc">
              ${c.estado !== 'hecha' && dia(c.inicio) >= hoy ? `<a class="a-btn a-btn--ch a-btn--fantasma" target="_blank" rel="noopener" href="${esc(enlaceCalendario({ titulo: `${tipoCita(c.tipo)} · ${negocio(c.prospecto_id)}`, inicio: c.inicio, minutos: c.minutos || 45, lugar: c.lugar || '', detalle: c.notas || '' }))}">Agregar a Google Calendar</a>` : ''}
              ${c.prospecto_id && c.estado !== 'hecha' && dia(c.inicio) >= hoy ? `<button type="button" class="a-btn a-btn--ch a-btn--fantasma" data-confirmar="${c.id}">Confirmar por WhatsApp</button>` : ''}
              ${c.estado !== 'hecha' && c.estado !== 'cancelada' ? `<button type="button" class="a-btn a-btn--ch a-btn--fantasma" data-hecha="${c.id}">Marcar hecha</button>` : ''}
              ${c.tipo === 'visita2' && c.prospecto_id && c.estado !== 'hecha' ? `<a class="a-btn a-btn--ch" href="#/crm/prospecto/${c.prospecto_id}">Preparar la visita</a>` : ''}
            </div></div>`,
          ).join('')}</div>`,
        )
        .join('')
    main.innerHTML = `
      <header class="a-cab"><div><p class="a-k">${proximas.length} por venir</p><h1 class="a-h1">Agenda</h1></div><div class="a-cab-acc"><button type="button" class="a-btn a-btn--pri" data-nueva-cita>Nueva cita</button></div></header>
      ${proximas.length ? grupo(proximas) : vacio('No hay citas por venir', 'Las que apartes al final de una visita llegan aquí solas. También puedes crear una a mano.')}
      ${sinFecha.length ? `<section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Por acordar por mensaje</h2></div><div class="a-lista">${sinFecha.map(filaCita).join('')}</div></section>` : ''}
      ${pasadas.length ? `<section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Anteriores</h2></div>${grupo(pasadas)}</section>` : ''}`
  })
  const q = [
    alTocar(m.main, '[data-cita]', (b) => editarCita(store.uno('citas', b.dataset.cita))),
    alTocar(m.main, '[data-nueva-cita]', () => editarCita()),
    alTocar(m.main, '[data-hecha]', (b) => store.guardar('citas', { id: b.dataset.hecha, estado: 'hecha' })),
    alTocar(m.main, '[data-confirmar]', (b) => {
      const c = store.uno('citas', b.dataset.confirmar)
      avisar({ prospecto: store.uno('prospectos', c.prospecto_id), cita: c, tipo: 'cita' })
    }),
  ]
  return () => {
    q.forEach((f) => f())
    m.cerrar()
  }
}

// ───────────────────────── Cobranza ─────────────────────────

export function vistaCobranza() {
  let pestana = 'membresias'
  const m = marco('cobranza', (main) => {
    const r = resumenCobranza()
    const mem = store.lista('membresias').sort((a, b) => {
      const o = { vencida: 0, prueba_vencida: 0, por_cobrar: 1, por_vencer: 2, sin_fecha: 2, prueba: 3, al_corriente: 4, liquidada: 5, pausada: 6, cancelada: 7 }
      return (o[estadoMembresia(a).id] ?? 9) - (o[estadoMembresia(b).id] ?? 9) || (a.vence || '').localeCompare(b.vence || '')
    })
    const pagos = store.lista('pagos').sort((a, b) => (b.fecha || b.creado || '').localeCompare(a.fecha || a.creado || ''))
    const metodo = (id) => METODOS.find((x) => x.id === id)?.nombre || id || ''
    main.innerHTML = `
      <header class="a-cab"><div><p class="a-k">Membresía Soma y pagos únicos</p><h1 class="a-h1">Cobranza</h1></div></header>
      <div class="a-rejilla">
        ${cifra(dinero(r.cobradoMes), 'Cobrado este mes')}
        ${cifra(dinero(r.mensualRecurrente), 'Ingreso mensual por membresías')}
        ${cifra(r.porVencer.length, 'Por vencer')}
        ${cifra(r.vencidas.length, 'Vencidas o por cobrar')}
      </div>
      <div class="a-tabs" style="margin-top:28px" role="tablist">
        <button type="button" class="a-tab" role="tab" data-tab="membresias" aria-selected="${pestana === 'membresias'}">Membresías · ${mem.length}</button>
        <button type="button" class="a-tab" role="tab" data-tab="pagos" aria-selected="${pestana === 'pagos'}">Pagos · ${pagos.length}</button>
      </div>
      ${
        pestana === 'membresias'
          ? mem.length
            ? `<div class="a-lista">${mem.map((x) => filaMembresia(x).replace('<button type="button" class="a-btn a-btn--ch" data-avisar>', '<button type="button" class="a-btn a-btn--ch a-btn--fantasma" data-editar-membresia>Editar</button><button type="button" class="a-btn a-btn--ch" data-avisar>').replace('--cols:1.4fr 1fr auto auto', '--cols:1.4fr 1fr auto auto auto')).join('')}</div>`
            : vacio('Todavía no hay membresías', 'Se crean cuando un cliente decide en la segunda visita, o a mano desde su expediente. Aquí vas a ver quién está al corriente, a quién se le vence y a quién avisarle.')
          : pagos.length
            ? [...agrupar(pagos, (p) => (p.fecha || p.creado || '').slice(0, 7))]
                .map(
                  ([mes, L]) => `<p class="a-k crm-dia">${esc(fecha(`${mes}-01`, 'mes'))} · ${dinero(L.filter((p) => p.estado === 'confirmado').reduce((s, p) => s + (Number(p.monto) || 0), 0))} cobrados</p>
                  <div class="a-lista">${L.map(
                    (p) => `<div class="a-item" style="--cols:86px 1.4fr 1fr auto auto" data-pago="${p.id}">
                      <span class="a-item-s a-num">${esc(fecha(p.fecha || p.creado, 'corta'))}</span>
                      <span><a class="a-item-t a-enlace" href="#/crm/prospecto/${p.prospecto_id}">${esc(negocio(p.prospecto_id))}</a><br><span class="a-item-s">${esc(p.concepto || '')}${p.referencia ? ` · ${esc(p.referencia)}` : ''}</span></span>
                      <span class="a-item-s">${esc(metodo(p.metodo))}${p.registrado_por ? ` · ${esc(p.registrado_por)}` : ''}</span>
                      <span class="a-fuerte a-num">${dinero(p.monto || 0)}</span>
                      ${
                        p.estado === 'confirmado'
                          ? '<span class="a-chip a-chip--ok">Pagado</span>'
                          : p.estado === 'pendiente'
                            ? `<span class="a-fila"><span class="a-chip a-chip--alerta">Pendiente</span>${p.enlace ? '<button type="button" class="a-btn a-btn--ch a-btn--fantasma" data-copia-enlace>Copiar enlace</button>' : ''}<button type="button" class="a-btn a-btn--ch" data-confirma>Marcar pagado</button></span>`
                            : `<span class="a-chip a-chip--mal">${p.estado === 'fallido' ? 'Falló' : 'Reembolsado'}</span>`
                      }
                    </div>`,
                  ).join('')}</div>`,
                )
                .join('')
            : vacio('Todavía no hay pagos', 'Cada pago que registres, por transferencia, en efectivo o con tarjeta, queda aquí con su fecha y quién lo recibió.')
      }`
  })
  const q = [
    ...acciones(m.main),
    alTocar(m.main, '[data-tab]', (b) => {
      pestana = b.dataset.tab
      m.repinta()
    }),
    alTocar(m.main, '[data-copia-enlace]', async (b) => aviso((await copiar(store.uno('pagos', b.closest('[data-pago]').dataset.pago).enlace)) ? 'Enlace copiado.' : 'No se pudo copiar.')),
    alTocar(m.main, '[data-confirma]', async (b) => {
      const p = store.uno('pagos', b.closest('[data-pago]').dataset.pago)
      if (await confirmar({ titulo: '¿Marcar este pago como recibido?', texto: 'Úsalo si ya confirmaste el pago por fuera. Si pagó con el enlace, se marca solo en cuanto Stripe avisa.', si: 'Marcar pagado' })) confirmarPago(p)
    }),
  ]
  return () => {
    q.forEach((f) => f())
    m.cerrar()
  }
}

// ───────────────────────── Sistemas ─────────────────────────

export const senal = (s) => {
  if (!s.ultima_senal) return { t: 'Sin señal todavía', c: 'mudo' }
  const min = (Date.now() - new Date(s.ultima_senal)) / 60000
  if (min < 60 * 26) return { t: min < 60 ? 'Activo hace un momento' : `Última señal ${fecha(s.ultima_senal, 'hora')}`, c: 'ok' }
  return { t: `Última señal ${relativo(s.ultima_senal)}`, c: min > 60 * 24 * 7 ? 'mal' : 'alerta' }
}

export const filaSistema = (s) => {
  const mem = store.lista('membresias', (x) => x.sistema_id === s.id && x.estado !== 'cancelada')[0]
  const e = estadoMembresia(mem)
  const sn = senal(s)
  const estados = { demo: 'Demo', prueba: 'En prueba', activo: 'Activo', suspendido: 'Suspendido', baja: 'De baja' }
  return `<div class="crm-sistema" data-sistema="${s.id}">
    <div class="a-entre"><div><p class="a-item-t">${esc(s.nombre)}</p><p class="a-item-s">${s.prospecto_id ? `<a class="a-enlace" href="#/crm/prospecto/${s.prospecto_id}">${esc(negocio(s.prospecto_id))}</a>` : 'Sin cliente'}${s.url ? ` · <a class="a-enlace" target="_blank" rel="noopener" href="${esc(s.url)}">${esc(s.url.replace(/^https?:\/\//, ''))}</a>` : ''}${s.version ? ` · v${esc(s.version)}` : ''}</p></div>
      <div class="a-fila"><span class="a-chip a-chip--${s.estado === 'suspendido' ? 'mal' : s.estado === 'activo' ? 'ok' : 'liso'}">${estados[s.estado] || 'Demo'}</span><span class="a-chip a-chip--${sn.c}">${esc(sn.t)}</span><span class="a-chip a-chip--${e.chip}">${esc(e.texto)}</span></div></div>
    <div class="a-fila" style="margin-top:12px">
      <button type="button" class="a-btn a-btn--ch" data-conectar>Conectar</button>
      <button type="button" class="a-btn a-btn--ch" data-accesos>Accesos</button>
      <button type="button" class="a-btn a-btn--ch" data-editar-sistema>Editar</button>
      <button type="button" class="a-btn a-btn--ch ${s.estado === 'suspendido' ? 'a-btn--pri' : 'a-btn--peligro'}" data-suspender>${s.estado === 'suspendido' ? 'Reactivar' : 'Suspender'}</button>
    </div>
  </div>`
}

export function accionesSistema(main) {
  const de = (b) => store.uno('sistemas', b.closest('[data-sistema]').dataset.sistema)
  return [
    alTocar(main, '[data-conectar]', (b) => dlgConectar(de(b))),
    alTocar(main, '[data-accesos]', (b) => dlgCredenciales(de(b))),
    alTocar(main, '[data-editar-sistema]', (b) => editarSistema(de(b))),
    alTocar(main, '[data-suspender]', async (b) => {
      const s = de(b)
      const suspender = s.estado !== 'suspendido'
      if (suspender && !(await confirmar({ titulo: `¿Suspender «${s.nombre}»?`, texto: 'El sistema se pausa la próxima vez que alguien lo abra y muestra un mensaje. Se reactiva desde aquí cuando quieras.', si: 'Suspender', peligro: true }))) return
      store.guardar('sistemas', { id: s.id, estado: suspender ? 'suspendido' : 'activo' })
      store.anotar(s.prospecto_id, 'sistema', suspender ? `Se suspendió «${s.nombre}».` : `Se reactivó «${s.nombre}».`, null, sesion.nombre)
    }),
  ]
}

export function vistaSistemas() {
  const m = marco('sistemas', (main) => {
    const L = store.lista('sistemas').sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
    main.innerHTML = `
      <header class="a-cab"><div><p class="a-k">Lo que hemos entregado</p><h1 class="a-h1">Sistemas</h1><p class="a-p" style="margin-top:10px">Cada sistema enlazado avisa aquí que está vivo y obedece a su membresía: si vence, muestra un aviso o se pausa.</p></div><div class="a-cab-acc"><button type="button" class="a-btn a-btn--pri" data-nuevo-sistema>Nuevo sistema</button></div></header>
      ${L.length ? L.map(filaSistema).join('') : vacio('Todavía no hay sistemas', 'Cuando entregues uno, regístralo aquí. Te da una línea para pegar en el sistema y, desde entonces, lo administras a distancia: su estado, sus accesos y su membresía.')}`
  })
  const q = [...accionesSistema(m.main), alTocar(m.main, '[data-nuevo-sistema]', () => editarSistema())]
  return () => {
    q.forEach((f) => f())
    m.cerrar()
  }
}

export { etapa, chipEtapa, giro, filaCita, filaMembresia, acciones, vacio, tipoCita }
