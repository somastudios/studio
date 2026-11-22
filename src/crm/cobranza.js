import { store } from '../data/store.js'
import { sesion } from '../app/sesion.js'
import { dia, deDia, sumaDias, sumaMeses, diasPara, fecha, dinero, plantilla, telBonito } from '../app/util.js'
import { MODALIDADES } from '../data/esquema.js'

// Las reglas de membresías y cobros, en un solo lugar. El servidor aplica las mismas
// cuando un pago entra por Stripe (supabase/functions/stripe-webhook).

const MESES = { mensual: 1, semestral: 6, anual: 12 }
export const nombreModalidad = (id) => MODALIDADES.find((m) => m.id === id)?.nombre || '—'

/** Estado real de una membresía hoy: { id, texto, chip, dias }. */
export function estadoMembresia(m) {
  const aviso = Number(store.ajuste('dias_aviso')) || 7
  if (!m) return { id: 'ninguna', texto: 'Sin membresía', chip: 'mudo' }
  if (m.estado === 'cancelada') return { id: 'cancelada', texto: 'Cancelada', chip: 'mudo' }
  if (m.estado === 'pausada') return { id: 'pausada', texto: 'En pausa', chip: 'mudo' }
  if (m.modalidad === 'contado') return m.estado === 'liquidada' ? { id: 'liquidada', texto: 'Pagado, es suyo', chip: 'ok' } : { id: 'por_cobrar', texto: 'Pago único pendiente', chip: 'alerta' }
  if (!m.vence) return { id: 'sin_fecha', texto: 'Sin fecha de vencimiento', chip: 'alerta' }
  const d = diasPara(m.vence)
  if (m.modalidad === 'prueba') return d < 0 ? { id: 'prueba_vencida', texto: `La prueba terminó ${rel(d)}`, chip: 'mal', dias: d } : { id: 'prueba', texto: d === 0 ? 'La prueba termina hoy' : `En prueba, ${d} ${d === 1 ? 'día' : 'días'} más`, chip: 'azul', dias: d }
  if (d < 0) return { id: 'vencida', texto: `Venció ${rel(d)}`, chip: 'mal', dias: d }
  if (d <= aviso) return { id: 'por_vencer', texto: d === 0 ? 'Vence hoy' : `Vence en ${d} ${d === 1 ? 'día' : 'días'}`, chip: 'alerta', dias: d }
  return { id: 'al_corriente', texto: 'Al corriente', chip: 'ok', dias: d }
}
const rel = (d) => (d === -1 ? 'ayer' : `hace ${-d} días`)

/** ¿Hay que cobrarle o avisarle? */
export const requiereAtencion = (m) => ['por_vencer', 'vencida', 'prueba_vencida', 'por_cobrar', 'sin_fecha'].includes(estadoMembresia(m).id)

/** Hasta cuándo queda cubierta una membresía si paga hoy. */
export function siguienteVencimiento(m, desde = dia()) {
  const n = MESES[m.modalidad]
  if (!n) return null
  const base = m.vence && m.vence > desde ? m.vence : desde
  return dia(sumaMeses(base, n))
}

/** Precio de una propuesta a cierto plazo: { mensual, total, ahorro, meses }. */
export function precioPlazo(p, meses) {
  const base = Number(p?.precio_mensual) || 0
  const desc = meses === 6 ? Number(p?.desc_6) || 0 : meses === 12 ? Number(p?.desc_12) || 0 : 0
  const total = Math.round(base * meses * (1 - desc / 100))
  return { meses, mensual: meses ? Math.round(total / meses) : 0, total, ahorro: base * meses - total, desc }
}

export function montoModalidad(p, modalidad) {
  if (modalidad === 'contado') return Number(p?.precio_contado) || 0
  if (modalidad === 'prueba') return 0
  return precioPlazo(p, MESES[modalidad] || 1).total
}

/**
 * Registra un pago. Si queda confirmado y pertenece a una membresía, la extiende.
 * Devuelve el pago guardado.
 */
export function registrarPago({ membresia, prospecto_id, monto, metodo, fecha: f = dia(), referencia = null, notas = null, concepto = null, estado = 'confirmado' }) {
  let cubre = null
  if (membresia && estado === 'confirmado') cubre = aplicarPago(membresia, f)
  const pago = store.guardar('pagos', {
    prospecto_id: prospecto_id || membresia?.prospecto_id || null,
    membresia_id: membresia?.id || null,
    concepto: concepto || (membresia ? nombreModalidad(membresia.modalidad) : 'Pago'),
    monto: Number(monto) || 0,
    moneda: 'MXN',
    metodo,
    estado,
    fecha: f,
    referencia,
    notas,
    cubre_hasta: cubre,
    registrado_por: sesion.nombre || null,
  })
  if (estado === 'confirmado') store.anotar(pago.prospecto_id, 'pago', `Pago registrado: ${dinero(pago.monto)} por ${metodo}.`, { pago_id: pago.id }, sesion.nombre)
  return pago
}

/** Marca como pagado un cobro que estaba pendiente (por ejemplo, un enlace de tarjeta). */
export function confirmarPago(pago, extra = {}) {
  const m = pago.membresia_id ? store.uno('membresias', pago.membresia_id) : null
  const cubre = m ? aplicarPago(m, extra.fecha || dia()) : null
  store.anotar(pago.prospecto_id, 'pago', `Pago confirmado: ${dinero(pago.monto)}.`, { pago_id: pago.id }, sesion.nombre)
  return store.guardar('pagos', { id: pago.id, estado: 'confirmado', fecha: extra.fecha || dia(), cubre_hasta: cubre, ...extra })
}

function aplicarPago(m, f) {
  if (m.modalidad === 'contado') {
    store.guardar('membresias', { id: m.id, estado: 'liquidada' })
    return null
  }
  const vence = siguienteVencimiento(m, f)
  if (vence) store.guardar('membresias', { id: m.id, vence, estado: 'activa' })
  return vence
}

/** Crea la membresía que corresponde a lo que el cliente decidió en la segunda visita. */
export function activarMembresia({ prospecto, propuesta, modalidad, sistema_id = null }) {
  const hoy = dia()
  const m = store.guardar('membresias', {
    prospecto_id: prospecto.id,
    propuesta_id: propuesta?.id || null,
    sistema_id,
    modalidad,
    monto: montoModalidad(propuesta, modalidad),
    moneda: 'MXN',
    inicio: hoy,
    // Hasta el primer pago, vence hoy: así aparece de inmediato en "por cobrar".
    vence: modalidad === 'contado' ? null : modalidad === 'prueba' ? dia(sumaDias(hoy, Number(propuesta?.prueba_dias) || 7)) : hoy,
    estado: modalidad === 'prueba' ? 'prueba' : 'activa',
    auto: false,
  })
  store.guardar('prospectos', { id: prospecto.id, etapa: 'cliente' })
  store.anotar(prospecto.id, 'membresia', `Se activó: ${nombreModalidad(modalidad)}${m.monto ? `, ${dinero(m.monto)}` : ''}.`, { membresia_id: m.id }, sesion.nombre)
  return m
}

/** Mensaje listo para enviar, a partir de las plantillas de Ajustes. */
export function mensaje(tipo, { prospecto, membresia, pago, cita } = {}) {
  const t = store.ajuste('plantillas')?.[tipo] || ''
  return plantilla(t, {
    contacto: (prospecto?.contacto || '').split(' ')[0] || 'buen día',
    negocio: prospecto?.negocio || '',
    quien: sesion.nombre || 'el equipo',
    vence: membresia?.vence ? fecha(membresia.vence, 'larga') : '',
    monto: dinero(pago?.monto ?? membresia?.monto ?? 0),
    fecha: cita?.inicio ? fecha(cita.inicio, 'larga') : '',
    hora: cita?.inicio ? fecha(cita.inicio, 'hora') : '',
  })
}

export const tipoAviso = (m) => {
  const e = estadoMembresia(m).id
  return e === 'vencida' || e === 'prueba_vencida' ? 'vencida' : 'por_vencer'
}

/** Resumen de cobranza para tableros. */
export function resumenCobranza() {
  const mes = dia().slice(0, 7)
  const pagos = store.lista('pagos', (p) => p.estado === 'confirmado')
  const membresias = store.lista('membresias')
  const con = (ids) => membresias.filter((m) => ids.includes(estadoMembresia(m).id))
  const suma = (l) => l.reduce((s, x) => s + (Number(x.monto) || 0), 0)
  return {
    cobradoMes: suma(pagos.filter((p) => (p.fecha || '').startsWith(mes))),
    porVencer: con(['por_vencer']),
    vencidas: con(['vencida', 'prueba_vencida', 'por_cobrar']),
    alCorriente: con(['al_corriente', 'liquidada']),
    enPrueba: con(['prueba']),
    mensualRecurrente: suma(con(['al_corriente', 'por_vencer']).map((m) => ({ monto: (Number(m.monto) || 0) / (MESES[m.modalidad] || 1) }))),
  }
}

export { telBonito, deDia }
