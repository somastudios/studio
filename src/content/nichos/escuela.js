// Colegio pequeño, guardería, academia (inglés, música, regularización) o escuela de manejo.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").
// Quien paga y recibe los avisos suele ser el padre de familia; el alumno es quien asiste.

export default {
  id: 'escuela',
  familia: 'estancia',
  nombre: 'Escuela o academia',
  plural: 'escuelas y academias',
  icono: 'escuela',
  acento: '#2f5d3f',
  orden: 30,
  vocab: {
    cliente: 'el alumno',
    clientes: 'los alumnos',
    empleado: 'el maestro',
    producto: 'concepto',
    productos: 'conceptos',
    pedido: 'trámite',
    pedidos: 'trámites',
    cita: 'clase',
    citas: 'clases',
    lugar: 'plantel',
  },

  // Para quien presenta, antes de entrar.
  apertura: '¿Cómo les fue con las inscripciones de este ciclo? ¿Se llenaron los grupos que esperaban?',
  observa: [
    'Cómo cobra la oficina: talonario de recibos, libreta, hoja de cálculo o un sistema.',
    'Si hay avisos pegados en la puerta o en la ventanilla, y de qué fecha son.',
    'Cuántos papás esperan en la oficina y a qué vienen: a pagar, a preguntar o a pedir un papel.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Colegiatura mensual primaria', precio: 2400, categoria: 'Colegiaturas' },
      { nombre: 'Colegiatura mensual preescolar', precio: 2100, categoria: 'Colegiaturas' },
      { nombre: 'Mensualidad de inglés', precio: 950, categoria: 'Colegiaturas' },
      { nombre: 'Mensualidad de guitarra o piano', precio: 800, categoria: 'Colegiaturas' },
      { nombre: 'Inscripción anual', precio: 2800, categoria: 'Inscripción' },
      { nombre: 'Reinscripción', precio: 2200, categoria: 'Inscripción' },
      { nombre: 'Examen de ubicación', precio: 150, categoria: 'Inscripción' },
      { nombre: 'Curso de manejo (10 clases)', precio: 3200, categoria: 'Cursos' },
      { nombre: 'Regularización por materia (mes)', precio: 700, categoria: 'Cursos' },
      { nombre: 'Curso de verano', precio: 1800, categoria: 'Cursos' },
      { nombre: 'Playera de uniforme', precio: 240, categoria: 'Uniformes y libros' },
      { nombre: 'Pants deportivo', precio: 520, categoria: 'Uniformes y libros' },
      { nombre: 'Paquete de libros', precio: 1650, categoria: 'Uniformes y libros' },
      { nombre: 'Libro de inglés por nivel', precio: 480, categoria: 'Uniformes y libros' },
    ],
    servicios: [
      { nombre: 'Clase muestra', precio: 0, minutos: 50 },
      { nombre: 'Cita de informes con dirección', precio: 0, minutos: 30 },
      { nombre: 'Examen de ubicación', precio: 150, minutos: 45 },
      { nombre: 'Clase de manejo', precio: 320, minutos: 60 },
      { nombre: 'Clase individual de piano', precio: 180, minutos: 45 },
      { nombre: 'Asesoría de regularización', precio: 150, minutos: 60 },
    ],
    personal: ['Paty', 'Arturo', 'Gaby', 'Noé'],
    clientes: ['Sofía Ramírez', 'Emiliano Torres', 'Valeria Núñez', 'Santiago Orozco', 'Regina Villa', 'Mateo Gutiérrez'],
    insumos: [
      { nombre: 'Playera de uniforme talla 8', unidad: 'pzas', hay: 4, minimo: 10 },
      { nombre: 'Playera de uniforme talla 12', unidad: 'pzas', hay: 22, minimo: 10 },
      { nombre: 'Pants deportivo talla 10', unidad: 'pzas', hay: 9, minimo: 8 },
      { nombre: 'Paquete de libros de tercero', unidad: 'paquetes', hay: 3, minimo: 6 },
      { nombre: 'Libro de inglés nivel 2', unidad: 'pzas', hay: 14, minimo: 10 },
      { nombre: 'Marcadores para pizarrón', unidad: 'cajas', hay: 5, minimo: 4 },
      { nombre: 'Hojas blancas', unidad: 'paquetes', hay: 12, minimo: 8 },
      { nombre: 'Credenciales en blanco', unidad: 'pzas', hay: 60, minimo: 40 },
    ],
  },

  problemas: [
    // ── Administración ──
    {
      id: 'cobranza-colegiaturas',
      area: 'administracion',
      titulo: 'Cada mes batallo para cobrar las colegiaturas',
      senal: 'Pasa el día diez y falta la tercera parte. Hay que revisar la lista y escribirle a cada papá, uno por uno.',
      frecuente: true,
      matices: [{ id: 'oficina', pregunta: '¿La mayoría paga en efectivo en la oficina?', si: 'Pagan en la oficina', no: 'Pagan por transferencia' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Quién pagó, quién debe y a quién se le vence esta semana, por grupo. El recordatorio sale con nombre y monto, sin armar listas.' },
        { sol: 'cobro-en-linea', para: 'El papá recibe un enlace y paga la colegiatura desde su celular. El pago se anota solo en la cuenta de su hijo.', pide: { oficina: false } },
        { sol: 'punto-de-venta', para: 'En la oficina, cada pago se cobra con recibo y queda en la cuenta del alumno al momento. Se acaba el talonario.', pide: { oficina: true } },
        { sol: 'respuestas-rapidas', para: 'El recordatorio de pago ya escrito, amable y claro, con monto, fecha límite y datos de la cuenta. Se manda con un toque.' },
      ],
    },
    {
      id: 'pago-sin-recibo',
      area: 'administracion',
      titulo: 'Un papá dice que ya pagó y no encuentro el recibo',
      senal: 'Transferencias sin nombre, recibos de talonario y una hoja de cálculo que solo entiende una persona.',
      matices: [{ id: 'sinnombre', pregunta: '¿Recibe transferencias que no dicen de qué alumno son?', si: 'Transferencias sin identificar', no: 'Los pagos llegan identificados' }],
      rutas: [
        { sol: 'fiado', para: 'Cada alumno con su estado de cuenta: colegiaturas, inscripción, uniformes y cada pago con su fecha. Se le muestra al papá y queda claro.' },
        { sol: 'cobro-en-linea', para: 'Cada pago entra por un enlace que ya lleva el nombre del alumno y el mes. No hay depósitos que adivinar.', pide: { sinnombre: true } },
        { sol: 'corte-de-caja', para: 'Al cerrar la oficina, el efectivo se compara con los recibos del día. Lo que falta se nota hoy, no en junio.' },
        { sol: 'proceso-claro', para: 'Acordamos un solo camino para cada pago: quién lo recibe, dónde se anota y qué comprobante se entrega. A veces eso basta.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'preguntan-no-inscriben',
      area: 'clientes',
      titulo: 'Muchos preguntan y pocos se inscriben',
      senal: 'En temporada de inscripciones llegan decenas de mensajes pidiendo costos. Se contestan y nadie vuelve a escribirles.',
      frecuente: true,
      matices: [{ id: 'muestra', pregunta: '¿Ofrece clase muestra o visita al plantel?', si: 'Ofrece clase muestra o visita', no: 'Solo da informes' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Cada papá que pidió informes queda anotado con el grado que busca y el día para volver a escribirle. En agosto nadie se queda sin respuesta.' },
        { sol: 'agenda-en-linea', para: 'La clase muestra se aparta sola, en los horarios que usted abre. Quien ya vio una clase decide más fácil.', pide: { muestra: true } },
        { sol: 'respuesta-automatica', para: 'Costos, horarios y requisitos se contestan solos a cualquier hora. A la oficina le llega quien ya quiere visitar o inscribirse.' },
        { sol: 'respuestas-rapidas', para: 'Costos, horarios y requisitos ya escritos por nivel. Quien contesta manda lo mismo, completo y sin errores.' },
      ],
    },
    {
      id: 'no-nos-encuentran',
      area: 'clientes',
      titulo: 'Quien busca escuela no nos encuentra en internet',
      senal: 'Los papás comparan en Google y en Facebook antes de visitar. La escuela sale sin fotos, sin horarios, o no sale.',
      matices: [{ id: 'continuo', pregunta: '¿Inscribe durante todo el año?', si: 'Inscribe todo el año', no: 'Solo al inicio del ciclo' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página con niveles, horarios, costos y fotos del plantel. El papá que compara tres escuelas entiende la suya en un minuto.' },
        { sol: 'resenas', para: 'Al terminar el curso o el ciclo, las familias reciben una invitación a opinar. Lo que ya dicen de palabra empieza a verse.' },
        { sol: 'promos-segmentadas', para: 'Cuando abre un grupo nuevo, se avisa a quienes preguntaron por ese nivel y a las familias que ya tiene.', pide: { continuo: true } },
        { sol: 'perfil-google', para: 'Lo primero: que al buscar la escuela aparezca con fotos, teléfono, horario de oficina y cómo llegar.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'avisos-no-llegan',
      area: 'comunicacion',
      titulo: 'Los avisos no les llegan a todos los papás',
      senal: 'El grupo de WhatsApp trae doscientos mensajes. El aviso de la junta quedó enterrado y media sala no llegó.',
      frecuente: true,
      matices: [{ id: 'grupos', pregunta: '¿Avisa por grupos de WhatsApp donde todos pueden escribir?', si: 'Grupos abiertos de WhatsApp', no: 'Circulares o avisos uno a uno' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'El aviso se manda solo a quien le toca: los papás de tercero, o los del grupo de sábado. Sale de la escuela, no de un chat abierto.', pide: { grupos: true } },
        { sol: 'recordatorios', para: 'La junta y la entrega de boletas se recuerdan un día antes. El papá confirma con un toque y usted sabe cuántos vienen.' },
        { sol: 'respuesta-automatica', para: 'Calendario, horarios y lista de útiles se contestan solos a cualquier hora. La oficina deja de repetirlo.' },
        { sol: 'proceso-claro', para: 'Acordamos un solo canal oficial y sus reglas: quién publica, a qué hora y qué no se contesta ahí. A veces eso basta.' },
      ],
    },

    // ── Organización ──
    {
      id: 'faltas-sin-ver',
      area: 'organizacion',
      titulo: 'Paso lista en papel y nadie ve quién está faltando',
      senal: 'Las listas se quedan en la carpeta del maestro. El alumno que lleva tres semanas sin venir se nota cuando deja de pagar.',
      frecuente: true,
      matices: [{ id: 'menores', pregunta: '¿Sus alumnos son menores de edad?', si: 'Alumnos menores de edad', no: 'Alumnos adultos' }],
      rutas: [
        { sol: 'acceso-vigencia', para: 'El alumno registra su llegada con un código. La asistencia queda anotada sola y, de paso, se ve si su mensualidad está al día.', pide: { menores: false } },
        { sol: 'expediente-cliente', para: 'La ficha de cada alumno con su asistencia y las notas del maestro. Se abre en la junta con su papá, y la ve solo quien debe.', pide: { menores: true } },
        { sol: 'reactivacion', para: 'El sistema detecta a quien lleva dos semanas sin venir y prepara el mensaje para preguntar qué pasó, mientras todavía hay remedio.' },
        { sol: 'reporte-diario', para: 'Cada tarde, un mensaje a dirección con quién faltó y quién lleva tres faltas seguidas. Lo mínimo para llamar a tiempo.' },
      ],
    },
    {
      id: 'horarios-rompecabezas',
      area: 'organizacion',
      titulo: 'Armar grupos y horarios es un rompecabezas cada ciclo',
      senal: 'Dos grupos en el mismo salón a la misma hora, un maestro con clases encimadas y un grupo con tres alumnos.',
      frecuente: true,
      matices: [{ id: 'porhora', pregunta: '¿Sus maestros trabajan por hora?', si: 'Maestros por hora', no: 'Maestros de planta' }],
      rutas: [
        { sol: 'agenda-interna', para: 'Salones, maestros y grupos en un mismo horario. Si el salón 2 ya está ocupado el martes a las cinco, se ve antes de prometerlo.' },
        { sol: 'roles-horarios', para: 'Cada maestro ve su semana y registra las clases que dio. Las horas a pagar salen de ahí, sin sumar hojas cada quincena.', pide: { porhora: true } },
        { sol: 'lista-espera', para: 'Cuando un grupo se llena, los siguientes quedan en lista. Al juntarse suficientes, usted sabe que ya puede abrir otro.' },
        { sol: 'proceso-claro', para: 'Antes de un sistema: definimos con usted el cupo de cada grupo y quién autoriza un cambio de horario.' },
      ],
    },
    {
      id: 'falta-maestro',
      area: 'organizacion',
      titulo: 'Falta un maestro y la clase se queda sin cubrir',
      senal: 'Avisa a las siete de la mañana. Hay que buscar quién cubra, avisar a las familias y reponer la clase después.',
      matices: [{ id: 'repone', pregunta: '¿Las clases perdidas se reponen otro día?', si: 'Se reponen las clases', no: 'Se cubre con otro maestro' }],
      rutas: [
        { sol: 'roles-horarios', para: 'Se ve qué maestro está libre a esa hora para cubrir. La suplencia queda anotada y se le paga a quien dio la clase.', pide: { repone: false } },
        { sol: 'agenda-interna', para: 'La reposición se agenda en un hueco real del salón y del maestro, no en un "luego vemos cuándo".', pide: { repone: true } },
        { sol: 'recordatorios', para: 'El grupo recibe el aviso del cambio y, un día antes de la reposición, el recordatorio. Nadie llega a un salón cerrado.' },
        { sol: 'bitacora-turno', para: 'Cada maestro deja anotado en qué tema se quedó el grupo. Quien cubre sabe dónde seguir.' },
      ],
    },

    // ── Atención ──
    {
      id: 'inscripciones-papel',
      area: 'atencion',
      titulo: 'Las inscripciones son puro papel y filas en la oficina',
      senal: 'En agosto la oficina se llena. Fichas a mano, copias que faltan y expedientes incompletos todo el año.',
      frecuente: true,
      matices: [{ id: 'reinscribe', pregunta: '¿La mayoría son alumnos que se reinscriben?', si: 'La mayoría se reinscribe', no: 'Muchos son de nuevo ingreso' }],
      rutas: [
        { sol: 'formatos-digitales', para: 'La ficha de inscripción, el reglamento y las autorizaciones se llenan y se firman desde el celular. Los datos del alumno los ve solo quien debe.' },
        { sol: 'expediente-cliente', para: 'Quien se reinscribe ya tiene su ficha: solo confirma lo que cambió. Se ve qué documento le falta a cada alumno.', pide: { reinscribe: true } },
        { sol: 'turnos-virtuales', para: 'En semana de inscripciones, el papá toma su turno desde el celular y llega cuando le toca. La oficina no se llena.' },
        { sol: 'respuestas-rapidas', para: 'Requisitos y costos de inscripción ya escritos. El papá llega con todo y no da dos vueltas.' },
      ],
    },
    {
      id: 'cancelan-clase',
      area: 'atencion',
      titulo: 'Cancelan la clase a última hora y el hueco se pierde',
      senal: 'Clase de manejo o de piano a las cinco. A las cuatro y media avisan que no vienen. El maestro ya estaba listo.',
      matices: [{ id: 'paquete', pregunta: '¿Las clases se pagan por paquete adelantado?', si: 'Pagan paquete adelantado', no: 'Pagan clase por clase' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El alumno aparta y mueve sus clases desde su celular, dentro de las reglas que usted ponga: por ejemplo, hasta un día antes.' },
        { sol: 'anticipo-reserva', para: 'La clase se aparta pagada. Quien cancela a última hora la pierde, y eso estaba claro desde el principio.', pide: { paquete: false } },
        { sol: 'lista-espera', para: 'El hueco que se libera se ofrece a quien quería esa hora. El maestro no se queda esperando.' },
        { sol: 'recordatorios', para: 'Un mensaje un día antes para confirmar la clase. Si no pueden venir, se sabe con tiempo.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'uniformes-libros',
      area: 'inventarios',
      titulo: 'Con los uniformes y los libros siempre sobra o falta',
      senal: 'Las tallas chicas se acaban la primera semana y sobran cajas de la grande. Los apartados van en una libreta.',
      matices: [{ id: 'apartan', pregunta: '¿Deja apartar o pagar en abonos uniformes y libros?', si: 'Permite apartar y abonar', no: 'Solo venta de contado' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Con lo vendido el ciclo pasado por talla y grado, la lista para el proveedor sale armada. Se pide con datos, no con cálculos.' },
        { sol: 'inventario-alertas', para: 'Cada talla y cada libro con su existencia. Cuando las playeras talla 8 bajan de diez, llega el aviso y hay tiempo de pedir más.' },
        { sol: 'fiado', para: 'Los apartados y lo que se quedó a deber, en la cuenta de cada alumno. Se entrega y se cobra sin buscar en la libreta.', pide: { apartan: true } },
        { sol: 'catalogo-whatsapp', para: 'Los papás hacen su pedido desde un enlace, con talla y grado. Le llega armado por WhatsApp y usted sabe cuánto pedir.' },
      ],
    },

    // ── Logística ──
    {
      id: 'salida-caos',
      area: 'logistica',
      titulo: 'La hora de la salida es un caos de coches y niños',
      senal: 'Coches en doble fila, niños esperando en la banqueta y la maestra buscando a quién entregar a cada uno.',
      matices: [{ id: 'escrito', pregunta: '¿Tiene por escrito quién puede recoger a cada niño?', si: 'Autorizados por escrito', no: 'Se entrega a quien se conoce' }],
      rutas: [
        { sol: 'turnos-virtuales', para: 'El papá avisa desde su celular que ya llegó. El niño sale cuando le toca y nadie espera en la banqueta.' },
        { sol: 'pantalla-turnos', para: 'Una pantalla en la puerta va llamando a cada alumno conforme llegan por él. La maestra entrega con orden.' },
        { sol: 'formatos-digitales', para: 'Los papás registran y firman quién puede recoger a su hijo. Si un día va la tía, queda autorizado por escrito.', pide: { escrito: false } },
        { sol: 'bitacora-turno', para: 'Quién se llevó a cada niño y a qué hora, anotado al entregar. Si después hay duda, está escrito.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'adeudos-acumulados',
      area: 'rentabilidad',
      titulo: 'Hay familias que ya deben tres o cuatro meses',
      senal: 'El adeudo crece mes con mes sin que nadie lo platique. En junio ya es una cantidad difícil de pagar.',
      matices: [{ id: 'convenio', pregunta: '¿Hace convenios de pago con las familias que se atrasan?', si: 'Hace convenios de pago', no: 'Espera a que se pongan al día' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Al segundo mes vencido, usted se entera. Se platica con la familia cuando todavía es una cantidad que se puede pagar.' },
        { sol: 'fiado', para: 'El adeudo se vuelve un plan de abonos con fechas. Cada abono se anota y la familia ve cuánto le falta.', pide: { convenio: true } },
        { sol: 'expediente-cliente', para: 'En la ficha de cada familia queda lo que se platicó y lo que se acordó. Quien cobra el mes siguiente no empieza de cero.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con los pagos del día y las familias que pasaron a dos meses vencidos.' },
      ],
    },
    {
      id: 'grupos-no-dejan',
      area: 'rentabilidad',
      titulo: 'Hay grupos que no cubren ni lo que cuesta el maestro',
      senal: 'Un grupo de cuatro alumnos ocupa salón y maestro igual que uno de doce. Nadie ha hecho la cuenta.',
      matices: [{ id: 'becas', pregunta: '¿Da becas o descuentos por hermanos o pronto pago?', si: 'Da becas y descuentos', no: 'Cobra tarifa pareja' }],
      rutas: [
        { sol: 'costeo', para: 'Cada grupo con lo que cuesta (maestro, salón, material) y lo que paga. Se ve cuál se sostiene y cuál conviene juntar con otro.' },
        { sol: 'tablero-ventas', para: 'Lo que debía entrar este mes y lo que entró, ya con becas y descuentos. Se ve cuánto se está dejando de cobrar.', pide: { becas: true } },
        { sol: 'seguimiento-prospectos', para: 'Quien preguntó por ese nivel y no se inscribió recibe la invitación al grupo que tiene lugares. Llenarlo cuesta un mensaje.' },
        { sol: 'lista-espera', para: 'Lo mínimo: un grupo nuevo abre cuando la lista junta el cupo. Deja de abrirse por tres alumnos y una promesa.' },
      ],
    },
  ],
}
