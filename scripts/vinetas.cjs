//   node scripts/vinetas.cjs <puerto> <carpeta>
// Fotos de las viñetas de cada sección: doce momentos repartidos a lo largo de la animación.
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
    const dura = await p.evaluate(() => document.querySelector('.vn')._tl.duration())
    for (let n = 0; n < 12; n++) {
      await p.evaluate((x) => { document.querySelector('.vn')._tl.pause(x) }, ((n + 0.75) / 12) * dura)
      await p.waitForTimeout(420)
      await p.screenshot({ path: `${salida}/${nombre}-${String(n).padStart(2, '0')}.png`, clip: caja })
    }
  }
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
