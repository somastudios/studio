// Recibe los avisos de Stripe y deja el CRM al día: marca pagos, extiende membresías y anota la bitácora.
// Necesita el secreto STRIPE_WEBHOOK_SECRET. Sin firma válida no hace nada.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const MESES: Record<string, number> = { mensual: 1, semestral: 6, anual: 12 }
const enc = new TextEncoder()
const hoyMx = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
const pesos = (centavos: number) => Math.round(centavos) / 100

function sumaMeses(dia: string, n: number) {
  const [a, m, d] = dia.split('-').map(Number)
  const x = new Date(Date.UTC(a, m - 1 + n, 1))
  const tope = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate()
  x.setUTCDate(Math.min(d, tope))
  return x.toISOString().slice(0, 10)
}

async function firmaValida(cuerpo: string, cabecera: string, secreto: string) {
  const partes = cabecera.split(',').map((p) => p.trim())
  const t = partes.find((p) => p.startsWith('t='))?.slice(2)
  const firmas = partes.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3))
  if (!t || !firmas.length || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false
  const llave = await crypto.subtle.importKey('raw', enc.encode(secreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', llave, enc.encode(`${t}.${cuerpo}`))
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return firmas.some((f) => {
    if (f.length !== hex.length) return false
    let dif = 0
    for (let i = 0; i < f.length; i++) dif |= f.charCodeAt(i) ^ hex.charCodeAt(i)
    return dif === 0
  })
}

const pagina = (titulo: string, texto: string) =>
  new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#efece4;color:#050506;font-family:system-ui,sans-serif"><main style="max-width:28rem;padding:2rem"><svg width="56" height="56" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#050506" stroke-width="6"/><circle cx="32" cy="32" r="9" fill="#216fff"/></svg><h1 style="font-size:1.8rem;margin:1.2rem 0 .5rem">${titulo}</h1><p style="font-size:1.05rem;line-height:1.5;opacity:.72">${texto}</p></main></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const q = new URL(req.url).searchParams
    return q.has('cancelado')
      ? pagina('No se hizo ningún cargo', 'Puede cerrar esta página. Si quiere intentarlo de nuevo, use el mismo enlace o escríbanos.')
      : pagina('Pago recibido', 'Gracias. Su pago quedó registrado y en un momento le confirmamos por mensaje. Ya puede cerrar esta página.')
  }
  const secreto = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const cuerpo = await req.text()
  if (!secreto || !(await firmaValida(cuerpo, req.headers.get('stripe-signature') || '', secreto))) return new Response('firma inválida', { status: 400 })

  const ev = JSON.parse(cuerpo)
  const o = ev.data?.object || {}
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const ahora = new Date().toISOString()
  const hoy = hoyMx()

  // Extiende la membresía según su modalidad y devuelve hasta cuándo queda cubierta.
  async function extender(membresia_id: string | null, extra: Record<string, unknown> = {}) {
    if (!membresia_id) return null
    const { data: m } = await sb.from('membresias').select('*').eq('id', membresia_id).maybeSingle()
    if (!m) return null
    const cambio: Record<string, unknown> = { ...extra, actualizado: ahora }
    let hasta: string | null = null
    if (m.modalidad === 'contado') cambio.estado = 'liquidada'
    else if (MESES[m.modalidad]) {
      hasta = sumaMeses(m.vence && m.vence > hoy ? m.vence : hoy, MESES[m.modalidad])
      cambio.vence = hasta
      cambio.estado = 'activa'
    }
    await sb.from('membresias').update(cambio).eq('id', m.id)
    return hasta
  }

  try {
    if (ev.type === 'checkout.session.completed' && o.payment_status !== 'unpaid') {
      const pago_id = o.metadata?.pago_id || o.client_reference_id
      const { data: pago } = pago_id ? await sb.from('pagos').select('*').eq('id', pago_id).maybeSingle() : { data: null }
      if (pago && pago.estado !== 'confirmado') {
        const hasta = await extender(pago.membresia_id, { stripe_cliente: o.customer || null, ...(o.subscription ? { stripe_suscripcion: o.subscription, auto: true } : {}) })
        await sb.from('pagos').update({ estado: 'confirmado', fecha: hoy, referencia: o.payment_intent || o.subscription || o.id, cubre_hasta: hasta, actualizado: ahora }).eq('id', pago.id)
        await sb.from('bitacora').insert({ prospecto_id: pago.prospecto_id, tipo: 'pago', texto: `Pago con tarjeta confirmado: $${Number(pago.monto).toLocaleString('es-MX')}.`, datos: { pago_id: pago.id }, quien: 'Stripe' })
      }
    } else if (ev.type === 'invoice.paid' || ev.type === 'invoice.payment_failed') {
      const sub = o.subscription || o.parent?.subscription_details?.subscription
      const { data: m } = sub ? await sb.from('membresias').select('*').eq('stripe_suscripcion', sub).is('eliminado', null).maybeSingle() : { data: null }
      if (m && ev.type === 'invoice.paid' && o.billing_reason !== 'subscription_create') {
        const hasta = await extender(m.id)
        await sb.from('pagos').insert({ prospecto_id: m.prospecto_id, membresia_id: m.id, concepto: 'Renovación automática', monto: pesos(o.amount_paid || 0), moneda: String(o.currency || 'mxn').toUpperCase(), metodo: 'stripe', estado: 'confirmado', fecha: hoy, referencia: o.id, stripe_id: o.id, cubre_hasta: hasta, registrado_por: 'Stripe' })
        await sb.from('bitacora').insert({ prospecto_id: m.prospecto_id, tipo: 'pago', texto: `Renovación automática cobrada: $${pesos(o.amount_paid || 0).toLocaleString('es-MX')}.`, quien: 'Stripe' })
      } else if (m && ev.type === 'invoice.payment_failed') {
        await sb.from('bitacora').insert({ prospecto_id: m.prospecto_id, tipo: 'pago', texto: 'Stripe no pudo cobrar la renovación. Conviene avisarle al cliente.', datos: { factura: o.id }, quien: 'Stripe' })
      }
    } else if (ev.type === 'customer.subscription.deleted') {
      const { data: m } = await sb.from('membresias').select('*').eq('stripe_suscripcion', o.id).is('eliminado', null).maybeSingle()
      if (m) {
        await sb.from('membresias').update({ auto: false, stripe_suscripcion: null, actualizado: ahora }).eq('id', m.id)
        await sb.from('bitacora').insert({ prospecto_id: m.prospecto_id, tipo: 'pago', texto: 'Se canceló la renovación automática con tarjeta. La membresía sigue vigente hasta su fecha de vencimiento.', quien: 'Stripe' })
      }
    }
  } catch (e) {
    console.error(e)
    return new Response('error', { status: 500 })
  }
  return new Response(JSON.stringify({ recibido: true }), { headers: { 'Content-Type': 'application/json' } })
})
