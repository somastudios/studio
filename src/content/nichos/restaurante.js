// Nicho ejemplar. Los demás siguen esta misma forma (ver docs/ARQUITECTURA.md, "Contrato de un nicho").

export default {
  id: 'restaurante',
  familia: 'comida',
  nombre: 'Restaurante',
  plural: 'restaurantes',
  icono: 'restaurante',
  acento: '#b4472b',
  vocab: {
    cliente: 'el comensal',
    clientes: 'los comensales',
    personal: 'el mesero',
    empleado: 'el mesero',
    producto: 'platillo',
    productos: 'platillos',
    pedido: 'pedido',
    pedidos: 'pedidos',
    cita: 'reservación',
    citas: 'reservaciones',
    lugar: 'salón',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que a esta hora tienen buen movimiento. ¿Cómo les va cuando se llena?',
  observa: [
    'Cuánto tarda en llegar un mesero a una mesa recién ocupada.',
    'Si las comandas van en papel o a gritos hacia la cocina.',
    'Si hay menú impreso con precios tachados o parchados.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Guacamole con totopos', precio: 95, categoria: 'Entradas' },
      { nombre: 'Queso fundido con chorizo', precio: 110, categoria: 'Entradas' },
      { nombre: 'Sopa de tortilla', precio: 85, categoria: 'Entradas' },
      { nombre: 'Enchiladas suizas', precio: 165, categoria: 'Fuertes' },
      { nombre: 'Arrachera a la parrilla', precio: 289, categoria: 'Fuertes' },
      { nombre: 'Pechuga rellena', precio: 198, categoria: 'Fuertes' },
      { nombre: 'Filete de pescado al mojo', precio: 215, categoria: 'Fuertes' },
      { nombre: 'Chiles en nogada', precio: 245, categoria: 'Fuertes' },
      { nombre: 'Flan napolitano', precio: 75, categoria: 'Postres' },
      { nombre: 'Pastel de elote', precio: 80, categoria: 'Postres' },
      { nombre: 'Agua de jamaica', precio: 38, categoria: 'Bebidas' },
      { nombre: 'Limonada mineral', precio: 45, categoria: 'Bebidas' },
      { nombre: 'Cerveza artesanal', precio: 85, categoria: 'Bebidas' },
      { nombre: 'Café de olla', precio: 40, categoria: 'Bebidas' },
    ],
    servicios: [
      { nombre: 'Mesa para dos', precio: 0, minutos: 90 },
      { nombre: 'Mesa para cuatro', precio: 0, minutos: 105 },
      { nombre: 'Mesa para grupo (6 a 10)', precio: 0, minutos: 120 },
      { nombre: 'Terraza', precio: 0, minutos: 105 },
    ],
    personal: ['Lupita', 'Chuy', 'Mariana', 'Toño'],
    clientes: ['Familia Ochoa', 'Sra. Elizondo', 'Ing. Barragán', 'Paola Méndez', 'Don Rafael', 'Lic. Sandoval'],
    insumos: [
      { nombre: 'Arrachera', unidad: 'kg', hay: 6, minimo: 8 },
      { nombre: 'Aguacate', unidad: 'kg', hay: 14, minimo: 10 },
      { nombre: 'Queso Oaxaca', unidad: 'kg', hay: 3, minimo: 5 },
      { nombre: 'Tortilla', unidad: 'kg', hay: 22, minimo: 12 },
      { nombre: 'Crema', unidad: 'L', hay: 9, minimo: 6 },
      { nombre: 'Cerveza artesanal', unidad: 'pzas', hay: 48, minimo: 36 },
      { nombre: 'Jitomate', unidad: 'kg', hay: 18, minimo: 10 },
      { nombre: 'Pechuga de pollo', unidad: 'kg', hay: 7, minimo: 8 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'servicio-lento',
      area: 'atencion',
      titulo: 'El servicio en mesa es lento',
      senal: 'En horas pico los meseros no se dan abasto y las mesas esperan.',
      frecuente: true,
      matices: [
        { id: 'solo', pregunta: '¿Sus comensales pedirían por su cuenta desde el teléfono?', si: 'Autoservicio bienvenido', no: 'Prefieren que los atiendan' },
        { id: 'trato', pregunta: '¿La atención del mesero es parte de lo que usted vende?', si: 'El trato personal se conserva', no: 'La rapidez va primero' },
      ],
      rutas: [
        { sol: 'pedidos-qr', para: 'La mesa ordena en cuanto se sienta. El mesero deja de tomar órdenes y se dedica a atender.', pide: { solo: true } },
        { sol: 'comandero', para: 'El mesero sigue tomando la orden, pero ya no camina a la cocina: la envía desde la mesa.', pide: { trato: true } },
        { sol: 'pantalla-cocina', para: 'Si la espera nace en cocina, se ordena la preparación: qué va primero y cuánto lleva cada mesa.' },
        { sol: 'llamado-mesa', para: 'Lo mínimo: la mesa avisa con un toque cuando necesita algo, y nadie tiene que estar adivinando.' },
      ],
    },
    {
      id: 'cuenta-tarda',
      area: 'atencion',
      titulo: 'La cuenta tarda en llegar',
      senal: 'El comensal ya terminó y sigue esperando para pagar. La mesa no se libera.',
      frecuente: true,
      matices: [{ id: 'tarjeta', pregunta: '¿La mayoría paga con tarjeta?', si: 'Pagan con tarjeta', no: 'Pagan en efectivo' }],
      rutas: [
        { sol: 'cobro-en-linea', para: 'El comensal ve su cuenta en el teléfono y paga ahí mismo. La mesa se libera sola.', pide: { tarjeta: true } },
        { sol: 'llamado-mesa', para: 'Un toque para pedir la cuenta. El mesero llega ya con ella, no a preguntar qué se ofrece.' },
        { sol: 'punto-de-venta', para: 'La cuenta se arma sola conforme se pide. Cerrarla y dividirla toma segundos.' },
        { sol: 'comandero', para: 'El mesero cierra la cuenta desde su celular, sin ir a la caja y volver.' },
      ],
    },
    {
      id: 'reservas-plantones',
      area: 'atencion',
      titulo: 'Reservan y no llegan',
      senal: 'Mesas apartadas que se quedan vacías en el mejor horario.',
      matices: [{ id: 'anticipo', pregunta: '¿Pediría un anticipo para apartar en fechas fuertes?', si: 'Anticipo aceptado', no: 'Sin anticipo' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'En fechas fuertes, apartar cuesta un anticipo que se descuenta de la cuenta. Quien aparta, llega.', pide: { anticipo: true } },
        { sol: 'recordatorios', para: 'Un mensaje un día antes para confirmar. Si cancelan, usted se entera con tiempo.' },
        { sol: 'lista-espera', para: 'Cuando alguien cancela, la mesa se ofrece sola a quien estaba en lista.' },
        { sol: 'agenda-interna', para: 'Todas las reservaciones en una vista, con la hora y el tamaño del grupo. Para empezar, sin cambiar nada más.' },
      ],
    },

    // ── Organización ──
    {
      id: 'comandas-perdidas',
      area: 'organizacion',
      titulo: 'Las comandas se pierden o llegan mal',
      senal: 'Platillos que salen equivocados, o que nunca salieron porque el papel se traspapeló.',
      frecuente: true,
      matices: [{ id: 'papel', pregunta: '¿Hoy las comandas van en papel?', si: 'Comandas en papel', no: 'Ya usan algún sistema' }],
      rutas: [
        { sol: 'comandero', para: 'La orden se captura una sola vez, en la mesa, y llega legible a cocina.' },
        { sol: 'pantalla-cocina', para: 'Cocina ve cada orden en pantalla, en el orden en que entró. No hay papel que se pierda.' },
        { sol: 'pedidos-qr', para: 'El comensal captura su propia orden. Lo que pidió es lo que llega.' },
        { sol: 'proceso-claro', para: 'Antes de cambiar herramientas, acordamos cómo viaja una orden de la mesa al plato. A veces eso basta.', pide: { papel: true } },
      ],
    },
    {
      id: 'cambio-turno',
      area: 'organizacion',
      titulo: 'Entre un turno y otro se pierden cosas',
      senal: 'Lo que el turno de la mañana sabía, el de la tarde no se entera.',
      matices: [{ id: 'encargado', pregunta: '¿Hay un encargado en cada turno?', si: 'Hay encargado por turno', no: 'Sin encargado fijo' }],
      rutas: [
        { sol: 'bitacora-turno', para: 'Lo pendiente queda por escrito y el siguiente turno lo ve al llegar: qué faltó, qué se acabó, qué se prometió.' },
        { sol: 'checklist-turnos', para: 'Abrir y cerrar con una lista. Se sabe qué se hizo, quién y a qué hora.' },
        { sol: 'roles-horarios', para: 'Quién entra y quién sale, publicado para todos. Se acaban los "yo pensé que hoy descansaba".', pide: { encargado: false } },
        { sol: 'reporte-diario', para: 'Un resumen cada noche en su teléfono con lo que pasó en los dos turnos.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-insumo',
      area: 'inventarios',
      titulo: 'Se acaban ingredientes sin aviso',
      senal: 'A media tarde ya no hay un platillo de la carta, y nadie lo vio venir.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Hoy alguien lleva el registro de lo que hay?', si: 'Hay quien lo registra', no: 'Se compra "a ojo"' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada insumo con su mínimo. Cuando la arrachera baja de ocho kilos, usted se entera antes del fin de semana.' },
        { sol: 'compras-sugeridas', para: 'Según lo que se vendió, la lista de compra se arma sola. Se pide lo justo.' },
        { sol: 'inventario-escaner', para: 'Lo que entra del proveedor y lo que sale a cocina se registra con el celular.', pide: { registro: true } },
        { sol: 'menu-digital', para: 'Lo mínimo: cuando algo se acaba, se marca agotado en el menú y el comensal ya no lo pide.' },
      ],
    },
    {
      id: 'merma-cocina',
      area: 'inventarios',
      titulo: 'Se tira producto y nadie sabe cuánto',
      senal: 'Producto que caduca, porciones que varían y una merma que no se mide.',
      matices: [{ id: 'perecederos', pregunta: '¿Lo que más se pierde es producto fresco?', si: 'Se pierde producto fresco', no: 'Se pierde en la preparación' }],
      rutas: [
        { sol: 'merma', para: 'Cada pérdida se anota con su motivo. A fin de mes la merma deja de ser una sospecha y se vuelve un número.' },
        { sol: 'caducidades', para: 'Lo fresco entra con su fecha. Lo que está por vencer aparece primero para usarse.', pide: { perecederos: true } },
        { sol: 'costeo', para: 'Cada platillo con su receta y su porción. Si se sirve de más, se nota en el margen.' },
        { sol: 'compras-sugeridas', para: 'Comprar según lo que de verdad se vende: menos sobra, menos se tira.' },
      ],
    },

    // ── Administración ──
    {
      id: 'no-se-cuanto-vendi',
      area: 'administracion',
      titulo: 'No sé con certeza cuánto se vendió hoy',
      senal: 'El número del día llega tarde, o hay que estar presente para saberlo.',
      frecuente: true,
      matices: [{ id: 'presente', pregunta: '¿Usted está en el restaurante todos los días?', si: 'El dueño está presente', no: 'El dueño no siempre está' }],
      rutas: [
        { sol: 'tablero-ventas', para: 'Las ventas del día en su teléfono, en vivo: cuánto va, a qué hora se llenó y qué se pidió más.', pide: { presente: false } },
        { sol: 'corte-de-caja', para: 'Al cerrar, el sistema dice cuánto debe haber en caja. Se cuenta y la diferencia queda a la vista.' },
        { sol: 'punto-de-venta', para: 'Cada cuenta se registra al cobrarse. El número del día ya no depende de sumar notas.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con las ventas y lo que requiere su atención. Sin abrir ningún sistema.' },
      ],
    },
    {
      id: 'caja-no-cuadra',
      area: 'administracion',
      titulo: 'La caja no cuadra',
      senal: 'Faltantes pequeños que se repiten y que nadie puede explicar.',
      matices: [{ id: 'varios', pregunta: '¿Varias personas cobran en el mismo turno?', si: 'Varias personas cobran', no: 'Una sola persona cobra' }],
      rutas: [
        { sol: 'corte-de-caja', para: 'El corte compara lo vendido con lo contado, por turno y por persona. La diferencia tiene nombre y hora.' },
        { sol: 'punto-de-venta', para: 'Nada se cobra sin registrarse. Cada cuenta deja rastro de quién la cerró.', pide: { varios: true } },
        { sol: 'cobro-en-linea', para: 'Mientras más pagos entran por tarjeta o enlace, menos efectivo hay que contar.' },
        { sol: 'checklist-turnos', para: 'Un cierre con pasos fijos: contar, anotar, firmar. Lo mínimo para que deje de pasar.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'entre-semana-vacio',
      area: 'clientes',
      titulo: 'Entre semana se queda vacío',
      senal: 'Fines de semana llenos y de lunes a jueves las mesas solas.',
      frecuente: true,
      matices: [{ id: 'contacto', pregunta: '¿Tiene forma de escribirles a quienes ya han venido?', si: 'Tiene contacto de sus comensales', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'Una invitación de martes a quienes vinieron en fin de semana. Le llega a quien ya conoce el lugar.', pide: { contacto: true } },
        { sol: 'tarjeta-lealtad', para: 'Sellos que valen doble entre semana. El comensal elige venir el día que a usted le conviene.' },
        { sol: 'reactivacion', para: 'El sistema detecta a quién hace dos meses no viene y prepara la invitación.' },
        { sol: 'perfil-google', para: 'Quien busca dónde comer un miércoles lo encuentra con horario, fotos y menú. Es el primer paso.' },
      ],
    },
    {
      id: 'no-nos-encuentran',
      area: 'clientes',
      titulo: 'Quien no nos conoce no nos encuentra',
      senal: 'Casi todos llegan por recomendación. En internet el restaurante casi no existe.',
      matices: [{ id: 'turistas', pregunta: '¿Le interesa atraer gente de fuera de la ciudad?', si: 'Busca visitantes', no: 'Su público es local' }],
      rutas: [
        { sol: 'perfil-google', para: 'Lo primero: que al buscar "dónde comer" aparezca completo, con fotos, horario y cómo llegar.' },
        { sol: 'resenas', para: 'Después de cada visita, una invitación a opinar. Las buenas experiencias empiezan a verse.' },
        { sol: 'sitio-web', para: 'Una página con el menú, las fotos y el botón para reservar. Quien entra sabe qué hacer.', pide: { turistas: true } },
        { sol: 'menu-digital', para: 'El menú con un enlace que se comparte: en redes, en WhatsApp, en el perfil de Google.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'whatsapp-saturado',
      area: 'comunicacion',
      titulo: 'Los mensajes se contestan tarde',
      senal: 'Preguntan por horario, menú o reservación y la respuesta llega horas después.',
      matices: [{ id: 'pedidos', pregunta: '¿También reciben pedidos para llevar por mensaje?', si: 'Reciben pedidos por mensaje', no: 'Solo preguntas y reservaciones' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Horario, ubicación y menú se contestan solos, a cualquier hora. Lo demás pasa a una persona.' },
        { sol: 'whatsapp-pedidos', para: 'El pedido para llevar se arma con una guía. Llega completo y sin ida y vuelta.', pide: { pedidos: true } },
        { sol: 'agenda-en-linea', para: 'Para reservar ya no hay que escribir: se elige día, hora y cuántos son.' },
        { sol: 'respuestas-rapidas', para: 'Las respuestas de siempre, ya escritas. Quien contesta lo hace bien y con un toque.' },
      ],
    },

    // ── Logística ──
    {
      id: 'para-llevar-caos',
      area: 'logistica',
      titulo: 'Los pedidos para llevar se enredan',
      senal: 'Pedidos por teléfono, por mensaje y por plataforma al mismo tiempo. Algunos salen tarde o incompletos.',
      matices: [{ id: 'reparto', pregunta: '¿Tienen repartidor propio?', si: 'Reparto propio', no: 'Solo para recoger o plataformas' }],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El pedido se hace en línea y llega ya ordenado, con hora de entrega. Solo pasan a recoger.' },
        { sol: 'seguimiento-pedidos', para: 'Todos los pedidos en un tablero, vengan de donde vengan, con su etapa a la vista.' },
        { sol: 'rastreo-cliente', para: 'Quien pidió ve en qué va su pedido. Dejan de llamar a preguntar.', pide: { reparto: true } },
        { sol: 'whatsapp-pedidos', para: 'El pedido por WhatsApp sigue una guía. Llega completo desde el primer mensaje.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'vendo-mucho-queda-poco',
      area: 'rentabilidad',
      titulo: 'Se vende mucho y queda poco',
      senal: 'El salón se llena, pero al final del mes el dinero no se ve.',
      frecuente: true,
      matices: [{ id: 'recetas', pregunta: '¿Tiene el costo de cada platillo calculado?', si: 'Tiene sus costos', no: 'Los precios se pusieron "a ojo"' }],
      rutas: [
        { sol: 'costeo', para: 'El costo real de cada platillo, ingrediente por ingrediente. Se ve cuál deja y cuál solo ocupa la mesa.', pide: { recetas: false } },
        { sol: 'tablero-ventas', para: 'Qué se vende más y qué deja más, lado a lado. No siempre es lo mismo.' },
        { sol: 'merma', para: 'Parte de lo que no queda, se tira. Medirlo es el primer paso para recuperarlo.' },
        { sol: 'menu-digital', para: 'Con un menú que se edita en un minuto, ajustar un precio deja de ser un gasto de imprenta.' },
      ],
    },
  ],
}
