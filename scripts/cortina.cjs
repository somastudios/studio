//   node scripts/cortina.cjs <puerto> <carpeta> [ancho] [alto]
// Fotos de la cortina entre secciones: de Hoy a Prospectos, cada 70 ms.
const { chromium } = require('playwright')
;(async () => {
  const [puerto, salida, ancho = '390', alto = '844'] = process.argv.slice(2)
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, isMobile: +ancho < 700, hasTouch: +ancho < 700 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.addInitScript(() => { localStorage.setItem('soma.local', '1'); localStorage.setItem('soma.nombre', 'Alex') })
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(2500)
  await p.evaluate(() => (location.hash = '#/crm/prospectos'))
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(70)
    await p.screenshot({ path: `${salida}/cortina-${String(i).padStart(2, '0')}.png` })
  }
  await p.waitForTimeout(1500)
  await p.screenshot({ path: `${salida}/cortina-fin.png` })
  console.log(errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores')
  await b.close()
})()
