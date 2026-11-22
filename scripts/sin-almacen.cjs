// Abre la versión compilada dentro de un marco aislado (sin almacenamiento del navegador),
// como la muestran algunas vistas previas, y comprueba que se puede entrar y llegar a la presala.
//   node scripts/sin-almacen.cjs <puerto-de-vite-preview> <carpeta-de-salida>
const { chromium } = require('playwright')
const fs = require('fs')

;(async () => {
  const [puerto, salida] = process.argv.slice(2)
  fs.mkdirSync(salida, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } })
  const errores = []
  p.on('pageerror', (e) => errores.push('error: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && !/supabase|Failed to load|ERR_|net::/i.test(m.text()) && errores.push('consola: ' + m.text()))
  await p.setContent(`<body style="margin:0"><iframe sandbox="allow-scripts allow-forms" src="http://localhost:${puerto}/" style="border:0;width:100vw;height:100vh"></iframe></body>`)
  const f = p.frameLocator('iframe')
  await p.waitForTimeout(3500)
  await p.screenshot({ path: `${salida}/0-llegada.png` })
  const paso = async (nombre, sel, espera = 1200) => {
    try {
      await f.locator(sel).first().click({ timeout: 5000 })
    } catch (e) {
      errores.push(`${nombre}: no se pudo tocar ${sel}`)
    }
    await p.waitForTimeout(espera)
    await p.screenshot({ path: `${salida}/${nombre}.png` })
  }
  await paso('1-entrar-local', '[data-local]')
  await paso('2-nueva-visita', 'a[href="#/presala"]')
  try {
    await f.locator('#ps-negocio').fill('La Casona', { timeout: 4000 })
  } catch {
    errores.push('presala: no apareció el campo del negocio')
  }
  await paso('3-giro', '[data-nicho="restaurante"]', 600)
  await paso('4-empezar', '[data-empezar]', 3500)
  console.log(errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
})()
