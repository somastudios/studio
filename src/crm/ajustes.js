import { store } from '../data/store.js'
import { sesion, sb } from '../app/sesion.js'
import { alTocar } from '../app/vista.js'
import { aviso, leerCampos, dialogo } from '../app/capas.js'
import { esc } from '../app/util.js'
import { AJUSTES_BASE } from '../data/esquema.js'
import { marco } from './marco.js'

// Ajustes: lo que cambia cómo se presenta Soma y cómo se cobra. Cada bloque se guarda por separado.

const campo = (etq, nombre, valor = '', extra = '') => `<label class="a-campo"><span>${etq}</span><input class="a-in" name="${nombre}" value="${esc(valor ?? '')}" ${extra} /></label>`
const NOMBRES = { por_vencer: 'Membresía por vencer', vencida: 'Membresía vencida', pago_recibido: 'Pago recibido', cita: 'Confirmar una cita', seguimiento: 'Seguimiento' }

export function vistaAjustes() {
  const m = marco('ajustes', (main) => {
    const k = store.ajuste('contacto')
    const personas = store.ajuste('presentadores')
    const banco = store.ajuste('banco')
    const plantillas = store.ajuste('plantillas')
    main.innerHTML = `
      <header class="a-cab"><div><p class="a-k">Cómo se presenta Soma y cómo cobra</p><h1 class="a-h1">Ajustes</h1></div></header>

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
        <p class="a-p">${sesion.usuario ? `Sesión iniciada como ${esc(sesion.nombre || 'integrante')}. Lo que registras se sincroniza con el resto del equipo.` : 'Estás trabajando solo en este dispositivo. Inicia sesión para que tus datos se compartan con el equipo y no dependan de este navegador.'}</p>
        <div class="a-fila" style="margin-top:12px">
          ${sesion.usuario ? '<button type="button" class="a-btn a-btn--ch" data-codigo>Cambiar el código de equipo</button>' : '<a class="a-btn a-btn--ch a-btn--pri" href="#/entrar">Iniciar sesión</a>'}
          <a class="a-btn a-btn--ch" href="#/demos">Galería de demos</a><a class="a-btn a-btn--ch" href="#/iconos">Iconos</a><a class="a-btn a-btn--ch" href="#/general">Presentación general</a>
        </div>
      </section>`
  })

  const guardar = (e) => {
    e.preventDefault()
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
  return () => {
    m.main.removeEventListener('submit', guardar)
    q()
    m.cerrar()
  }
}
