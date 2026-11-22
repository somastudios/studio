import { abrirApp } from '../app/vista.js'
import { store } from '../data/store.js'
import { sesion, salir } from '../app/sesion.js'
import { ir, rutaActual } from '../app/router.js'
import { confirmar } from '../app/capas.js'
import { esc, fecha } from '../app/util.js'
import { resumenCobranza } from './cobranza.js'

// El marco del CRM: navegación a la izquierda, contenido a la derecha.
// Cada vista pide su marco, pinta dentro y se vuelve a pintar cuando cambian los datos.

const SECCIONES = [
  { id: 'hoy', ruta: '/crm', nombre: 'Hoy' },
  { id: 'prospectos', ruta: '/crm/prospectos', nombre: 'Prospectos' },
  { id: 'agenda', ruta: '/crm/agenda', nombre: 'Agenda' },
  { id: 'cobranza', ruta: '/crm/cobranza', nombre: 'Cobranza' },
  { id: 'sistemas', ruta: '/crm/sistemas', nombre: 'Sistemas' },
  { id: 'ajustes', ruta: '/crm/ajustes', nombre: 'Ajustes' },
]

function estadoSync() {
  const e = store.estado
  if (!e.persistente && !sesion.usuario) return { t: 'Modo de prueba: no se guarda', c: 'alerta' }
  if (!sesion.usuario) return { t: 'Solo en este dispositivo', c: 'mudo' }
  if (!navigator.onLine) return { t: `Sin conexión${e.pendientes ? ` · ${e.pendientes} por subir` : ''}`, c: 'alerta' }
  if (e.sincronizando) return { t: 'Sincronizando…', c: 'azul' }
  if (e.error) return { t: 'No se pudo sincronizar', c: 'mal' }
  if (e.pendientes) return { t: `${e.pendientes} por subir`, c: 'alerta' }
  return { t: e.ultima ? `Al día · ${fecha(e.ultima, 'hora')}` : 'Al día', c: 'ok' }
}

/**
 * Abre el marco y devuelve { main, alCerrar }.
 * `pintar` se llama ahora y cada vez que cambian los datos (salvo que se esté escribiendo).
 */
export function marco(activa, pintar) {
  const app = abrirApp({ tema: 'paper', titulo: 'Soma CRM' })
  const porCobrar = () => {
    const r = resumenCobranza()
    return r.vencidas.length + r.porVencer.length
  }
  app.innerHTML = `
    <div class="crm">
      <nav class="crm-nav" aria-label="Secciones">
        <a class="crm-marca" href="#/crm"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="6.4"/><circle cx="32" cy="32" r="9.4" fill="#216fff"/></svg><span><b>SOMA</b> CRM</span></a>
        <a class="a-btn a-btn--pri crm-nueva" href="#/presala">Nueva visita</a>
        <ul class="crm-secciones">
          ${SECCIONES.map((s) => `<li><a href="#${s.ruta}" ${s.id === activa ? 'aria-current="page"' : ''}><i></i>${s.nombre}${s.id === 'cobranza' ? '<span class="crm-cuenta" data-cobrar></span>' : ''}</a></li>`).join('')}
        </ul>
        <div class="crm-pie">
          <button type="button" class="a-chip crm-sync" data-sync></button>
          <p class="crm-quien">${esc(sesion.nombre || 'Sin nombre')}</p>
          <button type="button" class="a-enlace crm-salir" data-salir>${sesion.usuario ? 'Cerrar sesión' : 'Iniciar sesión'}</button>
        </div>
      </nav>
      <main class="crm-main"><div class="a-pagina"></div></main>
    </div>`
  const main = app.querySelector('.a-pagina')
  const sync = app.querySelector('[data-sync]')
  const cobrar = app.querySelector('[data-cobrar]')
  const marcas = () => {
    const e = estadoSync()
    sync.textContent = e.t
    sync.className = `a-chip crm-sync a-chip--${e.c}`
    const n = porCobrar()
    cobrar.textContent = n || ''
    cobrar.hidden = !n
  }
  let raf = 0
  const repinta = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      marcas()
      const foco = document.activeElement
      if (foco && main.contains(foco) && /INPUT|TEXTAREA|SELECT/.test(foco.tagName)) return
      const y = app.querySelector('.crm-main').scrollTop
      pintar(main)
      app.querySelector('.crm-main').scrollTop = y
    })
  }
  marcas()
  pintar(main)
  const off = store.alCambiar(repinta)
  const clic = async (e) => {
    if (e.target.closest('[data-sync]')) {
      await store.sincronizar()
      marcas()
    } else if (e.target.closest('[data-salir]')) {
      if (!sesion.usuario) return ir('/entrar')
      const ok = await confirmar({ titulo: '¿Cerrar sesión?', texto: store.estado.pendientes ? `Hay ${store.estado.pendientes} cambios que no han subido. Si cierras sesión ahora, se pierden.` : 'La copia de este dispositivo se borra. Todo sigue guardado en la nube.', si: 'Cerrar sesión', peligro: !!store.estado.pendientes })
      if (!ok) return
      await salir()
      ir('/entrar')
    }
  }
  app.addEventListener('click', clic)
  return {
    main,
    repinta,
    cerrar() {
      off()
      cancelAnimationFrame(raf)
      app.removeEventListener('click', clic)
    },
  }
}

export const enRuta = (r) => rutaActual() === r
