import { REGION, MONEDA } from '../config.js'

// Utilidades compartidas por la presala, las visitas y el CRM.

export const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16))

/** Escapa texto para insertarlo en HTML. Todo dato que venga de una persona pasa por aquí. */
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const ahora = () => new Date().toISOString()

/** Fecha local en formato AAAA-MM-DD (sin el corrimiento de zona de toISOString). */
export const dia = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

/** Interpreta 'AAAA-MM-DD' como fecha local. */
export const deDia = (s) => {
  if (!s) return null
  if (s instanceof Date) return s
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s)
}

export const sumaDias = (d, n) => {
  const x = new Date(deDia(d))
  x.setDate(x.getDate() + n)
  return x
}

export const sumaMeses = (d, n) => {
  const x = new Date(deDia(d))
  const diaMes = x.getDate()
  x.setDate(1)
  x.setMonth(x.getMonth() + n)
  x.setDate(Math.min(diaMes, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()))
  return x
}

/** Días completos entre hoy y una fecha. Negativo si ya pasó. */
export const diasPara = (d) => {
  const a = deDia(dia())
  const b = deDia(dia(deDia(d)))
  return Math.round((b - a) / 86400000)
}

const fmt = (opts) => new Intl.DateTimeFormat(REGION, opts)
const F = {
  corta: fmt({ day: 'numeric', month: 'short' }),
  media: fmt({ weekday: 'short', day: 'numeric', month: 'short' }),
  larga: fmt({ weekday: 'long', day: 'numeric', month: 'long' }),
  completa: fmt({ day: 'numeric', month: 'long', year: 'numeric' }),
  hora: fmt({ hour: 'numeric', minute: '2-digit', hour12: true }),
  mes: fmt({ month: 'long', year: 'numeric' }),
}

/** fecha(d, 'corta' | 'media' | 'larga' | 'completa' | 'hora' | 'mes') */
export const fecha = (d, estilo = 'media') => {
  const x = deDia(d)
  return x && !isNaN(x) ? F[estilo].format(x).replace(/\./g, '') : ''
}

/** "hoy", "mañana", "en 3 días", "hace 2 días". */
export const relativo = (d) => {
  const n = diasPara(d)
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  if (n === -1) return 'ayer'
  return n > 0 ? `en ${n} días` : `hace ${-n} días`
}

const pesos = new Intl.NumberFormat(REGION, { style: 'currency', currency: MONEDA, maximumFractionDigits: 0 })
const pesosC = new Intl.NumberFormat(REGION, { style: 'currency', currency: MONEDA, minimumFractionDigits: 2 })

/** dinero(1800) → "$1,800". Con centavos solo si los hay. */
export const dinero = (n) => {
  const v = Number(n)
  if (!isFinite(v)) return ''
  return Number.isInteger(v) ? pesos.format(v) : pesosC.format(v)
}

/** Deja solo dígitos; a 10 dígitos les antepone el 52 de México. */
export const telLimpio = (t) => {
  const d = String(t ?? '').replace(/\D/g, '')
  if (d.length === 10) return '52' + d
  return d
}

export const telBonito = (t) => {
  const d = String(t ?? '').replace(/\D/g, '').slice(-10)
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : String(t ?? '')
}

/** Enlace que abre WhatsApp con el mensaje ya escrito. */
export const enlaceWhatsApp = (tel, texto = '') => `https://wa.me/${telLimpio(tel)}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`

export const enlaceCorreo = (correo, asunto = '', cuerpo = '') =>
  `mailto:${encodeURIComponent(correo ?? '')}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`

/** Enlace para agregar una cita a Google Calendar sin pedir permisos de nada. */
export const enlaceCalendario = ({ titulo, inicio, minutos = 45, lugar = '', detalle = '' }) => {
  const a = new Date(inicio)
  const b = new Date(a.getTime() + minutos * 60000)
  const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${z(a)}/${z(b)}&location=${encodeURIComponent(lugar)}&details=${encodeURIComponent(detalle)}`
}

/** Sustituye {claves} en una plantilla. Lo que no exista se deja vacío. */
export const plantilla = (s, datos = {}) => String(s ?? '').replace(/\{(\w+)\}/g, (_, k) => datos[k] ?? '')

export const mayus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

export const duracion = (seg) => {
  const s = Math.max(0, Math.round(seg || 0))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export const copiar = async (texto) => {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}

export const espera = (ms) => new Promise((r) => setTimeout(r, ms))

/** Agrupa una lista por una clave. */
export const agrupar = (lista, fn) => {
  const m = new Map()
  for (const x of lista) {
    const k = fn(x)
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(x)
  }
  return m
}
