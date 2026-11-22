// Veterinaria: consulta, vacunas, estética canina, pensión y mostrador de alimento.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").

export default {
  id: 'veterinaria',
  familia: 'salud',
  nombre: 'Veterinaria',
  plural: 'veterinarias',
  icono: 'veterinaria',
  acento: '#2f6b4a',
  orden: 40,
  // El cliente es el dueño de la mascota; el paciente es la mascota.
  vocab: {
    cliente: 'el cliente',
    clientes: 'los clientes',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que tienen consulta, estética y alimento. ¿Cuál de las tres les da más trabajo?',
  observa: [
    'Cuántas marcas de alimento hay en exhibición y si los bultos ocupan el paso.',
    'Si la agenda de estética está en un pizarrón o libreta, y cuántos perros esperan en jaula.',
    'Si al llegar un cliente le piden la cartilla de papel para saber qué le toca a su mascota.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Croquetas adulto 20 kg', precio: 1150, categoria: 'Alimento' },
      { nombre: 'Croquetas cachorro 8 kg', precio: 620, categoria: 'Alimento' },
      { nombre: 'Alimento para gato 7 kg', precio: 690, categoria: 'Alimento' },
      { nombre: 'Lata de alimento húmedo', precio: 38, categoria: 'Alimento' },
      { nombre: 'Desparasitante en tableta', precio: 90, categoria: 'Farmacia' },
      { nombre: 'Pipeta antipulgas', precio: 280, categoria: 'Farmacia' },
      { nombre: 'Tableta antipulgas de 3 meses', precio: 620, categoria: 'Farmacia' },
      { nombre: 'Collar con placa', precio: 150, categoria: 'Accesorios' },
      { nombre: 'Correa', precio: 180, categoria: 'Accesorios' },
      { nombre: 'Cama mediana', precio: 480, categoria: 'Accesorios' },
      { nombre: 'Transportadora chica', precio: 550, categoria: 'Accesorios' },
      { nombre: 'Arena para gato 10 kg', precio: 160, categoria: 'Higiene' },
      { nombre: 'Champú para perro', precio: 140, categoria: 'Higiene' },
    ],
    servicios: [
      { nombre: 'Consulta general', precio: 300, minutos: 30 },
      { nombre: 'Vacuna antirrábica', precio: 200, minutos: 15 },
      { nombre: 'Vacuna múltiple', precio: 380, minutos: 15 },
      { nombre: 'Baño y corte, raza chica', precio: 280, minutos: 90 },
      { nombre: 'Baño y corte, raza grande', precio: 420, minutos: 120 },
      { nombre: 'Corte de uñas', precio: 80, minutos: 10 },
    ],
    personal: ['Ricardo', 'Karen', 'Beto', 'Yolanda'],
    clientes: ['Sra. Zepeda', 'Jorge Michel', 'Familia Orozco', 'Don Nacho', 'Valeria Guzmán', 'Profe Macías'],
    insumos: [
      { nombre: 'Vacuna antirrábica', unidad: 'dosis', hay: 8, minimo: 10 },
      { nombre: 'Vacuna múltiple', unidad: 'dosis', hay: 14, minimo: 10 },
      { nombre: 'Croquetas adulto 20 kg', unidad: 'bultos', hay: 2, minimo: 4 },
      { nombre: 'Jeringas de 3 ml', unidad: 'pzas', hay: 60, minimo: 40 },
      { nombre: 'Champú de avena', unidad: 'L', hay: 6, minimo: 4 },
      { nombre: 'Desparasitante en tableta', unidad: 'pzas', hay: 35, minimo: 20 },
      { nombre: 'Gasas', unidad: 'paquetes', hay: 9, minimo: 6 },
      { nombre: 'Arena para gato 10 kg', unidad: 'bultos', hay: 5, minimo: 4 },
    ],
  },

  problemas: [
    // ── Clientes ──
    {
      id: 'vacunas-se-pasan',
      area: 'clientes',
      titulo: 'A los clientes se les pasa la fecha de la vacuna',
      senal: 'La cartilla dice cuándo toca, pero está en un cajón de su casa y nadie les avisa.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Guarda usted la fecha de cada vacuna, además de la cartilla?', si: 'La clínica guarda las fechas', no: 'Solo queda en la cartilla' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada mascota con su cartilla en la clínica: qué vacuna se puso, cuándo y cuál sigue. Aunque el dueño pierda la de papel.' },
        { sol: 'recordatorios', para: 'Una semana antes del refuerzo, el dueño recibe el aviso con el nombre de su mascota y aparta la cita con un toque.', pide: { registro: true } },
        { sol: 'reactivacion', para: 'El sistema detecta mascotas con la vacuna anual vencida y prepara la invitación. Usted elige a quiénes se envía.' },
        { sol: 'base-clientes', para: 'Para empezar: al vacunar se anota dueño, mascota, teléfono y fecha del siguiente refuerzo en una lista que sí se consulta.', pide: { registro: false } },
      ],
    },
    {
      id: 'alimento-otro-lado',
      area: 'clientes',
      titulo: 'El alimento lo compran en el súper o en línea',
      senal: 'Vienen a consulta y a vacunas, pero el bulto de croquetas de cada mes se lo llevan de otro lado.',
      matices: [{ id: 'reparto', pregunta: '¿Podría llevar el alimento a domicilio?', si: 'Puede repartir', no: 'Solo venta en mostrador' }],
      rutas: [
        { sol: 'reactivacion', para: 'Un bulto de 20 kilos dura cerca de un mes. A las cuatro semanas, el sistema prepara el mensaje para ofrecer el siguiente.' },
        { sol: 'seguimiento-pedidos', para: 'Los pedidos a domicilio en un tablero: quién pidió, qué bulto y si ya salió. Cargar 20 kilos deja de ser asunto del cliente.', pide: { reparto: true } },
        { sol: 'tarjeta-lealtad', para: 'Un sello por cada bulto y el décimo con descuento. Una razón concreta para comprarlo aquí y no en el súper.' },
        { sol: 'catalogo-whatsapp', para: 'Lo más corto: sus marcas y tamaños en un enlace. El cliente elige el de siempre y el pedido llega armado a su WhatsApp.' },
      ],
    },
    {
      id: 'urgencia-google',
      area: 'clientes',
      titulo: 'En una urgencia buscan en Google y no aparezco',
      senal: 'Alguien busca "veterinaria abierta" a las diez de la noche y encuentra a otra, o un horario equivocado.',
      matices: [{ id: 'urgencias', pregunta: '¿Atiende urgencias fuera de horario?', si: 'Atiende urgencias', no: 'Solo en horario' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página con servicios, costo de consulta y estética, y el botón para llamar. Quien llega con prisa sabe qué hacer.' },
        { sol: 'respuesta-automatica', para: 'Fuera de horario, el mensaje se contesta solo con el teléfono de urgencias y el costo de la consulta nocturna.', pide: { urgencias: true } },
        { sol: 'resenas', para: 'Después de la consulta o del baño, una invitación a opinar. Quien busca veterinaria lee primero las reseñas.' },
        { sol: 'perfil-google', para: 'Lo primero: horario real, teléfono que sí contesta y fotos de la clínica. Es lo que se ve al buscar con el perro en brazos.' },
      ],
    },

    // ── Atención ──
    {
      id: 'estetica-sabados',
      area: 'atencion',
      titulo: 'Los sábados la estética no se da abasto',
      senal: 'Todos quieren baño en fin de semana. Llegan sin avisar y los perros esperan horas en jaula.',
      frecuente: true,
      matices: [{ id: 'cita', pregunta: '¿La estética trabaja con cita?', si: 'Estética con cita', no: 'Como van llegando' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El dueño aparta el baño eligiendo tamaño y tipo de pelo, y la agenda calcula cuánto dura. El sábado ya no se promete de más.' },
        { sol: 'promos-segmentadas', para: 'Baño de martes a jueves con precio especial, ofrecido solo a quienes siempre vienen en sábado. La carga se reparte.' },
        { sol: 'recordatorios', para: 'El viernes llega el recordatorio: confirma o libera el lugar. Un plantón en sábado es hora y media de estilista sin trabajo.', pide: { cita: true } },
        { sol: 'agenda-interna', para: 'Para empezar: los baños del día en una vista, con la hora de entrega de cada perro. Se sabe cuándo ya no cabe otro.', pide: { cita: false } },
      ],
    },
    {
      id: 'consulta-se-junta',
      area: 'atencion',
      titulo: 'A ciertas horas se me junta toda la consulta',
      senal: 'Se atiende como van llegando. En la tarde la sala se llena de perros y gatos nerviosos.',
      matices: [{ id: 'cita', pregunta: '¿Sus clientes aceptarían venir con cita?', si: 'Aceptarían cita', no: 'Prefieren llegar sin cita' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Vacunas y revisiones, que pueden programarse, pasan a cita. La sala queda para lo que no puede esperar.', pide: { cita: true } },
        { sol: 'turnos-virtuales', para: 'El cliente toma turno desde el celular y espera en su coche con su mascota, lejos de los demás animales.', pide: { cita: false } },
        { sol: 'pantalla-turnos', para: 'Una pantalla con el orden de llegada. Nadie discute quién iba primero, y la urgencia que pasa antes queda a la vista.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar quién recibe, quién pesa y quién cobra cuando hay cinco esperando. Hoy el médico hace las tres cosas.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'ya-esta-mi-perro',
      area: 'comunicacion',
      titulo: 'Llaman a cada rato para saber si ya está su perro',
      senal: 'El dueño no sabe a qué hora recoger. Llama, llega antes y espera, o llega tarde y la jaula sigue ocupada.',
      frecuente: true,
      matices: [{ id: 'hospital', pregunta: '¿También tiene mascotas hospitalizadas o en pensión?', si: 'Hay hospital o pensión', no: 'Solo estética y consulta' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada mascota entra con su orden: tipo de corte, indicaciones y hora prometida. Al terminar, el dueño recibe el aviso.' },
        { sol: 'rastreo-cliente', para: 'El dueño abre un enlace y ve cómo va su mascota: la nota del día si está internada, o si ya comió y salió al patio en pensión.', pide: { hospital: true } },
        { sol: 'aviso-listo', para: 'En cuanto el estilista marca "listo", sale el mensaje al dueño. Nadie suelta la tijera para contestar el teléfono.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: mensajes ya escritos como "ya puede pasar por Rocky" o "le faltan cuarenta minutos". Un toque y se envían.' },
      ],
    },

    // ── Organización ──
    {
      id: 'historial-mascota',
      area: 'organizacion',
      titulo: 'No tengo a la mano el historial de cada mascota',
      senal: 'El dueño llega sin cartilla y hay que preguntarle qué se le puso, cuándo y cuánto pesaba.',
      frecuente: true,
      matices: [{ id: 'varios', pregunta: '¿Atiende más de un veterinario?', si: 'Varios veterinarios', no: 'Un solo veterinario' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Una ficha por mascota: peso en cada visita, vacunas, tratamientos y alergias. Se abre antes de subirla a la mesa.' },
        { sol: 'bitacora-turno', para: 'Lo que el médico de la mañana dejó pendiente con una mascota, el de la tarde lo lee al llegar. No se le pregunta otra vez al dueño.', pide: { varios: true } },
        { sol: 'formatos-digitales', para: 'En la primera visita, el dueño llena los datos en una tableta: edad, raza, alergias, qué come. Quedan legibles en la ficha.' },
        { sol: 'base-clientes', para: 'Lo mínimo: cada dueño con su teléfono y sus mascotas juntas. Si tiene dos perros y un gato, se ve la última visita de cada uno.' },
      ],
    },
    {
      id: 'pension-vacaciones',
      area: 'organizacion',
      titulo: 'En vacaciones la pensión se vuelve un enredo',
      senal: 'Lugares apartados de palabra, jaulas que no alcanzan y dueños que no pasan el día que dijeron.',
      matices: [{ id: 'anticipo', pregunta: '¿Cobra anticipo para apartar lugar en la pensión?', si: 'Aparta con anticipo', no: 'Aparta de palabra' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'En Semana Santa y diciembre, el lugar se aparta con anticipo. Quien reserva tres jaulas llega con los tres perros.', pide: { anticipo: false } },
        { sol: 'agenda-interna', para: 'Las jaulas como un calendario: cuál está ocupada, hasta qué día y cuál se libera. Se sabe si cabe uno más antes de decir que sí.' },
        { sol: 'formatos-digitales', para: 'La hoja de ingreso se firma en pantalla: qué come, qué medicina toma, a quién llamar y qué día lo recogen.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: los requisitos ya escritos (cartilla al día, desparasitado, su alimento) se envían al apartar. Nadie llega sin ellos.' },
      ],
    },
    {
      id: 'guardias-de-palabra',
      area: 'organizacion',
      titulo: 'Las guardias de fin de semana se arreglan de palabra',
      senal: 'Hay mascotas internadas o en pensión y no queda claro quién viene, a qué hora ni qué les tocaba.',
      matices: [{ id: 'equipo', pregunta: '¿Se turnan entre varias personas?', si: 'Se turnan entre varios', no: 'Casi siempre va el dueño' }],
      rutas: [
        { sol: 'roles-horarios', para: 'El rol de guardias del mes publicado para todos. Cada quien registra su llegada el domingo desde el celular.', pide: { equipo: true } },
        { sol: 'bitacora-turno', para: 'Qué medicina toca, a qué hora y en cuál jaula, por escrito. Quien llega de guardia no depende de una llamada.' },
        { sol: 'reporte-diario', para: 'El domingo en la noche, un mensaje con lo que se hizo en la guardia y lo que requiere atención el lunes temprano.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: una lista por guardia que se palomea. Comida, agua, limpieza y medicina, con la hora en que se hizo.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'no-hay-croquetas',
      area: 'inventarios',
      titulo: 'Vienen por su alimento y justo ese no hay',
      senal: 'Muchas marcas y tamaños. Se acaba el bulto que más sale y sobran los que nadie pide.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Registra cada venta de alimento?', si: 'Registra sus ventas', no: 'Se surte "a ojo"' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada marca y tamaño con su mínimo. Cuando quedan dos bultos del de cachorro, llega el aviso antes de la visita del proveedor.' },
        { sol: 'compras-sugeridas', para: 'Con lo vendido en el mes, el pedido al distribuidor se arma solo: más del que rota, menos del que lleva meses en bodega.', pide: { registro: true } },
        { sol: 'punto-de-venta', para: 'Sin registro de ventas no hay de dónde saber qué rota. Cada bulto cobrado baja solo de la existencia.', pide: { registro: false } },
        { sol: 'whatsapp-pedidos', para: 'El cliente aparta su bulto por WhatsApp antes de venir. Usted sabe qué se va a llevar y lo pide a tiempo.' },
      ],
    },
    {
      id: 'vacunas-caducan',
      area: 'inventarios',
      titulo: 'Se me caducan vacunas y medicamento',
      senal: 'Frascos vencidos en el refrigerador y desparasitantes que caducan en el anaquel.',
      matices: [{ id: 'lotes', pregunta: '¿Anota lote y caducidad al recibir del proveedor?', si: 'Anota lote y fecha', no: 'No registra caducidad' }],
      rutas: [
        { sol: 'caducidades', para: 'Cada caja de vacunas entra con lote y fecha. Lo que vence en 60 días aparece primero, a tiempo para usarlo o devolverlo.' },
        { sol: 'inventario-escaner', para: 'Al recibir del proveedor, lote y fecha se registran con el celular en el momento. No se deja para cuando haya tiempo.' },
        { sol: 'merma', para: 'Lo que se tira por vencido se anota con su costo. Se ve qué se está comprando de más.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: revisión de fechas el primer lunes del mes, anaquel por anaquel. Lo próximo a vencer pasa al frente.', pide: { lotes: false } },
      ],
    },

    // ── Administración ──
    {
      id: 'me-quedan-a-deber',
      area: 'administracion',
      titulo: 'Me quedan a deber consultas y cirugías',
      senal: '"Luego le paso el resto", y el resto se queda en una libreta o en la memoria.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pide anticipo antes de una cirugía u hospitalización?', si: 'Pide anticipo', no: 'Cobra al final' }],
      rutas: [
        { sol: 'fiado', para: 'Cada cliente con su saldo y sus abonos: qué se le hizo a su mascota, cuánto dio y cuánto resta. Con recordatorio amable.' },
        { sol: 'cotizador', para: 'Antes de operar, el presupuesto por escrito: cirugía, anestesia, medicamento y días de hospital. El dueño acepta sabiendo el total.', pide: { anticipo: false } },
        { sol: 'cobro-en-linea', para: 'El anticipo o el resto se paga con un enlace, aunque el dueño esté en su trabajo. No hay que esperar a que "pase luego".' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: un recordatorio de saldo ya escrito, amable y sin regaños. Se manda cada quincena a quien debe.' },
      ],
    },
    {
      id: 'caja-revuelta',
      area: 'administracion',
      titulo: 'Consulta, estética y mostrador van a la misma caja',
      senal: 'Al final del día hay dinero, pero no se sabe cuánto fue de alimento, de baños o de consulta.',
      matices: [{ id: 'comision', pregunta: '¿Paga comisión al estilista por cada baño o corte?', si: 'Estilista a comisión', no: 'Estilista con sueldo fijo' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada cobro con su concepto: consulta, baño, bulto, vacuna. El ticket sale solo y la existencia baja con la venta.' },
        { sol: 'tablero-ventas', para: 'Las tres áreas lado a lado en su celular: cuánto fue de clínica, de estética y de mostrador, hoy y en el mes.' },
        { sol: 'corte-de-caja', para: 'Al cerrar, el corte separa los baños de cada estilista. La comisión de la semana ya no se saca con papelitos.', pide: { comision: true } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con lo vendido por área y lo que quedó pendiente de cobro.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'alimento-deja-poco',
      area: 'rentabilidad',
      titulo: 'El alimento ocupa media tienda y deja muy poco',
      senal: 'Se vende mucho bulto con margen corto. La consulta y la estética se cobran igual que hace años.',
      matices: [{ id: 'precios', pregunta: '¿Ha calculado cuánto le cuesta dar un baño o una consulta?', si: 'Tiene sus costos', no: 'Precios según la competencia' }],
      rutas: [
        { sol: 'costeo', para: 'Un baño de raza grande con todo: champú, hora y media de estilista, agua y luz. Se ve si el precio deja o apenas sale.', pide: { precios: false } },
        { sol: 'tablero-ventas', para: 'Qué área vende más y cuál deja más, lado a lado. No siempre es la misma.' },
        { sol: 'compras-sugeridas', para: 'Menos dinero parado en bultos que no rotan. Se pide lo que sale, y lo demás se trae sobre pedido.' },
        { sol: 'menu-digital', para: 'Lo más corto: la lista de precios de estética y consulta en un enlace. Ajustarla toma un minuto y todos ven la misma.' },
      ],
    },
  ],
}
