import { abrirApp, alTocar } from '../app/vista.js'
import { ir } from '../app/router.js'
import { aviso } from '../app/capas.js'
import { esc, ahora } from '../app/util.js'
import { store } from '../data/store.js'
import { NICHOS, nicho as nichoPorId } from '../content/nichos/index.js'
import { FAMILIAS } from '../content/base.js'
import { icoNicho } from '../icons/render.js'
import { grabadora } from '../visita1/grabadora.js'

// Presala: lo que se prepara antes de entrar al negocio. Tres decisiones y a presentar.
// Con ?p=<id> se abre para un prospecto que ya tiene expediente.

const sinAcentos = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function vistaPresala({ consulta }) {
  const app = abrirApp({ tema: 'ink', titulo: 'Presala · Soma' })
  const previo = consulta.p ? store.uno('prospectos', consulta.p) : null
  const personas = store.ajuste('presentadores') || []
  const st = {
    negocio: previo?.negocio || '',
    nicho: previo?.nicho || '',
    otro: previo?.nicho_otro || '',
    van: new Set(personas.slice(0, 1).map((p) => p.id)),
    graba: false,
    mic: '',
    filtro: '',
  }

  const conocido = () => previo || store.lista('prospectos', (p) => sinAcentos(p.negocio) === sinAcentos(st.negocio) && st.negocio.trim())[0] || null

  const giros = () => {
    const f = sinAcentos(st.filtro)
    const lista = f ? NICHOS.filter((n) => sinAcentos(`${n.nombre} ${n.plural}`).includes(f)) : NICHOS
    return FAMILIAS.map((fam) => ({ fam, lista: lista.filter((n) => n.familia === fam.id) })).filter((g) => g.lista.length)
  }

  function pintaGiros() {
    const G = giros()
    app.querySelector('.ps-giros').innerHTML =
      G.map(
        ({ fam, lista }) => `<div class="ps-fam"><p class="a-k">${esc(fam.nombre)}</p><div class="ps-rejilla">
          ${lista.map((n) => `<button type="button" class="ps-nicho ${st.nicho === n.id ? 'vivo' : ''}" data-nicho="${esc(n.id)}" aria-pressed="${st.nicho === n.id}">${icoNicho(n.icono)}<span>${esc(n.nombre)}</span></button>`).join('')}
        </div></div>`,
      ).join('') || `<p class="a-p">Ningún giro coincide. Elige «Otro giro» y escribe cuál es.</p>`
  }

  function pintaAntes() {
    const n = st.nicho ? nichoPorId(st.nicho) : null
    const z = app.querySelector('.ps-antes')
    z.hidden = !n
    if (!n) return
    z.innerHTML = `
      <p class="a-k">Antes de entrar</p>
      <p class="ps-apertura">«${esc(n.apertura)}»</p>
      <ul class="ps-observa">${n.observa.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      ${n.id === 'general' ? `<label class="a-campo" style="margin-top:16px;max-width:420px"><span>¿Qué giro es?</span><input class="a-in" data-otro value="${esc(st.otro)}" placeholder="Por ejemplo: vivero, imprenta, purificadora" /></label>` : ''}`
  }

  function pintaPie() {
    const c = conocido()
    app.querySelector('.ps-conocido').textContent = c && !previo ? 'Ya tiene expediente. Esta visita se suma a su historial.' : ''
    const listo = st.negocio.trim() && st.nicho
    const b = app.querySelector('[data-empezar]')
    b.disabled = !listo
    app.querySelector('.ps-falta').textContent = listo ? 'Se abre a pantalla completa. Para salir: Escape dos veces.' : !st.negocio.trim() ? 'Falta el nombre del negocio.' : 'Falta elegir el giro.'
  }

  app.innerHTML = `
    <div class="ps">
      <header class="ps-cab"><a class="a-enlace" href="#/crm">Volver al CRM</a><span class="a-k">Presala</span></header>
      <h1 class="a-h1 ps-h">Nueva visita</h1>

      <section class="ps-paso">
        <label class="a-k" for="ps-negocio">01 · ¿A dónde vas?</label>
        <input id="ps-negocio" class="ps-negocio" value="${esc(st.negocio)}" placeholder="Nombre del negocio" autocomplete="off" list="ps-conocidos" ${previo ? 'readonly' : 'autofocus'} />
        <datalist id="ps-conocidos">${store
          .lista('prospectos')
          .map((p) => `<option value="${esc(p.negocio)}"></option>`)
          .join('')}</datalist>
        <p class="a-ayuda ps-conocido"></p>
      </section>

      <section class="ps-paso">
        <div class="ps-paso-cab"><p class="a-k">02 · ¿Qué giro es?</p><input class="a-in ps-buscar" type="search" placeholder="Escribe para filtrar" aria-label="Filtrar giros" /></div>
        <div class="ps-giros"></div>
        <div class="ps-antes" hidden></div>
      </section>

      <section class="ps-paso">
        <p class="a-k">03 · ¿Quién va?</p>
        <div class="ps-van">${personas.map((p) => `<button type="button" class="ps-persona" data-va="${esc(p.id)}" aria-pressed="${st.van.has(p.id)}"><b>${esc(p.nombre)}</b><span>${esc(p.linea || '')}</span></button>`).join('')}</div>
        <label class="a-sw ps-graba"><input type="checkbox" data-graba ${grabadora.soportada ? '' : 'disabled'} /><i></i><span><b>Grabar la conversación</b><br /><span class="a-ayuda ps-mic">${grabadora.soportada ? 'Pide permiso antes de empezar. Sirve para no estar anotando y repasar después qué le interesó.' : 'Este navegador no permite grabar audio.'}</span></span></label>
      </section>

      <footer class="ps-pie">
        <button type="button" class="a-btn a-btn--azul a-btn--g" data-empezar>Empezar presentación</button>
        <p class="a-ayuda ps-falta"></p>
      </footer>
    </div>`
  pintaGiros()
  pintaAntes()
  pintaPie()

  const alEscribir = (e) => {
    const t = e.target
    if (t.id === 'ps-negocio') st.negocio = t.value
    else if (t.matches('.ps-buscar')) {
      st.filtro = t.value
      pintaGiros()
    } else if (t.matches('[data-otro]')) st.otro = t.value
    pintaPie()
  }
  const alCambiar = async (e) => {
    if (!e.target.matches('[data-graba]')) return
    st.graba = e.target.checked
    const nota = app.querySelector('.ps-mic')
    if (st.graba) {
      const ok = await grabadora.pedirPermiso()
      if (!ok) {
        st.graba = e.target.checked = false
        nota.textContent = 'No hay acceso al micrófono. Revisa el permiso del navegador y vuelve a intentarlo.'
      } else nota.textContent = 'Micrófono listo. La grabación empieza con la presentación; recuerda pedir permiso.'
    } else grabadora.soltar()
  }
  const alTeclear = (e) => {
    if (e.key === 'Enter' && e.target.matches('.ps-buscar')) {
      const primero = giros()[0]?.lista[0]
      if (primero) elegir(primero.id)
    }
  }
  function elegir(id) {
    st.nicho = id
    pintaGiros()
    pintaAntes()
    pintaPie()
  }
  app.addEventListener('input', alEscribir)
  app.addEventListener('change', alCambiar)
  app.addEventListener('keydown', alTeclear)
  const vivo = (e, si) => e.target.closest?.('.ps-nicho')?.classList.toggle('vivo', si || e.target.closest('.ps-nicho').getAttribute('aria-pressed') === 'true')
  const entra = (e) => vivo(e, true)
  const sale = (e) => vivo(e, false)
  app.addEventListener('pointerover', entra)
  app.addEventListener('pointerout', sale)

  const q = [
    alTocar(app, '[data-nicho]', (b) => elegir(b.dataset.nicho)),
    alTocar(app, '[data-va]', (b) => {
      const id = b.dataset.va
      st.van.has(id) && st.van.size > 1 ? st.van.delete(id) : st.van.add(id)
      app.querySelectorAll('[data-va]').forEach((x) => x.setAttribute('aria-pressed', String(st.van.has(x.dataset.va))))
    }),
    alTocar(app, '[data-empezar]', () => {
      if (!st.negocio.trim() || !st.nicho) return aviso('Faltan el nombre del negocio y el giro.')
      const c = conocido()
      const prospecto = store.guardar('prospectos', { ...(c ? { id: c.id } : { etapa: 'nuevo' }), negocio: st.negocio.trim(), nicho: st.nicho, nicho_otro: st.nicho === 'general' ? st.otro.trim() || null : null })
      const visita = store.guardar('visitas', { prospecto_id: prospecto.id, tipo: 1, inicio: ahora(), presentadores: [...st.van], graba: st.graba, estado: 'en_curso', datos: {} })
      document.documentElement.requestFullscreen?.().catch(() => {})
      ir(`/visita/${visita.id}`)
    }),
  ]

  return () => {
    q.forEach((f) => f())
    app.removeEventListener('input', alEscribir)
    app.removeEventListener('change', alCambiar)
    app.removeEventListener('keydown', alTeclear)
    app.removeEventListener('pointerover', entra)
    app.removeEventListener('pointerout', sale)
  }
}
