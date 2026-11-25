import { $, $$, words, wordsDot, rise, fade, pad } from '../core/fx.js'
import { esc } from '../app/util.js'
import { escena, linea } from './base.js'
import { ESPACIOS } from '../content/visita.js'
import { ESPACIOS_EN_OBRA } from '../config.js'

// Espacios: escenas que ya tienen su lugar en la presentación pero todavía no su contenido.
// Cada una muestra su título y los huecos que le faltan, con lo que va en cada uno. Para
// llenar una: reemplaza su `pinta` (o hazle su propio archivo de escena) y quítala de aquí.
// Los textos están en ESPACIOS, en src/content/visita.js.

/** Una escena en obra. `tema` es 'paper' o 'ink'. */
const espacio = (clave, tema = 'paper') =>
  escena({
    id: `espacio-${clave}`,
    theme: tema,
    title: ESPACIOS[clave].nav,
    pinta(el) {
      const T = ESPACIOS[clave]
      const ultima = T.titulo.length - 1
      el.innerHTML = `
        <div class="scene-inner ve">
          <header class="ve-cab">
            <p class="t-label ve-obra"><i></i>${esc(ESPACIOS.obra)}</p>
            <h2 class="t-display ve-h">${T.titulo.map((t, i) => `<span class="ln">${i === ultima ? wordsDot(t) : words(t)}</span>`).join('')}</h2>
            <p class="t-body ve-intro">${esc(T.intro)}</p>
          </header>
          <ol class="ve-huecos">
            ${T.huecos.map((h, i) => `<li class="ve-hueco" data-hueco="${clave}-${i + 1}"><span class="t-label ve-n">${pad(i + 1)}</span><span class="ve-t">${esc(h.t)}</span><span class="t-body ve-d">${esc(h.d)}</span></li>`).join('')}
          </ol>
        </div>`
      const tl = linea()
      rise(tl, $$(el, '.ve-h .wi'), 0.1, { stagger: 0.07 })
      fade(tl, [$(el, '.ve-obra'), $(el, '.ve-intro')], 0.5)
      fade(tl, $$(el, '.ve-hueco'), 0.7, { stagger: 0.12 })
      return { tl, anchor: () => $(el, '[data-dot]') }
    },
  })

/**
 * Mete los espacios en una lista de escenas: `despuesDe` es el id de la escena que va antes.
 * Con ESPACIOS_EN_OBRA apagado devuelve la lista tal cual: la presentación queda limpia para
 * llevarla con un cliente.
 */
export function conEspacios(escenas, plan) {
  if (!ESPACIOS_EN_OBRA) return escenas
  const out = []
  for (const e of escenas) {
    out.push(e)
    for (const [despuesDe, clave, tema] of plan) if (e.id === despuesDe) out.push(espacio(clave, tema))
  }
  return out
}
