// Piezas comunes del contenido: áreas, familias de nichos y vocabulario.

/** Las ocho áreas donde un negocio suele detenerse. El `icono` es una clave de src/icons/icons.js. */
export const AREAS = [
  { id: 'clientes', nombre: 'Clientes', pregunta: '¿Llegan los que deberían?' },
  { id: 'atencion', nombre: 'Atención', pregunta: '¿Se atiende a tiempo?' },
  { id: 'organizacion', nombre: 'Organización', pregunta: '¿Cada quien sabe qué sigue?' },
  { id: 'inventarios', nombre: 'Inventarios', pregunta: '¿Hay lo que debe haber?' },
  { id: 'administracion', nombre: 'Administración', pregunta: '¿Los números están claros?' },
  { id: 'logistica', nombre: 'Logística', pregunta: '¿Las cosas llegan bien?' },
  { id: 'comunicacion', nombre: 'Comunicación', pregunta: '¿Los mensajes llegan?' },
  { id: 'rentabilidad', nombre: 'Rentabilidad', pregunta: '¿Queda lo que debería quedar?' },
]

export const AREA = Object.fromEntries(AREAS.map((a) => [a.id, a]))

/** Familias: así se agrupan los nichos en el selector de la presala. */
export const FAMILIAS = [
  { id: 'comida', nombre: 'Comida y bebida' },
  { id: 'tiendas', nombre: 'Tiendas' },
  { id: 'cuidado', nombre: 'Cuidado personal' },
  { id: 'salud', nombre: 'Salud' },
  { id: 'servicios', nombre: 'Servicios y oficios' },
  { id: 'estancia', nombre: 'Hospedaje, eventos y enseñanza' },
  { id: 'otro', nombre: 'Otro giro' },
]

/** Palabras de fábrica. Cada nicho cambia las que necesite en su `vocab`. */
export const VOCAB = {
  cliente: 'el cliente',
  clientes: 'los clientes',
  personal: 'el personal',
  empleado: 'el empleado',
  producto: 'producto',
  productos: 'productos',
  pedido: 'pedido',
  pedidos: 'pedidos',
  cita: 'cita',
  citas: 'citas',
  lugar: 'local',
}

export const vocab = (nicho) => ({ ...VOCAB, ...(nicho?.vocab || {}) })

/** Sustituye {palabras} con el vocabulario del nicho. {Palabra} con mayúscula inicial. */
export const txt = (s, v) =>
  String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => {
    const min = k.charAt(0).toLowerCase() + k.slice(1)
    const val = v[min]
    if (val == null) return m
    return k === min ? val : val.charAt(0).toUpperCase() + val.slice(1)
  })
