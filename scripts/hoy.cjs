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
  // Las hojas de cuadros: una por escena, sobre el color de su ficha. De la película se
  // muestran todos; `desde` y `hasta` (6.º y 7.º argumento) acotan el tramo.
  const [desde = '0', hasta = '9999'] = process.argv.slice(7)
  for (const [nombre, color] of [['puertas', '#216fff'], ['agentes', '#ffcb1f'], ['billetes', '#1fce6d'], ['cobro', '#ff5240']]) {
    const info = await p.evaluate(async ([nombre, color, desde, hasta]) => {
      const { escena, pelicula, pinta } = await import('/src/crm/escenas.js')
      escena(nombre)
      const peli = pelicula(nombre)
      document.getElementById('hoja-px')?.remove()
      const hoja = document.createElement('div')
      hoja.id = 'hoja-px'
      hoja.style.cssText = `position:fixed;inset:0;z-index:99999;background:${color};overflow:auto;padding:6px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start`
      const a = Math.max(0, +desde)
      const b = Math.min(peli.n, +hasta)
      // A 60 por segundo hay cinco pasos por cuadro: en la hoja basta uno de cada cinco.
      const salto = peli.fps > 30 ? 5 : 1
      for (let i = a * salto; i < Math.min(peli.n, b * salto); i += salto) {
        const c = document.createElement('canvas')
        c.width = peli.w
        c.height = peli.h
        c.style.cssText = `width:${peli.w * 4}px;height:${peli.h * 4}px;flex:none;image-rendering:pixelated;outline:1px solid rgb(0 0 0 / .2)`
        pinta(c, nombre, i)
        hoja.appendChild(c)
      }
      document.querySelector('#app').appendChild(hoja)
      return { n: Math.ceil((Math.min(peli.n, b * salto) - a * salto) / salto), w: peli.w * 4 + 6, h: peli.h * 4 + 6, total: peli.n }
    }, [nombre, color, desde, hasta])
    const cols = Math.max(1, Math.floor(1400 / info.w))
    await p.setViewportSize({ width: cols * info.w + 12, height: Math.ceil(info.n / cols) * info.h + 12 })
    await p.waitForTimeout(150)
    await p.screenshot({ path: `${salida}/cuadros-${nombre}.png` })
    console.log(nombre, info.total, 'cuadros')
  }
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
