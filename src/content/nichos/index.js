import { FAMILIAS } from '../base.js'

// Reúne todos los nichos de esta carpeta. Para agregar uno basta con crear su archivo.
const mods = import.meta.glob('./*.js', { eager: true })

const ordenFamilia = Object.fromEntries(FAMILIAS.map((f, i) => [f.id, i]))

export const NICHOS = Object.entries(mods)
  .filter(([ruta]) => !ruta.endsWith('/index.js'))
  .map(([, m]) => m.default)
  .filter(Boolean)
  .sort((a, b) => (ordenFamilia[a.familia] ?? 99) - (ordenFamilia[b.familia] ?? 99) || (a.orden ?? 50) - (b.orden ?? 50) || a.nombre.localeCompare(b.nombre, 'es'))

export const NICHO = Object.fromEntries(NICHOS.map((n) => [n.id, n]))

/** El nicho pedido o, si no existe, el genérico. */
export const nicho = (id) => NICHO[id] || NICHO.general || NICHOS[0]
