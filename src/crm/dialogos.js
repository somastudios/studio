import qrcode from 'qrcode-generator'
import { store } from '../data/store.js'
import { sesion, funcion, sb } from '../app/sesion.js'
import { dialogo, confirmar, aviso, leerCampos } from '../app/capas.js'
import { esc, dia, fecha, dinero, uid, copiar, enlaceWhatsApp, enlaceCorreo, ahora } from '../app/util.js'
import { ETAPAS, MODALIDADES } from '../data/esquema.js'
import { NICHOS } from '../content/nichos/index.js'
import { SUPABASE_URL, FUNCIONES } from '../config.js'
import { registrarPago, mensaje, tipoAviso, nombreModalidad, estadoMembresia, precioPlazo, montoModalidad, siguienteVencimiento } from './cobranza.js'

// Los diálogos del CRM. Cada uno abre, guarda y resuelve; la vista de abajo se repinta sola
// porque escucha los cambios del almacén.

const campo = (etq, nombre, valor = '', extra = '') => `<label class="a-campo"><span>${etq}</span><input class="a-in" name="${nombre}" value="${esc(valor ?? '')}" ${extra} /></label>`
const area = (etq, nombre, valor = '', filas = 3, ph = '') => `<label class="a-campo a-ancho"><span>${etq}</span><textarea class="a-in" name="${nombre}" rows="${filas}" placeholder="${esc(ph)}">${esc(valor ?? '')}</textarea></label>`
const lista = (etq, nombre, opciones, valor) => `<label class="a-campo"><span>${etq}</span><select class="a-in" name="${nombre}">${opciones.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(valor ?? '') ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`
const GUARDAR = [
  { id: 'no', texto: 'Cancelar' },
  { id: 'ok', texto: 'Guardar', pri: true },
]

export function qrSvg(texto) {
  const q = qrcode(0, 'M')
  q.addData(texto)
  q.make()
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
}

// ───────────────────────── Prospecto ─────────────────────────

export async function editarProspecto(p = null) {
  const r = await dialogo({
    titulo: p ? 'Editar prospecto' : 'Nuevo prospecto',
    html: `<div class="a-campos a-campos--2">
      <div class="a-ancho">${campo('Negocio', 'negocio', p?.negocio, 'required autofocus')}</div>
      ${lista('Giro', 'nicho', [['', 'Sin definir'], ...NICHOS.map((n) => [n.id, n.nombre])], p?.nicho)}
      ${lista('Etapa', 'etapa', ETAPAS.map((e) => [e.id, e.nombre]), p?.etapa || 'nuevo')}
      ${campo('Contacto', 'contacto', p?.contacto)}
      ${campo('Puesto', 'puesto', p?.puesto)}
      ${campo('WhatsApp', 'telefono', p?.telefono, 'inputmode="tel"')}
      ${campo('Correo', 'correo', p?.correo, 'type="email"')}
      <div class="a-ancho">${campo('Dirección', 'direccion', p?.direccion)}</div>
      ${campo('Siguiente paso', 'proxima_accion', p?.proxima_accion, 'placeholder="Qué sigue con este prospecto"')}
      ${campo('Para cuándo', 'proxima_fecha', p?.proxima_fecha, 'type="date"')}
      ${area('Notas', 'notas', p?.notas, 3)}
    </div>`,
    acciones: GUARDAR,
    antesDeCerrar(id, dlg) {
      if (id !== 'ok') return
      const c = leerCampos(dlg)
      if (!c.negocio) return aviso('Falta el nombre del negocio.'), false
      c.telefono = c.telefono.replace(/\D/g, '')
      return store.guardar('prospectos', { ...(p ? { id: p.id } : {}), ...c })
    },
  })
  return r && r !== 'no' ? r : null
}

// ───────────────────────── Cita ─────────────────────────

export const TIPOS_CITA = [
  ['visita2', 'Segunda visita'],
  ['visita1', 'Primera visita'],
  ['seguimiento', 'Seguimiento'],
  ['llamada', 'Llamada'],
  ['cobro', 'Cobro'],
  ['otro', 'Otro'],
]

export async function editarCita(c = null, prospecto_id = null) {
  const prospectos = store.lista('prospectos').sort((a, b) => (a.negocio || '').localeCompare(b.negocio || '', 'es'))
  const ini = c?.inicio ? new Date(c.inicio) : null
  const r = await dialogo({
    titulo: c ? 'Editar cita' : 'Nueva cita',
    html: `<div class="a-campos a-campos--2">
      <div class="a-ancho">${lista('Con quién', 'prospecto_id', [['', 'Sin prospecto'], ...prospectos.map((p) => [p.id, p.negocio])], c?.prospecto_id || prospecto_id)}</div>
      ${lista('Tipo', 'tipo', TIPOS_CITA, c?.tipo || 'seguimiento')}
      ${lista('Estado', 'estado', [['pendiente', 'Pendiente'], ['confirmada', 'Confirmada'], ['hecha', 'Hecha'], ['cancelada', 'Cancelada']], c?.estado || 'pendiente')}
      ${campo('Día', 'dia', ini ? dia(ini) : '', 'type="date"')}
      ${campo('Hora', 'hora', ini ? `${String(ini.getHours()).padStart(2, '0')}:${String(ini.getMinutes()).padStart(2, '0')}` : '', 'type="time"')}
      ${campo('Duración (min)', 'minutos', c?.minutos ?? 45, 'type="number" min="5" step="5"')}
      ${campo('Lugar', 'lugar', c?.lugar)}
      ${area('Notas', 'notas', c?.notas, 2)}
    </div>
    <p class="a-ayuda" style="margin-top:12px">Sin día ni hora, la cita queda como «por acordar por mensaje».</p>`,
    acciones: [...(c ? [{ id: 'borrar', texto: 'Eliminar', peligro: true }] : []), ...GUARDAR],
    async antesDeCerrar(id, dlg) {
      if (id === 'borrar') {
        if (!(await confirmar({ titulo: '¿Eliminar esta cita?', si: 'Eliminar', peligro: true }))) return false
        store.borrar('citas', c.id)
        return 'borrada'
      }
      if (id !== 'ok') return
      const f = leerCampos(dlg)
      const inicio = f.dia && f.hora ? new Date(`${f.dia}T${f.hora}:00`).toISOString() : null
      return store.guardar('citas', { ...(c ? { id: c.id } : {}), prospecto_id: f.prospecto_id || null, tipo: f.tipo, estado: f.estado, inicio, por_mensaje: !inicio, minutos: f.minutos || 45, lugar: f.lugar || null, notas: f.notas || null })
    },
  })
  return r && r !== 'no' ? r : null
}

// ───────────────────────── Aviso al cliente ─────────────────────────

/** Mensaje listo para WhatsApp o correo. Queda registrado en avisos y en la bitácora. */
export async function avisar({ prospecto, membresia = null, cita = null, tipo = null }) {
  const t = tipo || (membresia ? tipoAviso(membresia) : cita ? 'cita' : 'seguimiento')
  const texto = mensaje(t, { prospecto, membresia, cita })
  await dialogo({
    titulo: `Avisar a ${prospecto.negocio}`,
    html: `
      <p class="dlg-texto">El mensaje saldrá desde tu WhatsApp o tu correo, puedes ajustarlo antes.</p>
      <label class="a-campo" style="margin-top:14px"><span>Mensaje</span><textarea class="a-in" name="mensaje" rows="6">${esc(texto)}</textarea></label>
      ${prospecto.telefono ? '' : '<p class="a-error" style="margin-top:10px">Este prospecto no tiene WhatsApp registrado, puedes copiar el mensaje.</p>'}
      <div class="a-fila" style="margin-top:16px">
        <button type="button" class="a-btn a-btn--pri" data-canal="whatsapp" ${prospecto.telefono ? '' : 'disabled'}>Abrir WhatsApp</button>
        <button type="button" class="a-btn" data-canal="correo" ${prospecto.correo ? '' : 'disabled'}>Abrir correo</button>
        <button type="button" class="a-btn" data-canal="copiado">Copiar</button>
      </div>`,
    alAbrir(dlg, cerrar) {
      dlg.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-canal]')
        if (!b) return
        const canal = b.dataset.canal
        const msj = dlg.querySelector('[name="mensaje"]').value
        if (canal === 'whatsapp') window.open(enlaceWhatsApp(prospecto.telefono, msj), '_blank', 'noopener')
        else if (canal === 'correo') location.href = enlaceCorreo(prospecto.correo, `Soma · ${prospecto.negocio}`, msj)
        else aviso((await copiar(msj)) ? 'Mensaje copiado.' : 'No se pudo copiar. Selecciónalo y cópialo a mano.')
        store.guardar('avisos', { prospecto_id: prospecto.id, membresia_id: membresia?.id || null, tipo: t, canal, mensaje: msj, enviado: ahora(), quien: sesion.nombre })
        store.anotar(prospecto.id, 'aviso', `Aviso por ${canal === 'copiado' ? 'mensaje copiado' : canal}: ${t.replace('_', ' ')}.`, null, sesion.nombre)
        cerrar('enviado')
      })
    },
  })
}

// ───────────────────────── Pagos ─────────────────────────

/** Registrar un pago: transferencia, efectivo o tarjeta con enlace de Stripe. */
export async function dlgPago({ prospecto, membresia = null }) {
  const sugerido = membresia?.monto || ''
  const hasta = membresia ? siguienteVencimiento(membresia) : null
  await dialogo({
    titulo: 'Registrar pago',
    ancho: 560,
    html: `
      <p class="dlg-texto">${esc(prospecto.negocio)}${membresia ? ` · ${esc(nombreModalidad(membresia.modalidad))}` : ''}${hasta ? `. Con este pago queda cubierto hasta el ${esc(fecha(hasta, 'completa'))}.` : ''}</p>
      <div class="a-campos a-campos--2" style="margin-top:14px">
        ${campo('Monto', 'monto', sugerido, 'type="number" min="0" step="0.01" required')}
        ${campo('Fecha', 'fecha', dia(), 'type="date"')}
        <div class="a-ancho a-campo"><span>Cómo pagó</span>
          <div class="a-seg" data-metodo>
            <button type="button" data-m="transferencia" aria-pressed="true">Transferencia</button>
            <button type="button" data-m="efectivo" aria-pressed="false">Efectivo</button>
            <button type="button" data-m="stripe" aria-pressed="false">Tarjeta, con enlace</button>
          </div>
        </div>
        <div class="a-ancho" data-zona-ref>${campo('Referencia', 'referencia', '', 'placeholder="Folio o clave de rastreo (opcional)"')}</div>
        ${area('Nota', 'notas', '', 2)}
      </div>
      <p class="a-ayuda" data-ayuda style="margin-top:10px"></p>
      <div data-enlace hidden></div>`,
    acciones: [
      { id: 'no', texto: 'Cancelar' },
      { id: 'ok', texto: 'Registrar pago', pri: true },
    ],
    alAbrir(dlg) {
      const ayuda = dlg.querySelector('[data-ayuda]')
      const pri = dlg.querySelector('[data-accion="ok"]')
      const pon = (m) => {
        dlg.dataset.metodo = m
        dlg.querySelectorAll('[data-m]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === m)))
        dlg.querySelector('[data-zona-ref]').hidden = m === 'stripe'
        pri.textContent = m === 'stripe' ? 'Crear enlace de pago' : 'Registrar pago'
        ayuda.textContent = m === 'stripe' ? 'Se creará un enlace para que pague con tarjeta, el pago se marcará solo cuando Stripe lo confirme.' : m === 'efectivo' ? 'Queda registrado a tu nombre, con la fecha de hoy.' : ''
      }
      pon('transferencia')
      dlg.addEventListener('click', (e) => {
        const b = e.target.closest('[data-m]')
        if (b) pon(b.dataset.m)
      })
    },
    async antesDeCerrar(id, dlg) {
      if (id !== 'ok') return
      if (dlg.dataset.listo) return 'ok'
      const f = leerCampos(dlg)
      const metodo = dlg.dataset.metodo
      if (!(f.monto > 0)) return aviso('Falta el monto.'), false
      if (metodo !== 'stripe') {
        registrarPago({ membresia, prospecto_id: prospecto.id, monto: f.monto, metodo, fecha: f.fecha || dia(), referencia: f.referencia || null, notas: f.notas || null })
        aviso('Pago registrado.', { tipo: 'ok' })
        return 'ok'
      }
      // Tarjeta: el pago nace pendiente y Stripe lo confirma.
      if (!sesion.usuario) return aviso('Para crear enlaces de pago necesitas iniciar sesión.'), false
      const b = dlg.querySelector('[data-accion="ok"]')
      b.disabled = true
      b.textContent = 'Creando enlace…'
      const pago = registrarPago({ membresia, prospecto_id: prospecto.id, monto: f.monto, metodo: 'stripe', fecha: f.fecha || dia(), notas: f.notas || null, estado: 'pendiente' })
      await store.sincronizar()
      const r = await funcion('cobro', { pago_id: pago.id })
      b.disabled = false
      if (r.error) {
        store.borrar('pagos', pago.id)
        b.textContent = 'Crear enlace de pago'
        dlg.querySelector('[data-ayuda]').innerHTML = `<span class="a-error">${esc(r.error)}</span>`
        return false
      }
      await store.sincronizar()
      const z = dlg.querySelector('[data-enlace]')
      z.hidden = false
      z.innerHTML = `<div class="a-sep"></div><div class="crm-enlace"><div class="crm-qr">${qrSvg(r.url)}</div><div class="a-pila"><p class="a-fuerte">Enlace listo por ${dinero(f.monto)}</p><p class="a-ayuda">Puede escanear el código o abrir el enlace en su teléfono.</p><div class="a-fila"><a class="a-btn a-btn--pri a-btn--ch" target="_blank" rel="noopener" href="${esc(enlaceWhatsApp(prospecto.telefono || '', `Le comparto el enlace para pagar con tarjeta: ${r.url}`))}">Enviar por WhatsApp</a><button type="button" class="a-btn a-btn--ch" data-copiar="${esc(r.url)}">Copiar enlace</button></div></div></div>`
      z.querySelector('[data-copiar]').addEventListener('click', async (e) => aviso((await copiar(e.currentTarget.dataset.copiar)) ? 'Enlace copiado.' : 'No se pudo copiar.'))
      dlg.dataset.listo = '1'
      b.textContent = 'Listo'
      return false
    },
  })
}

// ───────────────────────── Membresía ─────────────────────────

export async function editarMembresia(m, prospecto) {
  const sistemas = store.lista('sistemas', { prospecto_id: prospecto.id })
  const r = await dialogo({
    titulo: m ? 'Editar membresía' : 'Nueva membresía',
    html: `<p class="dlg-texto">${esc(prospecto.negocio)}</p>
      <div class="a-campos a-campos--2" style="margin-top:14px">
      ${lista('Modalidad', 'modalidad', MODALIDADES.map((x) => [x.id, x.nombre]), m?.modalidad || 'mensual')}
      ${campo('Monto por periodo', 'monto', m?.monto ?? '', 'type="number" min="0" step="0.01"')}
      ${campo('Inicio', 'inicio', m?.inicio || dia(), 'type="date"')}
      ${campo('Vence', 'vence', m?.vence || '', 'type="date"')}
      ${lista('Estado', 'estado', [['activa', 'Activa'], ['prueba', 'En prueba'], ['pausada', 'En pausa'], ['liquidada', 'Pagada (pago único)'], ['cancelada', 'Cancelada']], m?.estado || 'activa')}
      ${lista('Sistema', 'sistema_id', [['', 'Sin sistema enlazado'], ...sistemas.map((s) => [s.id, s.nombre])], m?.sistema_id)}
      ${area('Notas', 'notas', m?.notas, 2)}
    </div>
    <p class="a-ayuda" style="margin-top:12px">Si enlazas el sistema, mostrará un aviso o se pausará cuando la membresía venza.</p>`,
    acciones: GUARDAR,
    antesDeCerrar(id, dlg) {
      if (id !== 'ok') return
      const f = leerCampos(dlg)
      const fila = store.guardar('membresias', { ...(m ? { id: m.id } : { prospecto_id: prospecto.id, moneda: 'MXN', auto: false }), modalidad: f.modalidad, monto: f.monto || 0, inicio: f.inicio || null, vence: f.modalidad === 'contado' ? null : f.vence || null, estado: f.estado, sistema_id: f.sistema_id || null, notas: f.notas || null })
      if (!m) {
        store.guardar('prospectos', { id: prospecto.id, etapa: 'cliente' })
        store.anotar(prospecto.id, 'membresia', `Membresía creada: ${nombreModalidad(f.modalidad)}.`, null, sesion.nombre)
      }
      return fila
    },
  })
  return r && r !== 'no' ? r : null
}

// ───────────────────────── Propuesta ─────────────────────────

export async function editarPropuesta(p, prospecto) {
  const r = await dialogo({
    titulo: 'Propuesta para la segunda visita',
    ancho: 640,
    html: `<div class="a-campos a-campos--2">
      <div class="a-ancho">${campo('Título', 'titulo', p?.titulo || `Sistema para ${prospecto.negocio}`)}</div>
      ${area('Qué construimos', 'resumen', p?.resumen, 2, 'Una o dos frases que el cliente va a leer.')}
      <div class="a-ancho">${campo('Enlace de la demo', 'demo_url', p?.demo_url, 'type="url" placeholder="https://…  (si se deja vacío, se muestran las demos del catálogo)"')}</div>
      ${area('Qué incluye', 'incluye', (p?.incluye || []).join('\n'), 4, 'Una línea por punto.')}
      ${campo('Pago único', 'precio_contado', p?.precio_contado ?? '', 'type="number" min="0" step="1"')}
      ${campo('Membresía mensual', 'precio_mensual', p?.precio_mensual ?? '', 'type="number" min="0" step="1"')}
      ${campo('Descuento a 6 meses (%)', 'desc_6', p?.desc_6 ?? '', 'type="number" min="0" max="90" step="1"')}
      ${campo('Descuento a 12 meses (%)', 'desc_12', p?.desc_12 ?? '', 'type="number" min="0" max="90" step="1"')}
      ${campo('Días de prueba', 'prueba_dias', p?.prueba_dias ?? '', 'type="number" min="0" step="1" placeholder="0 = no ofrecer prueba"')}
      ${campo('Soporte y mantenimiento', 'mantenimiento', p?.mantenimiento, 'placeholder="Qué pasa después del pago único"')}
      ${area('Notas internas', 'notas', p?.notas, 2, 'No se muestran al cliente.')}
    </div>
    <p class="a-ayuda" data-calculo style="margin-top:12px"></p>`,
    acciones: GUARDAR,
    alAbrir(dlg) {
      const calc = () => {
        const f = leerCampos(dlg)
        if (!f.precio_mensual) return (dlg.querySelector('[data-calculo]').textContent = 'Aquí se calcula lo que verá el cliente con los precios que pongas.')
        const a = precioPlazo(f, 6)
        const b = precioPlazo(f, 12)
        dlg.querySelector('[data-calculo]').textContent = `El cliente verá: ${dinero(f.precio_mensual)} al mes · 6 meses por ${dinero(a.total)}${a.ahorro ? ` (ahorra ${dinero(a.ahorro)})` : ''} · 12 meses por ${dinero(b.total)}${b.ahorro ? ` (ahorra ${dinero(b.ahorro)})` : ''}${f.precio_contado && f.precio_mensual ? ` · el pago único equivale a ${Math.round(f.precio_contado / f.precio_mensual)} mensualidades` : ''}.`
      }
      dlg.addEventListener('input', calc)
      calc()
    },
    antesDeCerrar(id, dlg) {
      if (id !== 'ok') return
      const f = leerCampos(dlg)
      return store.guardar('propuestas', { ...(p ? { id: p.id } : { prospecto_id: prospecto.id, estado: 'borrador' }), ...f, demo_url: f.demo_url || null, incluye: f.incluye.split('\n').map((x) => x.trim()).filter(Boolean), estado: p?.estado && p.estado !== 'borrador' ? p.estado : f.precio_contado || f.precio_mensual ? 'lista' : 'borrador' })
    },
  })
  if (r && r !== 'no' && ['visitado', 'nuevo'].includes(prospecto.etapa)) store.guardar('prospectos', { id: prospecto.id, etapa: 'demo' })
  return r && r !== 'no' ? r : null
}

// ───────────────────────── Sistemas ─────────────────────────

export const nuevaLlave = () => `soma_${uid().replace(/-/g, '')}`

export async function editarSistema(s, prospecto_id = null) {
  const prospectos = store.lista('prospectos').sort((a, b) => (a.negocio || '').localeCompare(b.negocio || '', 'es'))
  const r = await dialogo({
    titulo: s ? 'Editar sistema' : 'Nuevo sistema',
    html: `<div class="a-campos a-campos--2">
      <div class="a-ancho">${campo('Nombre', 'nombre', s?.nombre, 'required autofocus placeholder="Por ejemplo: Pedidos La Casona"')}</div>
      <div class="a-ancho">${lista('Cliente', 'prospecto_id', [['', 'Sin cliente'], ...prospectos.map((p) => [p.id, p.negocio])], s?.prospecto_id || prospecto_id)}</div>
      <div class="a-ancho">${campo('Dirección web', 'url', s?.url, 'type="url" placeholder="https://…"')}</div>
      ${campo('Repositorio', 'repo', s?.repo, 'placeholder="usuario/repo"')}
      ${lista('Estado', 'estado', [['demo', 'Demo'], ['prueba', 'En prueba'], ['activo', 'Activo'], ['suspendido', 'Suspendido'], ['baja', 'Dado de baja']], s?.estado || 'demo')}
      ${lista('Si la membresía vence', 'modo_vencido', [['aviso', 'Mostrar un aviso'], ['bloqueo', 'Pausar el sistema'], ['nada', 'No hacer nada']], s?.modo_vencido || 'aviso')}
      ${campo('Mensaje para el cliente', 'mensaje', s?.mensaje, 'placeholder="Opcional: sustituye al aviso de fábrica"')}
      ${area('Notas', 'notas', s?.notas, 2)}
    </div>`,
    acciones: GUARDAR,
    antesDeCerrar(id, dlg) {
      if (id !== 'ok') return
      const f = leerCampos(dlg)
      if (!f.nombre) return aviso('Falta el nombre del sistema.'), false
      return store.guardar('sistemas', { ...(s ? { id: s.id } : { llave: nuevaLlave(), config: {} }), ...f, prospecto_id: f.prospecto_id || null, url: f.url || null })
    },
  })
  return r && r !== 'no' ? r : null
}

/** Cómo enlazar un sistema entregado con el CRM. */
export async function dlgConectar(s) {
  const origen = store.ajuste('url_publica') || location.origin
  const etiqueta = `<script src="${origen.replace(/\/$/, '')}/soma-connect.js" data-llave="${s.llave}" data-servidor="${FUNCIONES}/connect" data-version="1.0.0"><\/script>`
  await dialogo({
    titulo: `Conectar «${s.nombre}»`,
    ancho: 640,
    html: `
      <p class="dlg-texto">Pega esta línea antes de <code>&lt;/body&gt;</code> en el sistema entregado. Desde ese momento el sistema avisa aquí que está vivo y pregunta por su membresía cada vez que alguien lo abre.</p>
      <pre class="crm-codigo selectable" data-codigo>${esc(etiqueta)}</pre>
      <div class="a-fila"><button type="button" class="a-btn a-btn--pri a-btn--ch" data-copia>Copiar</button></div>
      <div class="a-sep"></div>
      <p class="a-k">Qué hace</p>
      <ul class="crm-puntos">
        <li>Si la membresía está por vencer o vencida, muestra un aviso discreto, o pausa el sistema, según lo que elijas en «Si la membresía vence».</li>
        <li>Si lo suspendes desde aquí, se pausa en la siguiente apertura.</li>
        <li>Para reportar algo al expediente: <code>SomaConnect.evento('pedido', 'Pedido #132 por $410')</code>.</li>
      </ul>
      <p class="a-ayuda" style="margin-top:10px">La llave solo sirve para avisar y consultar el estado de este sistema. No da acceso a ningún dato del CRM.</p>`,
    alAbrir(dlg) {
      dlg.querySelector('[data-copia]').addEventListener('click', async () => aviso((await copiar(etiqueta)) ? 'Copiado.' : 'No se pudo copiar.'))
    },
  })
}

/** Accesos de un sistema. Las contraseñas viven cifradas en la bóveda del servidor, nunca en el dispositivo. */
export async function dlgCredenciales(s) {
  const pinta = (dlg) => {
    const L = store.lista('credenciales', { sistema_id: s.id })
    dlg.querySelector('[data-lista]').innerHTML =
      L.map(
        (c) => `<div class="crm-cred" data-id="${c.id}">
          <div><p class="a-fuerte">${esc(c.etiqueta || 'Acceso')}</p><p class="a-item-s selectable">${esc(c.usuario || '')}${c.url ? ` · ${esc(c.url)}` : ''}</p><p class="a-num selectable crm-secreto" data-secreto hidden></p></div>
          <div class="a-fila"><button type="button" class="a-btn a-btn--ch" data-ver>Ver contraseña</button><button type="button" class="a-btn a-btn--ch a-btn--fantasma" data-quitar>Quitar</button></div>
        </div>`,
      ).join('') || `<p class="a-p">Todavía no hay accesos guardados.</p>`
  }
  await dialogo({
    titulo: `Accesos de «${s.nombre}»`,
    ancho: 620,
    html: `
      <p class="dlg-texto">Las contraseñas se guardan cifradas en el servidor. No se quedan en este dispositivo y cada consulta queda anotada en la bitácora.</p>
      <div data-lista style="margin-top:14px"></div>
      <div class="a-sep"></div>
      <p class="a-k">Agregar acceso</p>
      <div class="a-campos a-campos--2" style="margin-top:10px">
        ${campo('Para qué es', 'etiqueta', '', 'placeholder="Panel de administración, hosting, correo…"')}
        ${campo('Usuario o correo', 'usuario', '', 'autocomplete="off"')}
        ${campo('Contraseña', 'secreto', '', 'type="password" autocomplete="new-password"')}
        ${campo('Dónde se usa', 'url', '', 'placeholder="https://…"')}
      </div>
      <div class="a-fila" style="margin-top:12px"><button type="button" class="a-btn a-btn--pri a-btn--ch" data-agregar>Guardar acceso</button><span class="a-ayuda" data-estado></span></div>`,
    alAbrir(dlg) {
      pinta(dlg)
      const estado = dlg.querySelector('[data-estado]')
      if (!sesion.usuario) estado.textContent = 'Para guardar o ver contraseñas necesitas iniciar sesión.'
      dlg.addEventListener('click', async (e) => {
        const fila = e.target.closest('.crm-cred')
        if (e.target.closest('[data-agregar]')) {
          const f = leerCampos(dlg)
          if (!f.etiqueta || !f.secreto) return aviso('Faltan el nombre del acceso y la contraseña.')
          if (!sesion.usuario) return aviso('Inicia sesión para guardar contraseñas.')
          estado.textContent = 'Guardando…'
          const c = store.guardar('credenciales', { sistema_id: s.id, prospecto_id: s.prospecto_id, etiqueta: f.etiqueta, usuario: f.usuario || null, url: f.url || null })
          await store.sincronizar()
          const { error } = await sb.rpc('credencial_guardar', { p_id: c.id, p_secreto: f.secreto })
          if (error) {
            store.borrar('credenciales', c.id)
            estado.textContent = 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.'
            return
          }
          dlg.querySelectorAll('[name]').forEach((x) => (x.value = ''))
          estado.textContent = 'Acceso guardado.'
          pinta(dlg)
        } else if (fila && e.target.closest('[data-ver]')) {
          const z = fila.querySelector('[data-secreto]')
          if (!z.hidden) return (z.hidden = true), (e.target.textContent = 'Ver contraseña')
          if (!sesion.usuario) return aviso('Inicia sesión para ver contraseñas.')
          const { data, error } = await sb.rpc('credencial_ver', { p_id: fila.dataset.id })
          z.textContent = error ? 'No se pudo consultar.' : data || 'Sin contraseña guardada.'
          z.hidden = false
          e.target.textContent = 'Ocultar'
          setTimeout(() => {
            z.hidden = true
            z.textContent = ''
            if (e.target.isConnected) e.target.textContent = 'Ver contraseña'
          }, 30000)
        } else if (fila && e.target.closest('[data-quitar]')) {
          if (await confirmar({ titulo: '¿Quitar este acceso?', texto: 'Si lo quitas, dejará de aparecer en todos los dispositivos.', si: 'Quitar', peligro: true })) {
            store.borrar('credenciales', fila.dataset.id)
            pinta(dlg)
          }
        }
      })
    },
  })
}

export { estadoMembresia, montoModalidad, SUPABASE_URL }
