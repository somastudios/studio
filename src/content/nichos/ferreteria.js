// Ferretería de mostrador: miles de artículos, maestros de obra, crédito, cotizaciones y envíos a obra.

export default {
  id: 'ferreteria',
  familia: 'tiendas',
  nombre: 'Ferretería',
  plural: 'ferreterías',
  icono: 'ferreteria',
  acento: '#33475b',
  vocab: {
    personal: 'el vendedor',
    empleado: 'el vendedor',
    producto: 'artículo',
    productos: 'artículos',
    cita: 'entrega',
    citas: 'entregas',
    lugar: 'mostrador',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Se ve que aquí llega mucho maestro de obra. ¿Qué le piden más: que tenga la pieza o que los despache rápido?',
  observa: [
    'Cuánta gente espera en el mostrador y si alguien se va sin que lo atiendan.',
    'Si el vendedor camina directo a la pieza o le pregunta a otro dónde está.',
    'Si las notas y las cotizaciones se hacen a mano, y si hay un fajo de notas de crédito junto a la caja.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Codo de PVC hidráulico de 1/2', precio: 6, categoria: 'Plomería' },
      { nombre: 'Llave de paso de 1/2', precio: 95, categoria: 'Plomería' },
      { nombre: 'Cinta teflón', precio: 12, categoria: 'Plomería' },
      { nombre: 'Flotador para tinaco', precio: 89, categoria: 'Plomería' },
      { nombre: 'Cable calibre 12, metro', precio: 14, categoria: 'Electricidad' },
      { nombre: 'Apagador sencillo', precio: 32, categoria: 'Electricidad' },
      { nombre: 'Foco LED 10 W', precio: 28, categoria: 'Electricidad' },
      { nombre: 'Martillo de uña 16 oz', precio: 189, categoria: 'Herramienta' },
      { nombre: 'Flexómetro 5 m', precio: 115, categoria: 'Herramienta' },
      { nombre: 'Disco de corte 4 1/2', precio: 35, categoria: 'Herramienta' },
      { nombre: 'Cemento gris 50 kg', precio: 265, categoria: 'Obra y pintura' },
      { nombre: 'Clavo de 2 1/2, kilo', precio: 48, categoria: 'Obra y pintura' },
      { nombre: 'Pintura vinílica blanca 19 L', precio: 1380, categoria: 'Obra y pintura' },
      { nombre: 'Brocha de 4 pulgadas', precio: 68, categoria: 'Obra y pintura' },
    ],
    servicios: [
      { nombre: 'Entrega de material en obra', precio: 150, minutos: 60 },
      { nombre: 'Pedido para pasar a recoger', precio: 0, minutos: 20 },
      { nombre: 'Pieza por encargo al proveedor', precio: 0, minutos: 15 },
      { nombre: 'Igualado de pintura', precio: 80, minutos: 30 },
      { nombre: 'Corte de tubo o cable a la medida', precio: 40, minutos: 15 },
      { nombre: 'Asesoría para lista de materiales', precio: 0, minutos: 30 },
    ],
    personal: ['Ramiro', 'Fabiola', 'Memo', 'Israel'],
    clientes: ['Maestro Cuco', 'Arq. Pelayo', 'Don Gildardo', 'Sra. Magaña', 'Constructora Zapotlán', 'Ing. Cárdenas'],
    insumos: [
      { nombre: 'Cemento gris 50 kg', unidad: 'bultos', hay: 38, minimo: 40 },
      { nombre: 'Cable calibre 12', unidad: 'm', hay: 420, minimo: 300 },
      { nombre: 'Codo de PVC de 1/2', unidad: 'pzas', hay: 65, minimo: 100 },
      { nombre: 'Cinta teflón', unidad: 'pzas', hay: 140, minimo: 60 },
      { nombre: 'Clavo de 2 1/2', unidad: 'kg', hay: 55, minimo: 40 },
      { nombre: 'Pintura vinílica blanca 19 L', unidad: 'cubetas', hay: 6, minimo: 8 },
      { nombre: 'Foco LED 10 W', unidad: 'pzas', hay: 90, minimo: 48 },
      { nombre: 'Disco de corte 4 1/2', unidad: 'pzas', hay: 44, minimo: 30 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'cotizar-tarda',
      area: 'atencion',
      titulo: 'Cotizar una lista de obra me lleva toda la tarde',
      senal: 'El contratista deja su lista, se busca precio por precio y la cotización sale al día siguiente, a mano.',
      frecuente: true,
      matices: [
        { id: 'dueno', pregunta: '¿Las cotizaciones grandes solo las hace usted?', si: 'Solo cotiza el dueño', no: 'Cotiza el mostrador' },
        { id: 'precios', pregunta: '¿Tiene sus precios en algún sistema o en una hoja de cálculo?', si: 'Precios ya capturados', no: 'Precios en listas de papel' },
      ],
      rutas: [
        { sol: 'cotizador', para: 'Se eligen los artículos de la lista, la suma sale sola y la cotización se va por WhatsApp antes de que el maestro vuelva a la obra.' },
        { sol: 'base-clientes', para: 'El precio y el descuento de cada contratista quedan en su ficha. Cualquiera en el mostrador cotiza igual que usted.', pide: { dueno: true } },
        { sol: 'whatsapp-pedidos', para: 'El contratista manda su lista con una guía: artículo, medida y cantidad. Llega pareja y ya no hay que descifrar la letra.' },
        { sol: 'menu-digital', para: 'Para empezar: su lista de precios en el celular de cada vendedor, con buscador. Nadie hojea el catálogo del proveedor.', pide: { precios: false } },
      ],
    },
    {
      id: 'mostrador-lleno',
      area: 'atencion',
      titulo: 'En la mañana se llena el mostrador y la gente se va',
      senal: 'De siete a nueve llegan los maestros con prisa. Uno con lista larga detiene a los que vienen por una pieza.',
      frecuente: true,
      matices: [{ id: 'antes', pregunta: '¿Sus maestros mandarían la lista desde la tarde anterior?', si: 'Mandarían su lista antes', no: 'Llegan y piden en el momento' }],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El maestro manda su lista en la tarde y a las siete pasa por ella ya surtida y con su nota. No hace fila.', pide: { antes: true } },
        { sol: 'pantalla-turnos', para: 'Turnos en una pantalla y una fila aparte para listas largas. Quien viene por una pieza sale en cinco minutos.' },
        { sol: 'aviso-listo', para: 'El maestro deja su lista, se va a almorzar y recibe un mensaje cuando está surtida. El mostrador se despeja.' },
        { sol: 'roles-horarios', para: 'Si el mostrador se llena de siete a nueve, a esa hora están todos. El almuerzo y los descansos se mueven a media mañana.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'cotizacion-sin-seguimiento',
      area: 'clientes',
      titulo: 'Mando cotizaciones y nunca sé en qué quedaron',
      senal: 'Se cotiza una obra completa, el cliente dice "le aviso" y nadie vuelve a preguntar.',
      matices: [{ id: 'obras', pregunta: '¿Cotiza seguido obras grandes, de varias semanas?', si: 'Cotiza obras grandes', no: 'Cotiza listas chicas' }],
      rutas: [
        { sol: 'seguimiento-prospectos', para: 'Cada cotización queda anotada con su monto y la fecha para volver a llamar. Las de obra grande no se enfrían solas.', pide: { obras: true } },
        { sol: 'cotizador', para: 'Las cotizaciones enviadas quedan guardadas. Si el cliente regresa en quince días, se abre la misma y se ajusta.' },
        { sol: 'recordatorios', para: 'A los tres días sale un mensaje: "¿le surtimos lo cotizado?". Responde con un toque y usted sabe si sigue en pie.' },
        { sol: 'respuestas-rapidas', para: 'El mensaje de seguimiento ya escrito. El vendedor lo manda en un toque cuando el mostrador le da un respiro.' },
      ],
    },
    {
      id: 'maestros-recomiendan',
      area: 'clientes',
      titulo: 'El maestro decide dónde se compra, y no siempre es aquí',
      senal: 'Plomeros y albañiles mandan al cliente a la ferretería donde los conocen y los tratan mejor.',
      matices: [{ id: 'trato', pregunta: '¿Hoy les da precio especial a los maestros que le compran seguido?', si: 'Da precio de maestro', no: 'Mismo precio para todos' }],
      rutas: [
        { sol: 'base-clientes', para: 'Cada maestro con su ficha: oficio, qué compra y qué precio se le da. El trato ya no depende de quién lo atienda.', pide: { trato: true } },
        { sol: 'tarjeta-lealtad', para: 'El maestro junta sellos por lo que compra y por lo que compran sus clientes. Al llenar la tarjeta, una herramienta.', pide: { trato: false } },
        { sol: 'promos-segmentadas', para: 'Llegó cable a buen precio: el aviso va solo a los electricistas. Al plomero le llega lo de plomería.' },
        { sol: 'reactivacion', para: 'Cada lunes, la lista de maestros que llevan un mes sin venir, con el mensaje listo para saludarlos.' },
      ],
    },

    // ── Organización ──
    {
      id: 'solo-yo-se-donde',
      area: 'organizacion',
      titulo: 'Solo yo y el más antiguo sabemos dónde está cada cosa',
      senal: 'El vendedor nuevo pregunta dónde está la pieza, cuál es la equivalente y a cómo. El cliente espera.',
      frecuente: true,
      matices: [
        { id: 'orden', pregunta: '¿Sus anaqueles y cajones están rotulados?', si: 'Anaqueles rotulados', no: 'Cada quien sabe "por dónde"' },
        { id: 'rota', pregunta: '¿Le cambia seguido el personal de mostrador?', si: 'Rota mucho el personal', no: 'El equipo es estable' },
      ],
      rutas: [
        { sol: 'punto-de-venta', para: 'Se busca la pieza como la pide la gente, "el cuello de cera", y sale el precio, cuántas hay y en qué anaquel está.' },
        { sol: 'inventario-escaner', para: 'Cada cajón con su etiqueta. Al escanearla, el vendedor nuevo ve qué va ahí, en qué medidas y a qué precio.', pide: { orden: true } },
        { sol: 'catalogo-whatsapp', para: 'Un catálogo con foto y medidas que también consulta el vendedor nuevo. Ve la pieza antes de ir a buscarla.', pide: { rota: true } },
        { sol: 'proceso-claro', para: 'Lo primero: acordar un orden para la tienda y rotular pasillos y anaqueles. Sin eso, ningún sistema encuentra la pieza.', pide: { orden: false } },
      ],
    },
    {
      id: 'encargo-olvidado',
      area: 'organizacion',
      titulo: 'Encargan una pieza, llega y nadie le avisa al cliente',
      senal: 'El encargo se anota en un papel. La pieza llega, se queda en la bodega y el cliente ya compró en otro lado.',
      matices: [{ id: 'anticipo', pregunta: '¿Pide anticipo cuando le encargan una pieza especial?', si: 'Encarga con anticipo', no: 'Encarga de palabra' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada encargo con su orden: qué pieza, para quién y cuándo llega. Al recibirla del proveedor, el cliente recibe su aviso.' },
        { sol: 'aviso-listo', para: 'En cuanto la pieza se marca como recibida, sale el mensaje: "ya llegó su bomba". Nadie tiene que acordarse de llamar.' },
        { sol: 'cobro-en-linea', para: 'El encargo se confirma con un anticipo por transferencia. Quien dejó dinero vuelve por su pieza.', pide: { anticipo: false } },
        { sol: 'bitacora-turno', para: 'Los encargos en una lista que todo el mostrador ve, no en el papel de quien lo tomó.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'hay-pero-no-aparece',
      area: 'inventarios',
      titulo: 'Le digo al cliente que sí hay y luego no aparece',
      senal: 'El sistema o la memoria dicen que quedan tres. En el anaquel no hay ninguna, o están en otro cajón.',
      frecuente: true,
      matices: [{ id: 'sistema', pregunta: '¿Lleva sus existencias en algún sistema?', si: 'Existencias en sistema', no: 'Existencias de memoria' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Lo que llega del proveedor y lo que sale se registra con el celular. Lo que dice la pantalla es lo que hay en el cajón.' },
        { sol: 'punto-de-venta', para: 'Cada venta descuenta la pieza en el momento. Las existencias dejan de depender de capturar las notas en la noche.', pide: { sistema: false } },
        { sol: 'merma', para: 'Lo roto, lo devuelto y lo que se usó en la tienda se anota con su motivo. Son las piezas que el sistema cree que siguen ahí.', pide: { sistema: true } },
        { sol: 'checklist-turnos', para: 'Lo mínimo: contar un anaquel al día, al abrir. En unos meses se recorrió la tienda sin cerrar por inventario.' },
      ],
    },
    {
      id: 'falta-lo-que-sale',
      area: 'inventarios',
      titulo: 'Se me acaba lo que más sale y me sobra lo que no',
      senal: 'Falta el codo de media o el cemento en plena temporada, y la bodega guarda piezas que llevan años.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Sus ventas quedan registradas artículo por artículo?', si: 'Ventas por artículo', no: 'Notas sin detalle' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada artículo con su mínimo. Cuando quedan menos de cuarenta bultos de cemento, usted se entera antes del sábado.' },
        { sol: 'compras-sugeridas', para: 'El pedido al proveedor se arma con lo que salió. Antes de las lluvias sugiere impermeabilizante, porque el año pasado se vendió.', pide: { registro: true } },
        { sol: 'tablero-ventas', para: 'Lo que más sale junto a lo que lleva un año sin moverse. Se decide qué rematar para hacerle lugar a lo que sí se vende.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con lo que pidieron y no había. Esa lista es su próximo pedido.' },
      ],
    },
    {
      id: 'granel-no-cuadra',
      area: 'inventarios',
      titulo: 'Lo que se vende por metro o por kilo nunca cuadra',
      senal: 'Cable, manguera, cadena y clavo: se da "un poquito más", quedan retazos y el rollo rinde menos de lo que debía.',
      matices: [{ id: 'retazos', pregunta: '¿Se le juntan retazos que ya no se venden?', si: 'Se juntan retazos', no: 'Casi no quedan retazos' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Se cobra por fracción: 3.5 metros de cable, 300 gramos de clavo. El rollo se descuenta por lo que de verdad salió.' },
        { sol: 'merma', para: 'El retazo que ya no se vende y el metro de cortesía se anotan. A fin de mes sabe cuánto rollo se fue sin cobrarse.', pide: { retazos: true } },
        { sol: 'costeo', para: 'El precio por metro se calcula contando lo que se pierde al cortar. El rollo completo vuelve a dejar lo que debe.' },
        { sol: 'proceso-claro', para: 'Una regla de corte para todos: se mide en la marca del mostrador, se cobra lo medido y el retazo va a un cajón con precio.' },
      ],
    },

    // ── Administración ──
    {
      id: 'credito-a-maestros',
      area: 'administracion',
      titulo: 'Les doy crédito a los maestros y batallo para cobrar',
      senal: 'Notas firmadas en una caja. Cada sábado hay que sumar quién debe, de qué obra y desde cuándo.',
      frecuente: true,
      matices: [
        { id: 'vendedores', pregunta: '¿Sus vendedores dan crédito sin preguntarle a usted?', si: 'El mostrador da crédito', no: 'Solo el dueño autoriza' },
        { id: 'transfer', pregunta: '¿Sus clientes de crédito suelen pagar por transferencia?', si: 'Pagan por transferencia', no: 'Pagan en efectivo' },
      ],
      rutas: [
        { sol: 'fiado', para: 'Cada contratista con su cuenta: notas, abonos y saldo, con la obra anotada. El sábado de raya ya está sumado.' },
        { sol: 'base-clientes', para: 'En la ficha del contratista queda su límite y su plazo. El vendedor sabe si puede darle otra nota sin buscarlo a usted.', pide: { vendedores: true } },
        { sol: 'cobro-en-linea', para: 'La constructora paga con un enlace y el abono cae a su cuenta. Nadie carga efectivo de la obra a la tienda.', pide: { transfer: true } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con las notas de crédito que se dieron hoy y los saldos que ya pasaron de un mes.' },
      ],
    },
    {
      id: 'notas-a-mano',
      area: 'administracion',
      titulo: 'Las notas se hacen a mano y al final del día no cuadran',
      senal: 'Hay notas sin precio, sumas mal hechas y ventas chicas que nadie anotó. El total del día es un aproximado.',
      matices: [{ id: 'varios', pregunta: '¿Cobran varios vendedores en la misma caja?', si: 'Varios cobran', no: 'Cobra una sola persona' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'La nota sale con precio y suma correctos, y queda quién vendió. También el tornillo de tres pesos.' },
        { sol: 'corte-de-caja', para: 'Al cerrar se compara lo vendido con lo contado, por vendedor. Si falta, se sabe en qué turno y no se reparte la sospecha.', pide: { varios: true } },
        { sol: 'tablero-ventas', para: 'La venta del día en su teléfono, separada en contado y crédito. No hay que esperar a sumar el bloc de notas.' },
        { sol: 'checklist-turnos', para: 'Un cierre con pasos fijos: juntar notas, contar, anotar el total y firmar quien cerró.' },
      ],
    },

    // ── Logística ──
    {
      id: 'material-a-obra',
      area: 'logistica',
      titulo: 'El material llega tarde a la obra, o incompleto',
      senal: 'La camioneta sale con tres entregas, falta un bulto en una y el maestro llama cada media hora a preguntar.',
      matices: [{ id: 'camioneta', pregunta: '¿Reparte con camioneta y chofer propios?', si: 'Reparto propio', no: 'Fletes por fuera' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada envío en un tablero: surtido, cargado, en camino, entregado. Se ve qué va en cada vuelta de la camioneta.' },
        { sol: 'rastreo-cliente', para: 'El maestro recibe un enlace y ve que su material ya va en camino. Deja de llamar al mostrador a preguntar.', pide: { camioneta: true } },
        { sol: 'agenda-interna', para: 'Las entregas del día con hora y obra. Antes de prometer "le llega a las diez", el vendedor ve si la camioneta está libre.' },
        { sol: 'formatos-digitales', para: 'Quien recibe en la obra firma en el celular del chofer. Queda qué se entregó, a quién y a qué hora.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'foto-de-la-pieza',
      area: 'comunicacion',
      titulo: 'Me mandan la foto de la pieza y nadie contesta a tiempo',
      senal: 'El WhatsApp suena todo el día: "¿tiene de esta?", "¿a cómo?". Se contesta cuando el mostrador se vacía.',
      frecuente: true,
      matices: [{ id: 'encargado', pregunta: '¿Hay una persona encargada de contestar los mensajes?', si: 'Alguien atiende el WhatsApp', no: 'Contesta quien pueda' }],
      rutas: [
        { sol: 'whatsapp-pedidos', para: 'El cliente manda foto, medida y cantidad siguiendo una guía. El mensaje llega completo y se contesta una sola vez.' },
        { sol: 'respuesta-automatica', para: 'Horario, ubicación, si hay envío a obra y si se hacen llaves se contesta solo. La foto de la pieza pasa a un vendedor.', pide: { encargado: false } },
        { sol: 'catalogo-whatsapp', para: 'Lo que más piden, con foto, medida y precio en un enlace. Muchos "¿a cómo?" se contestan antes de escribirse.' },
        { sol: 'respuestas-rapidas', para: 'Las respuestas de siempre, ya escritas: "sí hay, cuesta tanto, se lo aparto hasta las seis". En un toque.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'precio-de-antes',
      area: 'rentabilidad',
      titulo: 'El proveedor sube precios y yo sigo vendiendo al de antes',
      senal: 'El acero y el cobre se mueven cada semana. Llega la lista nueva y los precios del mostrador siguen igual.',
      matices: [{ id: 'listas', pregunta: '¿Sus proveedores le mandan las listas de precios en archivo?', si: 'Listas en archivo', no: 'Listas impresas o por teléfono' }],
      rutas: [
        { sol: 'costeo', para: 'Cada artículo con su costo actual y lo que deja. Cuando sube la varilla, se ve en cuáles ya está vendiendo casi al costo.' },
        { sol: 'inventario-escaner', para: 'Al recibir mercancía se captura el costo de la factura. Si subió, el artículo queda marcado para revisar su precio.', pide: { listas: false } },
        { sol: 'tablero-ventas', para: 'Qué líneas dejan más y cuáles solo mueven dinero: la herramienta contra el cemento, lado a lado.' },
        { sol: 'menu-digital', para: 'Una sola lista de precios que todos consultan en el celular. Usted la corrige y al minuto el mostrador cobra lo nuevo.' },
      ],
    },
  ],
}
