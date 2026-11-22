// El comodín: cualquier negocio que no esté en la lista. Problemas que casi todos comparten,
// dichos sin vocabulario de un giro en particular.

export default {
  id: 'general',
  familia: 'otro',
  nombre: 'Otro giro',
  plural: 'negocios',
  icono: 'general',
  acento: '#2f4a3f',
  orden: 99,
  vocab: {},

  apertura: 'Cuénteme, ¿cómo es un día normal aquí, desde que abren hasta que cierran?',
  observa: [
    'Dónde se anotan las cosas: libreta, pizarrón, hojas sueltas o una computadora.',
    'Cuánto tarda alguien en atender a quien acaba de entrar o de llamar.',
    'Si el dueño resuelve todo en persona o hay quien decida cuando no está.',
  ],

  muestra: {
    productos: [
      { nombre: 'Producto de línea', precio: 180, categoria: 'Más vendidos' },
      { nombre: 'Producto especial', precio: 320, categoria: 'Más vendidos' },
      { nombre: 'Presentación chica', precio: 95, categoria: 'Más vendidos' },
      { nombre: 'Paquete básico', precio: 450, categoria: 'Paquetes' },
      { nombre: 'Paquete completo', precio: 890, categoria: 'Paquetes' },
      { nombre: 'Paquete para mayoreo', precio: 1650, categoria: 'Paquetes' },
      { nombre: 'Artículo de temporada', precio: 240, categoria: 'Temporada' },
      { nombre: 'Novedad del mes', precio: 275, categoria: 'Temporada' },
      { nombre: 'Accesorio', precio: 60, categoria: 'Complementos' },
      { nombre: 'Refacción o repuesto', precio: 130, categoria: 'Complementos' },
      { nombre: 'Envío a domicilio', precio: 45, categoria: 'Complementos' },
    ],
    servicios: [
      { nombre: 'Atención en el local', precio: 0, minutos: 30 },
      { nombre: 'Servicio básico', precio: 250, minutos: 45 },
      { nombre: 'Servicio completo', precio: 480, minutos: 90 },
      { nombre: 'Visita a domicilio', precio: 350, minutos: 60 },
      { nombre: 'Asesoría o cotización', precio: 0, minutos: 20 },
    ],
    personal: ['Carmen', 'Beto', 'Gaby', 'Ramiro'],
    clientes: ['Sra. Villalobos', 'Ing. Cárdenas', 'Mayra Núñez', 'Don Ernesto', 'Lic. Preciado', 'Óscar Bautista'],
    insumos: [
      { nombre: 'Material principal', unidad: 'pzas', hay: 14, minimo: 20 },
      { nombre: 'Material secundario', unidad: 'pzas', hay: 46, minimo: 30 },
      { nombre: 'Empaque', unidad: 'pzas', hay: 18, minimo: 40 },
      { nombre: 'Consumibles', unidad: 'cajas', hay: 12, minimo: 8 },
      { nombre: 'Repuestos', unidad: 'pzas', hay: 9, minimo: 6 },
      { nombre: 'Etiquetas', unidad: 'rollos', hay: 5, minimo: 4 },
      { nombre: 'Producto terminado', unidad: 'pzas', hay: 64, minimo: 35 },
    ],
  },

  problemas: [
    // ── Clientes ──
    {
      id: 'llegan-pocos',
      area: 'clientes',
      titulo: 'Llegan pocos clientes nuevos',
      senal: 'Casi todos los que llegan ya lo conocían. Gente nueva, muy poca.',
      frecuente: true,
      matices: [{ id: 'buscan', pregunta: '¿La gente lo busca en internet antes de venir?', si: 'Lo buscan en internet', no: 'Llegan por recomendación' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página que dice qué hace, cuánto cuesta y cómo pedirlo. Quien lo busca entiende en un minuto si es lo que necesita.', pide: { buscan: true } },
        { sol: 'resenas', para: 'Cada cliente contento recibe una invitación a opinar. Lo que hoy se dice de boca en boca empieza a verse.' },
        { sol: 'reactivacion', para: 'Antes de buscar gente nueva: quienes ya le compraron y dejaron de venir reciben una invitación.' },
        { sol: 'perfil-google', para: 'Lo primero y lo más barato: que al buscar su negocio aparezca con horario, teléfono, fotos y cómo llegar.' },
      ],
    },
    {
      id: 'preguntan-y-no-compran',
      area: 'clientes',
      titulo: 'Preguntan, les doy precio y ya no vuelven',
      senal: 'Muchos interesados, pocos cierres. Nadie les vuelve a escribir.',
      frecuente: true,
      matices: [{ id: 'cotiza', pregunta: '¿Tiene que armar una cotización para cada quien?', si: 'Cotiza a la medida', no: 'Precios fijos' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Cada persona que preguntó queda anotada con su siguiente paso. A los tres días, el sistema le recuerda escribirle.' },
        { sol: 'cotizador', para: 'La cotización sale en un minuto y bien presentada, mientras el interés está fresco.', pide: { cotiza: true } },
        { sol: 'respuesta-automatica', para: 'Precio, horario y ubicación se contestan al instante. Quien pregunta de noche ya no se va con otro.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: las respuestas de siempre ya escritas, para contestar bien y en segundos.' },
      ],
    },
    {
      id: 'no-vuelven',
      area: 'clientes',
      titulo: 'Compran una vez y no regresan',
      senal: 'Hay buen trato y buen producto, pero pocos se vuelven clientes de siempre.',
      matices: [{ id: 'datos', pregunta: '¿Guarda el nombre o el teléfono de quien le compra?', si: 'Guarda datos de sus clientes', no: 'No guarda datos' }],
      rutas: [
        { sol: 'tarjeta-lealtad', para: 'Una tarjeta de sellos en el teléfono. Cada compra lo acerca a algo, y eso da una razón para volver.' },
        { sol: 'reactivacion', para: 'El sistema detecta a quién hace dos meses no viene y prepara el mensaje para invitarlo.', pide: { datos: true } },
        { sol: 'promos-segmentadas', para: 'Una promoción dirigida solo a quien ya le compró, según lo que suele llevar.', pide: { datos: true } },
        { sol: 'base-clientes', para: 'El primer paso: empezar a anotar quién le compra y qué lleva. Sin eso no hay a quién invitar.' },
      ],
    },

    // ── Atención ──
    {
      id: 'no-contesto-a-tiempo',
      area: 'atencion',
      titulo: 'No alcanzo a contestar todos los mensajes',
      senal: 'El WhatsApp se llena mientras se atiende el local. Algunos se quedan sin respuesta.',
      frecuente: true,
      matices: [{ id: 'repetidas', pregunta: '¿La mayoría pregunta más o menos lo mismo?', si: 'Preguntas repetidas', no: 'Cada caso es distinto' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Lo que siempre preguntan se responde solo. Usted atiende solo lo que de verdad necesita a una persona.', pide: { repetidas: true } },
        { sol: 'whatsapp-pedidos', para: 'Quien quiere pedir sigue una guía y el pedido llega completo, sin diez mensajes de ida y vuelta.' },
        { sol: 'seguimiento-prospectos', para: 'Cada conversación pendiente queda en una lista. Al final del día se ve a quién falta contestar.' },
        { sol: 'respuestas-rapidas', para: 'Respuestas ya escritas para enviar con un toque. Contestar deja de quitarle media mañana.' },
      ],
    },
    {
      id: 'se-hace-fila',
      area: 'atencion',
      titulo: 'Se junta la gente y algunos se van',
      senal: 'Hay horas en que no se dan abasto y horas muertas el resto del día.',
      matices: [{ id: 'cita', pregunta: '¿Su servicio se podría dar con cita?', si: 'Se puede trabajar con cita', no: 'Llegan sin avisar' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Quien puede apartar su hora ya no llega a esperar. La carga se reparte a lo largo del día.', pide: { cita: true } },
        { sol: 'turnos-virtuales', para: 'Toman turno desde el teléfono y esperan donde quieran. Ven cuánto falta y regresan a tiempo.' },
        { sol: 'pedidos-mostrador', para: 'Piden antes de llegar y solo pasan a recoger. La fila se hace más corta sin contratar a nadie.' },
        { sol: 'pantalla-turnos', para: 'Una pantalla con el orden de atención. Nadie se cuela y quien espera sabe que avanza.' },
      ],
    },

    // ── Organización ──
    {
      id: 'todo-en-mi-cabeza',
      area: 'organizacion',
      titulo: 'Todo depende de que yo esté aquí',
      senal: 'Si el dueño falta un día, las cosas se detienen o salen mal.',
      frecuente: true,
      matices: [{ id: 'encargado', pregunta: '¿Hay alguien de confianza que se quede a cargo?', si: 'Tiene encargado', no: 'Solo el dueño decide' }],
      rutas: [
        { sol: 'tablero-ventas', para: 'Ve desde su teléfono cómo va el día. Puede salir sin quedarse a ciegas.', pide: { encargado: true } },
        { sol: 'checklist-turnos', para: 'Lo que usted revisa de memoria queda en una lista que cualquiera puede seguir y palomear.' },
        { sol: 'reporte-diario', para: 'Cada noche le llega un resumen de lo que pasó. Se entera sin tener que estar.' },
        { sol: 'proceso-claro', para: 'Antes de cualquier sistema: escribir con usted cómo se hacen las cosas, para que no vivan solo en su cabeza.' },
      ],
    },
    {
      id: 'se-olvidan-pendientes',
      area: 'organizacion',
      titulo: 'Los pendientes se olvidan',
      senal: 'Encargos, promesas a clientes y tareas que nadie anotó y nadie hizo.',
      frecuente: true,
      matices: [{ id: 'turnos', pregunta: '¿Trabajan en más de un turno?', si: 'Varios turnos', no: 'Un solo turno' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada encargo con su orden: qué se prometió, para cuándo y en qué va. El cliente recibe aviso cuando está listo.' },
        { sol: 'bitacora-turno', para: 'Lo que queda pendiente pasa por escrito al siguiente turno. Ya no depende de acordarse de avisar.', pide: { turnos: true } },
        { sol: 'recordatorios', para: 'Lo que se prometió para una fecha se recuerda solo, un día antes.' },
        { sol: 'checklist-turnos', para: 'Una lista diaria de lo que no puede faltar. Lo mínimo para que deje de pasar.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-sin-aviso',
      area: 'inventarios',
      titulo: 'Se acaba lo que más se vende',
      senal: 'El cliente pide justo lo que no hay, y nadie se dio cuenta de que se estaba terminando.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Hoy alguien lleva la cuenta de lo que hay?', si: 'Alguien lleva la cuenta', no: 'Se compra a ojo' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada artículo con su mínimo. Cuando baja de ahí, le llega el aviso antes de que falte.' },
        { sol: 'compras-sugeridas', para: 'Según lo que se vende, la lista de compra se arma sola. Se pide lo justo.' },
        { sol: 'inventario-escaner', para: 'Entradas y salidas se anotan con el celular en segundos. Quien ya lleva la cuenta deja de hacerlo en papel.', pide: { registro: true } },
        { sol: 'menu-digital', para: 'Lo mínimo: marcar como agotado lo que no hay, para no prometerlo.' },
      ],
    },
    {
      id: 'dinero-parado',
      area: 'inventarios',
      titulo: 'Tengo dinero parado en mercancía',
      senal: 'Hay cosas que llevan meses en bodega y otras que siempre faltan.',
      matices: [{ id: 'caduca', pregunta: '¿Parte de lo que vende se echa a perder o pasa de moda?', si: 'Se echa a perder o caduca', no: 'No caduca' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Comprar según lo que de verdad sale. Lo que no se mueve deja de pedirse.' },
        { sol: 'caducidades', para: 'Lo que está por vencer aparece primero, a tiempo para ofrecerlo antes de perderlo.', pide: { caduca: true } },
        { sol: 'costeo', para: 'Ver qué deja más por peso invertido ayuda a decidir en qué vale la pena tener existencia.' },
        { sol: 'promos-segmentadas', para: 'Lo que lleva tiempo parado se ofrece a quien ya ha comprado algo parecido.' },
      ],
    },

    // ── Administración ──
    {
      id: 'no-se-cuanto-gano',
      area: 'administracion',
      titulo: 'No sé con certeza cuánto vendí',
      senal: 'Los números se hacen de memoria o al final del mes, si da tiempo.',
      frecuente: true,
      matices: [{ id: 'registra', pregunta: '¿Hoy registran cada venta en algún lado?', si: 'Registran las ventas', no: 'No se registran' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta se registra al cobrarla, en tres toques. El número del día ya no depende de sumar notas.', pide: { registra: false } },
        { sol: 'tablero-ventas', para: 'Cuánto va el día, la semana y el mes, en su teléfono. Con lo que más se vende a la vista.' },
        { sol: 'corte-de-caja', para: 'Al cerrar, el sistema dice cuánto debe haber. Se cuenta y la diferencia queda a la vista.' },
        { sol: 'reporte-diario', para: 'Un mensaje cada noche con lo vendido y lo pendiente. Sin abrir ningún sistema.' },
      ],
    },
    {
      id: 'me-deben',
      area: 'administracion',
      titulo: 'Me deben y batallo para cobrar',
      senal: 'Crédito de palabra, apartados y cuentas que se anotan en una libreta.',
      matices: [{ id: 'recurrente', pregunta: '¿Les cobra lo mismo cada mes a algunos clientes?', si: 'Cobros que se repiten', no: 'Cobros de una vez' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Quién ya pagó, quién debe y a quién se le vence esta semana, con el recordatorio listo.', pide: { recurrente: true } },
        { sol: 'fiado', para: 'Cada cliente con su saldo y sus abonos. Se acaba el "yo ya le había pagado".' },
        { sol: 'cobro-en-linea', para: 'Un enlace para pagar desde el teléfono. Cobrar deja de requerir que pasen al local.' },
        { sol: 'recordatorios', para: 'Un recordatorio amable unos días antes de la fecha. Muchas veces eso basta.' },
      ],
    },

    // ── Logística ──
    {
      id: 'entregas-enredadas',
      area: 'logistica',
      titulo: 'Los pedidos y las entregas se enredan',
      senal: 'Pedidos por teléfono, por mensaje y en persona. Algunos salen tarde o incompletos.',
      matices: [{ id: 'reparto', pregunta: '¿Entregan a domicilio?', si: 'Entregan a domicilio', no: 'Solo en el local' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Todos los pedidos en un tablero, vengan de donde vengan, con su etapa a la vista.' },
        { sol: 'rastreo-cliente', para: 'Quien pidió ve en qué va su entrega. Dejan de llamar a preguntar.', pide: { reparto: true } },
        { sol: 'pedidos-mostrador', para: 'El pedido se hace en línea y llega ordenado, con hora para recoger.' },
        { sol: 'whatsapp-pedidos', para: 'El pedido por WhatsApp sigue una guía y llega completo desde el primer mensaje.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'no-saben-que-vendo',
      area: 'comunicacion',
      titulo: 'La gente no sabe todo lo que ofrezco',
      senal: 'Los clientes se sorprenden: "¿a poco también hacen eso?".',
      matices: [{ id: 'redes', pregunta: '¿Publica en redes con regularidad?', si: 'Publica en redes', no: 'Casi no publica' }],
      rutas: [
        { sol: 'tienda-en-linea', para: 'Todo lo que ofrece, a la vista y con precio, abierto las 24 horas.' },
        { sol: 'catalogo-whatsapp', para: 'Un catálogo que se manda por enlace. Cada publicación en redes lleva a algo que se puede pedir.', pide: { redes: true } },
        { sol: 'promos-segmentadas', para: 'A quien ya le compra una cosa se le cuenta de la otra que también podría servirle.' },
        { sol: 'menu-digital', para: 'Una lista sencilla de lo que hace y cuánto cuesta, que se actualiza en un minuto.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'vendo-y-no-queda',
      area: 'rentabilidad',
      titulo: 'Vendo bien, pero no veo la ganancia',
      senal: 'Hay movimiento todo el mes y al final el dinero no aparece.',
      frecuente: true,
      matices: [{ id: 'costos', pregunta: '¿Sabe cuánto le cuesta cada cosa que vende?', si: 'Conoce sus costos', no: 'Precios puestos a ojo' }],
      rutas: [
        { sol: 'costeo', para: 'El costo real de cada producto o servicio, con todo lo que lleva. Se ve cuál deja y cuál solo da trabajo.', pide: { costos: false } },
        { sol: 'tablero-ventas', para: 'Qué se vende más y qué deja más, lado a lado. No siempre es lo mismo.' },
        { sol: 'merma', para: 'Parte de lo que no queda se pierde en el camino. Anotarlo es el primer paso para recuperarlo.' },
        { sol: 'corte-de-caja', para: 'Un corte diario que cuadre. Antes de afinar precios hay que saber que lo vendido sí llegó a la caja.' },
      ],
    },
  ],
}
