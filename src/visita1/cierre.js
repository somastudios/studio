import gsap from 'gsap'
import { boil, P } from '../core/boil.js'
import { $, $$, words, wordsDot, rise, fade, pad } from '../core/fx.js'
import { ringBtn, scopeGlyph } from '../icons/icons.js'
import { C } from '../content/es.js'
import { V1 } from '../content/visita.js'
import { AREA } from '../content/base.js'
import { SOL } from '../content/soluciones.js'
import { store } from '../data/store.js'
import { esc, fecha, dia, sumaDias, telBonito, plantilla } from '../app/util.js'
import { escena, tx, linea } from './base.js'

// La segunda mitad de la visita: lo que no se dijo, hasta dónde quiere llegar, el expediente
// a la vista, la fecha de la siguiente visita y la despedida.

const titular = (T, cls) => `<h2 class="t-display ${cls}"><span class="ln">${words(T[0])}</span><span class="ln">${wordsDot(T[1])}</span></h2>`

/** Antes de cerrar: tres cosas frecuentes del giro que no salieron. Solo sí o no. */
export const ronda = (E) =>
  escena({
    id: 'ronda',
    theme: 'ink',
    title: V1.ronda.nav,
    pinta(el, { on, dot }) {
      const T = V1.ronda
      const areasVistas = new Set(E.marcados().map((p) => p.area))
      const candidatos = E.nicho.problemas
        .filter((p) => !E.datos.marcados.includes(p.id))
        .sort((a, b) => areasVistas.has(a.area) - areasVistas.has(b.area) || !!b.frecuente - !!a.frecuente)
        .slice(0, 3)
      el.innerHTML = `
        <div class="scene-inner vr">
          <header class="vr-cab">${titular(T.titulo, 'vr-h')}<p class="t-body vr-intro">${tx(T.intro, { plural: E.plural })}</p></header>
          <ol class="vr-lista">
            ${
              candidatos
                .map(
                  (p, i) => `<li class="vr-item" data-p="${esc(p.id)}">
                    <span class="t-label vr-n">${pad(i + 1)}${p.area ? ` · ${esc(AREA[p.area]?.nombre || '')}` : ''}</span>
                    <p class="vr-t">${esc(p.titulo)}</p>
                    <p class="t-body vr-s">${esc(p.senal)}</p>
                    <div class="seg" role="radiogroup" aria-label="${esc(p.titulo)}">
                      <button type="button" role="radio" data-v="1" aria-checked="${E.datos.ronda[p.id] === true}">${esc(T.si)}</button>
                      <button type="button" role="radio" data-v="0" aria-checked="${E.datos.ronda[p.id] === false}">${esc(T.no)}</button>
                    </div>
                  </li>`,
                )
                .join('') || `<li class="vr-item"><p class="vr-t">${esc(T.vacio)}</p></li>`
            }
          </ol>
        </div>`
      on('.vr-item [data-v]', (b) => {
        const li = b.closest('.vr-item')
        const pid = li.dataset.p
        const si = b.dataset.v === '1'
        E.datos.ronda[pid] = si
        E.guardaDatos()
        if (si) E.ponHallazgo(pid, { estado: 'mencionado', orden: 100 + Object.keys(E.datos.ronda).indexOf(pid) })
        else E.quitaHallazgo(pid)
        $$(li, '[data-v]').forEach((x) => x.setAttribute('aria-checked', String(x === b)))
        if (si) dot.pulse(1.2)
      })
      const tl = linea()
      rise(tl, $$(el, '.vr-h .wi'), 0, { stagger: 0.07 })
      fade(tl, $(el, '.vr-intro'), 0.4)
      tl.fromTo($$(el, '.vr-item'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, 0.45)
      return { tl, anchor: () => $(el, '.period') }
    },
  })

/** Alcance: hasta dónde quiere llegar y cómo le acomoda pagar. Sin cifras nuestras. */
export const alcance = (E) =>
  escena({
    id: 'alcance',
    theme: 'ink',
    title: V1.alcance.nav,
    pinta(el, { on, dot, deck }) {
      const T = V1.alcance
      const niveles = C.s8.items
      const rangos = store.ajuste('presupuestos') || []
      const pr = () => E.prospecto
      el.innerHTML = `
        <div class="scene-inner vl">
          <header class="vl-cab">${titular(T.titulo, 'vl-h')}<p class="t-body vl-intro">${esc(T.intro)}</p><p class="t-label vl-nota">${esc(T.nota)}</p></header>
          <div class="vl-cuerpo">
            <div class="vl-niveles" role="radiogroup" aria-label="${esc(T.nav)}">
              ${niveles
                .map(
                  (n, i) => `<button type="button" class="vl-nivel" role="radio" data-alcance="${esc(n.name)}" aria-checked="${pr().alcance === n.name}">
                    <span class="vl-glifo">${scopeGlyph(i + 1)}<i class="vl-a"></i></span>
                    <span><span class="t-display vl-nn">${esc(n.name)}</span><span class="t-body vl-nt">${esc(n.tag)}</span></span>
                  </button>`,
                )
                .join('')}
            </div>
            <div class="vl-bloque"><p class="t-label vl-k">${esc(T.presupuesto)}</p>
              <div class="vl-chips">${rangos.map((r) => `<button type="button" class="v-chip" data-presupuesto="${esc(r)}" aria-pressed="${pr().presupuesto === r}">${esc(r)}</button>`).join('')}</div>
            </div>
            <div class="vl-bloque"><p class="t-label vl-k">${esc(T.forma)}</p>
              <div class="vl-formas">${T.formas.map((f) => `<button type="button" class="vl-forma" data-forma="${f.id}" aria-pressed="${pr().modalidad_interes === f.id}"><span class="t-name vl-ft">${esc(f.t)}</span><span class="t-body vl-fd">${esc(f.d)}</span></button>`).join('')}</div>
            </div>
          </div>
        </div>`
      const ancla = () => $(el, '.vl-nivel[aria-checked="true"] .vl-a') || $(el, '.period')
      on('[data-alcance]', (b) => {
        E.ponProspecto({ alcance: b.dataset.alcance })
        $$(el, '.vl-nivel').forEach((x) => x.setAttribute('aria-checked', String(x === b)))
        if (!deck.busy) dot.to(ancla(), { duration: 0.6, ease: 'expo.out' })
      })
      on('[data-presupuesto]', (b) => {
        const v = pr().presupuesto === b.dataset.presupuesto ? null : b.dataset.presupuesto
        E.ponProspecto({ presupuesto: v })
        $$(el, '[data-presupuesto]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.presupuesto === v)))
      })
      on('[data-forma]', (b) => {
        E.ponProspecto({ modalidad_interes: b.dataset.forma })
        $$(el, '[data-forma]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      })
      const tl = linea()
      rise(tl, $$(el, '.vl-h .wi'), 0, { stagger: 0.07 })
      fade(tl, [$(el, '.vl-intro'), $(el, '.vl-nota')], 0.4)
      tl.fromTo($$(el, '.vl-nivel'), { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1 }, 0.4)
      fade(tl, $$(el, '.vl-bloque'), 0.75, { stagger: 0.12 })
      return { tl, anchor: ancla }
    },
  })

/** El expediente, a la vista: el cliente ve que se le escuchó y puede corregir. */
export const expediente = (E) =>
  escena({
    id: 'expediente',
    theme: 'paper',
    title: V1.expediente.nav,
    pinta(el, { alEscribir }) {
      const T = V1.expediente
      const H = E.hallazgos()
      const vistos = H.filter((h) => h.estado !== 'mencionado')
      const mencionados = H.filter((h) => h.estado === 'mencionado')
      const pr = E.prospecto
      const forma = V1.alcance.formas.find((f) => f.id === pr.modalidad_interes)?.t
      const pie = [pr.alcance, pr.presupuesto, forma].filter(Boolean)
      el.innerHTML = `
        <div class="scene-inner ve">
          <header class="ve-cab">
            ${titular(T.titulo, 've-h')}
            <div class="ve-sello"><svg viewBox="0 0 48 48" aria-hidden="true">${boil(P.circle(24, 24, 21, 16), { amp: 0.5, cls: 'draw', attrs: 'stroke-width="3.4"' })}</svg><i class="ve-a" data-dot></i><span class="t-label">${esc(T.sello)}</span></div>
            <label class="ve-falta"><span class="t-label">${esc(T.falta)}</span><textarea class="v-in" name="correccion" rows="2" placeholder="${esc(T.faltaPh)}">${esc(E.datos.correccion || '')}</textarea></label>
          </header>
          <article class="ve-ficha" data-rueda>
            <div class="ve-fcab"><span class="t-display ve-negocio">${esc(E.negocio)}</span><span class="t-label">${esc(pr.nicho_otro || E.nicho.nombre)} · ${esc(fecha(new Date(), 'completa'))}</span></div>
            <ol class="ve-lista">
              ${
                vistos
                  .map((h, i) => {
                    const s = SOL[h.elegida]
                    return `<li class="ve-item"><span class="t-label ve-n">${pad(i + 1)}</span>
                      <div><p class="ve-t">${esc(h.titulo)}</p>
                        <p class="ve-r">${s ? esc(s.nombre) : h.a_medida ? esc(T.medida) : esc(T.sinRuta)}</p>
                        ${h.etiquetas?.length ? `<p class="t-label ve-e">${h.etiquetas.map(esc).join(' · ')}</p>` : ''}
                        ${h.nota ? `<p class="t-body ve-nota">«${esc(h.nota)}»</p>` : ''}
                      </div></li>`
                  })
                  .join('') || `<li class="ve-item"><span></span><p class="t-body">${esc(T.vacio)}</p></li>`
              }
            </ol>
            ${mencionados.length ? `<p class="ve-tambien"><span class="t-label">${esc(T.tambien)}</span> ${mencionados.map((h) => esc(h.titulo)).join(' · ')}</p>` : ''}
            ${pie.length ? `<p class="t-label ve-pie">${pie.map(esc).join(' · ')}</p>` : ''}
          </article>
        </div>`
      alEscribir('[name="correccion"]', (c) => {
        E.datos.correccion = c.value
        E.guardaDatos()
      })
      const tl = linea()
      rise(tl, $$(el, '.ve-h .wi'), 0, { stagger: 0.07 })
      tl.fromTo($(el, '.ve-ficha'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.2)
      tl.fromTo($$(el, '.ve-item'), { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.14 }, 0.5)
      fade(tl, [$(el, '.ve-tambien'), $(el, '.ve-pie')].filter(Boolean), 0.9)
      tl.fromTo($(el, '.ve-sello .boil'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.1, ease: 'expo.inOut' }, 0.7)
      fade(tl, [$(el, '.ve-sello span'), $(el, '.ve-falta')], 1.1)
      return { tl, anchor: () => $(el, '.ve-a') }
    },
  })

const HORAS = [9, 10, 11, 12, 13, 16, 17, 18, 19]
const horaTexto = (h) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'a. m.' : 'p. m.'}`

/** La cita de esta visita, si ya existe. */
export const citaDe = (E) => store.lista('citas', (c) => c.prospecto_id === E.prospecto.id && c.tipo === 'visita2' && c.estado !== 'cancelada').sort((a, b) => (b.creado > a.creado ? 1 : -1))[0] || null

/** Siguiente paso: una fecha real en un calendario real, y con quién quedamos. */
export const agenda = (E) =>
  escena({
    id: 'agenda',
    theme: 'ink',
    title: V1.agenda.nav,
    pinta(el, { on, dot, deck }) {
      const T = V1.agenda
      const previa = citaDe(E)
      const dias = Array.from({ length: 14 }, (_, k) => sumaDias(new Date(), k + 1))
      let selDia = previa?.inicio && !previa.por_mensaje ? dia(previa.inicio) : null
      let selHora = previa?.inicio && !previa.por_mensaje ? new Date(previa.inicio).getHours() : null
      let porMensaje = !!previa?.por_mensaje
      // Quién decide: si no es quien nos atiende, la segunda visita se aparta con esa persona.
      const decisor = { decide: '', nombre: '', ...(E.datos.decisor || {}) }
      const quienDecide = () => decisor.nombre.trim() || 'quien decide'
      const listo = (inicio) => plantilla(decisor.decide === 'no' ? T.listoCon : T.listo, { fecha: fecha(inicio, 'larga'), hora: fecha(inicio, 'hora'), quien: quienDecide() })
      function pintaDecisor() {
        $$(el, '[data-decide]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.decide === decisor.decide)))
        $(el, '.vg-decisor').hidden = decisor.decide !== 'no'
        $(el, '.vg-k-dia').textContent = decisor.decide === 'no' ? plantilla(T.diaDecisor, { quien: quienDecide() }) : T.dia
      }
      const ocupadas = (d) => new Set(store.lista('citas', (c) => c.inicio && c.estado !== 'cancelada' && c.id !== previa?.id && dia(c.inicio) === d).map((c) => new Date(c.inicio).getHours()))

      function horas() {
        const oc = selDia ? ocupadas(selDia) : new Set()
        $(el, '.vg-horas').innerHTML = HORAS.map((h) => `<button type="button" class="v-chip" data-hora="${h}" aria-pressed="${selHora === h}" ${oc.has(h) || porMensaje || !selDia ? 'disabled' : ''}>${horaTexto(h)}</button>`).join('')
      }
      const ancla = () => $(el, '.vg-dia[aria-pressed="true"] .vg-a') || $(el, '.period')
      const estado = (t, ok) => {
        const e = $(el, '.vg-estado')
        e.textContent = t
        e.classList.toggle('es-ok', !!ok)
      }

      el.innerHTML = `
        <div class="scene-inner vg">
          <header class="vg-cab">${titular(T.titulo, 'vg-h')}<p class="t-body vg-intro">${tx(T.intro, { negocio: E.negocio })}</p><p class="vg-estado" aria-live="polite"></p></header>
          <form class="vg-cuerpo" novalidate>
            <div class="vg-bloque"><p class="t-label vg-k vg-k-dia">${esc(T.dia)}</p>
              <div class="vg-dias">${dias
                .map((d) => `<button type="button" class="vg-dia" data-dia="${dia(d)}" aria-pressed="${selDia === dia(d)}"><i class="vg-a"></i><span class="t-label">${esc(fecha(d, 'media').split(' ')[0])}</span><span class="t-display vg-dn">${d.getDate()}</span></button>`)
                .join('')}</div>
            </div>
            <div class="vg-bloque"><p class="t-label vg-k">${esc(T.hora)}</p><div class="vg-horas"></div>
              <button type="button" class="v-chip vg-msj" data-mensaje aria-pressed="${porMensaje}">${esc(T.mensaje)}</button>
            </div>
            <div class="vg-bloque"><p class="t-label vg-k">${esc(T.quien)}</p>
              <div class="vg-campos">
                <input class="v-in" name="contacto" autocomplete="off" placeholder="${esc(T.nombre)}" aria-label="${esc(T.nombre)}" value="${esc(E.prospecto.contacto || '')}" />
                <input class="v-in" name="puesto" autocomplete="off" placeholder="${esc(T.puesto)}" aria-label="${esc(T.puesto)}" value="${esc(E.prospecto.puesto || '')}" />
                <input class="v-in" name="telefono" inputmode="tel" autocomplete="off" placeholder="${esc(T.tel)}" aria-label="${esc(T.tel)}" value="${esc(E.prospecto.telefono ? telBonito(E.prospecto.telefono) : '')}" />
              </div>
              <div class="vg-decide">
                <p class="t-label vg-k">${tx(T.decide, { negocio: E.negocio })}</p>
                <button type="button" class="v-chip" data-decide="si" aria-pressed="false">${esc(T.decideSi)}</button>
                <button type="button" class="v-chip" data-decide="no" aria-pressed="false">${esc(T.decideNo)}</button>
              </div>
              <div class="vg-decisor" hidden>
                <input class="v-in" name="decisor" autocomplete="off" placeholder="${esc(T.decisorPh)}" aria-label="${esc(T.decisorPh)}" value="${esc(decisor.nombre)}" />
                <p class="t-body vg-nota">${esc(T.decisorNota)}</p>
              </div>
            </div>
            ${ringBtn(T.agendar, { cls: 'vg-ok', attrs: 'data-agendar' })}
          </form>
        </div>`
      horas()
      pintaDecisor()
      if (previa) estado(previa.por_mensaje ? T.listoMsg : listo(previa.inicio), true)

      const guardaDecisor = () => {
        E.datos.decisor = { decide: decisor.decide, nombre: decisor.nombre.trim() }
        E.guardaDatos()
      }
      on('[data-decide]', (b) => {
        decisor.decide = decisor.decide === b.dataset.decide ? '' : b.dataset.decide
        pintaDecisor()
        guardaDecisor()
        if (decisor.decide === 'no') $(el, '[name="decisor"]').focus()
      })
      $(el, '[name="decisor"]').addEventListener('input', (e) => {
        decisor.nombre = e.target.value
        pintaDecisor()
        guardaDecisor()
      })

      on('[data-dia]', (b) => {
        selDia = b.dataset.dia
        porMensaje = false
        if (selHora != null && ocupadas(selDia).has(selHora)) selHora = null
        $$(el, '.vg-dia').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
        $(el, '.vg-msj').setAttribute('aria-pressed', 'false')
        horas()
        if (!deck.busy) dot.to(ancla(), { duration: 0.6, ease: 'expo.out' })
      })
      on('[data-hora]', (b) => {
        selHora = +b.dataset.hora
        horas()
      })
      on('[data-mensaje]', (b) => {
        porMensaje = !porMensaje
        b.setAttribute('aria-pressed', String(porMensaje))
        if (porMensaje) {
          selDia = selHora = null
          $$(el, '.vg-dia').forEach((x) => x.setAttribute('aria-pressed', 'false'))
          if (!deck.busy) dot.to(ancla(), { duration: 0.6, ease: 'expo.out' })
        }
        horas()
      })
      const guardar = () => {
        const f = $(el, '.vg-cuerpo')
        E.ponProspecto({ contacto: f.contacto.value.trim() || null, puesto: f.puesto.value.trim() || null, telefono: f.telefono.value.replace(/\D/g, '') || null })
        if (!porMensaje && (!selDia || selHora == null)) return estado(T.falta, false)
        const inicio = porMensaje ? null : new Date(`${selDia}T${String(selHora).padStart(2, '0')}:00:00`).toISOString()
        store.guardar('citas', { ...(previa ? { id: previa.id } : {}), prospecto_id: E.prospecto.id, tipo: 'visita2', inicio, minutos: 45, lugar: E.negocio, estado: 'pendiente', por_mensaje: porMensaje, quien: E.visita.presentadores || [] })
        estado(porMensaje ? T.listoMsg : listo(inicio), true)
        dot.pulse(1.3)
      }
      on('[data-agendar]', guardar)
      $(el, '.vg-cuerpo').addEventListener('submit', (e) => {
        e.preventDefault()
        guardar()
      })

      const tl = linea()
      rise(tl, $$(el, '.vg-h .wi'), 0, { stagger: 0.07 })
      fade(tl, [$(el, '.vg-intro'), $(el, '.vg-estado')], 0.4)
      tl.fromTo($$(el, '.vg-dia'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.025 }, 0.4)
      fade(tl, [...$$(el, '.vg-bloque'), $(el, '.vg-ok')], 0.6, { stagger: 0.1 })
      return { tl, anchor: ancla }
    },
  })

/** Despedida: el punto vuelve a su anillo. Aquí la visita queda cerrada y guardada. */
export const despedida = (E, { alLlegar, T = V1.cierre } = {}) =>
  escena({
    id: 'cierre',
    theme: 'paper',
    title: T.nav,
    pinta(el) {
      alLlegar?.()
      const cita = citaDe(E)
      const nombre = (E.prospecto.contacto || '').split(' ')[0]
      const k = store.ajuste('contacto') || {}
      const contacto = Object.entries({ WhatsApp: k.whatsapp, Correo: k.correo, Web: k.web, Instagram: k.instagram }).filter(([, v]) => v && String(v).trim())
      const linea2 = cita ? (cita.por_mensaje ? T.mensaje : plantilla(T.cita || '', { fecha: fecha(cita.inicio, 'larga'), hora: fecha(cita.inicio, 'hora') })) : ''
      el.innerHTML = `
        <div class="scene-inner s9">
          <div class="s9-logo" aria-hidden="true">
            <svg viewBox="-100 -100 200 200">${boil(P.circle(0, 0, 89.75, 44), { amp: 0.42, cls: 'draw s9-ring' })}</svg>
            <i class="s9-dot" data-dot></i>
          </div>
          <div class="s9-text">
            <h2 class="t-display s9-h"><span class="ln">${words(nombre ? `${T.gracias},` : T.gracias)}</span>${nombre ? `<span class="ln">${words(esc(nombre))}</span>` : ''}</h2>
            ${linea2 ? `<p class="vc-cita">${esc(linea2)}</p>` : ''}
            <p class="t-body s9-body">${esc(T.cuerpo)}</p>
            <div class="s9-cols">
              ${contacto.length ? `<ul class="s9-contact selectable">${contacto.map(([a, v]) => `<li><span class="t-label">${a}</span><span class="s9-cv">${esc(v)}</span></li>`).join('')}</ul>` : ''}
            </div>
            <div class="s9-foot">${ringBtn(T.terminar, { act: 'salir' })}</div>
          </div>
          <p class="t-label s9-lema">${esc(T.lema)}</p>
        </div>`
      const tl = linea()
      rise(tl, $$(el, '.s9-h .wi'), 0, { stagger: 0.09, duration: 1.15 })
      tl.fromTo($(el, '.s9-ring'), { '--draw': 1.06 }, { '--draw': 0, duration: 1.6, ease: 'expo.inOut' }, 0.1)
      fade(tl, [$(el, '.vc-cita'), $(el, '.s9-body'), ...$$(el, '.s9-contact li'), $(el, '.s9-foot'), $(el, '.s9-lema')].filter(Boolean), 0.55, { stagger: 0.08 })
      return { tl, anchor: () => $(el, '.s9-dot') }
    },
  })
