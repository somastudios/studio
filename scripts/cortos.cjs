// Fotografía los cortos de portada de todas las familias en varios instantes.
//   node scripts/cortos.cjs <puerto> <salida.png> [segundos separados por coma]
const { chromium } = require('playwright')
const [, , puerto, salida, lista = '0.4,2.4,3.6,5.0,6.3,7.6,9.0,9.9'] = process.argv
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1320, height: 260 }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  const fotos = []
  for (const t of lista.split(',')) {
    await p.goto(`http://localhost:${puerto}/scripts/cortos.html?t=${t}`)
    await p.waitForFunction(() => window.listo)
    await p.waitForTimeout(250)
    fotos.push((await p.screenshot()).toString('base64'))
  }
  const h = await b.newPage({ viewport: { width: 1320, height: 600 } })
  await h.setContent('<body style="margin:0;background:#888">' + fotos.map((f, i) => `<div style="position:relative"><img src="data:image/png;base64,${f}" style="display:block;width:100%"><b style="position:absolute;left:4px;top:3px;background:#fff;padding:0 4px;font:12px sans-serif">${lista.split(',')[i]} s</b></div>`).join('') + '</body>')
  await h.waitForTimeout(300)
  await h.screenshot({ path: salida, fullPage: true })
  console.log('errores:', errores.length ? [...new Set(errores)].join(' | ') : 0)
  await b.close()
})()
