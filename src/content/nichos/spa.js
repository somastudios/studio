// Spa o centro de bienestar. Forma y reglas en docs/ARQUITECTURA.md, "Contrato de un nicho".

export default {
  id: 'spa',
  familia: 'cuidado',
  nombre: 'Spa o centro de bienestar',
  plural: 'spas',
  icono: 'spa',
  acento: '#2f6b62',
  orden: 30,
  vocab: {
    personal: 'la terapeuta',
    empleado: 'la terapeuta',
    producto: 'tratamiento',
    productos: 'tratamientos',
    lugar: 'spa',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que manejan paquetes de varias sesiones. ¿Cómo llevan la cuenta de las que le quedan a cada cliente?',
  observa: [
    'Si hay alguien en recepción o atiende quien va saliendo de cabina.',
    'Si las sesiones de un paquete se marcan en una tarjeta de cartón.',
    'Si quien viene por primera vez llena una hoja de papel con sus datos de salud.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Protector solar facial FPS 50', precio: 380, categoria: 'Facial' },
      { nombre: 'Crema hidratante', precio: 420, categoria: 'Facial' },
      { nombre: 'Suero de vitamina C', precio: 520, categoria: 'Facial' },
      { nombre: 'Agua micelar', precio: 260, categoria: 'Facial' },
      { nombre: 'Aceite de masaje de lavanda', precio: 240, categoria: 'Corporal' },
      { nombre: 'Crema corporal reafirmante', precio: 360, categoria: 'Corporal' },
      { nombre: 'Exfoliante de café', precio: 220, categoria: 'Corporal' },
      { nombre: 'Sales de baño', precio: 150, categoria: 'Corporal' },
      { nombre: 'Láser en axila, 8 sesiones', precio: 2400, categoria: 'Paquetes' },
      { nombre: 'Reductivo, 10 sesiones', precio: 3500, categoria: 'Paquetes' },
      { nombre: 'Masajes, 5 sesiones', precio: 2400, categoria: 'Paquetes' },
      { nombre: 'Certificado de masaje relajante', precio: 550, categoria: 'Regalo' },
      { nombre: 'Certificado para pareja', precio: 1100, categoria: 'Regalo' },
      { nombre: 'Certificado de día de spa', precio: 1500, categoria: 'Regalo' },
    ],
    servicios: [
      { nombre: 'Masaje relajante', precio: 550, minutos: 60 },
      { nombre: 'Masaje descontracturante', precio: 650, minutos: 60 },
      { nombre: 'Facial de limpieza profunda', precio: 600, minutos: 75 },
      { nombre: 'Depilación láser en axila', precio: 350, minutos: 20 },
      { nombre: 'Depilación láser en pierna completa', precio: 1200, minutos: 50 },
      { nombre: 'Masaje en pareja', precio: 1100, minutos: 60 },
    ],
    personal: ['Rocío', 'Gaby', 'Araceli', 'Itzel'],
    clientes: ['Rebeca Orozco', 'Sra. Magaña', 'Lic. Contreras', 'Alejandra Tapia', 'Dra. Figueroa', 'Sergio Lomelí'],
    insumos: [
      { nombre: 'Aceite de masaje', unidad: 'L', hay: 2, minimo: 3 },
      { nombre: 'Gel conductor', unidad: 'L', hay: 4, minimo: 3 },
      { nombre: 'Sábanas limpias', unidad: 'juegos', hay: 9, minimo: 12 },
      { nombre: 'Toallas limpias', unidad: 'pzas', hay: 30, minimo: 24 },
      { nombre: 'Cera tibia', unidad: 'kg', hay: 3, minimo: 2 },
      { nombre: 'Mascarilla de arcilla', unidad: 'kg', hay: 2, minimo: 1 },
      { nombre: 'Ampolletas de colágeno', unidad: 'pzas', hay: 18, minimo: 12 },
      { nombre: 'Sandalias y gorros desechables', unidad: 'paquetes', hay: 5, minimo: 4 },
    ],
  },

  problemas: [
    // ── Administración ──
    {
      id: 'sesiones-de-paquete',
      area: 'administracion',
      titulo: 'No sé cuántas sesiones le quedan a cada cliente',
      senal: 'El paquete de láser se lleva en una tarjeta de cartón. Si se pierde, es la palabra del cliente contra la libreta.',
      frecuente: true,
      matices: [{ id: 'abonos', pregunta: '¿Sus clientes pagan los paquetes en abonos?', si: 'Pagan en abonos', no: 'Pagan el paquete completo' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Cada paquete en una lista con sus sesiones, sus pagos y su vigencia. Se ve a quién le quedan dos y a quién se le vence este mes.' },
        { sol: 'tarjeta-lealtad', para: 'La tarjeta de sesiones vive en el teléfono del cliente. Cada visita marca una y él mismo ve cuántas le quedan.' },
        { sol: 'fiado', para: 'El paquete con su saldo: cuánto ha abonado y cuánto falta. Se nota si alguien va en la sexta sesión con tres pagadas.', pide: { abonos: true } },
        { sol: 'base-clientes', para: 'Lo mínimo: pasar las tarjetas a una lista que se busca por nombre. El cartón deja de ser el único registro.' },
      ],
    },
    {
      id: 'certificados-de-regalo',
      area: 'administracion',
      titulo: 'No sé qué certificados de regalo siguen sin usarse',
      senal: 'Se venden en mayo y en diciembre con folio en una libreta. Llegan meses después y hay que buscar si ya se usaron.',
      frecuente: true,
      matices: [{ id: 'distancia', pregunta: '¿Le compran certificados personas que no pueden pasar al spa?', si: 'Compran a distancia', no: 'Se compran en mostrador' }],
      rutas: [
        { sol: 'tienda-en-linea', para: 'El certificado se compra y se paga en línea, y le llega por mensaje a quien lo recibe. Sirve para quien regala desde otra ciudad.', pide: { distancia: true } },
        { sol: 'punto-de-venta', para: 'Cada certificado se vende con folio y vigencia, y al canjearlo queda marcado. Un folio no se usa dos veces.' },
        { sol: 'base-clientes', para: 'Quien recibe un certificado queda registrado con su teléfono. Después de su masaje ya hay a quién invitar a volver.' },
        { sol: 'cobro-en-linea', para: 'Lo más corto: se sigue pidiendo por WhatsApp, pero se paga con un enlace. Queda registrado quién lo compró y cuándo.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'paquete-a-medias',
      area: 'clientes',
      titulo: 'Compran el paquete y lo dejan a la mitad',
      senal: 'El láser pide una sesión cada cinco semanas. Si se saltan dos, el resultado no llega y la queja sí.',
      frecuente: true,
      matices: [{ id: 'cita', pregunta: '¿El cliente sale de cada sesión con la siguiente ya apartada?', si: 'Sale con la siguiente apartada', no: 'Agenda cuando se acuerda' }],
      rutas: [
        { sol: 'reactivacion', para: 'El sistema ve a quién le tocaba sesión hace dos semanas y deja listo el mensaje con horarios para retomarla.', pide: { cita: false } },
        { sol: 'recordatorios', para: 'La sesión que se apartó hace cinco semanas se recuerda sola, un día antes. El cliente confirma o la mueve.', pide: { cita: true } },
        { sol: 'agenda-en-linea', para: 'El cliente reagenda desde su teléfono cuando se le cruza algo. Mover la sesión es más fácil que dejarla pasar.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: que nadie salga de cabina sin su siguiente sesión anotada. Lo acordamos con sus terapeutas como parte del servicio.' },
      ],
    },
    {
      id: 'mananas-solas',
      area: 'clientes',
      titulo: 'Entre semana por la mañana las cabinas están solas',
      senal: 'Todos quieren sábado o después de las seis. De lunes a jueves antes de comer, la terapeuta espera.',
      matices: [{ id: 'precio', pregunta: '¿Daría mejor precio en las horas flojas?', si: 'Precio especial en horas flojas', no: 'Mismo precio todo el día' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'Una invitación de martes por la mañana a quienes ya han venido entre semana. No a todos: a quien sí puede a esa hora.', pide: { precio: true } },
        { sol: 'tarjeta-lealtad', para: 'Las visitas de lunes a jueves antes de las dos suman doble. El cliente elige la hora que a usted le conviene.' },
        { sol: 'tablero-ventas', para: 'Qué horas se llenan y cuáles no, con números. Con eso se decide el horario de cada terapeuta.' },
        { sol: 'perfil-google', para: 'Lo primero: quien busca "masaje" un miércoles a las once encuentra el spa abierto, con fotos, precios y cómo escribir.' },
      ],
    },
    {
      id: 'no-se-animan',
      area: 'clientes',
      titulo: 'Quien no nos conoce no se anima a entrar',
      senal: 'Un spa se elige por confianza. Sin fotos de las cabinas ni opiniones de otros clientes, prefieren no arriesgarse.',
      matices: [{ id: 'fotos', pregunta: '¿Tiene fotos recientes de sus cabinas y de su equipo?', si: 'Tiene fotos recientes', no: 'Faltan fotos del lugar' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página con las cabinas, quién atiende, los tratamientos y los precios. Quien entra sabe a qué va y con quién.', pide: { fotos: true } },
        { sol: 'resenas', para: 'Al terminar la sesión, el cliente recibe la invitación a opinar. Lo que otros cuentan pesa más que cualquier anuncio.' },
        { sol: 'menu-digital', para: 'La carta de tratamientos con duración y precio en un enlace. Se comparte en redes y nadie pregunta "¿qué manejan?".' },
        { sol: 'perfil-google', para: 'Lo primero: la ficha completa, con fotos reales del lugar, horario y teléfono. Ahí revisa la gente antes de escribir.' },
      ],
    },

    // ── Organización ──
    {
      id: 'una-sola-cabina',
      area: 'organizacion',
      titulo: 'Dos citas a la misma hora y una sola cabina',
      senal: 'La agenda decía que había terapeuta, pero la cabina o el equipo de láser ya estaban ocupados. Alguien espera en bata.',
      frecuente: true,
      matices: [{ id: 'equipo', pregunta: '¿Hay algún aparato que sea uno solo para todo el spa?', si: 'Un solo equipo compartido', no: 'Cada cabina tiene lo suyo' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El cliente solo ve horarios donde hay terapeuta y cabina libres a la vez. Lo que no cabe no se puede apartar.' },
        { sol: 'agenda-interna', para: 'La agenda se ve por cabina y por equipo, no solo por persona. El láser tiene su columna y no se promete dos veces.', pide: { equipo: true } },
        { sol: 'aviso-listo', para: 'Cuando la cabina queda lista, recepción se entera al instante y pasa al siguiente. Nadie toca la puerta para preguntar.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: definir cuántos minutos se dejan entre una cita y otra para cambiar la cabina, y respetarlos al agendar.' },
      ],
    },
    {
      id: 'ficha-del-cliente',
      area: 'organizacion',
      titulo: 'Cada terapeuta le vuelve a preguntar lo mismo al cliente',
      senal: 'Alergias, lesiones, la presión que prefiere, los parámetros del láser. Está en una carpeta o en la memoria de alguien.',
      frecuente: true,
      matices: [{ id: 'laser', pregunta: '¿Hace depilación láser o tratamientos con aparatos?', si: 'Usa láser o aparatos', no: 'Solo masajes y faciales' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'La ficha de cada cliente: alergias, zonas a evitar, la presión que prefiere y, en láser, los parámetros de cada sesión.' },
        { sol: 'formatos-digitales', para: 'La historia clínica y el consentimiento se llenan y se firman en una tableta. Quedan guardados con fecha y no en una carpeta.', pide: { laser: true } },
        { sol: 'agenda-interna', para: 'La nota importante aparece en la cita: "embarazo de 20 semanas", "no tocar hombro derecho". La terapeuta la ve antes de entrar.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: lo que una terapeuta notó hoy queda por escrito para quien atienda a ese cliente la próxima vez.' },
      ],
    },

    // ── Atención ──
    {
      id: 'plantones',
      area: 'atencion',
      titulo: 'Apartan cabina y terapeuta, y no llegan',
      senal: 'Una hora de masaje que nadie ocupa. La terapeuta ya estaba ahí y ese hueco no se recupera.',
      frecuente: true,
      matices: [{ id: 'nuevos', pregunta: '¿Quienes faltan son sobre todo clientes de primera vez?', si: 'Faltan los de primera vez', no: 'También faltan los de siempre' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'La primera cita se aparta con anticipo. A quien ya tiene paquete no se le pide: si no avisa, se le descuenta la sesión.', pide: { nuevos: true } },
        { sol: 'recordatorios', para: 'Un mensaje la víspera con la hora y cómo llegar. Confirmar o cancelar es un toque, y usted se entera con tiempo.' },
        { sol: 'lista-espera', para: 'Si alguien cancela el masaje de las seis, se le ofrece a quien pidió esa hora y no alcanzó.' },
        { sol: 'agenda-interna', para: 'Lo mínimo: en la agenda se marca quién confirmó. A media mañana se llama a los pendientes de la tarde.' },
      ],
    },
    {
      id: 'nadie-contesta',
      area: 'atencion',
      titulo: 'Estamos en cabina y nadie contesta',
      senal: 'Un masaje dura una hora. Quien escribe o llega en ese rato no encuentra a nadie y aparta en otro lado.',
      matices: [{ id: 'recepcion', pregunta: '¿Hay alguien en recepción todo el día?', si: 'Recepción todo el día', no: 'Atienden las mismas terapeutas' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El cliente aparta solo mientras usted está en cabina. Al salir, la cita ya está en la agenda.', pide: { recepcion: false } },
        { sol: 'seguimiento-prospectos', para: 'Cada mensaje sin contestar queda en una lista con su hora. Al salir de cabina se retoman en orden y ninguno se pasa.' },
        { sol: 'llamado-mesa', para: 'Un código en recepción. Quien llega y no ve a nadie avisa con un toque, y la terapeuta sabe que hay alguien esperando.', pide: { recepcion: false } },
        { sol: 'respuesta-automatica', para: 'Lo mínimo: una respuesta inmediata que dice "estamos en sesión, le escribimos a las cinco" y deja precios y horarios.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'sabanas-limpias',
      area: 'inventarios',
      titulo: 'Se acaban las sábanas limpias a media tarde',
      senal: 'Cada servicio usa sábana, toalla y bata. Si la lavandería se atrasa, la última cabina del día se arma con lo que haya.',
      matices: [{ id: 'lavanderia', pregunta: '¿Mandan los blancos a una lavandería de fuera?', si: 'Lavandería externa', no: 'Se lava en el spa' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Juegos de sábanas, toallas y batas con su mínimo. Cuando lo limpio baja de doce juegos, el aviso llega antes del sábado.' },
        { sol: 'seguimiento-pedidos', para: 'Cada bolsa que sale a la lavandería queda anotada: cuántas piezas, cuándo salió y cuándo vuelve. Se nota lo que no regresó.', pide: { lavanderia: true } },
        { sol: 'inventario-escaner', para: 'Lo que sale sucio y lo que entra limpio se registra con el celular. Se sabe cuántos juegos hay de verdad.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: el cierre incluye contar los juegos limpios y dejar puesta la lavadora. Se palomea y queda quién lo hizo.', pide: { lavanderia: false } },
      ],
    },
    {
      id: 'producto-se-vence',
      area: 'inventarios',
      titulo: 'Producto caro que se vence sin usarse',
      senal: 'Ampolletas, mascarillas y cremas de cabina que se abren para un facial y caducan antes de terminarse.',
      matices: [{ id: 'venta', pregunta: '¿También vende esas cremas a sus clientes?', si: 'Vende producto al público', no: 'Solo uso en cabina' }],
      rutas: [
        { sol: 'caducidades', para: 'Cada crema y cada ampolleta entra con su fecha. Lo que vence en dos meses aparece primero, a tiempo para usarlo.' },
        { sol: 'compras-sugeridas', para: 'Se pide según los faciales que de verdad se hacen. Menos producto abierto esperando al siguiente cliente.' },
        { sol: 'promos-segmentadas', para: 'Lo que está por vencer se ofrece con tiempo a quien ya lo ha comprado, antes de que se vuelva pérdida.', pide: { venta: true } },
        { sol: 'merma', para: 'Lo mínimo: anotar lo que se tira y por qué. En tres meses se ve qué producto no conviene seguir comprando.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'explicar-el-laser',
      area: 'comunicacion',
      titulo: 'Explico lo mismo del láser veinte veces al día',
      senal: '"¿Cuánto cuesta?", "¿duele?", "¿cuántas sesiones son?". Cada respuesta es un mensaje largo y muchos ya no contestan.',
      frecuente: true,
      matices: [{ id: 'valoracion', pregunta: '¿Ofrece una valoración antes de vender el paquete?', si: 'Hace valoración previa', no: 'Vende directo el paquete' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página que explica cada tratamiento: para quién es, cuántas sesiones, cuánto cuesta y cómo prepararse. Se manda el enlace.' },
        { sol: 'agenda-en-linea', para: 'La valoración se aparta desde el mismo mensaje. La explicación larga se da en persona, viendo la piel.', pide: { valoracion: true } },
        { sol: 'cotizador', para: 'El paquete se arma por zonas y sale el precio: axila, bikini y media pierna, ocho sesiones. Se envía claro en un minuto.', pide: { valoracion: false } },
        { sol: 'respuestas-rapidas', para: 'La explicación del láser, ya escrita y bien escrita. Se envía con un toque y siempre dice lo mismo.' },
      ],
    },
    {
      id: 'sin-preparacion',
      area: 'comunicacion',
      titulo: 'Llegan sin la preparación y hay que regresarlos',
      senal: 'Para el láser: sin rasurar, recién asoleados o con crema. La sesión se pierde y la cabina quedó apartada.',
      matices: [{ id: 'primera', pregunta: '¿Les pasa sobre todo a clientes en su primera sesión?', si: 'Pasa en la primera sesión', no: 'Pasa en cualquier sesión' }],
      rutas: [
        { sol: 'formatos-digitales', para: 'Al comprar el paquete, el cliente lee y firma las indicaciones en una tableta. Queda claro desde el inicio qué pasa si no las sigue.', pide: { primera: true } },
        { sol: 'expediente-cliente', para: 'En la ficha queda si llegó preparado cada vez. A quien se le repite se le llama antes, en lugar de esperar a que llegue.', pide: { primera: false } },
        { sol: 'recordatorios', para: 'El recordatorio de la víspera lleva la preparación: rasurar un día antes, sin crema, sin sol en la semana.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: las indicaciones de cada tratamiento ya escritas, para enviarlas al apartar y otra vez un día antes.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'paquetes-con-descuento',
      area: 'rentabilidad',
      titulo: 'Vendo paquetes con descuento y no sé si me convienen',
      senal: 'Diez sesiones al precio de siete suena bien al vender. Nadie ha hecho la cuenta de la cabina, el gel y la terapeuta.',
      matices: [{ id: 'improvisa', pregunta: '¿El descuento se decide en el momento, según el cliente?', si: 'El descuento se improvisa', no: 'Precios de paquete fijos' }],
      rutas: [
        { sol: 'costeo', para: 'Cuánto cuesta dar una sesión: el pago a la terapeuta, el gel, la sábana y la hora de cabina. Se ve hasta dónde aguanta el descuento.' },
        { sol: 'tablero-ventas', para: 'Cuánto entró por paquetes y cuántas sesiones se deben todavía. Vender hoy no es lo mismo que haber ganado.' },
        { sol: 'cotizador', para: 'El paquete se arma por zona y número de sesiones con precios ya calculados. Nadie inventa un descuento en el mostrador.', pide: { improvisa: true } },
        { sol: 'menu-digital', para: 'Con la carta en un enlace, ajustar el precio de un paquete toma un minuto y no hay folletos que tirar.' },
      ],
    },
  ],
}
