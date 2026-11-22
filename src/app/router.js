// Enrutador por hash. Una ruta es un patrón y una vista; una vista es
// `montar(params) → desmontar`. Solo hay una vista montada a la vez.

const rutas = []
let actual = null
let guardia = null

/** ruta('/crm/prospecto/:id', vista) */
export function ruta(patron, vista) {
  const claves = []
  const re = new RegExp(
    '^' +
      patron.replace(/:(\w+)/g, (_, k) => {
        claves.push(k)
        return '([^/]+)'
      }) +
      '/?$',
  )
  rutas.push({ re, claves, vista })
}

/** Una función que decide si una ruta se puede ver. Devuelve otra ruta para redirigir. */
export const conGuardia = (fn) => (guardia = fn)

export function ir(hash, { reemplazar = false } = {}) {
  const h = hash.startsWith('#') ? hash : '#' + hash
  if (location.hash === h) return resolver()
  if (reemplazar) {
    history.replaceState(null, '', h)
    resolver()
  } else location.hash = h
}

export const rutaActual = () => (location.hash.replace(/^#/, '') || '/').split('?')[0]

export function consulta() {
  const q = location.hash.split('?')[1] || ''
  return Object.fromEntries(new URLSearchParams(q))
}

async function resolver() {
  let camino = rutaActual()
  const destino = guardia?.(camino)
  if (destino && destino !== camino) return ir(destino, { reemplazar: true })
  for (const r of rutas) {
    const m = r.re.exec(camino)
    if (!m) continue
    const params = Object.fromEntries(r.claves.map((k, i) => [k, decodeURIComponent(m[i + 1])]))
    try {
      actual?.()
    } catch (e) {
      console.error(e)
    }
    actual = null
    const fin = await r.vista({ ...params, consulta: consulta() })
    actual = typeof fin === 'function' ? fin : null
    return
  }
  ir('/', { reemplazar: true })
}

export function iniciarRutas() {
  addEventListener('hashchange', resolver)
  resolver()
}

export const recargar = resolver
