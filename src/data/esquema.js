// El mapa de datos. Cada tabla existe igual en este dispositivo y en Supabase.
// `cols` son las columnas que viajan; `servidor` son las que solo escribe el servidor
// (una función edge o un webhook) y que el navegador nunca debe pisar.

const C = ['id', 'creado', 'actualizado', 'eliminado', 'creado_por']

export const ESQUEMA = {
  prospectos: {
    cols: [...C, 'negocio', 'nicho', 'nicho_otro', 'contacto', 'puesto', 'telefono', 'correo', 'direccion', 'etapa', 'alcance', 'presupuesto', 'modalidad_interes', 'notas', 'proxima_accion', 'proxima_fecha'],
  },
  visitas: {
    cols: [...C, 'prospecto_id', 'tipo', 'inicio', 'fin', 'presentadores', 'graba', 'audio_ruta', 'audio_seg', 'estado', 'animo', 'resultado', 'notas', 'datos'],
  },
  hallazgos: {
    cols: [...C, 'prospecto_id', 'visita_id', 'area', 'problema_id', 'titulo', 'matices', 'etiquetas', 'rutas', 'elegida', 'nota', 'a_medida', 'estado', 'orden'],
  },
  citas: {
    cols: [...C, 'prospecto_id', 'tipo', 'inicio', 'minutos', 'lugar', 'estado', 'por_mensaje', 'notas', 'quien'],
  },
  propuestas: {
    cols: [...C, 'prospecto_id', 'titulo', 'resumen', 'demo_url', 'modulos', 'incluye', 'precio_contado', 'precio_mensual', 'desc_6', 'desc_12', 'prueba_dias', 'mantenimiento', 'vigencia', 'estado', 'modalidad', 'notas'],
  },
  sistemas: {
    cols: [...C, 'prospecto_id', 'nombre', 'url', 'repo', 'estado', 'llave', 'modo_vencido', 'mensaje', 'config', 'notas', 'ultima_senal', 'version', 'ultima_url'],
    servidor: ['ultima_senal', 'version', 'ultima_url'],
  },
  credenciales: {
    // La contraseña no vive en esta tabla ni en este dispositivo: está cifrada en la bóveda
    // de Supabase y solo se lee, con sesión iniciada, por medio de una función.
    cols: [...C, 'prospecto_id', 'sistema_id', 'etiqueta', 'usuario', 'url', 'notas', 'secreto_id'],
    servidor: ['secreto_id'],
  },
  membresias: {
    cols: [...C, 'prospecto_id', 'sistema_id', 'propuesta_id', 'modalidad', 'monto', 'moneda', 'inicio', 'vence', 'estado', 'auto', 'notas', 'stripe_cliente', 'stripe_suscripcion'],
  },
  pagos: {
    cols: [...C, 'prospecto_id', 'membresia_id', 'concepto', 'monto', 'moneda', 'metodo', 'estado', 'fecha', 'referencia', 'comprobante_ruta', 'enlace', 'cubre_hasta', 'registrado_por', 'notas', 'stripe_id'],
  },
  avisos: {
    cols: [...C, 'prospecto_id', 'membresia_id', 'tipo', 'canal', 'mensaje', 'enviado', 'quien'],
  },
  bitacora: {
    cols: [...C, 'prospecto_id', 'tipo', 'texto', 'datos', 'quien'],
  },
  ajustes: {
    cols: ['id', 'creado', 'actualizado', 'eliminado', 'valor'],
  },
}

export const TABLAS = Object.keys(ESQUEMA)

/** Etapas del prospecto, en el orden en que avanza. */
export const ETAPAS = [
  { id: 'nuevo', nombre: 'Por visitar' },
  { id: 'visitado', nombre: 'Visitado' },
  { id: 'demo', nombre: 'Demo en proceso' },
  { id: 'propuesta', nombre: 'Propuesta presentada' },
  { id: 'cliente', nombre: 'Cliente' },
  { id: 'pausa', nombre: 'En pausa' },
  { id: 'perdido', nombre: 'No avanzó' },
]

export const MODALIDADES = [
  { id: 'contado', nombre: 'Pago único', meses: 0 },
  { id: 'mensual', nombre: 'Membresía mensual', meses: 1 },
  { id: 'semestral', nombre: 'Membresía a 6 meses', meses: 6 },
  { id: 'anual', nombre: 'Membresía a 12 meses', meses: 12 },
  { id: 'prueba', nombre: 'Prueba', meses: 0 },
]

export const METODOS = [
  { id: 'stripe', nombre: 'Tarjeta (Stripe)' },
  { id: 'transferencia', nombre: 'Transferencia' },
  { id: 'efectivo', nombre: 'Efectivo' },
]

/** Valores de fábrica de los ajustes. Todo se puede cambiar en el CRM. */
export const AJUSTES_BASE = {
  contacto: { whatsapp: '', correo: '', web: '', instagram: '' },
  presentadores: [
    { id: 'dali', nombre: 'Dalí', linea: 'Escucha cómo opera su negocio y arma el plan.' },
    { id: 'alex', nombre: 'Alex', linea: 'Diseña y construye el sistema.' },
  ],
  // Rangos que se le ofrecen al cliente para ubicar su presupuesto. Son los de él, no nuestros precios.
  presupuestos: ['Menos de $10 mil', 'De $10 a $25 mil', 'De $25 a $60 mil', 'Más de $60 mil', 'Prefiero una mensualidad'],
  banco: { titular: '', banco: '', clabe: '', cuenta: '' },
  url_publica: '',
  dias_aviso: 7,
  plantillas: {
    por_vencer:
      'Hola, {contacto}. Le escribe {quien} de Soma. La membresía de {negocio} vence el {vence}. ¿Le comparto el enlace de pago o prefiere transferencia? Cualquier duda, aquí estoy.',
    vencida:
      'Hola, {contacto}. Le escribe {quien} de Soma. La membresía de {negocio} venció el {vence} y queremos evitar que el sistema se pause. ¿Le ayudo a ponerla al corriente hoy? Son {monto}.',
    pago_recibido: 'Hola, {contacto}. Recibimos su pago de {monto}. La membresía de {negocio} queda al corriente hasta el {vence}. Gracias por su confianza.',
    cita: 'Hola, {contacto}. Le escribe {quien} de Soma. Le confirmo nuestra visita a {negocio} el {fecha} a las {hora}. Llevamos la demostración que preparamos para usted.',
    seguimiento: 'Hola, {contacto}. Le escribe {quien} de Soma. Seguimos trabajando en lo que platicamos para {negocio}. ¿Qué día le queda bien para mostrarle el avance?',
  },
}
