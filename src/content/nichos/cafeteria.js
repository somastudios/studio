// Cafeterías: café de especialidad, barra, repostería y gente que se queda a trabajar.

export default {
  id: 'cafeteria',
  familia: 'comida',
  nombre: 'Cafetería',
  plural: 'cafeterías',
  icono: 'cafeteria',
  acento: '#5b3a29',
  vocab: {
    personal: 'el barista',
    empleado: 'el barista',
    cita: 'reservación',
    citas: 'reservaciones',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Se ve que tienen clientela de todos los días. ¿Cómo es aquí una mañana entre ocho y diez?',
  observa: [
    'Cuántas mesas ocupa una sola persona con laptop, y qué tiene enfrente.',
    'Cómo se entrega la bebida: si gritan el nombre o alguien la lleva a la mesa.',
    'Si junto a la caja hay tarjetas de sellos de cartón o una pizarra con precios corregidos.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Americano', precio: 42, categoria: 'Café caliente' },
      { nombre: 'Espresso doble', precio: 45, categoria: 'Café caliente' },
      { nombre: 'Capuchino', precio: 58, categoria: 'Café caliente' },
      { nombre: 'Latte', precio: 62, categoria: 'Café caliente' },
      { nombre: 'Cold brew', precio: 65, categoria: 'Bebidas frías' },
      { nombre: 'Frappé de caramelo', precio: 75, categoria: 'Bebidas frías' },
      { nombre: 'Chai frío', precio: 72, categoria: 'Bebidas frías' },
      { nombre: 'Rol de canela', precio: 48, categoria: 'Repostería' },
      { nombre: 'Pastel de zanahoria', precio: 68, categoria: 'Repostería' },
      { nombre: 'Galleta de avena', precio: 30, categoria: 'Repostería' },
      { nombre: 'Cuernito de mantequilla', precio: 45, categoria: 'Repostería' },
      { nombre: 'Panini de pavo', precio: 95, categoria: 'Repostería' },
      { nombre: 'Café en grano 250 g', precio: 185, categoria: 'Para la casa' },
      { nombre: 'Café molido 500 g', precio: 340, categoria: 'Para la casa' },
    ],
    servicios: [
      { nombre: 'Mesa grande para reunión', precio: 0, minutos: 120 },
      { nombre: 'Salita privada', precio: 150, minutos: 60 },
      { nombre: 'Cata de café', precio: 280, minutos: 90 },
      { nombre: 'Taller de métodos de extracción', precio: 350, minutos: 120 },
      { nombre: 'Barra de café para evento', precio: 3800, minutos: 180 },
    ],
    personal: ['Sofía', 'Emiliano', 'Ximena', 'Rodrigo'],
    clientes: ['Andrea Cárdenas', 'Mtro. Villalvazo', 'Despacho Rubio', 'Dra. Montes', 'Iker Zepeda', 'Fernanda Larios'],
    insumos: [
      { nombre: 'Café en grano', unidad: 'kg', hay: 7, minimo: 5 },
      { nombre: 'Leche entera', unidad: 'L', hay: 24, minimo: 18 },
      { nombre: 'Leche de avena', unidad: 'L', hay: 4, minimo: 8 },
      { nombre: 'Vasos de 12 oz', unidad: 'pzas', hay: 180, minimo: 200 },
      { nombre: 'Tapas', unidad: 'pzas', hay: 350, minimo: 200 },
      { nombre: 'Jarabe de vainilla', unidad: 'botellas', hay: 3, minimo: 2 },
      { nombre: 'Chocolate en polvo', unidad: 'kg', hay: 2, minimo: 1 },
      { nombre: 'Rol de canela', unidad: 'pzas', hay: 9, minimo: 6 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'fila-de-la-manana',
      area: 'atencion',
      titulo: 'En la mañana la fila llega a la puerta',
      senal: 'Entre ocho y diez todos quieren su café para llevar. Algunos ven la fila y se siguen.',
      frecuente: true,
      matices: [
        { id: 'antes', pregunta: '¿Sus clientes de la mañana pedirían antes de llegar?', si: 'Pedirían antes de llegar', no: 'Prefieren pedir en barra' },
        { id: 'solo', pregunta: '¿En la mañana una sola persona cobra y prepara?', si: 'Una persona cobra y prepara', no: 'Hay caja y barra separadas' },
      ],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El de las ocho pide su latte desde el coche y lo encuentra listo, con su nombre. No se forma.', pide: { antes: true } },
        { sol: 'pantalla-cocina', para: 'El barista ve la cola de bebidas en pantalla, en orden. Quien cobra ya no le dicta ni le pega papelitos a la máquina.', pide: { solo: false } },
        { sol: 'punto-de-venta', para: 'Cobrar un americano y un rol son tres toques. La fila avanza al ritmo de la barra y no al de la caja.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar el orden de la mañana: quién cobra, quién prepara y dónde se entrega. Sin comprar nada.' },
      ],
    },
    {
      id: 'bebida-en-la-barra',
      area: 'atencion',
      titulo: 'La bebida ya está y nadie pasa por ella',
      senal: 'Se grita el nombre, el cliente trae audífonos y el capuchino se enfría en la barra.',
      matices: [{ id: 'mesa', pregunta: '¿Llevan las bebidas a la mesa?', si: 'Se llevan a la mesa', no: 'El cliente recoge en barra' }],
      rutas: [
        { sol: 'pedidos-qr', para: 'Quien está en mesa pide desde su lugar y la orden llega con número de mesa. Se sabe a dónde llevarla.', pide: { mesa: true } },
        { sol: 'aviso-listo', para: 'Cuando la bebida sale, quien atiende las mesas recibe el aviso con el número. El capuchino llega caliente.', pide: { mesa: true } },
        { sol: 'pantalla-turnos', para: 'Una pantalla junto a la barra con las órdenes listas. Quien trabaja con audífonos levanta la vista y ve la suya.' },
        { sol: 'punto-de-venta', para: 'Lo mínimo: el ticket sale con número de orden y nombre, y se pega al vaso. Se acaba el "¿este de quién es?".' },
      ],
    },
    {
      id: 'talleres-apartan-y-no-llegan',
      area: 'atencion',
      titulo: 'Para las catas y talleres apartan y no llegan',
      senal: 'Se anuncia la cata, veinte dicen que van, se compra el café y llegan ocho.',
      matices: [{ id: 'cobra', pregunta: '¿Cobra la entrada a sus talleres o catas?', si: 'Eventos con costo', no: 'Eventos gratuitos' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'El lugar en la cata se aparta pagando. Usted compra el café y prepara las tazas para quienes sí vienen.', pide: { cobra: true } },
        { sol: 'agenda-en-linea', para: 'Los lugares disponibles se ven y se apartan en un enlace. Cuando se llena, deja de ofrecerse.' },
        { sol: 'lista-espera', para: 'Si alguien cancela, su lugar se ofrece solo a quien se quedó fuera.' },
        { sol: 'recordatorios', para: 'Lo mínimo: un mensaje la víspera para confirmar. Quien no va libera su lugar a tiempo.' },
      ],
    },

    // ── Organización ──
    {
      id: 'cada-barista-distinto',
      area: 'organizacion',
      titulo: 'Cada barista prepara el mismo latte a su manera',
      senal: 'El cliente pide lo de siempre y le sabe distinto según quién esté en la barra.',
      frecuente: true,
      matices: [{ id: 'recetas', pregunta: '¿Tiene sus recetas escritas con medidas?', si: 'Recetas escritas', no: 'Se enseñan de palabra' }],
      rutas: [
        { sol: 'costeo', para: 'Cada bebida con su receta: gramos de café, mililitros de leche, medidas de jarabe. Es una sola y está a la vista.' },
        { sol: 'pantalla-cocina', para: 'La orden llega a la barra escrita completa: leche de avena, descafeinado, extra caliente. No se interpreta, se lee.' },
        { sol: 'bitacora-turno', para: 'El barista de la mañana deja anotado cómo quedó el molino y qué café se abrió. El de la tarde no empieza de cero.' },
        { sol: 'proceso-claro', para: 'Lo primero: escribir las recetas con su mejor barista, con medidas. Sin eso, cada quien seguirá preparando a su modo.', pide: { recetas: false } },
      ],
    },
    {
      id: 'horarios-rompecabezas',
      area: 'organizacion',
      titulo: 'Armar los horarios de la semana es un rompecabezas',
      senal: 'Los baristas estudian, piden cambios por mensaje y a veces dos creen que descansan el mismo día.',
      matices: [{ id: 'cambios', pregunta: '¿Sus baristas intercambian turnos entre ellos?', si: 'Intercambian turnos', no: 'El horario lo fija el dueño' }],
      rutas: [
        { sol: 'roles-horarios', para: 'El horario de la semana en el celular de todos. Los cambios se piden ahí y quedan a la vista, no en un chat.', pide: { cambios: true } },
        { sol: 'agenda-interna', para: 'Turnos, talleres y catas en un mismo calendario. Se ve si el sábado de evento hay gente suficiente.' },
        { sol: 'checklist-turnos', para: 'Quien cubre un turno ajeno sigue la misma lista de apertura. No depende de que alguien le explique.' },
        { sol: 'reporte-diario', para: 'Lo mínimo: cada noche usted recibe quién abrió, quién cerró y si alguien faltó.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-la-leche',
      area: 'inventarios',
      titulo: 'Se acaba la leche de avena o las tapas a media tarde',
      senal: 'No falta el café: falta la leche vegetal, el vaso mediano o el jarabe. Y hay que decir "de ese no hay".',
      frecuente: true,
      matices: [{ id: 'fijo', pregunta: '¿Sus proveedores le surten en días fijos?', si: 'Surtido en días fijos', no: 'Se compra cuando falta' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Leche de avena, vasos, tapas y jarabes con su mínimo. Cuando quedan seis litros, el aviso llega antes del sábado.' },
        { sol: 'compras-sugeridas', para: 'El día que pasa el proveedor, la lista ya está hecha con lo que se gastó en la semana.', pide: { fijo: true } },
        { sol: 'inventario-escaner', para: 'Lo que llega se registra con el celular al recibirlo. Se sabe qué hay en bodega sin ir a asomarse.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: al cerrar se revisan leches, vasos, tapas, café y pan. Lo que falta se pide esa misma noche.' },
      ],
    },
    {
      id: 'vitrina-sobra',
      area: 'inventarios',
      titulo: 'Al cierre sobran postres que mañana ya no se venden',
      senal: 'La vitrina tiene que verse llena. Lo que no salió hoy, mañana ya no está igual.',
      matices: [{ id: 'propio', pregunta: '¿La repostería la hornean ustedes?', si: 'Repostería propia', no: 'La surte un proveedor' }],
      rutas: [
        { sol: 'compras-sugeridas', para: 'Según lo que salió cada día, se sabe cuántos roles tener el martes y cuántos el sábado.' },
        { sol: 'costeo', para: 'Con la receta costeada se ve cuánto cuesta cada rebanada que se tira y qué postres sí conviene hornear.', pide: { propio: true } },
        { sol: 'caducidades', para: 'Cada postre entra a la vitrina con su fecha. Lo de ayer se acomoda al frente y sale primero.' },
        { sol: 'merma', para: 'Lo mínimo: anotar cada noche lo que sobró. Dos semanas de notas ya dicen cuánto pedir.' },
      ],
    },

    // ── Administración ──
    {
      id: 'cierre-no-cuadra',
      area: 'administracion',
      titulo: 'Entre tarjeta, efectivo y propinas, el cierre no cuadra',
      senal: 'La terminal dice una cosa y el cajón otra. Las propinas con tarjeta nadie sabe de quién son.',
      frecuente: true,
      matices: [{ id: 'comparte', pregunta: '¿Las propinas se reparten entre todo el equipo?', si: 'Propina compartida', no: 'Cada quien la suya' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta queda con su forma de pago y su propina aparte. Terminal y cajón se registran en el mismo lugar.' },
        { sol: 'corte-de-caja', para: 'Al cierre: tanto en efectivo, tanto en tarjeta, tanto de propina. Se cuenta el cajón y la diferencia queda a la vista.' },
        { sol: 'roles-horarios', para: 'Con las horas de cada quien registradas, la propina compartida se reparte por tiempo trabajado. Sin discusiones.', pide: { comparte: true } },
        { sol: 'reporte-diario', para: 'Lo mínimo: cada noche le llega el cierre con venta, formas de pago y propinas. Lo revisa sin ir al local.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'tarjetas-de-sellos',
      area: 'clientes',
      titulo: 'Las tarjetas de sellos se pierden o se quedan en casa',
      senal: 'Los sellos de cartón se pierden. Nadie sabe quién viene diario ni quién dejó de venir.',
      frecuente: true,
      matices: [{ id: 'numero', pregunta: '¿Sus clientes frecuentes le darían su número de celular?', si: 'Dan su número', no: 'Prefieren no dar datos' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'El café de temporada o el nuevo origen se le avisa a quien sí lo toma. No a toda la lista.', pide: { numero: true } },
        { sol: 'reactivacion', para: 'Quien pasaba cada mañana y lleva tres semanas sin venir recibe una invitación a su bebida de siempre.', pide: { numero: true } },
        { sol: 'base-clientes', para: 'Se sabe quién viene diario y qué pide. El barista nuevo también puede saludar por nombre.' },
        { sol: 'tarjeta-lealtad', para: 'El paso más corto: los mismos sellos, en el teléfono. El décimo café llega sin buscar el cartón en la cartera.' },
      ],
    },
    {
      id: 'cafe-en-grano',
      area: 'clientes',
      titulo: 'Tengo café en grano para llevar y casi no sale',
      senal: 'Las bolsas están en la repisa. El cliente de todos los días no sabe que puede llevarse el mismo café a su casa.',
      matices: [{ id: 'envio', pregunta: '¿Enviaría café a clientes de otras ciudades?', si: 'Enviaría fuera de la ciudad', no: 'Solo venta en el local' }],
      rutas: [
        { sol: 'tienda-en-linea', para: 'Las bolsas de 250 gramos se venden en línea, con molienda a elegir. Quien se mudó sigue tomando su café.', pide: { envio: true } },
        { sol: 'control-mensualidades', para: 'Una bolsa al mes para el cliente de casa: se ve quién está suscrito, cuándo le toca y quién no ha pagado.' },
        { sol: 'promos-segmentadas', para: 'Cuando llega un tueste nuevo, el aviso le llega a quien ya compró grano antes.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: un enlace con los cafés disponibles, su tueste y su precio. El pedido llega armado a WhatsApp.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'pedidos-de-oficina',
      area: 'comunicacion',
      titulo: 'Piden diez cafés para una junta y avisan ya en camino',
      senal: 'Los pedidos grandes llegan por WhatsApp o Instagram, entre la fila. Alguien deja la barra para contestar.',
      matices: [{ id: 'seguido', pregunta: '¿Hay oficinas o escuelas que le piden cada semana?', si: 'Pedidos de oficina frecuentes', no: 'Pedidos grandes ocasionales' }],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El pedido grande se hace en un enlace, con hora de recolección. La barra lo ve venir con veinte minutos de ventaja.' },
        { sol: 'cobro-en-linea', para: 'Los diez cafés se pagan con un enlace antes de prepararse. Nadie llega a dividir la cuenta en la barra.' },
        { sol: 'base-clientes', para: 'El pedido de siempre de cada oficina queda guardado. Lo repiten con un mensaje y no hay que tomarlo desde cero.', pide: { seguido: true } },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: la respuesta ya escrita que pide cuántos, de qué, a qué hora y a nombre de quién.' },
      ],
    },

    // ── Logística ──
    {
      id: 'domicilio-llega-frio',
      area: 'logistica',
      titulo: 'El pedido a domicilio sale tarde y llega frío',
      senal: 'La barra atiende primero a quien está enfrente. El pedido para enviar espera, y el café no perdona.',
      matices: [{ id: 'propio', pregunta: '¿Reparten con alguien de su equipo?', si: 'Reparto propio', no: 'Reparto por aplicación' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Los pedidos para enviar en un tablero aparte, con su hora. Se ve cuál lleva diez minutos esperando repartidor.' },
        { sol: 'rastreo-cliente', para: 'El cliente ve cuándo salió su café. Deja de escribir para preguntar por él.', pide: { propio: true } },
        { sol: 'aviso-listo', para: 'En cuanto la bebida está lista, el repartidor recibe el aviso. El café no se queda esperando en la barra.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar que la bebida caliente se prepara cuando el repartidor ya llegó, no cuando entra el pedido.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'mesa-toda-la-tarde',
      area: 'rentabilidad',
      titulo: 'Piden un café y ocupan la mesa toda la tarde',
      senal: 'Vienen a trabajar con su laptop. El local se ve lleno, pero la caja no lo refleja.',
      frecuente: true,
      matices: [{ id: 'gusto', pregunta: '¿Quiere seguir siendo un lugar para venir a trabajar?', si: 'Bienvenido quien viene a trabajar', no: 'Prefiere que la mesa rote' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'La mesa grande o la salita se apartan por hora, con consumo incluido. Quien necesita tres horas, las reserva.', pide: { gusto: true } },
        { sol: 'pedidos-qr', para: 'Quien trabaja pide su segundo café desde la mesa, sin recoger sus cosas. Consumir más no le cuesta el lugar.', pide: { gusto: true } },
        { sol: 'tablero-ventas', para: 'Se ve cuánto deja cada hora del día. Con ese dato se decide si conviene un consumo mínimo por la tarde.' },
        { sol: 'menu-digital', para: 'Lo mínimo: en el código de la mesa, junto al menú, la clave del wifi y la regla de consumo, dicha con amabilidad.' },
      ],
    },
    {
      id: 'costo-por-bebida',
      area: 'rentabilidad',
      titulo: 'No sé cuánto me deja un latte con leche de avena',
      senal: 'La leche vegetal, el vaso para llevar y el jarabe suben el costo. El cargo extra se puso por intuición.',
      matices: [{ id: 'extras', pregunta: '¿Cobra aparte la leche vegetal y los extras?', si: 'Cobra los extras', no: 'Los extras van incluidos' }],
      rutas: [
        { sol: 'costeo', para: 'Café, leche, vaso, tapa y manga: el costo real de cada bebida. Se ve si el cargo por leche de avena alcanza a cubrirla.' },
        { sol: 'punto-de-venta', para: 'Cada extra se cobra con un toque y queda registrado. El shot adicional deja de regalarse por las prisas.', pide: { extras: true } },
        { sol: 'inventario-escaner', para: 'Cada compra de leche y de café se registra con su precio. Cuando el litro sube, se ve ese día y no a fin de mes.' },
        { sol: 'menu-digital', para: 'Con el menú en un código, ajustar el precio de un extra toma un minuto. No hay que rehacer la pizarra.' },
      ],
    },
  ],
}
