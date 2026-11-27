import { SOL, EJES } from '../content/soluciones.js'
import { AREA, vocab, txt } from '../content/base.js'
import { nicho as nichoPorId } from '../content/nichos/index.js'
import { V1 } from '../content/visita.js'
import { dinero } from '../app/util.js'

// El prompt para construir el sistema de un cliente. Sale del expediente: lo que dijo en el
// diagnóstico, la ruta que eligió en cada problema y lo que se le propuso. Se copia y se le da
// a Claude tal cual.
//
// Es una función pura: `promptDe(datos)` devuelve { texto, faltan }. `faltan` son las cosas
// que conviene resolver antes de construir; salen arriba del prompt en el CRM.

const linea = (k, v) => (v ? `- ${k}: ${v}` : '')
const junta = (...ls) => ls.filter(Boolean).join('\n')

/** Quién decide, según lo que se anotó al apartar la segunda visita. */
export function decisorDe(p, visitas) {
  const d = visitas.map((v) => v.datos?.decisor).find(Boolean)
  if (!d) return null
  if (d.decide === 'si') return { decide: true, nombre: p.contacto || '' }
  return { decide: false, nombre: d.nombre || '' }
}

export function promptDe({ p, hallazgos, propuesta, visitas }) {
  const n = nichoPorId(p.nicho)
  const v = vocab(n)
  const giro = p.nicho_otro || n.nombre
  const vistos = hallazgos.filter((h) => h.estado !== 'mencionado')
  const mencionados = hallazgos.filter((h) => h.estado === 'mencionado')
  const forma = V1.alcance.formas.find((f) => f.id === p.modalidad_interes)?.t
  const decisor = decisorDe(p, visitas)
  const correccion = visitas.map((x) => x.datos?.correccion).find(Boolean)
  const notas = [p.notas, ...visitas.map((x) => x.notas)].filter(Boolean)

  const faltan = []
  if (!vistos.length) faltan.push('Todavía no hay diagnóstico, el prompt saldrá casi vacío.')
  const sinRuta = vistos.filter((h) => !SOL[h.elegida] && !h.a_medida).length
  if (sinRuta) faltan.push(sinRuta === 1 ? 'Un problema no tiene ruta elegida.' : `${sinRuta} problemas no tienen ruta elegida.`)
  if (!propuesta) faltan.push('Todavía no hay propuesta, faltan lo que incluye y el precio.')
  if (decisor && !decisor.decide) faltan.push(`Quien decide es ${decisor.nombre || 'otra persona'}, deberías confirmar el alcance con esa persona antes de construir.`)

  const problema = (h, i) => {
    const s = SOL[h.elegida]
    const tambien = (h.rutas || []).filter((r) => r.reaccion === 'interesa' && r.sol !== h.elegida).map((r) => SOL[r.sol]?.nombre).filter(Boolean)
    const no = (h.rutas || []).filter((r) => r.reaccion === 'no').map((r) => SOL[r.sol]?.nombre).filter(Boolean)
    return junta(
      `### ${i + 1}. ${h.titulo}`,
      linea('Área', AREA[h.area]?.nombre),
      linea('Cómo trabaja hoy', h.etiquetas?.length ? h.etiquetas.join('; ') : ''),
      s ? `- Lo que eligió: ${s.nombre} (${EJES[s.eje]?.corto || s.eje}). ${txt(s.resumen, v)}` : h.a_medida ? '- Ninguna ruta del catálogo encajó, hay que diseñarla a la medida. Propón dos opciones antes de construir.' : '- Todavía no eligió ruta. Propón la más simple y dime por qué.',
      s ? `- Cómo funciona, en tres momentos: ${s.pasos.map((x, k) => `${k + 1}) ${txt(x.t, v)}`).join(' ')}` : '',
      linea('También le interesó', tambien.join(', ')),
      linea('Descartó', no.join(', ')),
      h.nota ? `- En sus palabras: «${h.nota}»` : '',
    )
  }

  const texto = [
    `Vas a construir el sistema de ${p.negocio}, un negocio del giro «${giro}». Es cliente de Soma, una agencia de dos personas que primero diagnostica cómo trabaja un negocio y después construye lo que le hace falta.`,
    'Todo lo de abajo salió de una visita en persona, con el cliente señalando sus problemas en una tableta. Trátalo como la fuente de verdad: no agregues funciones que no resuelvan algo de esta lista.',

    junta(
      '## El negocio',
      linea('Nombre', p.negocio),
      linea('Giro', giro),
      linea('Con quién tratamos', [p.contacto, p.puesto].filter(Boolean).join(', ')),
      decisor ? linea('Quién decide', decisor.decide ? 'la misma persona' : `${decisor.nombre || 'otra persona'}, que no estuvo en la primera visita`) : '',
      linea('Hasta dónde quiere llegar', p.alcance),
      linea('Presupuesto que mencionó', p.presupuesto),
      linea('Forma de pago que prefiere', forma),
      linea('Cómo le dice a las cosas', `a sus clientes «${v.clientes}», a su personal «${v.personal}», a lo que vende «${v.productos}»`),
    ),

    vistos.length ? `## Lo que le pasa\n\nVan en el orden en que los señaló.\n\n${vistos.map(problema).join('\n\n')}` : '## Lo que le pasa\n\nTodavía no hay diagnóstico registrado.',

    mencionados.length ? `## También mencionó, sin entrar en detalle\n\n${mencionados.map((h) => `- ${h.titulo}`).join('\n')}\n\nNo lo construyas todavía, pero no diseñes nada que lo estorbe.` : '',

    correccion ? `## Lo que corrigió al ver el resumen\n\n«${correccion}»` : '',

    propuesta
      ? junta(
          '## Lo que se le propuso',
          linea('Nombre', propuesta.titulo),
          propuesta.resumen || '',
          propuesta.incluye?.length ? `- Incluye:\n${propuesta.incluye.map((x) => `  - ${x}`).join('\n')}` : '',
          linea('Pago único', propuesta.precio_contado ? dinero(propuesta.precio_contado) : ''),
          linea('Membresía mensual', propuesta.precio_mensual ? dinero(propuesta.precio_mensual) : ''),
          linea('Prueba', propuesta.prueba_dias ? `${propuesta.prueba_dias} días` : ''),
          linea('Soporte', propuesta.mantenimiento),
          linea('Lo que eligió', propuesta.modalidad && propuesta.modalidad !== 'pensar' ? propuesta.modalidad : ''),
          'Lo que no esté en «Incluye» queda fuera del alcance.',
        )
      : '',

    notas.length ? `## Notas de las visitas\n\n${notas.map((x) => `- ${x}`).join('\n')}` : '',

    junta(
      '## Lo que te pido',
      '1. Antes de escribir código, devuélveme un plan corto: las pantallas, quién usa cada una, los datos que se guardan y qué queda fuera. Si te falta un dato del negocio, pregúntalo, no lo inventes.',
      `2. Construye primero la solución del problema 1, completa y usable, con datos de ejemplo creíbles para un negocio de «${giro}». Después sigue con los demás en orden.`,
      '3. Al terminar cada parte, dime qué probaste y qué no pudiste probar.',
    ),

    junta(
      '## Cómo debe quedar',
      `- Lo va a usar gente que atiende un negocio, no programadores: una acción principal por pantalla y nada que haya que explicar. Usa sus palabras («${v.clientes}», «${v.pedidos}», «${v.personal}»).`,
      '- Primero el teléfono. Debe abrir rápido y servir con mala señal.',
      '- Usa la tecnología más simple que lo resuelva. Soma trabaja con sitios estáticos y Supabase para los datos, úsalos salvo que haya una razón para otra cosa.',
      '- Si tienes las skills de Soma, úsalas: `ui-soma` para la interfaz, `soma-copywriting` para los textos y `soma-animation` para los estados animados.',
      '- Deja un lugar para pegar la línea de Soma Connect, que da el CRM en Sistemas → Conectar. Con ella el sistema avisa que está vivo y cuándo vence la membresía.',
      '- No guardes contraseñas ni llaves en el código.',
    ),
  ]
    .filter(Boolean)
    .join('\n\n')

  return { texto, faltan }
}
