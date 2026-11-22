// Gimnasio o estudio. Forma y reglas en docs/ARQUITECTURA.md, "Contrato de un nicho".

export default {
  id: 'gimnasio',
  familia: 'cuidado',
  nombre: 'Gimnasio o estudio',
  plural: 'gimnasios',
  icono: 'gimnasio',
  acento: '#a4262c',
  orden: 40,
  vocab: {
    cliente: 'el socio',
    clientes: 'los socios',
    personal: 'el instructor',
    empleado: 'el instructor',
    cita: 'clase',
    citas: 'clases',
    lugar: 'gimnasio',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que en la tarde se llena. ¿Cómo saben en recepción quién está al corriente con su mensualidad?',
  observa: [
    'Si al entrar alguien revisa la vigencia o todos pasan de largo.',
    'Si los pagos se anotan en una libreta, en Excel o en algún sistema.',
    'Si hay máquinas con letrero de "fuera de servicio".',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Mensualidad', precio: 450, categoria: 'Planes' },
      { nombre: 'Mensualidad de estudiante', precio: 380, categoria: 'Planes' },
      { nombre: 'Inscripción', precio: 150, categoria: 'Planes' },
      { nombre: 'Visita', precio: 60, categoria: 'Planes' },
      { nombre: 'Proteína de suero 1 kg', precio: 780, categoria: 'Suplementos' },
      { nombre: 'Creatina 300 g', precio: 420, categoria: 'Suplementos' },
      { nombre: 'Preentreno', precio: 520, categoria: 'Suplementos' },
      { nombre: 'Agua 600 ml', precio: 15, categoria: 'Bebidas' },
      { nombre: 'Bebida hidratante', precio: 28, categoria: 'Bebidas' },
      { nombre: 'Bebida energética', precio: 38, categoria: 'Bebidas' },
      { nombre: 'Licuado de proteína', precio: 55, categoria: 'Bebidas' },
      { nombre: 'Guantes de entrenamiento', precio: 180, categoria: 'Accesorios' },
      { nombre: 'Vaso mezclador', precio: 120, categoria: 'Accesorios' },
      { nombre: 'Toalla deportiva', precio: 150, categoria: 'Accesorios' },
    ],
    servicios: [
      { nombre: 'Clase de spinning', precio: 60, minutos: 50 },
      { nombre: 'Clase de funcional', precio: 60, minutos: 60 },
      { nombre: 'Clase de yoga', precio: 70, minutos: 60 },
      { nombre: 'Clase de zumba', precio: 50, minutos: 60 },
      { nombre: 'Valoración inicial', precio: 0, minutos: 30 },
      { nombre: 'Entrenamiento personal', precio: 180, minutos: 60 },
    ],
    personal: ['Fer', 'Abraham', 'Jazmín', 'Omar'],
    clientes: ['Jorge Larios', 'Karen Guzmán', 'Ing. Michel', 'Sofía Rolón', 'Don Arturo', 'Valeria Núñez'],
    insumos: [
      { nombre: 'Agua 600 ml', unidad: 'pzas', hay: 18, minimo: 24 },
      { nombre: 'Bebida hidratante', unidad: 'pzas', hay: 30, minimo: 24 },
      { nombre: 'Proteína de suero 1 kg', unidad: 'botes', hay: 2, minimo: 4 },
      { nombre: 'Creatina 300 g', unidad: 'botes', hay: 5, minimo: 3 },
      { nombre: 'Toallas desinfectantes', unidad: 'paquetes', hay: 6, minimo: 4 },
      { nombre: 'Líquido desinfectante', unidad: 'L', hay: 8, minimo: 5 },
      { nombre: 'Papel para manos', unidad: 'rollos', hay: 10, minimo: 6 },
      { nombre: 'Magnesia', unidad: 'kg', hay: 2, minimo: 1 },
    ],
  },

  problemas: [
    // ── Administración ──
    {
      id: 'quien-debe',
      area: 'administracion',
      titulo: 'No sé quién ya pagó y quién debe este mes',
      senal: 'Cada socio paga en una fecha distinta. La libreta dice una cosa y la recepcionista recuerda otra.',
      frecuente: true,
      matices: [{ id: 'presente', pregunta: '¿Usted está en el gimnasio la mayor parte del día?', si: 'El dueño está presente', no: 'Lo atiende su personal' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Todos los socios en una lista: vigentes, por vencer esta semana y vencidos. El lunes se ve a quién toca cobrarle.' },
        { sol: 'punto-de-venta', para: 'Cada mensualidad se cobra con su recibo y la vigencia se renueva sola. No hay pago sin registro.' },
        { sol: 'tablero-ventas', para: 'Cuánto se ha cobrado de mensualidades en el mes y cuánto falta, en su teléfono. No hay que estar en recepción para saberlo.', pide: { presente: false } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje: quién pagó hoy, quién venció y cuánto falta por cobrar en la semana.' },
      ],
    },
    {
      id: 'caja-entre-turnos',
      area: 'administracion',
      titulo: 'La caja de recepción no cuadra entre turnos',
      senal: 'Mensualidades, visitas, aguas y proteínas pasan por la misma caja. Cambia el turno y el faltante no es de nadie.',
      matices: [{ id: 'varios', pregunta: '¿Cobran dos o más personas en el día?', si: 'Varias personas cobran', no: 'Una sola persona cobra' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Mensualidad, visita o agua: todo se cobra en el mismo lugar y con recibo. Queda quién cobró y a qué hora.' },
        { sol: 'corte-de-caja', para: 'Cada turno entrega con su corte: lo que debía haber y lo que hay. La diferencia tiene nombre antes de que llegue el siguiente.', pide: { varios: true } },
        { sol: 'cobro-en-linea', para: 'Las mensualidades pagadas con enlace no pasan por la caja. Hay menos efectivo que contar y que cuidar.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: una nota de entrega entre turnos. Cuánto se deja en caja, qué se fió y quién quedó de pagar mañana.' },
      ],
    },
    {
      id: 'paquetes-de-clases',
      area: 'administracion',
      titulo: 'En los paquetes de clases nadie lleva bien la cuenta',
      senal: 'El estudio vende diez clases y las marca en una tarjeta. Unos toman doce y otros reclaman que les faltan.',
      matices: [{ id: 'aparta', pregunta: '¿Apartan lugar antes de cada clase?', si: 'Apartan antes de la clase', no: 'Llegan directo a la clase' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Cada clase apartada descuenta una del paquete. No hay tarjeta que marcar ni cuenta que discutir.', pide: { aparta: true } },
        { sol: 'acceso-vigencia', para: 'Al llegar muestra su código. Si le quedan clases, pasa; si era la última, se le avisa ahí mismo.', pide: { aparta: false } },
        { sol: 'tarjeta-lealtad', para: 'La tarjeta de clases vive en el teléfono. Cada asistencia marca una y cada quien ve cuántas le quedan.' },
        { sol: 'base-clientes', para: 'Lo mínimo: pasar las tarjetas a una lista por nombre que se actualiza al terminar cada clase.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'vencidos-entran',
      area: 'rentabilidad',
      titulo: 'Entra gente con la mensualidad vencida',
      senal: 'A las siete de la tarde entran veinte al mismo tiempo. Nadie revisa a nadie, y el conocido del instructor pasa sin pagar.',
      frecuente: true,
      matices: [{ id: 'pena', pregunta: '¿A su personal le cuesta cobrarle a los conocidos?', si: 'Les da pena cobrar', no: 'Cobran sin problema' }],
      rutas: [
        { sol: 'acceso-vigencia', para: 'Cada socio pasa su código al entrar. Si venció, lo dice la pantalla y no la recepcionista. Es más fácil para todos.', pide: { pena: true } },
        { sol: 'control-mensualidades', para: 'Los vencidos de hoy a la vista en recepción, con nombre y fecha. Se revisan diez nombres, no doscientos.' },
        { sol: 'cobro-en-linea', para: 'El aviso de vencimiento llega con un enlace de pago. El socio puede renovar desde el celular antes de llegar a la puerta.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar la regla y escribirla donde todos la vean. Cuántos días de gracia hay y quién autoriza una cortesía.' },
      ],
    },
    {
      id: 'apuntamelo',
      area: 'rentabilidad',
      titulo: '"Apúntamelo" y luego nadie cobra',
      senal: 'Aguas, proteínas y mensualidades a medias anotadas en una hoja pegada junto a la caja.',
      matices: [{ id: 'abonos', pregunta: '¿También deja que la mensualidad se pague en partes?', si: 'Mensualidad en abonos', no: 'Solo se fía en mostrador' }],
      rutas: [
        { sol: 'fiado', para: 'Cada socio con su cuenta: dos aguas, una proteína, un abono. Se ve el saldo y el recordatorio sale con un toque.' },
        { sol: 'control-mensualidades', para: 'La mensualidad pagada a medias queda marcada con lo que falta y su fecha. No se confunde con una completa.', pide: { abonos: true } },
        { sol: 'cobro-en-linea', para: 'El saldo se cobra con un enlace por WhatsApp. El socio paga desde su casa aunque ese día no traiga efectivo.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: el recordatorio de saldo ya escrito, corto y amable. Se envía cada viernes a quien debe.' },
      ],
    },
    {
      id: 'no-salen-las-cuentas',
      area: 'rentabilidad',
      titulo: 'Tengo muchos socios y aun así no salen las cuentas',
      senal: 'Inscripción gratis, plan de pareja, plan de estudiante. La renta, la luz y los instructores no bajan.',
      matices: [{ id: 'clases', pregunta: '¿Paga a sus instructores por clase dada?', si: 'Paga por clase', no: 'Sueldo fijo' }],
      rutas: [
        { sol: 'costeo', para: 'Cuánto cuesta dar la clase de las siete con ocho personas y cuánto deja con quince. Se ve qué horario se sostiene.', pide: { clases: true } },
        { sol: 'tablero-ventas', para: 'Cuánto entra por mensualidades, por visitas y por mostrador, mes con mes. Se ve de qué vive el gimnasio en realidad.' },
        { sol: 'control-mensualidades', para: 'Cuántos socios hay en cada plan y cuántos renovaron. Se nota la promoción que solo trajo gente de un mes.' },
        { sol: 'menu-digital', para: 'Con los planes en un enlace, ajustar un precio o quitar una promoción toma un minuto y no hay lona que rehacer.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'dejan-de-ir',
      area: 'clientes',
      titulo: 'Se inscriben en enero y en marzo ya no vienen',
      senal: 'Primero faltan una semana, luego dos, y ya no renuevan. Nadie lo nota hasta que la mensualidad vence.',
      frecuente: true,
      matices: [{ id: 'asistencia', pregunta: '¿Registran quién entra cada día?', si: 'Hay registro de asistencia', no: 'No se registra la entrada' }],
      rutas: [
        { sol: 'reactivacion', para: 'A los diez días sin venir, el mensaje queda listo: "Lo esperamos en la clase de las siete". Antes de que venza, no después.', pide: { asistencia: true } },
        { sol: 'expediente-cliente', para: 'Cada socio con sus medidas y su avance. Quien ve en su ficha lo que ha cambiado en dos meses tiene una razón para seguir.' },
        { sol: 'acceso-vigencia', para: 'El registro de entrada es el punto de partida. Sin saber quién vino, no hay forma de notar quién dejó de venir.', pide: { asistencia: false } },
        { sol: 'tarjeta-lealtad', para: 'Lo más sencillo: doce visitas en el mes ganan un licuado o un pase de invitado. Venir seguido tiene recompensa.' },
      ],
    },
    {
      id: 'preguntan-y-no-llegan',
      area: 'clientes',
      titulo: 'Preguntan precios, dicen "el lunes voy" y no llegan',
      senal: 'Cada semana preguntan diez personas por la inscripción. Nadie anota quiénes fueron ni les vuelve a escribir.',
      frecuente: true,
      matices: [{ id: 'prueba', pregunta: '¿Ofrece una clase o un día de prueba?', si: 'Ofrece clase de prueba', no: 'Sin clase de prueba' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Cada persona que preguntó queda anotada con fecha. El lunes aparece el aviso: escribirle a quien dijo que empezaba hoy.' },
        { sol: 'agenda-en-linea', para: 'La clase de prueba se aparta desde el mismo mensaje. Quien ya tiene día y hora tiene un compromiso, no una intención.', pide: { prueba: true } },
        { sol: 'sitio-web', para: 'Planes, horarios, fotos del lugar y cómo inscribirse en una página. Quien pregunta "¿qué precio?" recibe todo de una vez.' },
        { sol: 'perfil-google', para: 'Lo primero: que al buscar "gimnasio" aparezca con horario, fotos y teléfono. Muchos deciden ahí antes de preguntar.' },
      ],
    },

    // ── Atención ──
    {
      id: 'nuevo-se-desanima',
      area: 'atencion',
      titulo: 'El que llega nuevo no sabe qué hacer y se desanima',
      senal: 'Le enseñan las máquinas el primer día y después queda solo. A las tres semanas deja de venir.',
      matices: [{ id: 'rutina', pregunta: '¿Sus instructores arman una rutina para cada socio nuevo?', si: 'Dan rutina personal', no: 'Cada quien entrena a su modo' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'La rutina, las medidas y las lesiones del socio en su ficha. Cualquier instructor la abre y sabe en qué va.', pide: { rutina: true } },
        { sol: 'agenda-en-linea', para: 'Al inscribirse, el nuevo aparta su valoración y sus primeras sesiones guiadas. No depende de coincidir con el instructor.' },
        { sol: 'seguimiento-prospectos', para: 'Cada socio nuevo queda en seguimiento su primer mes: un mensaje a la semana y una revisión a los quince días.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: una lista de bienvenida por socio nuevo. Recorrido, valoración, rutina entregada. Se palomea y queda quién lo recibió.' },
      ],
    },
    {
      id: 'apartan-y-no-llegan',
      area: 'atencion',
      titulo: 'Apartan lugar en la clase y no llegan',
      senal: 'Las quince bicicletas apartadas por WhatsApp. Llegan nueve, y quienes sí querían venir se quedaron fuera.',
      frecuente: true,
      matices: [{ id: 'grupo', pregunta: '¿Hoy apartan por un grupo de WhatsApp?', si: 'Apartan por grupo de WhatsApp', no: 'Entra quien alcanza lugar' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Cada clase con su cupo. El socio aparta su bicicleta desde el celular y, si no puede ir, la suelta con un toque.' },
        { sol: 'lista-espera', para: 'Cuando alguien suelta su lugar, se le ofrece al primero de la lista. La bicicleta no se queda sola.' },
        { sol: 'recordatorios', para: 'Dos horas antes llega un mensaje para confirmar o liberar el lugar. Quien no confirma lo pierde.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: las reglas para apartar, ya escritas y fijadas en el grupo. Hasta qué hora se aparta y cómo se cancela.', pide: { grupo: true } },
      ],
    },

    // ── Organización ──
    {
      id: 'hora-pico',
      area: 'organizacion',
      titulo: 'De seis a nueve no cabe nadie y a mediodía está solo',
      senal: 'En la tarde hay fila para la caminadora y la prensa. A las once de la mañana entrenan tres personas.',
      matices: [{ id: 'precio', pregunta: '¿Daría un precio distinto por venir en horario de poca gente?', si: 'Precio por horario aceptado', no: 'Un solo precio' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'Una mensualidad matutina a menor precio, ofrecida a quienes ya vienen temprano o trabajan por la tarde.', pide: { precio: true } },
        { sol: 'roles-horarios', para: 'Los instructores se reparten según la gente: dos en piso de seis a nueve, uno a mediodía. Publicado para todos.' },
        { sol: 'acceso-vigencia', para: 'El registro de entrada dice cuánta gente hay a cada hora. Con ese número se decide si conviene otra clase o un plan de mañana.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: un tiempo máximo por máquina en hora pico y un letrero que lo diga. Lo acordamos con sus instructores.' },
      ],
    },
    {
      id: 'maquina-descompuesta',
      area: 'organizacion',
      titulo: 'Una máquina se descompone y pasa semanas así',
      senal: 'El cable de la polea, la banda de la caminadora. Todos lo saben, nadie lo reporta y el socio se queja en una reseña.',
      matices: [{ id: 'tecnico', pregunta: '¿Tiene un técnico de confianza para el mantenimiento?', si: 'Tiene técnico de confianza', no: 'Busca quien repare cada vez' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada falla con su orden: qué máquina, qué tiene, a quién se le encargó y para cuándo. Deja de ser "ya le dije a alguien".' },
        { sol: 'llamado-mesa', para: 'Un código en cada máquina. El socio reporta la falla con un toque y el aviso llega a recepción.' },
        { sol: 'inventario-alertas', para: 'Cables, bandas y poleas de repuesto con su mínimo. Cuando el técnico llega, la refacción más común ya está en la bodega.', pide: { tecnico: true } },
        { sol: 'bitacora-turno', para: 'Lo mínimo: el turno de la mañana anota lo que falló y el de la tarde lo ve al llegar. El reporte no depende de coincidir.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'cambia-la-clase',
      area: 'comunicacion',
      titulo: 'Cambia una clase y la mitad no se entera',
      senal: 'El aviso se puso en el grupo, entre memes y saludos. Llegan a la clase de las siete y el instructor no vino.',
      frecuente: true,
      matices: [{ id: 'grupo', pregunta: '¿Los avisos se dan por un grupo de WhatsApp?', si: 'Avisos por grupo', no: 'Avisos en el pizarrón' }],
      rutas: [
        { sol: 'roles-horarios', para: 'Qué instructor da qué clase, publicado para todos. Si alguien no puede, se ve con tiempo y se busca quién lo cubra.' },
        { sol: 'promos-segmentadas', para: 'El aviso le llega directo a quienes toman esa clase y no al grupo de trescientos. No se pierde entre otros mensajes.', pide: { grupo: true } },
        { sol: 'respuesta-automatica', para: '"¿Hay clase hoy?" se contesta solo, con el horario del día. Recepción deja de responder lo mismo treinta veces.' },
        { sol: 'menu-digital', para: 'Lo mínimo: el horario de clases en un enlace que siempre está al día. Se cambia en un minuto y no hay lona que reimprimir.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-el-mostrador',
      area: 'inventarios',
      titulo: 'Se acaban las aguas y la proteína que más se vende',
      senal: 'El refrigerador vacío en la hora pico, o el sabor que todos piden agotado desde el martes.',
      matices: [{ id: 'proveedor', pregunta: '¿El proveedor le surte en días fijos?', si: 'Surtido en días fijos', no: 'Compra cuando se acaba' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Aguas, bebidas y proteína con su mínimo. Cuando quedan menos de 24 aguas, el aviso llega antes de la tarde.' },
        { sol: 'compras-sugeridas', para: 'Para el día en que pasa el proveedor, la lista ya está hecha según lo que se vendió en la semana.', pide: { proveedor: true } },
        { sol: 'caducidades', para: 'Los suplementos entran con su fecha. El bote que vence en dos meses se ofrece primero y no se queda al fondo.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: resurtir el refrigerador está en la lista de apertura de la tarde. Se palomea antes de las cinco.' },
      ],
    },
  ],
}
