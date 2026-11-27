// Fotografía «Antes de empezar»: la escena completa en cada compromiso y el dibujo grande en
// varios instantes, incluidas las transformaciones de uno a otro.
//   node scripts/acuerdo.cjs <puerto> <carpeta-de-salida> [dos]
// Deja escena-0.png, escena-1.png, escena-2.png y dibujo.png (la tira de cuadros).
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [, , puerto, salida, dos] = process.argv
;(async () => {
  const dir = path.resolve(salida)
  fs.mkdirSync(dir, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
  })
  await p.goto(`http://localhost:${puerto}/#/presala`)
  await p.waitForTimeout(900)
  await p.fill('#ps-negocio', 'La Casona')
  await p.locator('[data-nicho="restaurante"]').click()
  if (dos) await p.locator('[data-va]').nth(1).click()
  await p.locator('[data-empezar]').click()
  await p.waitForTimeout(2600)
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(3200)

  const celdas = []
  const foto = async (rotulo) => {
    const f = `${dir}/_${celdas.length}.png`
    await p.locator('.va-tv').screenshot({ path: f })
    celdas.push('<div style="position:relative"><img src="file://' + f + '" style="width:100%;display:block"><b style="position:absolute;left:4px;top:3px;background:#fff;color:#000;padding:0 4px">' + rotulo + '</b></div>')
  }
  const vivo = (fn, ...args) => p.evaluate(([f, a]) => document.querySelector('.va-tv svg')._vivo[f](...a), [fn, args])
  const fija = (s) => p.evaluate((x) => window.Trazo.fija(x), s)
  // el reloj del dibujo: el bucle de cada paso empieza 0.3 s después de `desde`
  const BUCLE = [[0.9, 1.75, 2.1, 2.7, 3.6, 4.6], [0.8, 1.7, 2.6, 3.5, 3.95, 4.9], [0.7, 1.2, 1.6, 2.4, 3.2, 4.9]]
  for (let k = 0; k < 3; k++) {
    await vivo('desde', 0)
    for (const L of BUCLE[k]) {
      await fija(L + 0.3)
      await foto(`${k} · ${L}`)
    }
    await fija(BUCLE[k][3] + 0.3)
    await p.screenshot({ path: `${dir}/escena-${k}.png` })
    if (k < 2) {
      // la transformación al siguiente, con el reloj detenido en cuatro instantes
      await vivo('ir', k + 1, 100)
      for (const u of [0.2, 0.4, 0.6, 0.95]) {
        await fija(100 + u)
        await foto(`${k}→${k + 1} · ${u}`)
      }
      await vivo('ir', k, 200)
      await p.evaluate(() => window.Trazo.sigue())
      await p.keyboard.press('ArrowDown')
      await p.waitForTimeout(1500)
    }
  }
  console.log('errores:', errores.length ? [...new Set(errores)].join(' | ') : 0)
  fs.writeFileSync(dir + '/_h.html', '<body style="margin:0;background:#888;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:4px">' + celdas.join('') + '</div></body>')
  const h = await b.newPage({ viewport: { width: 1300, height: 600 } })
  await h.goto('file://' + dir + '/_h.html')
  await h.waitForTimeout(300)
  await h.screenshot({ path: dir + '/dibujo.png', fullPage: true })
  await b.close()
})()
