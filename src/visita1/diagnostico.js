import gsap from 'gsap'
import { $, $$, pad, fade } from '../core/fx.js'
import { ringBtn } from '../icons/icons.js'
import { flujo, animaFlujo } from '../core/flujo.js'
import { V1 } from '../content/visita.js'
import { AREA, txt } from '../content/base.js'
import { abrirDemo } from '../demos/host.js'
import { hayDemo } from '../demos/index.js'
import { esc } from '../app/util.js'
import { escena, tx, linea } from './base.js'

// El diagnóstico: un problema a la vez. Una o dos preguntas ajustan la recomendación y se muestran
// cuatro rutas, de la que más transforma a la más ligera. Cada una se puede probar en una demo.
// Lo que el cliente responde y lo que le interesa queda en su expediente al momento.

export const diagnostico = (E) =>
  escena({
    id: 'diagnostico',
    theme: 'paper',
    title: V1.diag.nav,
    pinta(el, { dot, deck, dir, on, alEscribir }) {
      const T = V1.diag
      const cola = E.marcados()
      let i = dir < 0 ? Math.max(0, cola.length - 1) : 0
      let foco = 0 // ruta enfocada
      let animacion = null

      if (!cola.length) {
        el.innerHTML = `<div class="scene-inner vd vd--vacio"><div><h2 class="t-display vd-h">${esc(T.vacioT)}</h2><p class="t-body vd-senal">${esc(T.vacioD)}</p><i class="vd-a0" data-dot></i></div></div>`
        return { anchor: () => $(el, '.vd-a0') }
      }

      const p = () => cola[i]
      const h = () => E.hallazgo(p().id) || E.ponHallazgo(p().id)
      const respuestas = () => h().matices || {}
      const rutas = () => E.rutas(p(), respuestas())
      const reaccion = (sol) => (h().rutas || []).find((r) => r.sol === sol)?.reaccion || null

      function ponReaccion(sol, valor) {
        const lista = (h().rutas || []).filter((r) => r.sol !== sol)
        if (valor) lista.push({ sol, reaccion: valor })
        const interesa = lista.filter((r) => r.reaccion === 'interesa').map((r) => r.sol)
        const previa = h().elegida
        E.ponHallazgo(p().id, { rutas: lista, elegida: interesa.includes(previa) ? previa : interesa[0] || null, estado: 'explorado' })
      }

      const todasNo = () => {
        const R = rutas()
        return R.length > 0 && R.every((r) => reaccion(r.sol) === 'no')
      }

      // ── Columna izquierda: el problema y sus preguntas ──
      function izquierda() {
        const x = p()
        const r = respuestas()
        $(el, '.vd-izq').innerHTML = `
          <p class="t-label vd-k">${pad(i + 1)} / ${pad(cola.length)}${x.area ? ` · ${esc(AREA[x.area]?.nombre || '')}` : ''}</p>
          <h2 class="t-display vd-h">${esc(x.titulo)}</h2>
          ${x.senal ? `<p class="t-body vd-senal">${esc(x.senal)}</p>` : ''}
          ${
            x.matices?.length
              ? `<div class="vd-preguntas"><p class="t-label vd-k">${esc(T.preguntas)}</p>
                  ${x.matices
                    .map(
                      (m) => `<div class="vd-q">
                        <p class="vd-qt">${esc(m.pregunta)}</p>
                        <div class="seg" role="radiogroup" aria-label="${esc(m.pregunta)}">
                          <button type="button" role="radio" data-m="${esc(m.id)}" data-v="1" aria-checked="${r[m.id] === true}">Sí</button>
                          <button type="button" role="radio" data-m="${esc(m.id)}" data-v="0" aria-checked="${r[m.id] === false}">No</button>
                        </div>
                        ${m.id in r ? `<p class="t-label vd-reg">${esc(T.registrado)} · ${esc(r[m.id] ? m.si : m.no)}</p>` : ''}
                      </div>`,
                    )
                    .join('')}
                </div>`
              : ''
          }
          <input class="v-in vd-nota" name="nota" autocomplete="off" placeholder="${esc(T.notaPh)}" value="${esc(h().nota || '')}" aria-label="${esc(T.notaPh)}" />`
      }

      // ── Columna derecha: las rutas ──
      function derecha({ animar = true } = {}) {
        const R = rutas()
        const zona = $(el, '.vd-der')
        animacion?.kill()
        if (!R.length || todasNo()) {
          zona.innerHTML = `
            ${R.length ? pestanas(R) : ''}
            <div class="vd-panel vd-medida">
              <p class="t-label vd-k">05</p>
              <h3 class="t-display vd-sol">${esc(T.medidaT)}</h3>
              <p class="vd-para">${tx(R.length ? T.medidaD : T.propioD, { negocio: E.negocio })}</p>
            </div>`
          if (R.length === 0 || h().a_medida !== true) E.ponHallazgo(p().id, { a_medida: true, estado: 'explorado' })
          if (animar) gsap.fromTo($(el, '.vd-panel').children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 })
          return
        }
        if (h().a_medida && !p().propio) E.ponHallazgo(p().id, { a_medida: false })
        foco = Math.max(0, Math.min(R.length - 1, foco))
        const r = R[foco]
        const s = r.solucion
        const re = reaccion(r.sol)
        const conDemo = hayDemo(s.demo.modulo, s.demo.vista)
        zona.innerHTML = `
          ${pestanas(R)}
          <div class="vd-panel">
            <p class="t-label vd-k">${esc(T.ejes[s.eje] || '')}${r.choca ? ` · <span class="vd-choca">${esc(T.noEncaja)}: ${esc(r.choca)}</span>` : ''}</p>
            <h3 class="t-display vd-sol">${esc(s.nombre)}</h3>
            <p class="vd-para">${esc(r.para)}</p>
            <div class="vd-flujo">${flujo(s.pasos.map((x) => ({ ico: x.ico, t: txt(x.t, E.v) })))}</div>
            <div class="vd-acc">
              ${conDemo ? ringBtn(T.demo, { cls: 'vd-demo', attrs: 'data-demo' }) : ''}
              <div class="vd-voto">
                <button type="button" class="vd-v" data-voto="interesa" aria-pressed="${re === 'interesa'}">${esc(T.interesa)}</button>
                <button type="button" class="vd-v" data-voto="no" aria-pressed="${re === 'no'}">${esc(T.no)}</button>
              </div>
            </div>
          </div>`
        if (animar) {
          animacion = gsap.timeline()
          animacion.fromTo([$(el, '.vd-panel > .vd-k'), $(el, '.vd-sol'), $(el, '.vd-para')], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'expo.out', stagger: 0.06 }, 0)
          animacion.add(animaFlujo($(el, '.vd-flujo')), 0.15)
          animacion.fromTo($(el, '.vd-acc'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.5)
        }
      }

      const pestanas = (R) => `<div class="vd-tabs" role="tablist">
        ${R.map((r, k) => {
          const re = reaccion(r.sol)
          return `<button type="button" role="tab" class="vd-tab ${r.choca ? 'es-choca' : ''} ${re ? 'es-' + re : ''}" data-r="${k}" aria-selected="${k === foco && !todasNo()}">
            <i class="vd-ta"></i><span class="t-label vd-tn">${pad(k + 1)}</span><span class="t-name vd-tt">${esc(r.solucion.nombre)}</span>
          </button>`
        }).join('')}
      </div>`

      const ancla = () => $(el, '.vd-tab[aria-selected="true"] .vd-ta') || $(el, '.vd-a0')
      const posar = (dur = 0.6) => !deck.busy && dot.to(ancla(), { duration: dur, ease: 'expo.out' })

      function irRuta(k) {
        const R = rutas()
        if (deck.busy || !R.length) return
        foco = (k + R.length) % R.length
        derecha()
        posar()
      }

      function irProblema(k) {
        if (deck.busy || k < 0 || k >= cola.length) return false
        i = k
        foco = 0
        izquierda()
        derecha()
        gsap.fromTo($(el, '.vd-izq').children, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.04 })
        posar(0.8)
        return true
      }

      function demo() {
        const r = rutas()[foco]
        if (!r) return
        const s = r.solucion
        abrirDemo({
          titulo: s.nombre,
          sub: r.para,
          modulo: s.demo.modulo,
          vista: s.demo.vista,
          negocio: E.negocio,
          nicho: E.nicho,
          pie: `<button type="button" class="cd-x t-label" data-cerrar-demo="interesa">${esc(T.interesa)}</button><button type="button" class="cd-x t-label" data-cerrar-demo="no">${esc(T.no)}</button>`,
          alCerrar: (v) => v && votar(v),
        })
      }

      function votar(valor) {
        const r = rutas()[foco]
        if (!r) return
        const nuevo = reaccion(r.sol) === valor ? null : valor
        ponReaccion(r.sol, nuevo)
        if (nuevo === 'interesa') dot.pulse(1.3)
        // Si no le convenció, se le ofrece la siguiente ruta que aún no ha visto.
        if (nuevo === 'no' && !todasNo()) {
          const R = rutas()
          const sig = R.findIndex((x, k) => k > foco && !reaccion(x.sol))
          if (sig >= 0) foco = sig
        }
        derecha({ animar: nuevo === 'no' })
        posar()
      }

      el.innerHTML = `<div class="scene-inner vd"><section class="vd-izq"></section><section class="vd-der"></section><i class="vd-a0"></i></div>`
      izquierda()
      derecha({ animar: false })

      on('[data-m]', (b) => {
        const r = { ...respuestas(), [b.dataset.m]: b.dataset.v === '1' }
        const x = p()
        E.ponHallazgo(x.id, { matices: r, etiquetas: x.matices.filter((m) => m.id in r).map((m) => (r[m.id] ? m.si : m.no)) })
        foco = 0
        izquierda()
        derecha()
        posar()
      })
      on('[data-r]', (b) => {
        if (todasNo()) {
          // Reabrir una ruta descartada: se le quita el "no" para volver a verla.
          const r = rutas()[+b.dataset.r]
          ponReaccion(r.sol, null)
        }
        irRuta(+b.dataset.r)
      })
      on('[data-demo]', demo)
      on('[data-voto]', (b) => votar(b.dataset.voto))
      alEscribir('.vd-nota', (c) => E.ponHallazgo(p().id, { nota: c.value }))

      const tl = linea()
      fade(tl, [...$(el, '.vd-izq').children], 0, { stagger: 0.06 })
      tl.fromTo($$(el, '.vd-tab'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 }, 0.2)
      tl.fromTo($(el, '.vd-panel'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.35)
      tl.add(() => {
        const f = $(el, '.vd-flujo')
        if (f) animacion = animaFlujo(f)
      }, 0.45)

      return {
        tl,
        anchor: ancla,
        next: () => irProblema(i + 1),
        prev: () => irProblema(i - 1),
        key(e) {
          if (e.key === 'ArrowDown') return irRuta(foco + 1), true
          if (e.key === 'ArrowUp') return irRuta(foco - 1), true
          if (e.key === 'd' || e.key === 'D') return demo(), true
          return false
        },
        leave: () => animacion?.kill(),
      }
    },
  })
