// Fotografía el dibujo de trazo vivo de una escena de la primera visita, en varios instantes.
//   node scripts/escena.cjs <puerto> <carpeta> <escena> [giro]
// <escena> es una de las claves de ESCENAS. Deja tira.png (los cuadros del dibujo), laptop.png y
// movil.png (la escena completa). Para detener el reloj usa Trazo.fija y el `_vivo` que cada
// escena deja en su <svg>.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [, , puerto, salida, cual, giro = 'restaurante'] = process.argv

// flechas: cuántas veces → hasta llegar; sel: el svg; cuadros(p, api): devuelve [rótulo, prepara()]
const ESCENAS = {
  premisa: {
    flechas: 5,
    sel: '.s1-tv',
    cuadros: (api) => [0.3, 0.95, 1.3, 1.6, 2.0, 2.5, 3.3, 3.8, 4.3, 4.6, 5.4, 6.2, 7.0, 7.4, 7.9].map((u) => [`${u}`, async () => (await api.vivo('desde', 300), api.fija(300 + u))]),
  },
  metodo: {
    flechas: 6,
    antes: async (p) => {
      for (let i = 0; i < 30 && !(await p.locator('.s4-tv svg').count() && await p.locator('.s4-tv').isVisible()); i++) {
        await p.keyboard.press('ArrowRight')
        await p.waitForTimeout(1500)
      }
    },
    sel: '.s4-tv',
    cuadros: (api) => {
      const c = []
      const L = [[0.6, 1.8, 3.2], [0.9, 1.9, 2.8, 3.4], [0.8, 1.45, 2.4, 3.4, 4.0], [1.0, 2.2, 2.7, 3.4], [0.9, 1.4, 1.8, 2.8]]
      for (let k = 0; k < 5; k++) {
        c.push([`→${k} · 0.45`, async () => (k ? await api.vivo('ir', k, 100 * k) : await api.vivo('pon', 0, 0), api.fija(100 * k + 0.45))])
        for (const l of L[k]) c.push([`${k} · ${l}`, () => api.fija(100 * k + (k ? 0.8 : 0.3) + l)])
      }
      return c
    },
  },
  alcance: {
    flechas: 6,
    antes: async (p) => {
      for (let i = 0; i < 30 && !(await p.locator('.vl-tv svg').count()); i++) {
        await p.keyboard.press('ArrowRight')
        await p.waitForTimeout(1500)
      }
    },
    sel: '.vl-tv',
    cuadros: (api) => {
      const c = [['0 · 2', async () => (await api.vivo('pon', 0, 0), api.fija(2))]]
      for (const k of [1, 2]) {
        for (const u of [0.3, 0.6, 1.0]) c.push([`→${k} · ${u}`, async () => (await api.vivo('ir', k, 100 * k), api.fija(100 * k + u))])
        for (const l of [0.9, 1.6, 3]) c.push([`${k} · ${l}`, () => api.fija(100 * k + 0.8 + l)])
      }
      return c
    },
    antesDeFoto: async (p) => {
      await p.keyboard.press('ArrowDown')
      await p.waitForTimeout(400)
      await p.keyboard.press('ArrowDown')
    },
  },
  suele: {
    flechas: 6,
    sel: '.vs-tv',
    cuadros: (api) => {
      const c = []
      for (const k of [0, 1, 2, 3, 4, 6]) {
        c.push([`${k} · 0.2`, async () => (await api.vivo('pon', k, 100 * k + 50), api.fija(100 * k + 50.2))])
        c.push([`${k} · 1.6`, () => api.fija(100 * k + 51.6)])
      }
      c.push(['6→3 · 0.5', async () => (await api.vivo('pon', 3, 900), api.fija(900.5))])
      c.push(['3 · 2.2', () => api.fija(902.2)])
      return c
    },
    antesDeFoto: async (p) => {
      for (const i of [0, 2, 3]) await p.locator('.vs-item').nth(i).click()
    },
  },
  expediente: {
    flechas: 6,
    antes: async (p) => {
      // marca tres problemas y recorre hasta la ficha
      for (const i of [0, 2, 3]) await p.locator('.vs-item').nth(i).click()
      for (let i = 0; i < 30 && !(await p.locator('.ve-der svg').count()); i++) {
        await p.keyboard.press('ArrowRight')
        await p.waitForTimeout(1500)
      }
    },
    sel: '.ve-der',
    quieto: ['.ve-vivo', '.ve-ficha'],
    todo: true,
    cuadros: (api) => [0.2, 0.7, 0.95, 1.08, 1.25, 1.45, 1.7, 2.0, 2.3, 2.6].map((u) => [`${u}`, async () => (await api.vivo('desde', 500), api.fija(500 + u))]),
  },
}

;(async () => {
  const E = ESCENAS[cual]
  if (!E) throw new Error('escena desconocida: ' + cual + ' (hay ' + Object.keys(ESCENAS).join(', ') + ')')
  const dir = path.resolve(salida)
  fs.mkdirSync(dir, { recursive: true })
  const b = await chromium.launch()
  const errores = []
  const llega = async (vp) => {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 })
    p.on('pageerror', (e) => errores.push(e.message))
    await p.addInitScript(() => {
      localStorage.setItem('soma.local', '1')
      localStorage.setItem('soma.nombre', 'Dalí')
    })
    await p.goto(`http://localhost:${puerto}/#/presala`)
    await p.waitForTimeout(900)
    await p.fill('#ps-negocio', 'La Casona')
    await p.locator(`[data-nicho="${giro}"]`).click()
    await p.locator('[data-empezar]').click()
    await p.waitForTimeout(2800)
    for (let i = 0; i < E.flechas; i++) {
      await p.keyboard.press('ArrowRight')
      await p.waitForTimeout(i < 2 ? 2400 : 1500)
    }
    if (E.antes) await E.antes(p)
    await p.waitForTimeout(1600)
    return p
  }

  const p = await llega({ width: 1440, height: 810 })
  const api = {
    vivo: (fn, ...args) => p.evaluate(([s, f, a]) => document.querySelector(s + ' svg')._vivo[f](...a), [E.sel, fn, args]),
    fija: (s) => p.evaluate((x) => window.Trazo.fija(x), s),
  }
  if (E.quieto) {
    // la escena ya terminó de entrar: se deja a la vista solo el dibujo
    await p.waitForTimeout(4500)
    await p.evaluate(([ver, tapar]) => {
      window.__gsap.set(document.querySelector(ver), { autoAlpha: 1, y: 0 })
      window.__gsap.set(document.querySelector(tapar), { autoAlpha: 0.12 })
    }, E.quieto)
  }
  const celdas = []
  for (const [rotulo, prepara] of E.cuadros(api)) {
    await prepara()
    await p.waitForTimeout(60)
    const f = `${dir}/_${celdas.length}.png`
    if (E.todo) await p.screenshot({ path: f })
    else await p.locator(E.sel).screenshot({ path: f })
    celdas.push('<div style="position:relative"><img src="file://' + f + '" style="width:100%;display:block"><b style="position:absolute;left:4px;top:3px;background:#fff;color:#000;padding:0 4px">' + rotulo + '</b></div>')
  }
  fs.writeFileSync(dir + '/_h.html', '<body style="margin:0;background:#888;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(' + (E.todo ? 4 : 6) + ',1fr);gap:4px;padding:4px">' + celdas.join('') + '</div></body>')
  const h = await b.newPage({ viewport: { width: 1500, height: 600 } })
  await h.goto('file://' + dir + '/_h.html')
  await h.waitForTimeout(300)
  await h.screenshot({ path: dir + '/tira.png', fullPage: true })
  await p.close()

  // la escena completa, andando, en laptop y en celular
  for (const [nombre, vp] of [['laptop', { width: 1440, height: 810 }], ['movil', { width: 390, height: 800 }]]) {
    const q = await llega(vp)
    if (E.antesDeFoto) await E.antesDeFoto(q)
    await q.waitForTimeout(2600)
    await q.screenshot({ path: `${dir}/${nombre}.png` })
    await q.close()
  }
  console.log('errores:', errores.length ? [...new Set(errores)].join(' | ') : 0)
  await b.close()
})()
