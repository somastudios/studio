import { montarDeck } from '../deck/montar.js'
import { ir } from '../app/router.js'
import { abrirCapa } from '../app/capas.js'
import { store } from '../data/store.js'
import { sesion } from '../app/sesion.js'
import { nicho as nichoPorId } from '../content/nichos/index.js'
import { vocab } from '../content/base.js'
import { SOL } from '../content/soluciones.js'
import { V2 } from '../content/visita.js'
import { $, $$, words, wordsDot, rise, fade, pad } from '../core/fx.js'
import { ringBtn } from '../icons/icons.js'
import { abrirDemo } from '../demos/host.js'
import { hayDemo } from '../demos/index.js'
import { esc, ahora, fecha, dinero, plantilla } from '../app/util.js'
import { escena, tx, linea } from '../visita1/base.js'
import { portada } from '../visita1/apertura.js'
import { despedida } from '../visita1/cierre.js'
import { conEspacios } from '../visita1/espacios.js'
import { precioPlazo } from '../crm/cobranza.js'

// La segunda visita: recordar lo que dijo, dejarle probar su sistema y, ahora sí, hablar de precio.

const titular = (T, cls) => `<h2 class="t-display ${cls}"><span class="ln">${words(T[0])}</span><span class="ln">${wordsDot(T[1])}</span></h2>`

export function vistaVisita2({ id }) {
  const prospecto = store.uno('prospectos', id)
  if (!prospecto) return void ir('/crm')
  const nicho = nichoPorId(prospecto.nicho)
  const propuesta = () => store.lista('propuestas', { prospecto_id: id }).sort((a, b) => (b.creado || '').localeCompare(a.creado || ''))[0] || null
  const hallazgos = store.lista('hallazgos', (h) => h.prospecto_id === id && h.estado !== 'mencionado').sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  const primera = store.lista('visitas', (v) => v.prospecto_id === id && v.tipo !== 2).sort((a, b) => (b.inicio || '').localeCompare(a.inicio || ''))[0]
  let visita = store.lista('visitas', (v) => v.prospecto_id === id && v.tipo === 2 && v.estado === 'en_curso')[0] || store.guardar('visitas', { prospecto_id: id, tipo: 2, inicio: ahora(), presentadores: primera?.presentadores || [], estado: 'en_curso', datos: {} })
  let cerrada = false

  const E = {
    prospecto,
    nicho,
    v: vocab(nicho),
    get negocio() {
      return prospecto.negocio || 'su negocio'
    },
  }

  function finalizar() {
    if (cerrada) return
    cerrada = true
    visita = store.guardar('visitas', { id: visita.id, estado: 'terminada', fin: ahora() })
    const p = store.uno('prospectos', id)
    if (!['cliente', 'perdido'].includes(p.etapa)) store.guardar('prospectos', { id, etapa: 'propuesta' })
    const pr = propuesta()
    if (pr && ['borrador', 'lista'].includes(pr.estado)) store.guardar('propuestas', { id: pr.id, estado: 'presentada' })
    store.anotar(id, 'visita', 'Segunda visita: se presentó la propuesta.', { visita_id: visita.id }, sesion.nombre)
    store.sincronizar()
  }

  // ── Lo que nos contó ──
  const recap = escena({
    id: 'recap',
    theme: 'paper',
    title: V2.recap.nav,
    pinta(el) {
      const T = V2.recap
      el.innerHTML = `
        <div class="scene-inner ve">
          <header class="ve-cab">${titular(T.titulo, 've-h wr-h')}<p class="t-body wr-intro">${primera?.inicio ? tx(T.intro, { fecha: fecha(primera.inicio, 'larga') }) : esc(T.sinFecha)}</p></header>
          <article class="ve-ficha" data-rueda>
            <div class="ve-fcab"><span class="t-display ve-negocio">${esc(E.negocio)}</span><span class="t-label">${esc(prospecto.nicho_otro || nicho.nombre)}</span></div>
            <ol class="ve-lista">
              ${
                hallazgos
                  .map((h, i) => {
                    const s = SOL[h.elegida]
                    return `<li class="ve-item"><span class="t-label ve-n">${pad(i + 1)}</span><div><p class="ve-t">${esc(h.titulo)}</p><p class="ve-r">${esc(T.resuelve)}: ${s ? esc(s.nombre) : esc(T.medida)}</p>${h.nota ? `<p class="t-body ve-nota">«${esc(h.nota)}»</p>` : ''}</div></li>`
                  })
                  .join('') || `<li class="ve-item"><span></span><p class="t-body">${esc(T.vacio)}</p></li>`
              }
            </ol>
          </article>
        </div>`
      const tl = linea()
      rise(tl, $$(el, '.ve-h .wi'), 0, { stagger: 0.07 })
      fade(tl, $(el, '.wr-intro'), 0.4)
      tl.fromTo($(el, '.ve-ficha'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.2)
      tl.fromTo($$(el, '.ve-item'), { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.16 }, 0.5)
      return { tl, anchor: () => $(el, '.period') }
    },
  })

  // ── Su sistema ──
  const demo = escena({
    id: 'demo',
    theme: 'ink',
    title: V2.demo.nav,
    pinta(el, { on }) {
      const T = V2.demo
      const pr = propuesta()
      const url = pr?.demo_url
      const piezas = []
      for (const h of hallazgos) {
        const s = SOL[h.elegida]
        if (s && hayDemo(s.demo.modulo, s.demo.vista) && !piezas.some((x) => x.s.id === s.id)) piezas.push({ s, h })
      }
      el.innerHTML = `
        <div class="scene-inner wd">
          <header class="wd-cab">
            <div>${titular(T.titulo, 'wd-h')}<p class="t-body wd-intro">${url ? tx(T.intro, { negocio: E.negocio }) : esc(T.sinUrl)}</p></div>
            ${url ? `<div class="wd-acc">${ringBtn(T.abrir, { attrs: 'data-plena' })}<a class="t-label wd-otra" target="_blank" rel="noopener" href="${esc(url)}">${esc(T.pestana)}</a></div>` : ''}
          </header>
          ${
            url
              ? `<div class="wd-marco"><div class="wd-barra"><i></i><i></i><i></i><span>${esc(url.replace(/^https?:\/\//, ''))}</span></div><iframe src="${esc(url)}" title="${esc(pr.titulo || 'Demostración')}" loading="eager" allow="clipboard-write; fullscreen"></iframe></div>`
              : `<div class="wd-piezas" data-rueda>${
                  piezas
                    .map(
                      ({ s, h }, i) => `<article class="wd-pieza"><p class="t-label">${pad(i + 1)} · ${esc(h.titulo)}</p><h3 class="t-display wd-pn">${esc(s.nombre)}</h3>${ringBtn(T.probar, { attrs: `data-pieza="${esc(s.id)}"` })}</article>`,
                    )
                    .join('') || `<p class="t-body">${esc(V2.recap.vacio)}</p>`
                }</div>`
          }
        </div>`
      on('[data-plena]', () => {
        const c = abrirCapa({ clase: 'capa-demo wd-plena', html: `<header class="cd-cab"><div><p class="t-label cd-k">${esc(E.negocio)}</p></div><button type="button" class="cd-x t-label" data-x>Cerrar <span aria-hidden="true">×</span></button></header><iframe src="${esc(url)}" title="Demostración" allow="clipboard-write; fullscreen"></iframe>` })
        c.el.querySelector('[data-x]').addEventListener('click', () => c.cerrar())
      })
      on('[data-pieza]', (b) => {
        const s = SOL[b.dataset.pieza]
        abrirDemo({ titulo: s.nombre, modulo: s.demo.modulo, vista: s.demo.vista, negocio: E.negocio, nicho })
      })
      const tl = linea()
      rise(tl, $$(el, '.wd-h .wi'), 0, { stagger: 0.07 })
      fade(tl, [$(el, '.wd-intro'), $(el, '.wd-acc')].filter(Boolean), 0.35)
      tl.fromTo($(el, '.wd-marco') || $$(el, '.wd-pieza'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1 }, 0.4)
      return { tl, anchor: () => $(el, '.period') }
    },
  })

  // ── Cómo se paga ──
  const precio = escena({
    id: 'precio',
    theme: 'paper',
    title: V2.precio.nav,
    pinta(el, { on, dot }) {
      const T = V2.precio
      const pr = propuesta()
      const hay = pr && (pr.precio_contado || pr.precio_mensual)
      let plazo = 1
      const pintaPlazo = () => {
        const x = precioPlazo(pr, plazo)
        $(el, '.wp-mensual').textContent = dinero(x.mensual)
        $(el, '.wp-total').textContent = plazo > 1 ? `${T.total}: ${dinero(x.total)}${x.ahorro > 0 ? ` · ${plantilla(T.ahorra, { monto: dinero(x.ahorro) })}` : ''}` : ''
        $$(el, '[data-plazo]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.plazo === plazo)))
      }
      el.innerHTML = `
        <div class="scene-inner wp">
          <header class="wp-cab">${titular(T.titulo, 'wp-h')}<p class="t-body wp-intro">${esc(hay ? T.intro : T.sinPrecio)}</p>
            ${hay && pr.prueba_dias ? `<p class="t-body wp-prueba">${tx(T.prueba, { dias: pr.prueba_dias })}</p>` : ''}</header>
          ${
            hay
              ? `<div class="wp-cuerpo">
                  <div class="wp-ops">
                    ${pr.precio_contado ? `<article class="wp-op"><p class="t-label">${esc(T.contadoT)}</p><p class="t-display wp-n">${dinero(pr.precio_contado)}</p><p class="t-body wp-d">${esc(T.contadoD)}</p>${pr.mantenimiento ? `<p class="t-label wp-k">${esc(T.mantenimiento)}</p><p class="t-body wp-d">${esc(pr.mantenimiento)}</p>` : ''}</article>` : ''}
                    ${
                      pr.precio_mensual
                        ? `<article class="wp-op wp-op--m"><p class="t-label">${esc(T.membT)}</p><p class="t-display wp-n"><span class="wp-mensual"></span><span class="wp-al">${esc(T.alMes)}</span></p>
                            <div class="wp-plazos">${T.plazos.map((x) => `<button type="button" class="v-chip" data-plazo="${x.meses}" aria-pressed="false">${esc(x.t)}</button>`).join('')}</div>
                            <p class="t-label wp-total"></p><p class="t-body wp-d">${esc(T.membD)}</p></article>`
                        : ''
                    }
                  </div>
                  ${pr.incluye?.length ? `<div class="wp-inc"><p class="t-label">${esc(T.incluye)}</p><ul>${pr.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
                </div>`
              : ''
          }
        </div>`
      if (hay && pr.precio_mensual) pintaPlazo()
      on('[data-plazo]', (b) => {
        plazo = +b.dataset.plazo
        pintaPlazo()
        dot.pulse(1.2)
      })
      const tl = linea()
      rise(tl, $$(el, '.wp-h .wi'), 0, { stagger: 0.07 })
      fade(tl, [$(el, '.wp-intro'), $(el, '.wp-prueba')].filter(Boolean), 0.4)
      if (hay) {
        tl.fromTo($$(el, '.wp-op'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.15 }, 0.45)
        if ($(el, '.wp-inc')) fade(tl, $(el, '.wp-inc'), 0.9)
      }
      return { tl, anchor: () => $(el, '.period') }
    },
  })

  // ── Formas de pago ──
  const pago = escena({
    id: 'pago',
    theme: 'ink',
    title: V2.pago.nav,
    pinta(el) {
      const T = V2.pago
      const b = store.ajuste('banco') || {}
      const datos = [b.banco, b.titular, b.clabe && `CLABE ${b.clabe}`, b.cuenta].filter(Boolean)
      const fila = (n, x, extra = '') => `<li class="wg-item"><span class="t-label wg-n">${n}</span><div><p class="t-display wg-t">${esc(x.t)}</p><p class="t-body wg-d">${esc(x.d)}</p>${extra}</div></li>`
      el.innerHTML = `
        <div class="scene-inner wg">
          <header>${titular(T.titulo, 'wg-h')}<p class="t-body wg-intro">${esc(T.intro)}</p></header>
          <ol class="wg-lista">
            ${fila('01', T.tarjeta)}
            ${fila('02', T.transferencia, `<p class="wg-banco selectable">${datos.length ? datos.map(esc).join(' · ') : esc(T.sinBanco)}</p>`)}
            ${fila('03', T.efectivo)}
          </ol>
        </div>`
      const tl = linea()
      rise(tl, $$(el, '.wg-h .wi'), 0, { stagger: 0.07 })
      fade(tl, $(el, '.wg-intro'), 0.4)
      tl.fromTo($$(el, '.wg-item'), { autoAlpha: 0, x: 22 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'expo.out', stagger: 0.13 }, 0.45)
      return { tl, anchor: () => $(el, '.period') }
    },
  })

  // ── Su decisión ──
  const decision = escena({
    id: 'decision',
    theme: 'paper',
    title: V2.decision.nav,
    pinta(el, { on, dot, deck }) {
      const T = V2.decision
      const pr = propuesta()
      const opciones = T.opciones.filter((o) => (o.id === 'contado' ? pr?.precio_contado : o.id === 'mensual' ? pr?.precio_mensual : o.id === 'prueba' ? pr?.prueba_dias : true))
      let sel = pr?.modalidad || null
      el.innerHTML = `
        <div class="scene-inner va wx">
          <header class="va-cab">${titular(T.titulo, 'va-h')}<p class="va-somos">${esc(T.intro)}</p><p class="wx-listo" aria-live="polite">${sel ? esc(T.listo[sel] || '') : ''}</p></header>
          <ol class="va-puntos">
            ${opciones.map((o, i) => `<li><button type="button" class="va-punto" data-op="${o.id}" aria-pressed="${sel === o.id}"><i class="va-a"></i><span class="t-label va-n">${pad(i + 1)}</span><span class="va-tx"><span class="t-display va-t wx-t">${esc(o.t)}</span></span></button></li>`).join('')}
          </ol>
        </div>`
      const ancla = () => $(el, '.va-punto[aria-pressed="true"] .va-a') || $(el, '.period')
      on('[data-op]', (b) => {
        sel = b.dataset.op
        $$(el, '.va-punto').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
        $(el, '.wx-listo').textContent = T.listo[sel] || ''
        if (pr) store.guardar('propuestas', { id: pr.id, modalidad: sel, estado: 'presentada' })
        visita = store.guardar('visitas', { id: visita.id, datos: { ...(visita.datos || {}), decision: T.opciones.find((o) => o.id === sel)?.t } })
        if (sel === 'pensar') store.guardar('prospectos', { id, proxima_accion: 'Dar seguimiento a la propuesta' })
        if (!deck.busy) dot.to(ancla(), { duration: 0.7, ease: 'expo.inOut' })
        dot.pulse(1.25)
      })
      const tl = linea()
      rise(tl, $$(el, '.va-h .wi'), 0, { stagger: 0.08 })
      fade(tl, [$(el, '.va-somos'), $(el, '.wx-listo')], 0.4)
      tl.fromTo($$(el, '.va-punto'), { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1 }, 0.5)
      return { tl, anchor: ancla }
    },
  })

  const scenes = conEspacios([portada(E, V2.portada), recap, demo, precio, pago, decision, despedida(E, { alLlegar: finalizar, T: V2.cierre })], [[pago.id, 'entrega', 'ink']])
  const d = montarDeck({
    scenes,
    titulo: `${E.negocio} · Soma`,
    alSalir() {
      if (!cerrada) {
        // Si se sale antes del final, la visita queda registrada como incompleta.
        store.guardar('visitas', { id: visita.id, estado: 'salida_rapida', fin: ahora() })
        cerrada = true
      }
      ir(`/crm/prospecto/${id}?t=propuesta`)
    },
    extraHud: '<button type="button" class="hud-salir t-label" data-act="salir">Salir</button>',
  })
  return () => d.destruir()
}
