// Recorre una primera visita completa (presala → cierre) y guarda una captura de cada paso.
//   node scripts/recorrido.cjs <puerto> <carpeta-de-salida> [nicho] [ancho] [alto]
const { chromium } = require('playwright')
const fs = require('fs')

;(async () => {
  const [puerto, salida, nicho = 'restaurante', ancho = '1440', alto = '810'] = process.argv.slice(2)
  fs.mkdirSync(salida, { recursive: true })
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', (e) => errores.push('error: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && !/supabase|Failed to load|ERR_|net::/i.test(m.text()) && errores.push('consola: ' + m.text()))
  await p.addInitScript(() => {
    localStorage.setItem('soma.local', '1')
    localStorage.setItem('soma.nombre', 'Dalí')
  })
  let n = 0
  const foto = async (nombre, espera = 1900) => {
    await p.waitForTimeout(espera)
    await p.screenshot({ path: `${salida}/${String(n++).padStart(2, '0')}-${nombre}.png` })
  }
  const toca = async (sel, i = 0) => {
    try {
      await p.locator(sel).nth(i).click({ timeout: 4000 })
      await p.waitForTimeout(450)
    } catch (e) {
      errores.push(`no se pudo tocar ${sel}[${i}]: ${e.message.split('\n')[0]}`)
    }
  }
  const sigue = async () => {
    await p.keyboard.press('ArrowRight')
  }

  await p.goto(`http://localhost:${puerto}/#/presala`)
  await p.waitForTimeout(900)
  await p.fill('#ps-negocio', 'La Casona')
  await toca(`[data-nicho="${nicho}"]`)
  await foto('presala', 600)
  await toca('[data-empezar]')
  await foto('portada', 3200)
  await sigue()
  await foto('acuerdo', 2600)
  await sigue(); await p.waitForTimeout(800); await sigue(); await p.waitForTimeout(800)
  await sigue()
  await foto('premisa', 3200)
  await sigue()
  await foto('suele', 2600)
  await toca('.vs-item', 0); await toca('.vs-item', 2); await toca('.vs-item', 3)
  await foto('suele-marcado', 900)
  await sigue()
  await foto('diagnostico', 3000)
  await toca('[data-m][data-v="0"]', 0)
  await foto('diagnostico-matiz', 1600)
  await toca('[data-demo]')
  await foto('demo', 1600)
  await toca('[data-cerrar-demo="interesa"]')
  await foto('diagnostico-interesa', 1200)
  await sigue()
  await p.waitForTimeout(900)
  for (let k = 0; k < 4; k++) await toca('[data-voto="no"]')
  await foto('diagnostico-medida', 1200)
  await sigue(); await p.waitForTimeout(900)
  await sigue()
  await foto('ronda', 2800)
  await toca('.vr-item [data-v="1"]', 0)
  await sigue()
  await foto('metodo', 3000)
  for (let k = 0; k < 4; k++) { await sigue(); await p.waitForTimeout(1100) }
  // Los espacios en construcción (si están encendidos en src/config.js).
  await sigue()
  if (await p.locator('.ve').count()) {
    await foto('espacio-trabajo', 2600)
    await sigue()
    await foto('espacio-casos', 2600)
    await sigue()
  }
  await foto('alcance', 2800)
  await toca('[data-alcance]', 1); await toca('[data-presupuesto]', 1); await toca('[data-forma="mensual"]')
  await foto('alcance-elegido', 900)
  await sigue()
  await foto('expediente', 3400)
  await sigue()
  await foto('agenda', 2800)
  await toca('[data-dia]', 3); await toca('[data-hora]:not([disabled])', 5)
  await p.fill('[name="contacto"]', 'Rosa Elizondo'); await p.fill('[name="telefono"]', '341 123 4567')
  await toca('[data-decide="no"]'); await p.fill('[name="decisor"]', 'Don Ernesto')
  await toca('[data-agendar]')
  await foto('agenda-lista', 1000)
  await p.locator('.vg-h').click().catch(() => {})
  await sigue()
  await foto('cierre', 3400)
  await toca('[data-act="salir"]')
  await foto('debrief', 1200)
  await toca('[data-animo="abierto"]'); await toca('[data-guardar]')
  await foto('expediente-crm', 1200)
  await toca('[data-tab="construir"]')
  await foto('expediente-construir', 900)
  if (process.env.PROMPT) console.log(await p.locator('[data-prompt]').inputValue())

  const datos = await p.evaluate(() => ({
    prospectos: JSON.parse(localStorage.getItem('soma.db.prospectos') || '[]').length,
    visitas: JSON.parse(localStorage.getItem('soma.db.visitas') || '[]').map((v) => v.estado),
    hallazgos: JSON.parse(localStorage.getItem('soma.db.hallazgos') || '[]').filter((h) => !h.eliminado).map((h) => `${h.titulo} → ${h.elegida || (h.a_medida ? 'a medida' : h.estado)}`),
    citas: JSON.parse(localStorage.getItem('soma.db.citas') || '[]').length,
    cola: JSON.parse(localStorage.getItem('soma.cola') || '[]').length,
  }))
  console.log(JSON.stringify(datos, null, 1))
  console.log(errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
})()
