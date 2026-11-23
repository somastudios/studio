//   node scripts/vinetas.cjs <puerto> <carpeta>
// Fotos de las viñetas de cada sección: cada plano en cuatro momentos (al abrir el iris, a
// media acción, casi al final y justo antes del corte).
const { chromium } = require('playwright')
const RUTAS = [['prospectos', '/crm/prospectos'], ['agenda', '/crm/agenda'], ['cobranza', '/crm/cobranza'], ['sistemas', '/crm/sistemas'], ['ajustes', '/crm/ajustes']]
;(async () => {
  const [puerto, salida] = process.argv.slice(2)
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.addInitScript(() => { localStorage.setItem('soma.local', '1'); localStorage.setItem('soma.nombre', 'Alex') })
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(1200)
  for (const [nombre, ruta] of RUTAS) {
    await p.evaluate((r) => (location.hash = '#' + r), ruta)
    await p.waitForTimeout(2300)
    const caja = await p.locator('.vn').boundingBox()
    if (!caja) { errores.push(`${nombre}: sin viñeta`); continue }
    let n = 0
    for (const plano of [0, 1, 2])
      for (const t of [0.25, 1.4, 2.5, 3.2]) {
        await p.evaluate((x) => { document.querySelector('.vn')._tl.pause(x) }, plano * 3.6 + t)
        await p.waitForTimeout(450)
        await p.screenshot({ path: `${salida}/${nombre}-${String(n++).padStart(2, '0')}.png`, clip: caja })
      }
  }
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
