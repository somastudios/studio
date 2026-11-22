// Salón de fiestas, terraza, banquetes y renta de mobiliario.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").

export default {
  id: 'eventos',
  familia: 'estancia',
  nombre: 'Salón de eventos o banquetes',
  plural: 'salones de eventos',
  icono: 'eventos',
  acento: '#6a2c4b',
  orden: 20,
  vocab: {
    empleado: 'el mesero',
    producto: 'paquete',
    productos: 'paquetes',
    pedido: 'evento',
    pedidos: 'eventos',
    cita: 'fecha',
    citas: 'fechas',
    lugar: 'salón',
  },

  // Para quien presenta, antes de entrar.
  apertura: '¿Con cuánto tiempo de anticipación le están apartando los sábados?',
  observa: [
    'Dónde está anotado qué fechas están apartadas: calendario de pared, libreta o el celular de alguien.',
    'Si hay lista de precios o de paquetes impresa, y de cuándo es.',
    'Cómo quedó el mobiliario después del último evento: contado y apilado, o revuelto.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Paquete básico (100 personas)', precio: 28000, categoria: 'Paquetes' },
      { nombre: 'Paquete con banquete (100 personas)', precio: 52000, categoria: 'Paquetes' },
      { nombre: 'Paquete XV años (150 personas)', precio: 78000, categoria: 'Paquetes' },
      { nombre: 'Fiesta infantil (50 niños)', precio: 14500, categoria: 'Paquetes' },
      { nombre: 'Renta de salón, 5 horas', precio: 12000, categoria: 'Renta del lugar' },
      { nombre: 'Renta de terraza, 5 horas', precio: 8500, categoria: 'Renta del lugar' },
      { nombre: 'Hora extra', precio: 1800, categoria: 'Renta del lugar' },
      { nombre: 'Silla Tiffany', precio: 22, categoria: 'Mobiliario' },
      { nombre: 'Mesa redonda con mantel', precio: 95, categoria: 'Mobiliario' },
      { nombre: 'Juego de loza por persona', precio: 18, categoria: 'Mobiliario' },
      { nombre: 'Carpa de 6 × 12 m', precio: 3200, categoria: 'Mobiliario' },
      { nombre: 'Mesero por evento', precio: 450, categoria: 'Extras' },
      { nombre: 'Barra de bebidas sin alcohol', precio: 3500, categoria: 'Extras' },
      { nombre: 'Pista iluminada', precio: 4500, categoria: 'Extras' },
    ],
    servicios: [
      { nombre: 'Visita para conocer el salón', precio: 0, minutos: 30 },
      { nombre: 'Degustación del banquete', precio: 0, minutos: 60 },
      { nombre: 'Cita para firmar contrato', precio: 0, minutos: 45 },
      { nombre: 'Salón por la tarde (5 horas)', precio: 12000, minutos: 300 },
      { nombre: 'Salón por la noche (5 horas)', precio: 14000, minutos: 300 },
      { nombre: 'Terraza (5 horas)', precio: 8500, minutos: 300 },
    ],
    personal: ['Ofelia', 'Memo', 'Karina', 'Ramiro'],
    clientes: ['Familia Ceballos', 'Sra. Magaña', 'Daniela Preciado', 'Óscar Figueroa', 'Profa. Cárdenas', 'Mariela Contreras'],
    insumos: [
      { nombre: 'Silla Tiffany', unidad: 'pzas', hay: 284, minimo: 300 },
      { nombre: 'Mesa redonda', unidad: 'pzas', hay: 32, minimo: 30 },
      { nombre: 'Mantel blanco redondo', unidad: 'pzas', hay: 26, minimo: 35 },
      { nombre: 'Cubremantel dorado', unidad: 'pzas', hay: 34, minimo: 30 },
      { nombre: 'Plato trinche', unidad: 'pzas', hay: 340, minimo: 300 },
      { nombre: 'Copa de agua', unidad: 'pzas', hay: 312, minimo: 300 },
      { nombre: 'Juego de cubiertos', unidad: 'juegos', hay: 320, minimo: 300 },
      { nombre: 'Hielo', unidad: 'bolsas', hay: 24, minimo: 20 },
    ],
  },

  problemas: [
    // ── Organización ──
    {
      id: 'fecha-doble',
      area: 'organizacion',
      titulo: 'Le aparté la misma fecha a dos familias',
      senal: 'Un sábado apalabrado con una familia, y otra persona del equipo se lo prometió a alguien más.',
      frecuente: true,
      matices: [{ id: 'palabra', pregunta: '¿Guarda fechas de palabra, sin anticipo?', si: 'Guarda fechas de palabra', no: 'Solo aparta con anticipo' }],
      rutas: [
        { sol: 'agenda-interna', para: 'Un solo calendario del salón que todos consultan antes de prometer. El sábado 14 aparece ocupado en cuanto alguien lo aparta.' },
        { sol: 'anticipo-reserva', para: 'La fecha queda apartada cuando entra el anticipo. Lo apalabrado tiene plazo: si vence, se libera y se puede ofrecer.', pide: { palabra: true } },
        { sol: 'lista-espera', para: 'Si dos familias quieren el mismo sábado, la segunda queda en lista. Si la primera no confirma, se le avisa a ella.' },
        { sol: 'proceso-claro', para: 'Una regla acordada con todos: sin anticipo no hay fecha, y un solo calendario manda. Sin sistema nuevo.' },
      ],
    },
    {
      id: 'depende-de-mi',
      area: 'organizacion',
      titulo: 'El día del evento todo depende de que yo esté ahí',
      senal: 'Montaje, cocina, meseros y música le preguntan a usted. Si un día no puede estar, nadie sabe a qué hora va cada cosa.',
      matices: [{ id: 'encargado', pregunta: '¿Tiene un capitán o encargado en quien delegar?', si: 'Hay capitán o encargado', no: 'Todo pasa por el dueño' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Una orden por evento: horario, montaje, menú, tiempos de servicio. El capitán la abre en su celular y no tiene que preguntar.', pide: { encargado: true } },
        { sol: 'checklist-turnos', para: 'Montar y desmontar con lista: mesas, mantelería, baños, hielo, luces. A las cinco se ve qué falta, no a las siete.' },
        { sol: 'reporte-diario', para: 'La noche anterior, un mensaje con lo del evento: horarios, pendientes y quién falta por confirmar.' },
        { sol: 'proceso-claro', para: 'Dibujamos con usted el evento de principio a fin: quién hace qué y a qué hora. Con eso, otra persona puede llevarlo.' },
      ],
    },

    // ── Atención ──
    {
      id: 'cotizacion-tarda',
      area: 'atencion',
      titulo: 'Me piden precio y tardo días en mandar la cotización',
      senal: 'Cada cotización se arma a mano según invitados, menú y horario. Mientras, la familia ya preguntó en tres salones.',
      frecuente: true,
      matices: [{ id: 'paquetes', pregunta: '¿Trabaja con paquetes ya definidos?', si: 'Tiene paquetes definidos', no: 'Cada evento se cotiza distinto' }],
      rutas: [
        { sol: 'cotizador', para: 'Se elige paquete, número de invitados y extras, y la cotización sale en un minuto con total y anticipo. Se manda desde la misma visita.' },
        { sol: 'catalogo-whatsapp', para: 'Los paquetes en un enlace que se comparte. La familia elige el suyo y a usted le llega por WhatsApp con lo que quiere.', pide: { paquetes: true } },
        { sol: 'respuesta-automatica', para: 'Capacidad, horarios y precio base por persona se contestan solos. A usted le llega quien ya quiere cotizar en serio.' },
        { sol: 'respuestas-rapidas', para: 'La primera respuesta ya escrita: qué incluye el salón, para cuántos es y qué datos hacen falta para cotizar.' },
      ],
    },
    {
      id: 'visitas-salon',
      area: 'atencion',
      titulo: 'Quedo de enseñar el salón y la gente no llega',
      senal: 'Hay que ir a abrir para cada visita. Unas llegan una hora tarde, otras no llegan y otras caen sin avisar.',
      matices: [{ id: 'horario', pregunta: '¿Podría fijar días y horas para mostrar el salón?', si: 'Puede fijar horarios de visita', no: 'Enseña cuando el cliente puede' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Las visitas se apartan en los horarios que usted abre: jueves por la tarde, sábado temprano. Va una vez y atiende a varias familias.', pide: { horario: true } },
        { sol: 'sitio-web', para: 'Fotos del salón montado, capacidad y precios base. Quien viene a verlo ya sabe que le gusta y que le alcanza.' },
        { sol: 'recordatorios', para: 'Un mensaje un día antes para confirmar la visita. Si no van a venir, usted no da la vuelta.' },
        { sol: 'agenda-interna', para: 'Las visitas anotadas junto a los eventos, para que no caigan en pleno montaje. Lo mínimo.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'cotizo-no-regresan',
      area: 'clientes',
      titulo: 'Cotizo mucho y pocos regresan a apartar',
      senal: 'Se mandan cotizaciones toda la semana. Nadie les da seguimiento y no se sabe cuántas se cerraron.',
      frecuente: true,
      matices: [{ id: 'visita', pregunta: '¿Quien cotiza suele venir antes a conocer el salón?', si: 'Vienen a conocer el salón', no: 'Cotizan solo por mensaje' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Cada familia que cotizó queda anotada con su fecha y el día para volver a escribirle. Los quince años de agosto no se enfrían.' },
        { sol: 'agenda-en-linea', para: 'La visita para conocer el salón se aparta sola, en los horarios que usted abre. Quien ya lo vio decide más rápido.', pide: { visita: true } },
        { sol: 'cobro-en-linea', para: 'Con la cotización va un enlace para dejar el anticipo. Quien ya se decidió aparta en ese momento, sin dar la vuelta al salón.', pide: { visita: false } },
        { sol: 'perfil-google', para: 'Fotos del salón montado y opiniones de quienes ya festejaron ahí. Es lo que la familia revisa antes de decidirse.' },
      ],
    },
    {
      id: 'temporada-floja',
      area: 'clientes',
      titulo: 'Entre semana y fuera de temporada el salón está parado',
      senal: 'De mayo a julio y en diciembre no hay sábado libre. Enero y septiembre pasan casi en blanco.',
      frecuente: true,
      matices: [{ id: 'empresas', pregunta: '¿Le interesan eventos de empresas y escuelas: cursos, juntas, graduaciones?', si: 'Busca eventos de empresas', no: 'Solo eventos sociales' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Empresas, escuelas y parroquias de la zona, con su contacto y la época en que organizan. Se les escribe antes de que busquen.', pide: { empresas: true } },
        { sol: 'promos-segmentadas', para: 'Una tarifa de viernes o domingo para quienes cotizaron y no apartaron por precio. Le llega a quien ya conoce el salón.' },
        { sol: 'reactivacion', para: 'Quien hizo aquí su posada en diciembre recibe en octubre la invitación para apartar la de este año.' },
        { sol: 'perfil-google', para: 'Fotos del salón montado para distintos eventos, capacidad y teléfono. Quien busca dónde hacer un bautizo lo encuentra.' },
      ],
    },

    // ── Administración ──
    {
      id: 'abonos-enredados',
      area: 'administracion',
      titulo: 'Me enredo con los abonos de cada evento',
      senal: 'Recibos en papel, transferencias y efectivo. A una semana de la fiesta hay que sumar para saber cuánto falta.',
      frecuente: true,
      matices: [{ id: 'liquida', pregunta: '¿Pide que el evento esté liquidado antes de la fecha?', si: 'Se liquida antes del evento', no: 'Se termina de pagar después' }],
      rutas: [
        { sol: 'fiado', para: 'Cada evento con su total, sus abonos y su saldo. El cliente y usted ven el mismo número, y cada abono deja su recibo.' },
        { sol: 'control-mensualidades', para: 'Las parcialidades con su fecha: quién va al corriente y a quién se le vence esta semana, con el recordatorio listo para enviar.', pide: { liquida: true } },
        { sol: 'cobro-en-linea', para: 'Cada abono se paga con un enlace y se anota solo en su evento. Se acaban las fotos de comprobantes sin nombre.' },
        { sol: 'respuestas-rapidas', para: 'El recordatorio de abono ya escrito, con el saldo y la fecha límite. Se manda sin pena y sin redactarlo cada vez.' },
      ],
    },
    {
      id: 'anticipo-gastado',
      area: 'administracion',
      titulo: 'El anticipo se gasta antes de que llegue el evento',
      senal: 'Entra el anticipo de una boda de octubre y se usa para lo de este sábado. En octubre hay que poner de la bolsa.',
      matices: [{ id: 'separa', pregunta: '¿Separa el dinero de cada evento?', si: 'Separa el dinero por evento', no: 'Todo entra a la misma bolsa' }],
      rutas: [
        { sol: 'tablero-ventas', para: 'Lo cobrado y lo que falta por cobrar de los eventos que vienen, en una vista. Se ve cuánto del dinero en caja ya está comprometido.' },
        { sol: 'costeo', para: 'Cada evento con su costo estimado desde que se aparta. Se sabe cuánto del anticipo hay que guardar para sacarlo.' },
        { sol: 'fiado', para: 'Cada evento con su propia cuenta: cuánto ha entrado y cuánto falta. Lo de octubre no se confunde con lo de este sábado.', pide: { separa: false } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con lo que entró hoy y a qué evento pertenece. Lo mínimo para no perder la cuenta.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'cambios-perdidos',
      area: 'comunicacion',
      titulo: 'Lo que se acordó por WhatsApp no llega al día del evento',
      senal: 'Cambió el menú, vienen treinta invitados más, pidieron manteles dorados. Está en algún chat de hace dos meses.',
      frecuente: true,
      matices: [{ id: 'contrato', pregunta: '¿Firma contrato con cada cliente?', si: 'Firma contrato', no: 'Acuerdo de palabra o recibo' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada evento con su ficha: lo contratado, cada cambio con su fecha y lo que falta por definir. El sábado en la mañana se abre y ahí está todo.' },
        { sol: 'formatos-digitales', para: 'El contrato y cada cambio se firman en el celular. Si el día del evento hay duda sobre lo acordado, se abre y se lee.', pide: { contrato: true } },
        { sol: 'ordenes-trabajo', para: 'Una orden por evento con lo que hay que montar y servir. Cocina, meseros y montaje leen lo mismo.' },
        { sol: 'bitacora-turno', para: 'Lo que se acuerda con el cliente se anota ese mismo día en un solo lugar, no en el chat de quien contestó.' },
      ],
    },

    // ── Logística ──
    {
      id: 'proveedor-falla',
      area: 'logistica',
      titulo: 'Un proveedor me queda mal el mero día',
      senal: 'El del sonido confirmó hace un mes. El sábado a las cinco no contesta y la fiesta empieza a las seis.',
      matices: [{ id: 'externos', pregunta: '¿El sonido, el pastel o el banquete los pone un proveedor externo?', si: 'Trabaja con proveedores externos', no: 'Casi todo es propio' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada evento con sus proveedores y su estado: pedido, confirmado, en camino, montado. Lo que falta se ve desde el jueves.', pide: { externos: true } },
        { sol: 'roles-horarios', para: 'Los meseros eventuales ven en qué evento les toca y confirman desde su celular. Usted sabe cuántos van antes del sábado.' },
        { sol: 'recordatorios', para: 'Antes del evento, cada proveedor recibe un mensaje para confirmar hora y lugar. Si uno no contesta, hay tiempo de buscar otro.' },
        { sol: 'checklist-turnos', para: 'Una lista por evento: sonido, pastel, hielo, flores, meseros. Se palomea al confirmar y queda quién habló con quién.' },
      ],
    },
    {
      id: 'entregas-mobiliario',
      area: 'logistica',
      titulo: 'Las entregas y recolecciones de mobiliario se cruzan',
      senal: 'Tres entregas el sábado temprano y dos recolecciones el domingo. Una camioneta, y las direcciones en mensajes sueltos.',
      matices: [{ id: 'llaman', pregunta: '¿Sus clientes llaman a preguntar a qué hora llega el mobiliario?', si: 'Llaman a preguntar la hora', no: 'Se acuerda la hora y basta' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada renta en un tablero: por entregar, entregada, por recoger, de vuelta en bodega. La ruta del sábado se ve completa.' },
        { sol: 'rastreo-cliente', para: 'Quien rentó ve cuándo sale su mobiliario y cuándo pasan por él. Deja de llamar a preguntar.', pide: { llaman: true } },
        { sol: 'ordenes-trabajo', para: 'Cada renta con su orden: domicilio, piezas, hora de entrega y de recolección. El chofer la abre en su celular.' },
        { sol: 'agenda-interna', para: 'Entregas y recolecciones en el mismo calendario que los eventos, con dirección y hora. Para empezar, sin cambiar nada más.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'faltantes-mobiliario',
      area: 'inventarios',
      titulo: 'Después de cada evento faltan sillas, manteles o loza',
      senal: 'Se cuenta al montar, no al recoger. Lo roto y lo perdido aparece en el siguiente evento, cuando ya hace falta.',
      matices: [{ id: 'fuera', pregunta: '¿Renta mobiliario para eventos fuera del salón?', si: 'Renta mobiliario a domicilio', no: 'Solo se usa en el salón' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Lo que sale a un domicilio y lo que regresa se registra con el celular. Si salieron cien sillas y volvieron noventa y seis, se sabe ese día.', pide: { fuera: true } },
        { sol: 'merma', para: 'El plato roto y el mantel quemado se anotan con el evento donde pasó. Se sabe cuánto se repone al año y a quién se le pudo cobrar.' },
        { sol: 'inventario-alertas', para: 'Cada pieza con el mínimo para montar un evento completo. Si los manteles blancos bajan de treinta y cinco, usted se entera antes del sábado.' },
        { sol: 'checklist-turnos', para: 'Contar al entregar y contar al recoger, con una lista que se palomea frente al cliente. Lo mínimo para poder cobrar un faltante.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'paquete-no-deja',
      area: 'rentabilidad',
      titulo: 'No sé cuánto me deja en realidad cada paquete',
      senal: 'El precio por persona es el del año pasado. La carne, el hielo y los meseros ya subieron.',
      matices: [{ id: 'banquete', pregunta: '¿El banquete lo prepara usted?', si: 'Banquete propio', no: 'Banquete subcontratado' }],
      rutas: [
        { sol: 'costeo', para: 'El costo real de cada paquete por invitado: comida, meseros, mantelería, luz. Se ve cuál deja y cuál apenas sale.' },
        { sol: 'compras-sugeridas', para: 'Para 150 invitados, la lista de compra sale del menú contratado. Se compra lo de ese sábado, sin calcular de memoria.', pide: { banquete: true } },
        { sol: 'tablero-ventas', para: 'Qué tipo de evento deja más por fecha ocupada: boda, quince años o posada de empresa. No siempre es el más grande.' },
        { sol: 'menu-digital', para: 'La lista de paquetes vive en un enlace. Subir un precio toma un minuto y no quedan folletos viejos circulando.' },
      ],
    },
    {
      id: 'extras-evento',
      area: 'rentabilidad',
      titulo: 'Las horas extra y los daños casi nunca se cobran',
      senal: 'La fiesta terminaba a la una y siguió hasta las tres. Al otro día ya nadie quiere hablar de cobrar.',
      matices: [{ id: 'deposito', pregunta: '¿Pide depósito en garantía?', si: 'Pide depósito en garantía', no: 'Sin depósito' }],
      rutas: [
        { sol: 'formatos-digitales', para: 'La hora extra y los daños quedan firmados en el contrato, con su precio. Esa noche no se negocia: ya estaba acordado.' },
        { sol: 'cobro-en-linea', para: 'La hora extra se cobra en ese momento con un enlace, antes de que siga la música.' },
        { sol: 'fiado', para: 'El depósito queda en la cuenta del evento. Lo que se rompió se descuenta ahí, con su nota, y el resto se devuelve.', pide: { deposito: true } },
        { sol: 'bitacora-turno', para: 'Al terminar, el encargado anota la hora real y lo que encontró. El lunes usted cobra con datos, no con lo que se acuerda.' },
      ],
    },
  ],
}
