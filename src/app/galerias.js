import { abrirApp, alTocar } from './vista.js'
import { esc } from './util.js'
import { ir } from './router.js'
import { MODS } from '../demos/index.js'
import { montarDemo, abrirDemo } from '../demos/host.js'
import { NICHOS, nicho as nichoPorId } from '../content/nichos/index.js'
import { SOLUCIONES, MODULOS } from '../content/soluciones.js'
import { PROCESO } from '../icons/proceso.js'
import { icoNicho, icoProceso, hayIconoNicho, hayIconoProceso } from '../icons/render.js'
import { icon } from '../icons/icons.js'
import { AREAS } from '../content/base.js'

// Galerías internas: todas las demos y todos los iconos en un solo lugar.
// Sirven para revisar el trabajo y para enseñar una demo suelta sin pasar por una visita.

/** #/demos — todas las demos, con selector de nicho para verlas vestidas. */
export function vistaDemos({ consulta }) {
  const app = abrirApp({ tema: 'paper', titulo: 'Demos · Soma' })
  let n = consulta.n || 'restaurante'
  let negocio = consulta.b || 'La Casona'

  function pintar() {
    const mods = Object.keys(MODULOS).sort()
    app.innerHTML = `
      <div class="a-pagina">
        <header class="a-cab">
          <div><p class="a-k">Galería</p><h1 class="a-h1">Demos</h1><p class="a-p" style="margin-top:10px">Cada solución del catálogo tiene una demostración que se puede tocar. Elige un giro para verlas con sus datos.</p></div>
          <div class="a-cab-acc"><a class="a-btn" href="#/">Volver</a></div>
        </header>
        <div class="a-campos a-campos--2" style="max-width:640px">
          <label class="a-campo"><span>Giro</span><select class="a-in" data-n>${NICHOS.map((x) => `<option value="${esc(x.id)}" ${x.id === n ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label>
          <label class="a-campo"><span>Nombre del negocio</span><input class="a-in" data-b value="${esc(negocio)}" /></label>
        </div>
        ${mods
          .map((id) => {
            const mod = MODS[id]
            const vistas = [...MODULOS[id]]
            return `<section class="a-seccion">
              <div class="a-seccion-cab"><h2 class="a-h2">${esc(mod?.nombre || id)}</h2><span class="a-k">${esc(id)}</span></div>
              <div class="a-lista">
                ${vistas
                  .map((v) => {
                    const meta = mod?.vistas?.[v]
                    const sols = SOLUCIONES.filter((s) => s.demo.modulo === id && s.demo.vista === v)
                    return `<button class="a-item" style="--cols:1fr auto auto" data-demo="${esc(id)}/${esc(v)}">
                      <span><span class="a-item-t">${esc(meta?.titulo || v)}</span><br><span class="a-item-s">${sols.map((s) => esc(s.nombre)).join(' · ')}</span></span>
                      <span class="a-k">${esc(meta?.dispositivo || '')}</span>
                      ${meta ? `<span class="a-chip a-chip--ok">Lista</span>` : `<span class="a-chip a-chip--mal">Falta</span>`}
                    </button>`
                  })
                  .join('')}
              </div>
            </section>`
          })
          .join('')}
      </div>`
  }

  pintar()
  app.addEventListener('change', (e) => {
    if (e.target.matches('[data-n]')) n = e.target.value
    if (e.target.matches('[data-b]')) negocio = e.target.value
  })
  const quitar = alTocar(app, '[data-demo]', (b) => {
    const [modulo, vista] = b.dataset.demo.split('/')
    const sol = SOLUCIONES.find((s) => s.demo.modulo === modulo && s.demo.vista === vista)
    abrirDemo({ titulo: sol?.nombre, modulo, vista, negocio, nicho: nichoPorId(n) })
  })
  return quitar
}

/** #/demo/:modulo/:vista?n=…&b=… — una demo sola. En un teléfono real ocupa toda la pantalla. */
export function vistaDemoSuelta({ modulo, vista, consulta }) {
  const app = abrirApp({ tema: 'ink', titulo: 'Demostración · Soma' })
  const n = nichoPorId(consulta.n)
  const meta = MODS[modulo]?.vistas?.[vista]
  const esTelefono = matchMedia('(max-width: 560px)').matches && (meta?.dispositivo || 'telefono') === 'telefono'
  app.innerHTML = `
    <div class="demo-suelta ${esTelefono ? 'demo-suelta--plena' : ''}">
      <div class="demo-suelta-cab"><span class="a-k" style="color:inherit;opacity:.7">Demostración · datos de ejemplo</span><a class="a-btn a-btn--ch" href="#/demos" style="--fg:#efece4;--fg-3:rgb(239 236 228/.36)">Todas las demos</a></div>
      <div class="demo-suelta-zona"></div>
    </div>`
  const d = montarDemo(app.querySelector('.demo-suelta-zona'), { modulo, vista, negocio: consulta.b || 'Su negocio', nicho: n, plena: esTelefono })
  return () => d.destruir()
}

/** #/iconos — todos los iconos, con los que faltan marcados. */
export function vistaIconos() {
  const app = abrirApp({ tema: 'ink', titulo: 'Iconos · Soma' })
  const usados = [...new Set(SOLUCIONES.flatMap((s) => s.pasos.map((p) => p.ico)))].sort()
  const extra = Object.keys(PROCESO).filter((k) => !usados.includes(k)).sort()
  app.innerHTML = `
    <div class="a-pagina">
      <header class="a-cab"><div><p class="a-k">Galería</p><h1 class="a-h1">Iconos</h1><p class="a-p" style="margin-top:10px">Pasa el cursor sobre un giro para verlo vivo.</p></div><div class="a-cab-acc"><a class="a-btn" href="#/">Volver</a></div></header>
      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Giros</h2><span class="a-k">${NICHOS.length}</span></div>
        <div class="gal-rejilla" style="margin-top:14px">${NICHOS.map((x) => `<div class="gal-celda ${hayIconoNicho(x.icono) ? '' : 'gal-falta'}" data-vivo>${icoNicho(x.icono)}<span class="a-k">${esc(x.nombre)}</span></div>`).join('')}</div>
      </section>
      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Proceso</h2><span class="a-k">${usados.length + extra.length}</span></div>
        <div class="gal-rejilla" style="margin-top:14px">${[...usados, ...extra].map((k) => `<div class="gal-celda ${hayIconoProceso(k) ? '' : 'gal-falta'}">${icoProceso(k)}<span class="a-k">${esc(k)}</span></div>`).join('')}</div>
      </section>
      <section class="a-seccion"><div class="a-seccion-cab"><h2 class="a-h2">Áreas</h2><span class="a-k">${AREAS.length}</span></div>
        <div class="gal-rejilla" style="margin-top:14px">${AREAS.map((a) => `<div class="gal-celda"><span style="width:40px;height:40px;display:block">${icon(a.id)}</span><span class="a-k">${esc(a.nombre)}</span></div>`).join('')}</div>
      </section>
    </div>`
  const entra = (e) => e.target.closest?.('[data-vivo]')?.classList.add('vivo')
  const sale = (e) => e.target.closest?.('[data-vivo]')?.classList.remove('vivo')
  app.addEventListener('pointerover', entra)
  app.addEventListener('pointerout', sale)
  return () => {
    app.removeEventListener('pointerover', entra)
    app.removeEventListener('pointerout', sale)
  }
}

export { ir }
