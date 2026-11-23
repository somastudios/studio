import gsap from 'gsap'
import { abrirApp } from '../app/vista.js'
import { store } from '../data/store.js'
import { sesion, salir } from '../app/sesion.js'
import { ir, rutaActual } from '../app/router.js'
import { confirmar } from '../app/capas.js'
import { boil, P, semilla } from '../core/boil.js'
import { icoNicho } from '../icons/render.js'
import { esc, fecha, dinero } from '../app/util.js'
import { resumenCobranza } from './cobranza.js'
import { animaEmblema, ponHora } from './emblemas.js'

// El marco del CRM: la navegación, que no se vuelve a dibujar al cambiar de sección, y el
// contenido, que entra con su propia coreografía. El punto azul es el cursor: viaja a la
// sección abierta, igual que en la presentación viaja de escena en escena.

const SECCIONES = [
  { id: 'hoy', ruta: '/crm', nombre: 'Hoy', ico: 'crm-hoy' },
  { id: 'prospectos', ruta: '/crm/prospectos', nombre: 'Prospectos', ico: 'crm-prospectos' },
  { id: 'agenda', ruta: '/crm/agenda', nombre: 'Agenda', ico: 'crm-agenda' },
  { id: 'cobranza', ruta: '/crm/cobranza', nombre: 'Cobranza', ico: 'crm-cobranza' },
  { id: 'sistemas', ruta: '/crm/sistemas', nombre: 'Sistemas', ico: 'crm-sistemas' },
  { id: 'ajustes', ruta: '/crm/ajustes', nombre: 'Ajustes', ico: 'crm-ajustes' },
]

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches
let previa = -1
const tabsPrevias = {}

function estadoSync() {
  const e = store.estado
  if (!e.persistente && !sesion.usuario) return { t: 'Modo de prueba: no se guarda', c: 'alerta' }
  if (!sesion.usuario) return { t: 'Sin cuenta · no se comparte', c: 'mudo' }
  if (!navigator.onLine) return { t: `Sin conexión${e.pendientes ? ` · ${e.pendientes} por subir` : ''}`, c: 'alerta' }
  // De paso: duran un instante. Solo se muestran si se alargan o si alguien tocó el indicador.
  if (e.sincronizando) return { t: 'Sincronizando…', c: 'azul', fugaz: true }
  if (e.error) return { t: 'No se pudo sincronizar', c: 'mal' }
  if (e.pendientes) return { t: `${e.pendientes} por subir`, c: 'alerta', fugaz: true }
  return { t: 'Al día', c: 'ok', nota: e.ultima ? `Última sincronización: ${fecha(e.ultima, 'hora')}` : '' }
}

// El indicador no anuncia cada sincronización de fondo (hay una por minuto y otra tras cada
// cambio): si se la pasa cambiando de texto y de color, se ve como un parpadeo. Se queda en lo
// último estable y solo cuenta lo que tarda más de la cuenta.
const PACIENCIA = 2500
let estable = null
let fugazDesde = 0
let insistir = false
let recordatorio = 0

function estadoVisible() {
  const e = estadoSync()
  if (!e.fugaz) {
    fugazDesde = 0
    estable = e
    return e
  }
  if (insistir) return e
  fugazDesde ||= performance.now()
  if (performance.now() - fugazDesde >= PACIENCIA) return e
  clearTimeout(recordatorio)
  recordatorio = setTimeout(() => document.querySelector('.crm')?.marcas?.(), PACIENCIA + 100)
  return estable || { t: 'Conectando…', c: 'mudo' }
}

/** Escribe solo si cambió: tocar el DOM con lo mismo también cuesta. */
const pon = (el, prop, v) => el && el[prop] !== v && (el[prop] = v)

const MARCA = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="6.4"/><circle cx="32" cy="32" r="9.4" fill="#216fff"/></svg>`

/** Construye la navegación una sola vez. Vive mientras se esté dentro del CRM. */
function construir(app) {
  app.innerHTML = `
    <div class="crm">
      <header class="crm-tope"><a class="crm-marca" href="#/crm">${MARCA}<span><b>SOMA</b> CRM</span></a><button type="button" class="a-chip crm-sync" data-sync></button></header>
      <nav class="crm-nav" aria-label="Secciones">
        <a class="crm-marca" href="#/crm">${MARCA}<span><b>SOMA</b> CRM</span></a>
        <a class="crm-nueva" href="#/presala"><span class="crm-nueva-aro"><svg viewBox="0 0 48 48" aria-hidden="true">${boil(P.circle(24, 24, 21.6, 14), { amp: 0.45, attrs: 'stroke-width="1.6"' })}${boil([P.line(24, 15, 24, 33, 3), P.line(15, 24, 33, 24, 3)], { amp: 0.3, attrs: 'stroke-width="2"' })}</svg></span><span>Nueva visita</span></a>
        <ul class="crm-secciones">
          ${SECCIONES.map((s) => `<li><a href="#${s.ruta}" data-seccion="${s.id}"><i class="crm-ancla"></i><span class="crm-ico">${icoNicho(s.ico)}</span><span class="crm-nombre">${s.nombre}</span>${s.id === 'cobranza' ? '<span class="crm-cuenta" data-cobrar hidden></span>' : ''}</a></li>`).join('')}
        </ul>
        <i class="crm-punto" aria-hidden="true"><svg viewBox="-100 -100 200 200">${boil(P.circle(0, 0, 98.5, 30), { amp: 0.6, cls: 'dot-shape' })}</svg></i>
        <div class="crm-pie">
          <button type="button" class="a-chip crm-sync" data-sync></button>
          <p class="crm-quien" data-quien></p>
          <button type="button" class="a-enlace crm-salir" data-salir></button>
        </div>
      </nav>
      <main class="crm-main"><div class="a-pagina"></div></main>
    </div>`
  const crm = app.querySelector('.crm')

  crm.addEventListener('click', async (e) => {
    if (e.target.closest('[data-sync]')) {
      // Aquí sí se muestra el «Sincronizando…»: alguien lo pidió y espera una respuesta.
      insistir = true
      const ida = store.sincronizar()
      crm.marcas?.()
      await ida
      insistir = false
      crm.marcas?.()
    } else if (e.target.closest('[data-salir]')) {
      if (!sesion.usuario) return ir('/entrar')
      const ok = await confirmar({ titulo: '¿Cerrar sesión?', texto: store.estado.pendientes ? `Hay ${store.estado.pendientes} cambios que no han subido. Si cierras sesión ahora, se pierden.` : 'La copia de este dispositivo se borra. Todo sigue guardado en la nube.', si: 'Cerrar sesión', peligro: !!store.estado.pendientes })
      if (!ok) return
      await salir()
      ir('/entrar')
    }
  })
  // Los iconos cobran vida al pasar por encima; el de la sección abierta siempre está vivo.
  const vivo = (e, si) => {
    const a = e.target.closest?.('.crm-secciones a')
    if (a && !a.hasAttribute('aria-current')) a.classList.toggle('vivo', si)
  }
  crm.addEventListener('pointerover', (e) => vivo(e, true))
  crm.addEventListener('pointerout', (e) => vivo(e, false))

  const alRedimensionar = () => crm.isConnected && ponPunto(crm, false)
  addEventListener('resize', alRedimensionar)
  const reloj = setInterval(() => (crm.isConnected ? ponHora(crm) : (clearInterval(reloj), removeEventListener('resize', alRedimensionar))), 20000)
  return crm
}

/** Lleva el punto a la sección abierta. */
function ponPunto(crm, animar) {
  const punto = crm.querySelector('.crm-punto')
  const ancla = crm.querySelector('.crm-secciones a[aria-current] .crm-ancla')
  const nav = crm.querySelector('.crm-nav')
  if (!ancla || !punto) return
  const a = ancla.getBoundingClientRect()
  const n = nav.getBoundingClientRect()
  const x = a.left - n.left + a.width / 2
  const y = a.top - n.top + a.height / 2
  gsap.killTweensOf(punto)
  if (animar && !reducido) {
    gsap.to(punto, { x, y, duration: 0.75, ease: 'expo.inOut' })
    gsap.fromTo(punto.firstElementChild, { scale: 1 }, { scale: 1.5, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1, delay: 0.42 })
  } else gsap.set(punto, { x, y })
  punto.classList.add('es-puesto')
}

/** El subrayado de las pestañas: uno solo, que se desliza a la elegida. */
function ponTabs(main, clave, animar) {
  main.querySelectorAll('.a-tabs').forEach((tabs, k) => {
    const sel = tabs.querySelector('[aria-selected="true"]')
    if (!sel) return
    let ind = tabs.querySelector('.a-tabs-ind')
    if (!ind) {
      ind = document.createElement('i')
      ind.className = 'a-tabs-ind'
      tabs.appendChild(ind)
    }
    const x = sel.offsetLeft + 12
    const w = Math.max(12, sel.offsetWidth - 24)
    const id = `${clave}:${k}`
    const p = tabsPrevias[id]
    if (animar && p && !reducido) gsap.fromTo(ind, { x: p.x, width: p.w }, { x, width: w, duration: 0.55, ease: 'expo.out' })
    else gsap.set(ind, { x, width: w })
    tabsPrevias[id] = { x, w }
    if (sel.offsetLeft < tabs.scrollLeft || sel.offsetLeft + sel.offsetWidth > tabs.scrollLeft + tabs.clientWidth) tabs.scrollLeft = Math.max(0, sel.offsetLeft - 16)
  })
}

/** La entrada de una sección: título, regla, emblema, y el contenido que sube por tandas. */
function entrada(main, dir) {
  const tl = gsap.timeline()
  const h1 = main.querySelector('.a-h1')
  const k = main.querySelector('.crm-cab .a-k, .crm-miga')
  if (h1) tl.fromTo(h1, { yPercent: 60, clipPath: 'inset(0% 0% 100% 0%)' }, { yPercent: 0, clipPath: 'inset(-15% -3% -15% -3%)', duration: 0.95, ease: 'expo.out', clearProps: 'transform,clipPath' }, 0)
  if (k) tl.fromTo(k, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }, 0.12)
  const regla = main.querySelector('.crm-regla .boil')
  if (regla) tl.fromTo(regla, { '--draw': 1.06 }, { '--draw': 0, duration: 1.15, ease: 'expo.inOut' }, 0.05)
  animaEmblema(main.querySelector('.crm-emblema [data-emb]'), tl, 0.1)
  const acc = main.querySelector('.crm-cab .a-cab-acc')
  if (acc) tl.fromTo(acc.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity,visibility' }, 0.3)
  const resto = [...main.children].filter((x) => !x.matches('.crm-cab, .crm-miga'))
  if (resto.length) tl.fromTo(resto, { autoAlpha: 0, y: 22 * dir }, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity,visibility' }, 0.22)
  const filas = [...main.querySelectorAll('.a-item, .crm-sistema, .crm-nodo, .crm-dia-celda')].slice(0, 14)
  if (filas.length) tl.fromTo(filas, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'expo.out', stagger: 0.035, clearProps: 'transform,opacity,visibility' }, 0.4)
  // Las cifras cuentan hasta su valor.
  main.querySelectorAll('.a-cifra-n[data-n]').forEach((el, i) => {
    const hasta = Number(el.dataset.n) || 0
    const esDinero = el.dataset.f === 'dinero'
    const o = { v: 0 }
    tl.to(o, { v: hasta, duration: 1.1, ease: 'expo.out', onUpdate: () => (el.textContent = esDinero ? dinero(Math.round(o.v)) : String(Math.round(o.v))) }, 0.3 + i * 0.06)
  })
  const reglas = main.querySelectorAll('.a-cifra')
  if (reglas.length) tl.fromTo(reglas, { '--trazo': 0 }, { '--trazo': 1, duration: 0.9, ease: 'expo.inOut', stagger: 0.07 }, 0.25)
  return tl
}

const SEMILLA = 9000

// Para comparar dos pintadas se ignoran las manecillas del reloj: esas avanzan solas (ponHora)
// y, si contaran, «Hoy» se repintaría entero cada minuto que llegue un dato.
const huella = (html) => html.replace(/ data-rot="[^"]*" transform="rotate\([^)]*\)"/g, '')

/**
 * Abre una sección. `pintar(destino)` dibuja el contenido; se llama ahora y cada vez que cambian
 * los datos (salvo que se esté escribiendo). `despues(main)` corre cada vez que el contenido
 * nuevo ya está en pantalla (para arrancar animaciones que viven ahí).
 * Devuelve { main, repinta({ tab }), cerrar }.
 */
export function marco(activa, pintar, { despues } = {}) {
  let app = document.getElementById('app')
  let crm = document.body.dataset.modo === 'app' ? app.querySelector('.crm') : null
  const nuevo = !crm
  if (nuevo) {
    app = abrirApp({ tema: 'paper', titulo: 'Soma CRM' })
    crm = construir(app)
  }
  document.title = `${SECCIONES.find((s) => s.id === activa)?.nombre || 'CRM'} · Soma`

  const i = SECCIONES.findIndex((s) => s.id === activa)
  const dir = previa < 0 || i >= previa ? 1 : -1
  crm.querySelectorAll('.crm-secciones a').forEach((a) => {
    const es = a.dataset.seccion === activa
    es ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')
    a.classList.toggle('vivo', es)
  })
  const main = crm.querySelector('.a-pagina')
  const rueda = crm.querySelector('.crm-main')
  const marcas = () => {
    const e = estadoVisible()
    crm.querySelectorAll('[data-sync]').forEach((b) => {
      pon(b, 'textContent', e.t)
      pon(b, 'className', `a-chip crm-sync a-chip--${e.c}`)
      pon(b, 'title', e.nota || '')
    })
    pon(crm.querySelector('[data-quien]'), 'textContent', sesion.nombre || 'Sin nombre')
    pon(crm.querySelector('[data-salir]'), 'textContent', sesion.usuario ? 'Cerrar sesión' : 'Iniciar sesión')
    const r = resumenCobranza()
    const n = r.vencidas.length + r.porVencer.length
    const c = crm.querySelector('[data-cobrar]')
    pon(c, 'textContent', n ? String(n) : '')
    pon(c, 'hidden', !n)
  }
  crm.marcas = marcas

  gsap.killTweensOf(main.querySelectorAll('*'))
  main.innerHTML = ''
  rueda.scrollTop = 0
  app.scrollTop = 0
  marcas()
  semilla(SEMILLA)
  pintar(main)
  // Lo que se dibujó, tal cual: si un cambio de datos no altera la vista, no se vuelve a pintar.
  let ultimo = huella(main.innerHTML)
  despues?.(main)
  ponTabs(main, activa, false)
  requestAnimationFrame(() => ponPunto(crm, !nuevo && previa !== i))
  if (!reducido) entrada(main, dir)
  previa = i

  let raf = 0
  let vivo = true
  const repinta = ({ tab = false } = {}) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      if (!vivo) return
      marcas()
      const foco = document.activeElement
      if (!tab && foco && main.contains(foco) && /INPUT|TEXTAREA|SELECT/.test(foco.tagName)) return
      const y = rueda.scrollTop
      const y2 = app.scrollTop
      // Se dibuja aparte y solo se cambia lo que hay en pantalla si de verdad cambió algo.
      // Repintar de más reinicia animaciones y se ve como un parpadeo.
      const nuevo = document.createElement('div')
      semilla(SEMILLA)
      pintar(nuevo)
      const html = huella(nuevo.innerHTML)
      if (!tab && html === ultimo) return
      ultimo = html
      gsap.killTweensOf(main.querySelectorAll('*'))
      main.replaceChildren(...nuevo.childNodes)
      despues?.(main)
      rueda.scrollTop = y
      app.scrollTop = y2
      ponTabs(main, activa, tab)
      if (tab && !reducido) {
        const cuerpo = main.querySelector('[data-cuerpo]')
        if (cuerpo) {
          gsap.fromTo(cuerpo, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform,opacity,visibility' })
          const filas = [...cuerpo.querySelectorAll('.a-item, .crm-sistema, .a-tarjeta')].slice(0, 12)
          if (filas.length) gsap.fromTo(filas, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'expo.out', stagger: 0.03, clearProps: 'transform,opacity,visibility' })
        }
      }
    })
  }
  // La sincronización solo cambia el indicador; los datos que baje llegan como su propia tabla.
  const off = store.alCambiar((tabla) => (tabla === '_sync' ? marcas() : repinta()))
  return {
    main,
    repinta,
    cerrar() {
      vivo = false
      off()
      cancelAnimationFrame(raf)
    },
  }
}

export const enRuta = (r) => rutaActual() === r
export { esc }
