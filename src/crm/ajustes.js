import { store } from '../data/store.js'
import { sesion, sb, funcion } from '../app/sesion.js'
import { alTocar } from '../app/vista.js'
import { aviso, leerCampos, dialogo } from '../app/capas.js'
import { esc, fecha } from '../app/util.js'
import { AJUSTES_BASE } from '../data/esquema.js'
import { marco } from './marco.js'
import { cab } from './vistas.js'
import { vineta } from './vinetas.js'
import { firma, montarFirma } from './firma.js'

// Ajustes: lo que cambia cómo se presenta Soma y cómo se cobra. Cada bloque se guarda por separado.

const campo = (etq, nombre, valor = '', extra = '') => `<label class="a-campo"><span>${etq}</span><input class="a-in" name="${nombre}" value="${esc(valor ?? '')}" ${extra} /></label>`
const NOMBRES = { por_vencer: 'Membresía por vencer', vencida: 'Membresía vencida', pago_recibido: 'Pago recibido', cita: 'Confirmar una cita', seguimiento: 'Seguimiento' }

export function vistaAjustes() {
  const m = marco('ajustes', (main) => {
    const k = store.ajuste('contacto')
    const personas = store.ajuste('presentadores')
    const banco = store.ajuste('banco')
    const plantillas = store.ajuste('plantillas')
    const st = store.ajuste('stripe') || {}
    main.innerHTML = `
      ${cab({ k: 'Cómo se presenta Soma y cómo cobra', t: 'Ajustes', emblema: vineta('ajustes') })}

      <section class="a-seccion crm-bloque" id="tarjeta"><div class="a-seccion-cab"><h2 class="a-h2">Pagos con tarjeta</h2><span class="a-chip a-chip--${st.conectado ? (st.modo === 'real' ? 'ok' : 'azul') : 'alerta'}">${st.conectado ? (st.modo === 'real' ? 'Conectado · cobros reales' : 'Conectado · modo de prueba') : 'Sin conectar'}</span></div>
        <p class="a-p">Con Stripe conectado, «Registrar pago» puede crear un enlace para que el cliente pague con tarjeta desde su teléfono. Cuando paga, el pago se marca solo y su membresía se extiende. Sin Stripe, todo lo demás funciona igual: transferencia y efectivo.</p>
        ${st.conectado ? `<p>Cuenta <b>${esc(st.cuenta || 'de Stripe')}</b>, llave terminada en <span class="a-num">${esc(st.termina || '')}</span>. ${st.webhook ? 'Los avisos de pago están activos.' : 'Los avisos de pago no están activos: los pagos con tarjeta habrá que marcarlos a mano.'}${st.quien ? ` La conectó ${esc(st.quien)}${st.fecha ? ` el ${esc(fecha(st.fecha, 'completa'))}` : ''}.` : ''}</p>` : ''}
        ${
          sesion.usuario
            ? `<form class="a-campos" data-stripe>
                <label class="a-campo"><span>Llave secreta de Stripe</span><input class="a-in" name="llave" type="password" autocomplete="off" spellcheck="false" placeholder="sk_test_…  o  sk_live_…" /></label>
                <details class="crm-detalle"><summary>Opciones avanzadas</summary>
                  <label class="a-campo" style="margin-top:10px"><span>Secreto de firma del webhook (opcional)</span><input class="a-in" name="webhook" type="password" autocomplete="off" spellcheck="false" placeholder="whsec_…" /></label>
                  <p class="a-ayuda" style="margin-top:6px">Déjalo vacío: al conectar, los avisos de pago se activan solos. Solo hace falta si usas una llave restringida que no puede crear webhooks.</p>
                </details>
                <div class="a-fila"><button class="a-btn a-btn--azul">${st.conectado ? 'Cambiar la llave' : 'Conectar Stripe'}</button>${st.conectado ? '<button type="button" class="a-btn" data-stripe-estado>Comprobar la conexión</button>' : ''}<span class="a-ayuda" data-stripe-msj></span></div>
              </form>`
            : `<p class="a-error">Para conectar Stripe necesitas iniciar sesión con tu cuenta del equipo: la llave se guarda en el servidor, no en este dispositivo.</p><div><a class="a-btn a-btn--pri" href="#/entrar">Iniciar sesión</a></div>`
        }
        <details class="crm-detalle" ${st.conectado ? '' : 'open'}><summary>Cómo conseguir la llave, paso a paso</summary>
          <ol class="crm-pasos">
            <li>Entra a <b>dashboard.stripe.com</b> con la cuenta de Soma.</li>
            <li>Arriba a la derecha, activa el <b>modo de prueba</b> (Test mode). Empieza ahí: nada de lo que hagas mueve dinero real.</li>
            <li>Ve a <b>Developers → API keys</b>.</li>
            <li>En <b>Secret key</b>, toca <b>Reveal</b> y copia la llave completa. Empieza con <code>sk_test_</code>.</li>
            <li>Pégala aquí arriba y toca <b>Conectar Stripe</b>. Se comprueba con Stripe en ese momento; si la llave está bien, verás el nombre de la cuenta.</li>
            <li>Pruébalo: en <b>Cobranza → Registrar pago → Tarjeta, con enlace</b>. Abre el enlace y paga con la tarjeta de prueba <span class="a-num">4242 4242 4242 4242</span>, cualquier fecha futura y cualquier código. En unos segundos el pago debe aparecer como «Pagado».</li>
            <li>Para cobrar de verdad: cuando Stripe haya activado tu cuenta, apaga el modo de prueba, copia la llave que empieza con <code>sk_live_</code> y pégala aquí igual. Sustituye a la de prueba.</li>
          </ol>
          <p class="a-ayuda">La llave se guarda cifrada en el servidor y nadie la puede volver a leer desde el CRM, ni tú. Si la pierdes o crees que alguien más la vio, genera otra en Stripe («Roll key») y pégala aquí.</p>
        </details>
      </section>

      <form class="a-seccion crm-bloque" data-bloque="contacto"><div class="a-seccion-cab"><h2 class="a-h2">Contacto de Soma</h2><button class="a-btn a-btn--ch a-btn--pri">Guardar</button></div>
        <p class="a-p">Aparece en la última escena de cada visita. Lo que dejes vacío no se muestra.</p>
        <div class="a-campos a-campos--2">${campo('WhatsApp', 'whatsapp', k.whatsapp)}${campo('Correo', 'correo', k.correo)}${campo('Sitio web', 'web', k.web)}${campo('Instagram', 'instagram', k.instagram)}</div>
      </form>

      <form class="a-seccion crm-bloque" data-bloque="presentadores"><div class="a-seccion-cab"><h2 class="a-h2">Quién presenta</h2><button class="a-btn a-btn--ch a-btn--pri">Guardar</button></div>
        <p class="a-p">La línea de cada quien sale en «Antes de empezar», cuando esa persona va a la visita.</p>
        ${personas.map((p, i) => `<div class="a-campos a-campos--2">${campo('Nombre', `nombre_${i}`, p.nombre)}${campo('Qué hace', `linea_${i}`, p.linea)}</div>`).join('')}
      </form>

      <form class="a-seccion crm-bloque" data-bloque="cobro"><div class="a-seccion-cab"><h2 class="a-h2">Cobro</h2><button class="a-btn a-btn--ch a-btn--pri">Guardar</button></div>
        <p class="a-p">Los datos de la cuenta se muestran al cliente en «Formas de pago» de la segunda visita.</p>
        <div class="a-campos a-campos--2">${campo('Titular', 'titular', banco.titular)}${campo('Banco', 'banco', banco.banco)}${campo('CLABE', 'clabe', banco.clabe, 'inputmode="numeric"')}${campo('Cuenta o tarjeta', 'cuenta', banco.cuenta)}
          ${campo('Avisar cuando falten (días)', 'dias_aviso', store.ajuste('dias_aviso'), 'type="number" min="1" max="30"')}
          <label class="a-campo"><span>Rangos de presupuesto, uno por línea</span><textarea class="a-in" name="presupuestos" rows="5">${esc((store.ajuste('presupuestos') || []).join('\n'))}</textarea></label>
        </div>
        <p class="a-ayuda">Pagos con tarjeta: ${sesion.usuario ? 'los enlaces se crean desde «Registrar pago». Si Stripe no está conectado todavía, el mismo diálogo lo dice.' : 'necesitan sesión iniciada.'}</p>
      </form>

      <form class="a-seccion crm-bloque" data-bloque="plantillas"><div class="a-seccion-cab"><h2 class="a-h2">Mensajes</h2><button class="a-btn a-btn--ch a-btn--pri">Guardar</button></div>
        <p class="a-p">Lo que se le escribe al cliente. Se pueden usar {contacto}, {negocio}, {quien}, {vence}, {monto}, {fecha} y {hora}.</p>
        <div class="a-campos">${Object.keys(AJUSTES_BASE.plantillas).map((id) => `<label class="a-campo"><span>${NOMBRES[id]}</span><textarea class="a-in" name="${id}" rows="3">${esc(plantillas[id] || '')}</textarea></label>`).join('')}</div>
      </form>

      <form class="a-seccion crm-bloque" data-bloque="general"><div class="a-seccion-cab"><h2 class="a-h2">Publicación</h2><button class="a-btn a-btn--ch a-btn--pri">Guardar</button></div>
        <p class="a-p">La dirección donde está publicada esta aplicación. Sirve para armar la línea que enlaza los sistemas entregados.</p>
        <div class="a-campos">${campo('Dirección pública', 'url_publica', store.ajuste('url_publica'), 'type="url" placeholder="https://…"')}</div>
      </form>

      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Equipo y cuenta</h2></div>
        <p class="a-p">${sesion.usuario ? `Sesión iniciada como ${esc(sesion.nombre || 'integrante')}. Lo que registras se sincroniza con el resto del equipo.` : 'Estás usando el CRM sin cuenta, deberías iniciar sesión para compartirlo con el equipo.'}</p>
        <div class="a-fila" style="margin-top:12px">
          ${sesion.usuario ? '<button type="button" class="a-btn a-btn--ch" data-codigo>Cambiar el código de equipo</button><button type="button" class="a-btn a-btn--ch" data-salir>Cerrar sesión</button>' : '<a class="a-btn a-btn--ch a-btn--pri" href="#/entrar">Iniciar sesión</a>'}
          <a class="a-btn a-btn--ch" href="#/demos">Galería de demos</a><a class="a-btn a-btn--ch" href="#/iconos">Iconos</a><a class="a-btn a-btn--ch" href="#/general">Presentación general</a>
        </div>
      </section>
      ${firma()}`
  }, { despues: montarFirma })

  const conectarStripe = async (form) => {
    const f = leerCampos(form)
    const msj = form.querySelector('[data-stripe-msj]')
    if (!f.llave) return (msj.textContent = 'Pega primero la llave secreta.')
    const boton = form.querySelector('button.a-btn--azul')
    boton.disabled = true
    msj.textContent = 'Comprobando con Stripe…'
    const r = await funcion('stripe-config', { accion: 'guardar', llave: f.llave, webhook: f.webhook || '' })
    boton.disabled = false
    if (r.error) return (msj.innerHTML = `<span class="a-error">${esc(r.error)}</span>`)
    const { nota, ...estado } = r
    document.activeElement?.blur()
    store.ponAjuste('stripe', estado)
    aviso(nota || `Stripe conectado: ${estado.cuenta}, ${estado.modo === 'real' ? 'cobros reales' : 'modo de prueba'}.`, { tipo: nota ? '' : 'ok', ms: nota ? 9000 : 4000 })
  }

  const guardar = (e) => {
    e.preventDefault()
    if (e.target.matches('[data-stripe]')) return void conectarStripe(e.target)
    const f = leerCampos(e.target)
    const b = e.target.dataset.bloque
    if (b === 'contacto') store.ponAjuste('contacto', f)
    else if (b === 'presentadores') store.ponAjuste('presentadores', store.ajuste('presentadores').map((p, i) => ({ ...p, nombre: f[`nombre_${i}`] || p.nombre, linea: f[`linea_${i}`] || '' })))
    else if (b === 'cobro') {
      store.ponAjuste('banco', { titular: f.titular, banco: f.banco, clabe: f.clabe, cuenta: f.cuenta })
      store.ponAjuste('dias_aviso', f.dias_aviso || 7)
      store.ponAjuste('presupuestos', f.presupuestos.split('\n').map((x) => x.trim()).filter(Boolean))
    } else if (b === 'plantillas') store.ponAjuste('plantillas', f)
    else if (b === 'general') store.ponAjuste('url_publica', f.url_publica)
    document.activeElement?.blur()
    aviso('Guardado.', { tipo: 'ok' })
  }
  m.main.addEventListener('submit', guardar)
  const q = alTocar(m.main, '[data-codigo]', async () => {
    await dialogo({
      titulo: 'Cambiar el código de equipo',
      html: `<p class="dlg-texto">Con este código alguien nuevo puede crear su cuenta. Cámbialo si alguien deja el equipo o si se compartió de más. Solo lo puede cambiar quien creó la primera cuenta.</p>
        <label class="a-campo" style="margin-top:14px"><span>Código nuevo</span><input class="a-in" name="codigo" autocomplete="off" placeholder="Mínimo 10 caracteres" /></label>`,
      acciones: [{ id: 'no', texto: 'Cancelar' }, { id: 'ok', texto: 'Cambiar código', pri: true }],
      async antesDeCerrar(id, dlg) {
        if (id !== 'ok') return
        const { codigo } = leerCampos(dlg)
        if ((codigo || '').length < 10) return aviso('El código necesita al menos 10 caracteres.'), false
        const { error } = await sb.rpc('cambiar_codigo_equipo', { p_nuevo: codigo })
        if (error) return aviso(/administrador/.test(error.message) ? 'Solo quien creó la primera cuenta puede cambiarlo.' : 'No se pudo cambiar. Revisa tu conexión.', { tipo: 'mal' }), false
        aviso('Código cambiado. El anterior ya no sirve.', { tipo: 'ok' })
      },
    })
  })
  const q2 = alTocar(m.main, '[data-stripe-estado]', async (b) => {
    const msj = m.main.querySelector('[data-stripe-msj]')
    b.disabled = true
    msj.textContent = 'Preguntando a Stripe…'
    const r = await funcion('stripe-config', { accion: 'estado' })
    b.disabled = false
    msj.innerHTML = r.error ? `<span class="a-error">${esc(r.error)}</span>` : r.conectado ? `Todo en orden: ${esc(r.cuenta)}, ${r.modo === 'real' ? 'cobros reales' : 'modo de prueba'}${r.webhook ? ', con avisos de pago activos' : ', sin avisos de pago'}.` : 'No hay ninguna llave guardada.'
  })
  if (location.hash.includes('tarjeta')) requestAnimationFrame(() => m.main.querySelector('#tarjeta')?.scrollIntoView())
  return () => {
    m.main.removeEventListener('submit', guardar)
    q()
    q2()
    montarFirma(null)
    m.cerrar()
  }
}
