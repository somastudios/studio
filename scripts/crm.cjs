// Llena el CRM con datos de ejemplo (solo en el navegador de prueba) y captura cada pantalla.
//   node scripts/crm.cjs <puerto> <carpeta-de-salida> [ancho] [alto]
const { chromium } = require('playwright')
const fs = require('fs')

;(async () => {
  const [puerto, salida, ancho = '1440', alto = '900'] = process.argv.slice(2)
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
  await p.goto(`http://localhost:${puerto}/#/crm`)
  await p.waitForTimeout(800)

  const ids = await p.evaluate(async () => {
    const { store } = await import('/src/data/store.js')
    const d = (n) => {
      const x = new Date()
      x.setDate(x.getDate() + n)
      return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    }
    const a = store.guardar('prospectos', { negocio: 'La Casona', nicho: 'restaurante', etapa: 'cliente', contacto: 'Rosa Elizondo', puesto: 'Dueña', telefono: '523411234567', alcance: 'Advanced', presupuesto: 'De $10 a $25 mil', modalidad_interes: 'mensual' })
    const b2 = store.guardar('prospectos', { negocio: 'Barbería El Patrón', nicho: 'barberia', etapa: 'demo', contacto: 'Iván Ochoa', telefono: '523419876543', proxima_accion: 'Terminar la demo de agenda' })
    const c = store.guardar('prospectos', { negocio: 'Farmacia San Rafael', nicho: 'farmacia', etapa: 'visitado', contacto: 'Lic. Sandoval' })
    store.guardar('prospectos', { negocio: 'Ferretería El Tornillo', nicho: 'ferreteria', etapa: 'nuevo' })
    const v = store.guardar('visitas', { prospecto_id: a.id, tipo: 1, inicio: new Date(Date.now() - 9 * 864e5).toISOString(), fin: new Date(Date.now() - 9 * 864e5 + 24 * 6e4).toISOString(), presentadores: ['dali'], graba: false, estado: 'terminada', animo: 'abierto', resultado: 'agendo', notas: 'Le brillaron los ojos con las comandas en el celular. Decide ella; el hijo opina.' })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'atencion', problema_id: 'servicio-lento', titulo: 'El servicio en mesa es lento', matices: { solo: false }, etiquetas: ['Prefieren que los atiendan'], rutas: [{ sol: 'comandero', reaccion: 'interesa' }, { sol: 'pedidos-qr', reaccion: 'no' }], elegida: 'comandero', nota: 'En domingo no se dan abasto', estado: 'explorado', orden: 0 })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'inventarios', problema_id: 'se-acaba-insumo', titulo: 'Se acaban ingredientes sin aviso', matices: {}, etiquetas: [], rutas: [{ sol: 'inventario-alertas', reaccion: 'interesa' }], elegida: 'inventario-alertas', estado: 'explorado', orden: 1 })
    store.guardar('hallazgos', { prospecto_id: a.id, visita_id: v.id, area: 'rentabilidad', problema_id: 'vendo-mucho-queda-poco', titulo: 'Se vende mucho y queda poco', estado: 'mencionado', orden: 100 })
    const pr = store.guardar('propuestas', { prospecto_id: a.id, titulo: 'Sistema para La Casona', resumen: 'Comandas en el celular de los meseros e inventario con alertas.', incluye: ['Comandas en el celular para 6 meseros', 'Pantalla de cocina', 'Inventario con alertas por WhatsApp', 'Capacitación al equipo'], precio_contado: 18000, precio_mensual: 1800, desc_6: 10, desc_12: 20, prueba_dias: 7, mantenimiento: 'Soporte por WhatsApp y correcciones sin costo durante 3 meses.', estado: 'aceptada', modalidad: 'mensual' })
    const s = store.guardar('sistemas', { prospecto_id: a.id, nombre: 'Comandas La Casona', url: 'https://lacasona.example', estado: 'activo', llave: 'soma_ejemplo123', modo_vencido: 'aviso', ultima_senal: new Date(Date.now() - 40 * 6e4).toISOString(), version: '1.2.0' })
    const m = store.guardar('membresias', { prospecto_id: a.id, sistema_id: s.id, propuesta_id: pr.id, modalidad: 'mensual', monto: 1800, moneda: 'MXN', inicio: d(-33), vence: d(-3), estado: 'activa', auto: false })
    store.guardar('pagos', { prospecto_id: a.id, membresia_id: m.id, concepto: 'Membresía mensual', monto: 1800, moneda: 'MXN', metodo: 'transferencia', estado: 'confirmado', fecha: d(-33), referencia: 'SPEI 88213', registrado_por: 'Dalí', cubre_hasta: d(-3) })
    const m2 = store.guardar('membresias', { prospecto_id: b2.id, modalidad: 'prueba', monto: 0, inicio: d(-2), vence: d(5), estado: 'prueba' })
    store.guardar('citas', { prospecto_id: b2.id, tipo: 'visita2', inicio: new Date(new Date(d(2) + 'T17:00:00')).toISOString(), minutos: 45, lugar: 'Barbería El Patrón', estado: 'pendiente' })
    store.guardar('citas', { prospecto_id: c.id, tipo: 'seguimiento', inicio: null, por_mensaje: true, estado: 'pendiente' })
    store.anotar(a.id, 'visita', 'Primera visita completada.', null, 'Dalí')
    store.anotar(a.id, 'membresia', 'Se activó: Membresía mensual, $1,800.', null, 'Alex')
    return { a: a.id, m: m.id }
  })

  let n = 0
  const foto = async (ruta, nombre, clics = []) => {
    await p.goto(`http://localhost:${puerto}/#${ruta}`)
    await p.waitForTimeout(700)
    for (const sel of clics) {
      try {
        await p.locator(sel).first().click({ timeout: 4000 })
        await p.waitForTimeout(500)
      } catch (e) {
        errores.push(`${nombre}: no se pudo tocar ${sel}`)
      }
    }
    await p.screenshot({ path: `${salida}/${String(n++).padStart(2, '0')}-${nombre}.png` })
    await p.keyboard.press('Escape')
    await p.waitForTimeout(250)
  }
  await foto('/crm', 'hoy')
  await foto('/crm/prospectos', 'prospectos')
  await foto(`/crm/prospecto/${ids.a}`, 'expediente')
  await foto(`/crm/prospecto/${ids.a}?t=visitas`, 'expediente-visitas')
  await foto(`/crm/prospecto/${ids.a}?t=propuesta`, 'expediente-propuesta')
  await foto(`/crm/prospecto/${ids.a}?t=propuesta`, 'dlg-propuesta', ['[data-propuesta]'])
  await foto(`/crm/prospecto/${ids.a}?t=cuenta`, 'expediente-cuenta')
  await foto(`/crm/prospecto/${ids.a}?t=bitacora`, 'expediente-bitacora')
  await foto('/crm/agenda', 'agenda')
  await foto('/crm/cobranza', 'cobranza')
  await foto('/crm/cobranza', 'dlg-pago', ['[data-pagar]'])
  await foto('/crm/cobranza', 'dlg-aviso', ['[data-avisar]'])
  await foto('/crm/cobranza', 'pagos', ['[data-tab="pagos"]'])
  await foto('/crm/sistemas', 'sistemas')
  await foto('/crm/sistemas', 'dlg-conectar', ['[data-conectar]'])
  await foto('/crm/sistemas', 'dlg-accesos', ['[data-accesos]'])
  await foto('/crm/ajustes', 'ajustes')
  await foto('/entrar', 'entrar')

  // Registrar un pago en efectivo y comprobar que la membresía se extiende un mes.
  await p.goto(`http://localhost:${puerto}/#/crm/cobranza`)
  await p.waitForTimeout(600)
  await p.locator('[data-pagar]').first().click()
  await p.waitForTimeout(400)
  await p.locator('.dlg [data-m="efectivo"]').click()
  await p.locator('.dlg [data-accion="ok"]').click()
  await p.waitForTimeout(600)
  const tras = await p.evaluate(async (id) => {
    const { store } = await import('/src/data/store.js')
    const { estadoMembresia } = await import('/src/crm/cobranza.js')
    const m = store.uno('membresias', id)
    return { vence: m.vence, estado: estadoMembresia(m).texto, pagos: store.lista('pagos', { membresia_id: id }).length }
  }, ids.m)
  console.log('tras el pago:', JSON.stringify(tras))
  await p.screenshot({ path: `${salida}/${String(n++).padStart(2, '0')}-cobranza-pagada.png` })

  console.log(errores.length ? errores.join('\n') : 'sin errores')
  await b.close()
})()
