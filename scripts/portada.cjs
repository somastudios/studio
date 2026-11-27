// Fotografía la portada de una visita en sus dos tiempos y en el cambio de uno a otro.
//   node scripts/portada.cjs <puerto> <carpeta-de-salida> [negocio] [ancho] [alto]
// Deja tiempo-0.png, tiempo-1.png, regreso.png y cambio.png (la tira del paso 0 → 1).
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [, , puerto, salida, negocio = 'La Casona', ancho = '1440', alto = '810'] = process.argv
;(async () => {
  const dir = path.resolve(salida)
  fs.mkdirSync(dir, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
  })
  await p.goto(`http://localhost:${puerto}/#/presala`)
  await p.waitForTimeout(900)
  await p.fill('#ps-negocio', negocio)
  await p.locator('[data-nicho="restaurante"]').click()
  await p.locator('[data-empezar]').click()
  await p.waitForTimeout(3200)
  await p.screenshot({ path: `${dir}/tiempo-0.png` })

  // El cambio, cuadro por cuadro: se detiene el reloj de GSAP y se avanza a mano.
  await p.evaluate(() => window.__gsap?.ticker && 0)
  const celdas = []
  await p.keyboard.press('ArrowRight')
  const t0 = Date.now()
  for (const ms of [120, 300, 500, 700, 900, 1150, 1450, 2200]) {
    const falta = ms - (Date.now() - t0)
    if (falta > 0) await p.waitForTimeout(falta)
    const f = `${dir}/_c${celdas.length}.png`
    await p.screenshot({ path: f })
    celdas.push('<div style="position:relative"><img src="file://' + f + '" style="width:100%;display:block"><b style="position:absolute;left:4px;top:3px;background:#fff;color:#000;padding:0 4px">' + ms + ' ms</b></div>')
  }
  await p.waitForTimeout(800)
  await p.screenshot({ path: `${dir}/tiempo-1.png` })
  // a la siguiente escena y de regreso: debe volver al tiempo 1
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(1800)
  await p.keyboard.press('ArrowLeft')
  await p.waitForTimeout(2600)
  await p.screenshot({ path: `${dir}/regreso.png` })
  await p.keyboard.press('ArrowLeft')
  await p.waitForTimeout(2000)
  await p.screenshot({ path: `${dir}/regreso-0.png` })
  console.log('errores:', errores.length ? [...new Set(errores)].join(' | ') : 0)
  fs.writeFileSync(dir + '/_h.html', '<body style="margin:0;background:#888;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:4px">' + celdas.join('') + '</div></body>')
  const h = await b.newPage({ viewport: { width: 1400, height: 600 } })
  await h.goto('file://' + dir + '/_h.html')
  await h.waitForTimeout(300)
  await h.screenshot({ path: dir + '/cambio.png', fullPage: true })
  await b.close()
})()
