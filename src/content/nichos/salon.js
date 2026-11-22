// Salón de belleza. Forma y reglas en docs/ARQUITECTURA.md, "Contrato de un nicho".

export default {
  id: 'salon',
  familia: 'cuidado',
  nombre: 'Salón de belleza',
  plural: 'salones de belleza',
  icono: 'salon',
  acento: '#7a3b6e',
  orden: 20,
  vocab: {
    cliente: 'la clienta',
    clientes: 'las clientas',
    personal: 'la estilista',
    empleado: 'la estilista',
    producto: 'servicio',
    productos: 'servicios',
    lugar: 'salón',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos en sus redes que hacen mucho color. ¿Cómo aparta una clienta un servicio de varias horas?',
  observa: [
    'Si hay clientas esperando mientras una estilista atiende a dos a la vez.',
    'Si la agenda está en una libreta, en el celular de la dueña o en el de cada estilista.',
    'Si los tintes están acomodados por tono y se ve cuáles faltan.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Shampoo sin sulfatos', precio: 320, categoria: 'Cabello' },
      { nombre: 'Shampoo matizador', precio: 290, categoria: 'Cabello' },
      { nombre: 'Mascarilla reparadora', precio: 340, categoria: 'Cabello' },
      { nombre: 'Aceite de argán', precio: 260, categoria: 'Cabello' },
      { nombre: 'Protector térmico', precio: 240, categoria: 'Cabello' },
      { nombre: 'Esmalte de larga duración', precio: 150, categoria: 'Uñas' },
      { nombre: 'Aceite para cutícula', precio: 90, categoria: 'Uñas' },
      { nombre: 'Crema para manos', precio: 130, categoria: 'Uñas' },
      { nombre: 'Espuma limpiadora de pestañas', precio: 170, categoria: 'Pestañas y cejas' },
      { nombre: 'Suero para pestañas', precio: 280, categoria: 'Pestañas y cejas' },
      { nombre: 'Gel fijador para cejas', precio: 140, categoria: 'Pestañas y cejas' },
      { nombre: 'Kit de mantenimiento de color', precio: 780, categoria: 'Paquetes' },
      { nombre: 'Certificado de regalo', precio: 500, categoria: 'Paquetes' },
    ],
    servicios: [
      { nombre: 'Corte y secado', precio: 250, minutos: 45 },
      { nombre: 'Tinte completo', precio: 850, minutos: 150 },
      { nombre: 'Balayage', precio: 2200, minutos: 270 },
      { nombre: 'Alaciado con keratina', precio: 1400, minutos: 210 },
      { nombre: 'Uñas acrílicas', precio: 350, minutos: 100 },
      { nombre: 'Extensión de pestañas', precio: 500, minutos: 120 },
    ],
    personal: ['Karla', 'Yadira', 'Brenda', 'Paty'],
    clientes: ['Fernanda Ruiz', 'Sra. Villalvazo', 'Maestra Elvira', 'Daniela Chávez', 'Mónica Preciado', 'Doña Tere'],
    insumos: [
      { nombre: 'Tinte 7.1 rubio cenizo', unidad: 'tubos', hay: 2, minimo: 4 },
      { nombre: 'Tinte 5.0 castaño claro', unidad: 'tubos', hay: 6, minimo: 4 },
      { nombre: 'Peróxido de 20 volúmenes', unidad: 'L', hay: 3, minimo: 2 },
      { nombre: 'Polvo decolorante', unidad: 'kg', hay: 1, minimo: 2 },
      { nombre: 'Keratina', unidad: 'L', hay: 2, minimo: 1 },
      { nombre: 'Polvo acrílico', unidad: 'frascos', hay: 4, minimo: 3 },
      { nombre: 'Adhesivo para pestañas', unidad: 'frascos', hay: 3, minimo: 2 },
      { nombre: 'Guantes de nitrilo', unidad: 'cajas', hay: 5, minimo: 3 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'cancelan-servicio-largo',
      area: 'atencion',
      titulo: 'Me cancelan el mismo día un servicio de cuatro horas',
      senal: 'Un balayage apartado ocupa media jornada. Si la clienta avisa a las diez que no llega, ese hueco ya no se llena.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Ya pide anticipo para los servicios largos?', si: 'Ya pide anticipo', no: 'Aparta sin anticipo' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'Color, alaciados y uñas con diseño se apartan dejando anticipo al elegir la hora. Sin anticipo, el horario no se bloquea.', pide: { anticipo: false } },
        { sol: 'recordatorios', para: 'Dos días antes, la clienta confirma con un toque. Si cancela, todavía hay tiempo de ofrecerle esas horas a alguien más.' },
        { sol: 'lista-espera', para: 'Quien quería ese sábado queda anotada. Si un color se cae, el hueco se le ofrece en el momento.' },
        { sol: 'agenda-interna', para: 'Lo mínimo: marcar en la agenda qué citas largas ya confirmaron. A las que no, se les llama un día antes.' },
      ],
    },
    {
      id: 'se-enciman',
      area: 'atencion',
      titulo: 'Las citas se enciman y todas acaban esperando',
      senal: 'Un tinte que se alarga o una clienta que llega tarde recorre a todas las demás de la tarde.',
      frecuente: true,
      matices: [{ id: 'tiempos', pregunta: '¿Tiene definido cuánto dura cada servicio?', si: 'Tiempos definidos', no: 'La duración se calcula al tanteo' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Cada servicio aparta su tiempo real: tres horas un color, hora y media unas uñas. La clienta no elige un hueco donde no cabe.', pide: { tiempos: true } },
        { sol: 'agenda-interna', para: 'La tarde de cada estilista en una vista, con el tiempo de pose marcado. Se ve dónde cabe un corte entre dos colores.' },
        { sol: 'recordatorios', para: 'El recordatorio lleva la hora y la tolerancia. La clienta que va tarde avisa antes y la siguiente no espera de más.' },
        { sol: 'proceso-claro', para: 'Antes que nada, medimos con usted cuánto dura de verdad cada servicio y cuánta holgura necesita. Con eso se agenda distinto.', pide: { tiempos: false } },
      ],
    },

    // ── Comunicación ──
    {
      id: 'cuanto-me-cobra',
      area: 'comunicacion',
      titulo: 'Todo el día preguntan "¿cuánto me cobra?" con una foto',
      senal: 'Mandan un color de Pinterest y piden precio. Contestar bien pide ver el cabello, y la estilista tiene las manos ocupadas.',
      frecuente: true,
      matices: [{ id: 'largo', pregunta: '¿Sus precios de color cambian según el largo y la cantidad de cabello?', si: 'El precio depende del cabello', no: 'Precios fijos por servicio' }],
      rutas: [
        { sol: 'cotizador', para: 'Se elige técnica, largo y si lleva decoloración, y sale el precio. Se envía por WhatsApp en un minuto y siempre con la misma cuenta.', pide: { largo: true } },
        { sol: 'respuesta-automatica', para: 'Horario, ubicación y precios base se contestan solos. Las fotos de color quedan en espera para que usted las vea con calma.' },
        { sol: 'menu-digital', para: 'La lista de servicios con precio en un enlace. Quien pregunta "¿cuánto?" recibe la lista completa y no una respuesta a medias.', pide: { largo: false } },
        { sol: 'respuestas-rapidas', para: 'Lo que siempre se explica, ya escrito: qué incluye el balayage, cuánto dura, cuánto es el anticipo. Un toque entre clienta y clienta.' },
      ],
    },

    // ── Administración ──
    {
      id: 'transferencias-sin-nombre',
      area: 'administracion',
      titulo: 'Me llegan transferencias y no sé de quién son',
      senal: 'Anticipos de 200 a nombre del esposo o sin concepto. Hay que buscar la captura en el chat para saber de qué cita es.',
      frecuente: true,
      matices: [{ id: 'tarjeta', pregunta: '¿Sus clientas pagarían el anticipo con tarjeta desde el celular?', si: 'Pagarían con tarjeta', no: 'Prefieren transferir' }],
      rutas: [
        { sol: 'cobro-en-linea', para: 'Cada anticipo se pide con un enlace ligado a la cita. Al pagarse, la cita queda confirmada y con el nombre correcto.', pide: { tarjeta: true } },
        { sol: 'punto-de-venta', para: 'Al cobrar el servicio, el anticipo ya aparece descontado. Nadie tiene que acordarse de cuánto había dejado la clienta.' },
        { sol: 'fiado', para: 'Anticipos, abonos y saldos en la cuenta de cada clienta. Se ve quién dejó cuánto y qué falta por cobrar.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: el mensaje con la cuenta y la instrucción de poner nombre y fecha de la cita en el concepto. Siempre el mismo.', pide: { tarjeta: false } },
      ],
    },
    {
      id: 'comisiones-a-mano',
      area: 'administracion',
      titulo: 'La comisión de cada estilista se saca a mano',
      senal: 'Al color se le descuenta el producto antes de repartir y a las uñas no. La cuenta de la quincena se lleva una tarde.',
      matices: [{ id: 'producto', pregunta: '¿Descuenta el costo del producto antes de calcular la comisión?', si: 'Se descuenta el producto', no: 'Comisión sobre el precio completo' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada servicio se cobra a nombre de quien lo hizo, con su porcentaje. La quincena llega sumada.' },
        { sol: 'costeo', para: 'El costo de producto de cada servicio se define una vez. La comisión se calcula sobre lo que de verdad deja.', pide: { producto: true } },
        { sol: 'tablero-ventas', para: 'Cada estilista ve lo que lleva en la quincena. Llega al día de pago sabiendo su número.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con los servicios del día por estilista. La cuenta se va armando sola.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'tono-se-acaba',
      area: 'inventarios',
      titulo: 'Se acaba justo el tono que necesitaba',
      senal: 'La clienta ya está sentada y falta el 7.1 o el peróxido de 20. Hay que mandar a alguien a la distribuidora.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Alguien lleva la cuenta de los tubos que hay de cada tono?', si: 'Se lleva la cuenta', no: 'Se revisa el estante "a ojo"' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada tono con su mínimo. Cuando quedan dos tubos del 7.1, el aviso llega antes de las citas del sábado.' },
        { sol: 'compras-sugeridas', para: 'Según los colores que se hicieron en el mes, se arma el pedido a la distribuidora. Se piden los tonos que salen.' },
        { sol: 'inventario-escaner', para: 'Cada tubo que se abre se registra con el celular. Lo anotado y lo que hay en el estante coinciden.', pide: { registro: true } },
        { sol: 'bitacora-turno', para: 'Lo mínimo: quien abre el último tubo de un tono lo anota. Quien hace el pedido lee esa lista antes de ir a la distribuidora.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'tinte-de-mas',
      area: 'rentabilidad',
      titulo: 'Se gasta más tinte del que se cobra',
      senal: 'Cada quien mezcla "a ojo" y lo que sobra se tira. Un cabello largo se lleva dos tubos al precio de uno.',
      frecuente: true,
      matices: [{ id: 'pesa', pregunta: '¿Sus estilistas pesan el tinte al preparar la mezcla?', si: 'Se pesa la mezcla', no: 'Se mezcla "a ojo"' }],
      rutas: [
        { sol: 'costeo', para: 'Cuánto cuesta de verdad un color en cabello largo: tubos, peróxido, decolorante y horas. Se ve qué precio ya no alcanza.' },
        { sol: 'cotizador', para: 'El precio se arma por largo y cantidad, con el producto extra incluido. La clienta lo sabe antes de sentarse.' },
        { sol: 'merma', para: 'Lo que sobra en el tazón se anota por servicio. Al mes se sabe cuánto tinte se tiró y en qué mezclas.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una báscula y una tabla de gramos por largo de cabello, acordada con sus estilistas. Sin sistema.', pide: { pesa: false } },
      ],
    },
    {
      id: 'mantenimiento-en-otro-lado',
      area: 'rentabilidad',
      titulo: 'Se hacen el color aquí y compran el shampoo en otro lado',
      senal: 'Un rubio necesita matizador y shampoo sin sulfatos. Nadie lo ofrece, y la clienta compra cualquier cosa en el súper.',
      matices: [{ id: 'recomienda', pregunta: '¿Sus estilistas recomiendan producto al terminar el servicio?', si: 'Recomiendan producto', no: 'Casi nunca lo ofrecen' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'A quien se hizo rubio la semana pasada le llega el matizador que le toca usar. No a todas: a ella.' },
        { sol: 'punto-de-venta', para: 'El producto se cobra junto con el servicio y queda a nombre de la estilista que lo recomendó, con su comisión.', pide: { recomienda: true } },
        { sol: 'catalogo-whatsapp', para: 'Los productos de mantenimiento en un enlace. La clienta los pide por WhatsApp y los recoge en su retoque.' },
        { sol: 'menu-digital', para: 'Lo mínimo: un código en el tocador con los productos y sus precios. La clienta lo ve durante el tiempo de pose.' },
      ],
    },

    // ── Organización ──
    {
      id: 'formula-en-la-cabeza',
      area: 'organizacion',
      titulo: 'La fórmula del color solo la sabe quien lo aplicó',
      senal: '"Póngame lo mismo de la otra vez." Si esa estilista descansó o ya no trabaja aquí, nadie sabe qué fue.',
      frecuente: true,
      matices: [{ id: 'libreta', pregunta: '¿Hoy anotan las fórmulas en una libreta o en tarjetas?', si: 'Se anotan en libreta', no: 'Se quedan en la memoria' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada clienta con su ficha: tono, volumen del peróxido, tiempo de pose y la foto de cómo quedó. Cualquiera puede repetir el color.' },
        { sol: 'formatos-digitales', para: 'La hoja de primera vez se llena en una tableta: alergias, tratamientos previos y prueba de sensibilidad, con su firma.' },
        { sol: 'base-clientes', para: 'Lo que hoy está en la libreta pasa a una lista que se busca por nombre. Se encuentra en segundos y no hojeando.', pide: { libreta: true } },
        { sol: 'agenda-interna', para: 'Lo mínimo: una nota en cada cita con la fórmula usada. La próxima vez aparece al abrir la cita de esa clienta.' },
      ],
    },
    {
      id: 'si-no-estoy',
      area: 'organizacion',
      titulo: 'Si yo no estoy, las cosas no se hacen igual',
      senal: 'Se abre tarde, la herramienta de uñas queda sin esterilizar o una plancha prendida. Usted se entera al día siguiente.',
      matices: [{ id: 'encargada', pregunta: '¿Deja a alguien encargada cuando usted no está?', si: 'Queda una encargada', no: 'Nadie queda a cargo' }],
      rutas: [
        { sol: 'roles-horarios', para: 'Quién abre, quién cierra y quién descansa, publicado para todas. La hora en que se abrió queda registrada desde el celular.', pide: { encargada: false } },
        { sol: 'bitacora-turno', para: 'Lo pendiente se anota: una clienta por confirmar, un tinte por pedir. Usted lo lee desde su casa y la encargada lo retoma.', pide: { encargada: true } },
        { sol: 'reporte-diario', para: 'Cada noche le llega un mensaje: cuántas clientas, cuánto se cobró y qué faltó de la lista de cierre.' },
        { sol: 'checklist-turnos', para: 'La lista de cierre en el celular: esterilizar herramienta, apagar planchas, lavar toallas. Se palomea y queda quién y a qué hora.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'retoque-se-pasa',
      area: 'clientes',
      titulo: 'Las clientas dejan pasar su retoque',
      senal: 'La raíz pide retoque a las cinco semanas y las uñas a las tres. Sin aviso, vuelven a los tres meses o prueban otro salón.',
      matices: [{ id: 'cita', pregunta: '¿La clienta se va con su siguiente cita ya apartada?', si: 'Sale con cita apartada', no: 'Regresa cuando escribe' }],
      rutas: [
        { sol: 'reactivacion', para: 'El sistema sabe a quién le toca raíz esta semana y deja listo el mensaje para invitarla, con su estilista y sus horarios.', pide: { cita: false } },
        { sol: 'recordatorios', para: 'La cita de retoque que se apartó hace un mes se recuerda sola. La clienta confirma o la mueve, pero no se le pasa.', pide: { cita: true } },
        { sol: 'agenda-en-linea', para: 'Mover el retoque es fácil: la clienta cambia de día desde su teléfono en lugar de dejarlo para después.' },
        { sol: 'base-clientes', para: 'Lo primero: anotar a cada clienta con la fecha de su último color. Con esa lista ya se sabe a quién escribirle.' },
      ],
    },
    {
      id: 'fuera-de-temporada',
      area: 'clientes',
      titulo: 'Fuera de temporada el salón se queda solo',
      senal: 'Graduaciones, mayo y diciembre llenos. En enero y en septiembre hay tardes enteras sin una clienta.',
      matices: [{ id: 'contacto', pregunta: '¿Tiene el teléfono de las clientas que ya vinieron?', si: 'Tiene sus teléfonos', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'En enero, una invitación de tratamiento a quienes se hicieron color en diciembre. Le llega a quien de verdad lo necesita.', pide: { contacto: true } },
        { sol: 'tarjeta-lealtad', para: 'Sellos dobles en enero y en septiembre. La clienta tiene un motivo para no esperar hasta diciembre.' },
        { sol: 'tablero-ventas', para: 'Qué semanas y qué tardes se quedan solas, con números. La promoción se pone donde hace falta y no en diciembre.' },
        { sol: 'perfil-google', para: 'Lo primero: la ficha con fotos de trabajos recientes, horario y cómo escribir. Quien busca salón en enero lo encuentra.' },
      ],
    },

    // ── Logística ──
    {
      id: 'eventos-por-whatsapp',
      area: 'logistica',
      titulo: 'Las novias y los XV años se llevan por puro WhatsApp',
      senal: 'Prueba, anticipo, cuántas se peinan, a qué hora y dónde. Todo está en un chat que hay que releer cada vez.',
      matices: [{ id: 'domicilio', pregunta: '¿Atiende eventos a domicilio o fuera del salón?', si: 'Atiende a domicilio', no: 'Solo en el salón' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada evento con su hoja: fecha, cuántas se peinan, prueba hecha, anticipo y saldo. Se abre y ahí está todo.' },
        { sol: 'cotizador', para: 'El paquete de novia con mamá y damas se cotiza en un minuto y se manda claro: qué incluye, cuánto es y con cuánto se aparta.' },
        { sol: 'anticipo-reserva', para: 'La fecha se bloquea cuando entra el anticipo. No se le promete el mismo sábado a dos novias.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: la lista de lo que sale del salón para un evento. Planchas, extensión, luz, maquillaje. Se palomea antes de salir.', pide: { domicilio: true } },
      ],
    },
  ],
}
