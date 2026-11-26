// Tira de cuadros: detiene la página en varios instantes y junta las fotos de un lienzo en una
// sola hoja, para revisar una animación sin verla moverse.
//
//   node tira.cjs <pagina.html | url> <selector> <desde> <hasta> [cuadros=12] [columnas=4] [light|dark] [escala=1] [salida.png]
//   node tira.cjs pagina.html '#corto' 0.7,1.5,3.2 - 0 3 light 1.4 cerca.png     ← instantes sueltos, más grandes
//
// La página tiene que usar trazo.js (o exponer window.trazo.fija). Los tiempos son del reloj
// global en segundos: un corto de 14 s va de 0 a 14 y luego se repite.
const { chromium } = require('playwright')
const fs = require('fs')
const os = require('os')
const path = require('path')
const [, , pagina, selector, desde = '0', hasta = '4', n = '12', cols = '4', tema = 'light', escala = '1', salida = 'tira.png'] = process.argv
;(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tira-'))
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: +escala, colorScheme: tema })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.goto(/^https?:/.test(pagina) ? pagina : 'file://' + path.resolve(pagina))
  await p.waitForTimeout(400)
  const el = p.locator(selector).first()
  const celdas = []
  // con una lista («0.7,1.5,3.2») se fotografían justo esos instantes
  const instantes = desde.includes(',') ? desde.split(',').map(Number) : Array.from({ length: +n }, (_, i) => (+n === 1 ? +desde : +desde + ((+hasta - +desde) * i) / (+n - 1)))
  for (let i = 0; i < instantes.length; i++) {
    const t = instantes[i]
    await p.evaluate((s) => (window.Trazo || window.trazo).fija(s), t)
    const f = path.join(dir, i + '.png')
    await el.screenshot({ path: f })
    celdas.push('<div style="position:relative"><img src="file://' + f + '" style="width:100%;display:block"><b style="position:absolute;left:4px;top:3px;background:#fff;color:#000;padding:0 4px">' + t.toFixed(2) + '</b></div>')
  }
  console.log('errores:', errores.length ? [...new Set(errores)].join(' | ') : 0, '· desplazamiento lateral:', await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
  const hoja = path.join(dir, 'hoja.html')
  fs.writeFileSync(hoja, '<body style="margin:0;background:#888;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:4px;padding:4px">' + celdas.join('') + '</div></body>')
  const h = await b.newPage({ viewport: { width: 1200, height: 600 } })
  await h.goto('file://' + hoja)
  await h.waitForTimeout(300)
  await h.screenshot({ path: salida, fullPage: true })
  await b.close()
  console.log('hoja:', salida)
})()
