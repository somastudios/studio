// Conecta Stripe desde el CRM. Recibe la llave secreta, la comprueba contra Stripe, activa los
// avisos de pago (webhook) y guarda todo cifrado en la bóveda. La llave nunca se devuelve.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })
const EVENTOS = ['checkout.session.completed', 'invoice.paid', 'invoice.payment_failed', 'customer.subscription.deleted']

async function stripe(llave: string, metodo: string, ruta: string, cuerpo?: URLSearchParams) {
  const r = await fetch(`https://api.stripe.com/v1/${ruta}`, { method: metodo, headers: { Authorization: `Bearer ${llave}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: cuerpo })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, estado: r.status, data }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const sb = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    const { data: u } = await sb.auth.getUser(token)
    if (!u?.user) return json({ error: 'Necesitas iniciar sesión.' }, 401)
    const { data: yo } = await sb.from('equipo').select('id, nombre').eq('id', u.user.id).maybeSingle()
    if (!yo) return json({ error: 'Solo el equipo puede conectar Stripe.' }, 403)

    const body = await req.json().catch(() => ({}))
    const leer = async (n: string) => (await sb.rpc('secreto_servidor', { p_nombre: n })).data as string | null
    const guardar = (n: string, v: string) => sb.rpc('secreto_servidor_guardar', { p_nombre: n, p_valor: v })
    const anotar = (valor: Record<string, unknown>) => sb.from('ajustes').upsert({ id: 'stripe', valor, actualizado: new Date().toISOString() })
    const modoDe = (ll: string) => (/_live_/.test(ll) ? 'real' : 'prueba')

    // Quién es la cuenta. Con llaves restringidas /account puede no estar permitido; /balance sirve para validar.
    async function cuentaDe(ll: string) {
      const a = await stripe(ll, 'GET', 'account')
      if (a.ok) return { ok: true, nombre: a.data?.settings?.dashboard?.display_name || a.data?.business_profile?.name || a.data?.email || 'Cuenta de Stripe' }
      if (a.estado === 401) return { ok: false, nombre: '' }
      const b = await stripe(ll, 'GET', 'balance')
      return { ok: b.ok, nombre: 'Cuenta de Stripe' }
    }

    if (body.accion === 'quitar') {
      await guardar('stripe_llave', '')
      await guardar('stripe_webhook', '')
      await anotar({ conectado: false })
      return json({ conectado: false })
    }

    if (body.accion === 'guardar') {
      const llave = String(body.llave || '').trim()
      if (!/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(llave)) return json({ error: 'Eso no parece una llave secreta de Stripe. Empieza con sk_test_ o sk_live_.' }, 400)
      const c = await cuentaDe(llave)
      if (!c.ok) return json({ error: 'Stripe no reconoce esa llave. Revisa que la hayas copiado completa.' }, 400)

      // Avisos de pago: se desactiva cualquier aviso anterior hacia esta dirección y se crea uno nuevo,
      // porque su secreto de firma solo se entrega al crearlo.
      const destino = `${url}/functions/v1/stripe-webhook`
      let webhook = false
      let nota = ''
      const manual = String(body.webhook || '').trim()
      if (manual) {
        if (!/^whsec_/.test(manual)) return json({ error: 'El secreto de firma empieza con whsec_.' }, 400)
        await guardar('stripe_webhook', manual)
        webhook = true
      } else {
        const lista = await stripe(llave, 'GET', 'webhook_endpoints?limit=100')
        if (lista.ok) {
          for (const w of lista.data?.data || []) {
            if (w.url === destino && w.status === 'enabled') await stripe(llave, 'POST', `webhook_endpoints/${w.id}`, new URLSearchParams({ disabled: 'true' }))
          }
          const p = new URLSearchParams({ url: destino, description: 'Soma CRM: marca pagos y extiende membresías' })
          EVENTOS.forEach((e) => p.append('enabled_events[]', e))
          const nuevo = await stripe(llave, 'POST', 'webhook_endpoints', p)
          if (nuevo.ok && nuevo.data?.secret) {
            await guardar('stripe_webhook', nuevo.data.secret)
            webhook = true
          }
        }
        if (!webhook) nota = 'La llave funciona, pero no tiene permiso para activar los avisos de pago. Los enlaces se pueden crear; los pagos habrá que marcarlos a mano hasta pegar el secreto de firma en «Opciones avanzadas».'
      }

      await guardar('stripe_llave', llave)
      const estado = { conectado: true, modo: modoDe(llave), cuenta: c.nombre, termina: llave.slice(-4), webhook, quien: yo.nombre, fecha: new Date().toISOString() }
      await anotar(estado)
      return json({ ...estado, nota })
    }

    // Estado actual: se vuelve a comprobar la llave guardada contra Stripe.
    const llave = Deno.env.get('STRIPE_SECRET_KEY') || (await leer('stripe_llave'))
    if (!llave) return json({ conectado: false })
    const c = await cuentaDe(llave)
    const wh = Deno.env.get('STRIPE_WEBHOOK_SECRET') || (await leer('stripe_webhook'))
    return json({ conectado: c.ok, modo: modoDe(llave), cuenta: c.nombre, termina: llave.slice(-4), webhook: !!wh, error: c.ok ? undefined : 'Stripe ya no reconoce la llave guardada. Conecta una nueva.' })
  } catch (_e) {
    return json({ error: 'No se pudo completar. Intenta de nuevo.' }, 500)
  }
})
