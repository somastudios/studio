//   node scripts/ancho.cjs <puerto> [anchos separados por coma]
// Busca desplazamiento lateral en el CRM de la manera que lo sufre un teléfono: en cada
// sección mide, cuadro por cuadro mientras dura la entrada y luego en reposo, cuánto se puede
// desplazar la página hacia los lados. Cualquier cosa mayor a cero es un desborde.
const { chromium } = require('playwright')
const RUTAS = ['/crm', '/crm/prospectos', '/crm/agenda', '/crm/cobranza', '/crm/sistemas', '/crm/ajustes', '/presala']
;(async () => {
  const [puerto, anchos = '320,360,390,412,768,1440'] = process.argv.slice(2)
  const b = await chromium.launch()
  let malos = 0
  for (const ancho of anchos.split(',').map(Number)) {
    const p = await b.newPage({ viewport: { width: ancho, height: ancho < 700 ? 780 : 900 }, isMobile: ancho < 700, hasTouch: ancho < 700 })
    await p.addInitScript(() => {
      localStorage.setItem('soma.local', '1')
      localStorage.setItem('soma.nombre', 'Maximiliano')
    })
    await p.goto(`http://localhost:${puerto}/#/entrar`)
    await p.waitForTimeout(500)
    await p.evaluate(async () => {
      const { store } = await import('/src/data/store.js')
      const a = store.guardar('prospectos', { negocio: 'Restaurante La Casona de los Abuelos', nicho: 'restaurante', etapa: 'cliente' })
      store.guardar('prospectos', { negocio: 'Barbería El Patrón', nicho: 'barberia', etapa: 'demo' })
      const m = store.guardar('membresias', { prospecto_id: a.id, modalidad: 'anual', monto: 172800, estado: 'activa', vence: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10) })
      store.guardar('pagos', { prospecto_id: a.id, membresia_id: m.id, monto: 1728000, metodo: 'transferencia', estado: 'pagado', fecha: new Date().toISOString().slice(0, 10), pagado: new Date().toISOString() })
    })
    for (const ruta of RUTAS) {
      await p.evaluate((r) => (location.hash = '#' + r), ruta)
      const r = await p.evaluate(async () => {
        const cajas = () => [document.scrollingElement, document.body, document.querySelector('#app'), document.querySelector('.crm-main')].filter(Boolean)
        let peor = 0
        let quien = ''
        const fin = performance.now() + 2600
        await new Promise((ok) => {
          const paso = () => {
            for (const c of cajas()) {
              // Solo cuenta si de verdad se puede desplazar: lo recortado con «clip» no se mueve.
              let d = c.scrollWidth - c.clientWidth
              if (d > 0) {
                const antes = c.scrollLeft
                c.scrollLeft = antes + d
                d = c.scrollLeft - antes
                c.scrollLeft = antes
              }
              if (d > peor) {
                peor = d
                quien = c.id || c.className || c.tagName
              }
            }
            performance.now() < fin ? requestAnimationFrame(paso) : ok()
          }
          requestAnimationFrame(paso)
        })
        // Lo que de verdad se sale, en reposo.
        const w = innerWidth
        const fuera = []
        document.querySelectorAll('#app *').forEach((el) => {
          const c = el.getBoundingClientRect()
          if (!c.width || getComputedStyle(el).position === 'fixed') return
          let a = el.parentElement
          let recortado = false
          while (a && a.id !== 'app') {
            const o = getComputedStyle(a)
            if (/hidden|clip|auto|scroll/.test(o.overflowX)) {
              const ca = a.getBoundingClientRect()
              if (ca.right <= w + 1 && ca.left >= -1) recortado = true
            }
            a = a.parentElement
          }
          if (!recortado && (c.right > w + 1 || c.left < -1)) fuera.push(`${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(' ')[0]} ${Math.round(c.left)}→${Math.round(c.right)}`)
        })
        return { peor, quien, fuera: [...new Set(fuera)].slice(0, 4) }
      })
      if (r.peor > 0 || r.fuera.length) {
        malos++
        console.log(`${ancho}px ${ruta}: se desplaza ${r.peor}px (${r.quien}) ${r.fuera.join(' | ')}`)
      }
    }
    await p.close()
  }
  console.log(malos ? `${malos} con desborde` : 'sin desplazamiento lateral en ningún ancho')
  await b.close()
})()
