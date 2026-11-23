//   node scripts/hoy.cjs <puerto> <carpeta> [ancho] [alto] [hora 0-23]
// Fotos de «Hoy» para revisar el sello del día y las fichas: la entrada cuadro por cuadro,
// el reposo, y una hoja con todos los cuadros de cada escena de pixel art, ampliados.
const { chromium } = require('playwright')
;(async () => {
  const [puerto, salida, ancho = '390', alto = '844', hora = ''] = process.argv.slice(2)
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: 2, isMobile: +ancho < 700, hasTouch: +ancho < 700 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
  await p.addInitScript((hora) => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
    if (hora !== '') {
      const D = Date
      const base = new D()
      base.setHours(+hora, 47, 12)
      const salto = base - D.now()
      window.Date = class extends D {
        constructor(...a) {
          a.length ? super(...a) : super(D.now() + salto)
        }
        static now() {
          return D.now() + salto
        }
      }
    }
  }, hora)
  await p.goto(`http://localhost:${puerto}/#/entrar`)
  await p.waitForTimeout(600)
  await p.evaluate(async () => {
    const { store } = await import('/src/data/store.js')
    const a = store.guardar('prospectos', { negocio: 'La Casona', nicho: 'restaurante', etapa: 'cliente' })
    store.guardar('prospectos', { negocio: 'Barbería El Patrón', nicho: 'barberia', etapa: 'demo' })
    store.guardar('prospectos', { negocio: 'Ferretería El Tornillo', nicho: 'ferreteria', etapa: 'nuevo' })
    const m = store.guardar('membresias', { prospecto_id: a.id, modalidad: 'mensual', monto: 1800, estado: 'activa', vence: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10) })
    store.guardar('pagos', { prospecto_id: a.id, membresia_id: m.id, monto: 12800, metodo: 'transferencia', estado: 'pagado', fecha: new Date().toISOString().slice(0, 10), pagado: new Date().toISOString() })
  })
  await p.evaluate(() => (location.hash = '#/crm'))
  for (const ms of [120, 300, 480, 660, 840, 1100, 1500]) {
    await p.waitForTimeout(ms - (globalThis.__t || 0))
    globalThis.__t = ms
    await p.screenshot({ path: `${salida}/entrada-${String(ms).padStart(4, '0')}.png`, clip: { x: 0, y: 0, width: +ancho, height: Math.min(+alto, 700) } })
  }
  await p.waitForTimeout(1600)
  await p.screenshot({ path: `${salida}/reposo.png` })
  const cab = await p.locator('.crm-cab').boundingBox()
  await p.screenshot({ path: `${salida}/sello.png`, clip: { x: cab.x, y: cab.y, width: cab.width, height: cab.height } })
  const f = await p.locator('.crm-fichas').boundingBox()
  for (let i = 0; i < 3; i++) {
    await p.screenshot({ path: `${salida}/fichas-${i}.png`, clip: { x: f.x - 4, y: f.y - 4, width: f.width + 8, height: f.height + 14 } })
    await p.waitForTimeout(430)
  }
  // Las hojas de cuadros: una por escena, con todos sus turnos sobre el color de su ficha.
  for (const [nombre, color] of [['puertas', '#216fff'], ['agentes', '#ffcb1f'], ['billetes', '#1fce6d'], ['cobro', '#ff5240']]) {
    const n = await p.evaluate(async ([nombre, color]) => {
      const { escena } = await import('/src/crm/escenas.js')
      document.getElementById('hoja-px')?.remove()
      const hoja = document.createElement('div')
      hoja.id = 'hoja-px'
      hoja.className = `ficha ficha--${{ '#216fff': 'azul', '#ffcb1f': 'amarillo', '#1fce6d': 'verde', '#ff5240': 'rojo' }[color]}`
      hoja.style.cssText = `position:fixed;inset:0;z-index:99999;background:${color};--f:${color};overflow:auto;padding:6px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;border-radius:0;flex-direction:row;justify-content:flex-start`
      const tmp = document.createElement('div')
      tmp.innerHTML = escena(nombre)
      const svg = tmp.firstElementChild
      const usos = [...svg.querySelectorAll('use')]
      usos.forEach((u, i) => {
        const c = svg.cloneNode(true)
        c.querySelectorAll('use').forEach((x, j) => (x.style.cssText = `animation:none;visibility:${i === j ? 'visible' : 'hidden'}`))
        c.style.cssText = 'width:224px;height:88px;flex:none;outline:1px solid rgb(0 0 0 / .15)'
        hoja.appendChild(c)
      })
      document.querySelector('#app').appendChild(hoja)
      return usos.length
    }, [nombre, color])
    await p.setViewportSize({ width: 1400, height: Math.ceil(n / 6) * 94 + 12 })
    await p.waitForTimeout(150)
    await p.screenshot({ path: `${salida}/cuadros-${nombre}.png` })
    console.log(nombre, n, 'cuadros')
  }
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
