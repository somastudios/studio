// Crea un enlace de pago con tarjeta (Stripe Checkout) para un pago ya registrado en el CRM.
// Usa la llave de Stripe guardada desde Ajustes → Pagos con tarjeta. Solo lo puede llamar alguien del equipo con sesión.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })
const MESES: Record<string, number> = { mensual: 1, semestral: 6, anual: 12 }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const sb = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    const { data: u } = await sb.auth.getUser(token)
    if (!u?.user) return json({ error: 'Necesitas iniciar sesión.' }, 401)
    const { data: yo } = await sb.from('equipo').select('id').eq('id', u.user.id).maybeSingle()
    if (!yo) return json({ error: 'Solo el equipo puede crear cobros.' }, 403)

    const llave = Deno.env.get('STRIPE_SECRET_KEY') || ((await sb.rpc('secreto_servidor', { p_nombre: 'stripe_llave' })).data as string | null)
    if (!llave) return json({ error: 'Los pagos con tarjeta todavía no están conectados. Se conectan en Ajustes → Pagos con tarjeta.' }, 400)

    const { pago_id, recurrente } = await req.json()
    const { data: pago } = await sb.from('pagos').select('*').eq('id', pago_id).is('eliminado', null).maybeSingle()
    if (!pago) return json({ error: 'Ese pago todavía no llega al servidor. Espera a que sincronice e intenta de nuevo.' }, 404)
    if (!(Number(pago.monto) > 0)) return json({ error: 'El pago necesita un monto mayor a cero.' }, 400)
    const { data: pro } = pago.prospecto_id ? await sb.from('prospectos').select('negocio, correo').eq('id', pago.prospecto_id).maybeSingle() : { data: null }
    const { data: mem } = pago.membresia_id ? await sb.from('membresias').select('modalidad').eq('id', pago.membresia_id).maybeSingle() : { data: null }

    const meses = MESES[mem?.modalidad || ''] || 0
    const sub = !!recurrente && meses > 0
    const p = new URLSearchParams()
    p.set('mode', sub ? 'subscription' : 'payment')
    p.set('locale', 'es-419')
    p.set('success_url', `${url}/functions/v1/stripe-webhook?gracias=1`)
    p.set('cancel_url', `${url}/functions/v1/stripe-webhook?cancelado=1`)
    p.set('client_reference_id', pago.id)
    p.set('line_items[0][quantity]', '1')
    p.set('line_items[0][price_data][currency]', String(pago.moneda || 'mxn').toLowerCase())
    p.set('line_items[0][price_data][unit_amount]', String(Math.round(Number(pago.monto) * 100)))
    p.set('line_items[0][price_data][product_data][name]', pago.concepto || `Soma · ${pro?.negocio || 'Servicio'}`)
    if (sub) {
      p.set('line_items[0][price_data][recurring][interval]', 'month')
      p.set('line_items[0][price_data][recurring][interval_count]', String(meses))
      p.set('subscription_data[metadata][membresia_id]', pago.membresia_id || '')
      p.set('subscription_data[metadata][prospecto_id]', pago.prospecto_id || '')
    }
    p.set('metadata[pago_id]', pago.id)
    p.set('metadata[membresia_id]', pago.membresia_id || '')
    p.set('metadata[prospecto_id]', pago.prospecto_id || '')
    if (pro?.correo) p.set('customer_email', pro.correo)

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${llave}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: p })
    const s = await r.json()
    if (!r.ok) return json({ error: `Stripe no aceptó el cobro: ${s?.error?.message || 'error desconocido'}` }, 400)
    await sb.from('pagos').update({ enlace: s.url, stripe_id: s.id, metodo: 'stripe', estado: 'pendiente', actualizado: new Date().toISOString() }).eq('id', pago.id)
    return json({ url: s.url })
  } catch (_e) {
    return json({ error: 'No se pudo crear el enlace de pago.' }, 500)
  }
})
