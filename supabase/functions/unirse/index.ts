// Crea la cuenta de un integrante del equipo. Solo funciona con el código de equipo.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { nombre, correo, clave, codigo } = await req.json()
    if (!nombre || !correo || !clave || !codigo) return json({ error: 'Faltan datos.' }, 400)
    if (String(clave).length < 8) return json({ error: 'corta' }, 400)
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: ok } = await sb.rpc('codigo_equipo_valido', { p_codigo: String(codigo).trim() })
    if (!ok) {
      await new Promise((r) => setTimeout(r, 900))
      return json({ error: 'codigo' }, 403)
    }
    const { data, error } = await sb.auth.admin.createUser({ email: String(correo).trim(), password: String(clave), email_confirm: true, user_metadata: { nombre } })
    if (error || !data?.user) return json({ error: /already|registered|exists/i.test(error?.message || '') ? 'existe' : error?.message || 'No se pudo crear la cuenta.' }, 400)
    const { count } = await sb.from('equipo').select('*', { count: 'exact', head: true })
    const { error: e2 } = await sb.from('equipo').insert({ id: data.user.id, nombre: String(nombre).trim(), rol: count ? 'miembro' : 'admin' })
    if (e2) return json({ error: e2.message }, 500)
    return json({ ok: true })
  } catch (_e) {
    return json({ error: 'No se pudo crear la cuenta.' }, 500)
  }
})
