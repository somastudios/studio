//   node scripts/parpadeo2.cjs <puerto> [ancho] [alto] [minutos que se adelanta el reloj]
// Simula una cuenta con sesión iniciada (la nube es de mentira) y mide, sección por sección,
// qué se mueve en pantalla cuando el CRM sincroniza solo o cuando pasa el tiempo:
//   · repintes del contenido sin que hayan cambiado los datos
//   · cambios en la barra de navegación y en el indicador de sincronización
// Necesita el servidor de desarrollo (importa los módulos de /src).
const { chromium } = require('playwright')
const RUTAS = ['/crm', '/crm/prospectos', '/crm/agenda', '/crm/cobranza', '/crm/sistemas', '/crm/ajustes']
;(async () => {
  const [puerto, ancho = '390', alto = '844', minutos = '95'] = process.argv.slice(2)
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, isMobile: +ancho < 700, hasTouch: +ancho < 700 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
    // Un reloj que se puede adelantar sin tocar el de las animaciones.
    window.__salto = 0
    const D = Date
    window.Date = class extends D {
      constructor(...a) {
        a.length ? super(...a) : super(D.now() + window.__salto)
      }
      static now() {
        return D.now() + window.__salto
      }
    }
  })
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(1500)
  // Datos de muestra, si la sección de pruebas los ofrece.
  await p.evaluate(async () => {
    const { store } = await import('/src/data/store.js')
    const { sesion } = await import('/src/app/sesion.js')
    const espera = (ms) => new Promise((r) => setTimeout(r, ms))
    // Como el servidor: lo que sube, vuelve en la siguiente bajada con su marca y sus fechas
    // escritas a la manera de Postgres.
    const eco = {}
    const comoServidor = (f) => {
      const o = { ...f, sincronizado: new Date().toISOString().replace('Z', '+00:00') }
      for (const k of ['creado', 'actualizado', 'eliminado']) if (typeof o[k] === 'string') o[k] = o[k].replace('Z', '+00:00')
      return o
    }
    const cadena = (t) => {
      const q = {
        select: () => q,
        order: () => q,
        limit: () => q,
        gt: () => q,
        upsert: async (filas) => (await espera(250), (eco[t] = [...(eco[t] || []), ...filas.map(comoServidor)]), { error: null }),
        then: (ok) => espera(60).then(() => ok({ data: eco[t]?.splice(0) || [], error: null })),
      }
      return q
    }
    // Datos de muestra: con las listas vacías no se nota si algo se repinta de más.
    const a = store.guardar('prospectos', { negocio: 'La Casona', nicho: 'restaurante', etapa: 'cliente', contacto: 'Rosa Elizondo', telefono: '523411234567' })
    const b = store.guardar('prospectos', { negocio: 'Barbería El Patrón', nicho: 'barberia', etapa: 'demo', proxima_accion: 'Terminar la demo de agenda' })
    store.guardar('prospectos', { negocio: 'Ferretería El Tornillo', nicho: 'ferreteria', etapa: 'nuevo', actualizado: new Date(Date.now() - 8 * 864e5).toISOString() })
    store.guardar('citas', { prospecto_id: b.id, tipo: 'visita2', inicio: new Date(Date.now() + 2 * 864e5).toISOString(), estado: 'confirmada', titulo: 'Segunda visita' })
    const s = store.guardar('sistemas', { prospecto_id: a.id, nombre: 'Comandas La Casona', url: 'https://lacasona.example', estado: 'activo', llave: 'soma_ejemplo123', modo_vencido: 'aviso', ultima_senal: new Date(Date.now() - 40 * 6e4).toISOString() })
    const m = store.guardar('membresias', { prospecto_id: a.id, sistema_id: s.id, plazo: 'mensual', monto: 1800, estado: 'activa', inicio: new Date(Date.now() - 27 * 864e5).toISOString().slice(0, 10), vence: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) })
    store.guardar('pagos', { prospecto_id: a.id, membresia_id: m.id, monto: 1800, metodo: 'transferencia', estado: 'pagado', fecha: new Date(Date.now() - 27 * 864e5).toISOString().slice(0, 10) })
    sesion.usuario = { id: '00000000-0000-4000-8000-000000000001' }
    store.conectar({ sb: { from: cadena }, activo: () => true, quien: () => sesion.usuario.id })
    window.__store = store
  })
  await p.waitForTimeout(3500) // que suba lo sembrado antes de medir
  const salida = {}
  for (const ruta of RUTAS) {
    await p.evaluate((r) => (location.hash = '#' + r), ruta)
    await p.waitForTimeout(2200)
    salida[ruta] = await p.evaluate(async (min) => {
      const espera = (ms) => new Promise((r) => setTimeout(r, ms))
      const pagina = document.querySelector('.a-pagina')
      const nav = document.querySelector('.crm-nav')
      const tope = document.querySelector('.crm-tope')
      const r = { repintes: 0, nav: [], chip: [] }
      const o1 = new MutationObserver((m) => m.forEach((x) => x.type === 'childList' && x.target === pagina && r.repintes++))
      o1.observe(pagina, { childList: true })
      const anota = (m) =>
        m.forEach((x) => {
          const el = x.target.nodeType === 1 ? x.target : x.target.parentElement
          if (el?.closest?.('.crm-punto')) return
          const quien = el?.closest?.('[data-sync]') ? r.chip : r.nav
          const que = x.type === 'attributes' ? `${el.className?.baseVal ?? el.className}@${x.attributeName}` : `${el.className?.baseVal ?? el.className}:${el.textContent.slice(0, 30)}`
          if (!quien.includes(que)) quien.push(que)
        })
      const o2 = new MutationObserver(anota)
      for (const el of [nav, tope]) o2.observe(el, { childList: true, subtree: true, attributes: true, characterData: true })
      // Tres sincronizaciones solas, como las que pasan cada minuto.
      for (let i = 0; i < 3; i++) {
        await window.__store.sincronizar()
        await espera(300)
      }
      const trasSync = { ...r, nav: [...r.nav], chip: [...r.chip] }
      // Un dato que ninguna vista muestra cambia, y además pasó una hora y media.
      window.__salto += min * 60000
      window.__store.ponAjuste('zz_prueba', Math.random())
      await espera(2600)
      o1.disconnect()
      o2.disconnect()
      return { sync: trasSync, conTiempo: { repintes: r.repintes - trasSync.repintes } }
    }, +minutos)
    await p.evaluate(() => (window.__salto = 0))
  }
  // Un cambio de verdad: debe repintar una vez (el cambio), no otra cuando vuelve del servidor.
  await p.evaluate(() => (location.hash = '#/crm/prospectos'))
  await p.waitForTimeout(2200)
  const eco = await p.evaluate(async () => {
    const espera = (ms) => new Promise((r) => setTimeout(r, ms))
    const fila = window.__store.guardar('prospectos', { negocio: 'Tacos de prueba', nicho: 'restaurante', etapa: 'prospecto' })
    await espera(3500)
    const pagina = document.querySelector('.a-pagina')
    let repintes = 0
    const chip = []
    const o = new MutationObserver((m) => m.forEach((x) => x.type === 'childList' && x.target === pagina && repintes++))
    o.observe(pagina, { childList: true })
    const o2 = new MutationObserver(() => chip.push(document.querySelector('.crm-tope [data-sync]').textContent))
    o2.observe(document.querySelector('.crm-tope'), { childList: true, subtree: true, attributes: true, characterData: true })
    window.__store.guardar('prospectos', { id: fila.id, negocio: 'Tacos El Eco' })
    await espera(4500)
    o.disconnect()
    o2.disconnect()
    return { repintes, chip, pendientes: window.__store.estado.pendientes }
  })
  console.log('editar y volver   ', JSON.stringify(eco))
  for (const [ruta, v] of Object.entries(salida)) console.log(ruta.padEnd(18), JSON.stringify(v))
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
