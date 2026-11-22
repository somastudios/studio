// Soma Connect: el punto de contacto entre un sistema entregado y el CRM.
// El sistema se identifica con su llave y pregunta por su licencia (ping) o reporta algo (evento).
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'x-soma-key, content-type, apikey, authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })
const hoyMx = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json().catch(() => ({}))
    const llave = req.headers.get('x-soma-key') || body.llave
    if (!llave) return json({ error: 'Falta la llave.' }, 401)
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: s } = await sb.from('sistemas').select('*').eq('llave', llave).is('eliminado', null).maybeSingle()
    if (!s) return json({ error: 'Llave desconocida.' }, 401)

    if (body.accion === 'evento') {
      await sb.from('bitacora').insert({
        prospecto_id: s.prospecto_id,
        tipo: 'sistema',
        texto: String(body.texto || body.tipo || 'Evento del sistema').slice(0, 300),
        datos: { sistema_id: s.id, tipo: body.tipo ?? null, datos: body.datos ?? null },
        quien: s.nombre,
      })
      return json({ ok: true })
    }

    // Señal de vida. No toca `actualizado`: así no pisa una edición pendiente hecha desde el CRM.
    await sb.from('sistemas').update({ ultima_senal: new Date().toISOString(), version: body.version ?? s.version, ultima_url: body.url ?? s.ultima_url }).eq('id', s.id)

    const { data: ms } = await sb.from('membresias').select('*').eq('sistema_id', s.id).is('eliminado', null).order('creado', { ascending: false })
    const m = (ms || []).find((x) => x.estado !== 'cancelada')
    const { data: aj } = await sb.from('ajustes').select('valor').eq('id', 'dias_aviso').maybeSingle()
    const diasAviso = Number(aj?.valor ?? 7) || 7

    let estado = 'activa'
    let dias: number | null = null
    let vence: string | null = null
    if (s.estado === 'suspendido') estado = 'suspendido'
    else if (!m) estado = 'sin_membresia'
    else if (m.modalidad === 'contado' || m.estado === 'liquidada') estado = 'activa'
    else if (m.vence) {
      vence = m.vence
      dias = Math.round((Date.parse(m.vence + 'T00:00:00Z') - Date.parse(hoyMx() + 'T00:00:00Z')) / 864e5)
      if (dias < 0) estado = 'vencida'
      else if (m.modalidad === 'prueba') estado = 'prueba'
      else estado = dias <= diasAviso ? 'por_vencer' : 'activa'
    }
    return json({ estado, vence, dias, modo: s.modo_vencido || 'aviso', mensaje: s.mensaje || null, config: s.config || {} })
  } catch (_e) {
    return json({ error: 'No se pudo procesar.' }, 500)
  }
})
