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
  // La hoja de cuadros: cada escena, todos sus turnos, sobre el color de su ficha.
  await p.evaluate(async () => {
    const { pixel } = await import('/src/crm/pixel.js')
    const hoja = document.createElement('div')
    hoja.id = 'hoja-px'
    hoja.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#efece4;overflow:auto;padding:10px;display:grid;gap:8px'
    for (const [nombre, color] of [['moto', 'azul'], ['tienda', 'amarillo'], ['moneda', 'verde'], ['arena', 'rojo']]) {
      const tmp = document.createElement('div')
      tmp.innerHTML = pixel(nombre)
      const svg = tmp.firstElementChild
      const usos = [...svg.querySelectorAll('use')]
      const fila = document.createElement('div')
      fila.className = `ficha ficha--${color}`
      fila.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:8px;min-height:0;border-radius:8px;box-shadow:none'
      usos.forEach((u, i) => {
        const c = svg.cloneNode(true)
        c.querySelectorAll('use').forEach((x, j) => (x.style.cssText = `animation:none;visibility:${i === j ? 'visible' : 'hidden'}`))
        c.style.cssText = 'width:100px;height:100px;flex:none;background:rgb(255 255 255 / .08)'
        fila.appendChild(c)
      })
      hoja.appendChild(fila)
    }
    document.body.appendChild(hoja)
  })
  await p.setViewportSize({ width: 900, height: 1000 })
  await p.waitForTimeout(200)
  await p.screenshot({ path: `${salida}/cuadros.png`, fullPage: false })
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
