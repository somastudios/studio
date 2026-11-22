// Congela la escena de Claude (al pie de Ajustes) en instantes exactos y captura cada uno.
//   T="1.5,4.4,11.5" node scripts/escena.cjs <puerto> <carpeta> [ancho] [alto] [escala]
// Congela la escena en instantes exactos y captura cada uno.
const { chromium } = require('playwright')
;(async () => {
  const [puerto, salida, ancho = '1100', alto = '700', escala = '2'] = process.argv.slice(2)
  require('fs').mkdirSync(salida, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: +escala })
  const errores = []
  p.on('pageerror', (e) => errores.push('error: ' + e.message))
  await p.addInitScript(() => { localStorage.setItem('soma.local', '1'); localStorage.setItem('soma.nombre', 'Dalí') })
  await p.goto(`http://localhost:${puerto}/#/crm/ajustes`)
  await p.waitForTimeout(1800)
  await p.evaluate(() => document.querySelector('.crm-firma').scrollIntoView({ block: 'center' }))
  await p.waitForTimeout(300)
  const tiempos = (process.env.T || '0.4,1.28,1.5,2.35,3.45,4.42,6.1,8.4,10.2,10.82,11.0,11.55,12.4,14.1').split(',').map(Number)
  const dur = await p.evaluate(() => document.querySelector('.crm-escena')._linea.duration())
  for (const [i, t] of tiempos.entries()) {
    await p.evaluate((t) => { const tl = document.querySelector('.crm-escena')._linea; tl.pause(t) }, t)
    await p.waitForTimeout(80)
    await p.locator('.crm-escena').screenshot({ path: `${salida}/${String(i).padStart(2, '0')}-${String(t).replace('.', '_')}.png` })
  }
  console.log('duración', dur.toFixed(2), errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
})()
