// Papelería, mercería, regalos, copias e impresiones: temporada escolar, miles de artículos baratos y trabajos por encargo.

export default {
  id: 'papeleria',
  familia: 'tiendas',
  nombre: 'Papelería o regalos',
  plural: 'papelerías',
  icono: 'papeleria',
  acento: '#1d5673',
  vocab: {
    producto: 'artículo',
    productos: 'artículos',
    cita: 'entrega',
    citas: 'entregas',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Cuando llega agosto y empiezan las listas de útiles, ¿cómo le hacen para atender a todos?',
  observa: [
    'Si los artículos tienen el precio a la vista o hay que preguntárselo a alguien.',
    'Si hay gente esperando copias mientras otros solo quieren pagar.',
    'Si los encargos están en una libreta, en papelitos pegados o en la memoria de alguien.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Cuaderno profesional 100 hojas', precio: 38, categoria: 'Escolar' },
      { nombre: 'Lápiz del número 2', precio: 6, categoria: 'Escolar' },
      { nombre: 'Caja de 12 colores', precio: 45, categoria: 'Escolar' },
      { nombre: 'Juego de geometría', precio: 35, categoria: 'Escolar' },
      { nombre: 'Pegamento en barra', precio: 18, categoria: 'Escolar' },
      { nombre: 'Cartulina blanca', precio: 8, categoria: 'Manualidades' },
      { nombre: 'Papel china (pliego)', precio: 3, categoria: 'Manualidades' },
      { nombre: 'Hoja de foami', precio: 7, categoria: 'Manualidades' },
      { nombre: 'Silicón frío', precio: 28, categoria: 'Manualidades' },
      { nombre: 'Paquete de 500 hojas carta', precio: 115, categoria: 'Oficina' },
      { nombre: 'Folder tamaño carta', precio: 4, categoria: 'Oficina' },
      { nombre: 'Bolígrafo punto medio', precio: 8, categoria: 'Oficina' },
      { nombre: 'Bolsa de regalo mediana', precio: 22, categoria: 'Regalos' },
      { nombre: 'Globo metálico', precio: 45, categoria: 'Regalos' },
    ],
    servicios: [
      { nombre: 'Lista de útiles surtida', precio: 0, minutos: 30 },
      { nombre: 'Impresión de trabajo escolar', precio: 20, minutos: 10 },
      { nombre: 'Engargolado', precio: 35, minutos: 15 },
      { nombre: 'Forrado de cuadernos (10 piezas)', precio: 150, minutos: 60 },
      { nombre: 'Arreglo de regalo por encargo', precio: 180, minutos: 30 },
      { nombre: 'Entrega a domicilio', precio: 30, minutos: 40 },
    ],
    personal: ['Elvira', 'Paco', 'Yesenia', 'Dani'],
    clientes: ['Mtra. Lourdes', 'Sra. Chávez', 'Primaria Benito Juárez', 'Despacho Contreras', 'Fernanda Guzmán', 'Don Arturo'],
    insumos: [
      { nombre: 'Hojas blancas carta', unidad: 'paquetes', hay: 6, minimo: 10 },
      { nombre: 'Tóner negro', unidad: 'pzas', hay: 1, minimo: 2 },
      { nombre: 'Cartulina blanca', unidad: 'pzas', hay: 140, minimo: 100 },
      { nombre: 'Papel china surtido', unidad: 'pliegos', hay: 300, minimo: 200 },
      { nombre: 'Cuaderno profesional', unidad: 'pzas', hay: 85, minimo: 60 },
      { nombre: 'Pegamento en barra', unidad: 'pzas', hay: 30, minimo: 24 },
      { nombre: 'Arillos para engargolar', unidad: 'pzas', hay: 60, minimo: 50 },
      { nombre: 'Plástico para forrar', unidad: 'rollos', hay: 9, minimo: 6 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'fila-regreso-a-clases',
      area: 'atencion',
      titulo: 'En regreso a clases la fila sale hasta la calle',
      senal: 'Cada lista de útiles se surte pieza por pieza en el mostrador. Los demás esperan con la suya en la mano.',
      frecuente: true,
      matices: [{ id: 'dejan', pregunta: '¿Los papás le dejarían la lista para pasar después?', si: 'Dejarían la lista', no: 'Quieren surtirla en el momento' }],
      rutas: [
        { sol: 'pedidos-mostrador', para: 'El papá manda la lista desde su casa y pasa por la bolsa ya surtida, con el nombre del niño y el total. No se forma.', pide: { dejan: true } },
        { sol: 'punto-de-venta', para: 'Una lista de cuarenta artículos se cobra escaneando, sin sumar en la calculadora. El cobro deja de ser lo que detiene la fila.' },
        { sol: 'pantalla-turnos', para: 'Cada quien toma su turno y ve cuántos faltan. Quien espera puede ir por los uniformes y volver cuando le toque.' },
        { sol: 'roles-horarios', para: 'Lo mínimo: las semanas fuertes con horario reforzado y puestos fijos. Quién surte listas, quién cobra y quién saca copias.' },
      ],
    },
    {
      id: 'copias-atoran',
      area: 'atencion',
      titulo: 'Las copias e impresiones me atoran el mostrador',
      senal: 'Archivos que llegan por WhatsApp, por correo y en memoria. Mientras se imprimen, nadie cobra ni despacha.',
      frecuente: true,
      matices: [{ id: 'whats', pregunta: '¿La mayoría le manda sus archivos por WhatsApp?', si: 'Archivos por WhatsApp', no: 'Llegan con memoria o en papel' }],
      rutas: [
        { sol: 'whatsapp-pedidos', para: 'Quien manda su archivo sigue una guía: tamaño, color, cuántos juegos y a qué hora pasa. Ya no hay que preguntarle todo de vuelta.', pide: { whats: true } },
        { sol: 'pantalla-cocina', para: 'Los trabajos de impresión en una fila, con su hora de entrega. Se ve cuál va primero y de quién es cada archivo.' },
        { sol: 'aviso-listo', para: 'Cuando la tesis queda engargolada, quien atiende el mostrador recibe el aviso. Nadie va hasta la copiadora a preguntar si ya salió.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: una respuesta ya escrita con el precio por hoja y los datos que hacen falta. Se envía en cuanto llega un archivo.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'cotizan-y-se-van',
      area: 'clientes',
      titulo: 'Cotizo listas de útiles y luego compran en otro lado',
      senal: 'Media hora sumando una lista para que el papá compare. Si no vuelve, nadie sabe por qué ni le da seguimiento.',
      matices: [
        { id: 'repiten', pregunta: '¿Las escuelas de por aquí piden casi la misma lista cada año?', si: 'Listas que se repiten', no: 'Cada lista es distinta' },
        { id: 'anticipo', pregunta: '¿Los papás apartarían su lista con un anticipo?', si: 'Apartarían con anticipo', no: 'Pagan todo al recoger' },
      ],
      rutas: [
        { sol: 'cotizador', para: 'La lista se cotiza en un minuto y se envía por WhatsApp, con el total y hasta qué día se respeta el precio.' },
        { sol: 'seguimiento-prospectos', para: 'Cada lista cotizada queda anotada con su teléfono. A los dos días se le escribe a quien no volvió, cuando todavía no compra.' },
        { sol: 'anticipo-reserva', para: 'Quien acepta la cotización aparta con un anticipo. La lista se surte con calma y esa venta ya no se va a comparar a otra parte.', pide: { anticipo: true } },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: el paquete de cada grado de las escuelas cercanas en un enlace, con su precio. El papá lo ve sin pedir cotización.', pide: { repiten: true } },
      ],
    },
    {
      id: 'fuera-de-temporada',
      area: 'clientes',
      titulo: 'Pasando el regreso a clases la venta se cae',
      senal: 'Agosto y septiembre sostienen el año. El resto son compras de diez pesos y copias sueltas.',
      matices: [{ id: 'maestros', pregunta: '¿Tiene el contacto de maestros u oficinas que le compran?', si: 'Tiene contacto de maestros', no: 'No guarda contactos' }],
      rutas: [
        { sol: 'promos-segmentadas', para: 'Antes del Día de Muertos o del festival de primavera, el aviso de material les llega a las maestras que compran para su grupo.', pide: { maestros: true } },
        { sol: 'sitio-web', para: 'Una página con lo que no se ve desde la calle: lonas, sellos, tesis, surtido a oficinas, y cómo pedir cada cosa.' },
        { sol: 'tarjeta-lealtad', para: 'Un sello por cada compra o por cada cincuenta copias. El estudiante que imprime cada semana tiene motivo para volver aquí.' },
        { sol: 'perfil-google', para: 'Lo primero: aparecer cuando buscan "impresiones cerca" o "papelería abierta", con el horario real y los servicios.' },
      ],
    },

    // ── Organización ──
    {
      id: 'solo-yo-precios',
      area: 'organizacion',
      titulo: 'Solo yo me sé los precios',
      senal: 'Miles de artículos sin etiqueta. Quien ayuda en el mostrador pregunta a gritos o cobra lo que se acuerda.',
      frecuente: true,
      matices: [{ id: 'codigo', pregunta: '¿La mayoría de sus artículos trae código de barras?', si: 'Artículos con código', no: 'Mucho suelto o sin código' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Se escanea el artículo y sale el precio. Quien entró ayer a trabajar cobra igual que usted, sin preguntar.', pide: { codigo: true } },
        { sol: 'inventario-escaner', para: 'Cuando llega mercancía, se escanea y se captura su precio una sola vez. Si el proveedor sube, se cambia ahí y vale para todos.', pide: { codigo: true } },
        { sol: 'proceso-claro', para: 'Acordar cómo se marca el precio al acomodar: por charola, por anaquel o por pieza. Que todo lo exhibido lo traiga.', pide: { codigo: false } },
        { sol: 'menu-digital', para: 'Lo mínimo: una lista de precios en el celular del mostrador. Se busca "papel china" o "listón por metro" y sale el precio.' },
      ],
    },
    {
      id: 'encargos-se-pasan',
      area: 'organizacion',
      titulo: 'Me encargan cosas y se me pasa pedirlas',
      senal: 'Un sello, unas invitaciones, un arreglo para el viernes. El encargo quedó en un papelito y el cliente ya llegó por él.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pediría anticipo para tomar un encargo?', si: 'Anticipo aceptado', no: 'Sin anticipo' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada encargo con su orden: qué se pidió, cuánto dejó y para cuándo. Al llegar la mercancía, el cliente recibe su aviso.' },
        { sol: 'cobro-en-linea', para: 'El anticipo se paga con un enlace al encargar. El sello personalizado no se manda a hacer hasta que está apartado.', pide: { anticipo: true } },
        { sol: 'recordatorios', para: 'Si el encargo llegó y nadie pasa, a los tres días sale un recordatorio. Ya no se queda arrumbado bajo el mostrador.' },
        { sol: 'agenda-interna', para: 'Lo mínimo: los encargos en una agenda por fecha de entrega, a la vista de todos. El viernes se sabe qué tiene que estar listo.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'se-acaba-lo-basico',
      area: 'inventarios',
      titulo: 'Se acaba lo que más piden y me entero cuando lo piden',
      senal: 'Hojas blancas, cartulina, tóner. Lo básico falta justo el día que media escuela tiene tarea.',
      frecuente: true,
      matices: [{ id: 'registro', pregunta: '¿Alguien anota lo que se va acabando?', si: 'Hay libreta de faltantes', no: 'Se surte "a ojo"' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'No hace falta inventariar todo: solo los cincuenta artículos que no pueden faltar. Si las hojas bajan de diez paquetes, llega el aviso.' },
        { sol: 'compras-sugeridas', para: 'Según lo que salió en la semana, se arma la lista para el proveedor. El viaje a surtir se hace con la cuenta ya hecha.' },
        { sol: 'inventario-escaner', para: 'Lo que entra del proveedor se registra con el celular al recibirlo. La libreta de faltantes se vuelve existencia real.', pide: { registro: true } },
        { sol: 'bitacora-turno', para: 'Lo mínimo: quien nota que queda poco papel lustre lo anota en el celular, y lo ve quien surte. Para empezar sin contar nada.', pide: { registro: false } },
      ],
    },
    {
      id: 'bodega-sin-contar',
      area: 'inventarios',
      titulo: 'Compro cosas que ya tenía arrumbadas en la bodega',
      senal: 'Cajas de temporadas pasadas hasta el techo. Nadie sabe qué hay ahí hasta que aparece buscando otra cosa.',
      matices: [{ id: 'codigo', pregunta: '¿Esa mercancía guardada trae código de barras?', si: 'Mercancía con código', no: 'Sin código o surtida' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'La bodega se cuenta por secciones con el celular, una caja a la vez. Queda anotado qué hay y en qué anaquel está.', pide: { codigo: true } },
        { sol: 'tablero-ventas', para: 'Se ve qué artículos sí rotan. Lo que lleva un año sin venderse deja de resurtirse por costumbre y ya no llega a la bodega.' },
        { sol: 'compras-sugeridas', para: 'Antes de pedir mercancía de temporada, la lista descuenta lo que ya hay guardado. No se compra moño navideño si quedan dos cajas.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: ordenar la bodega por temporada y rotular cada caja con lo que trae. Un sábado de trabajo, sin sistema todavía.' },
      ],
    },

    // ── Administración ──
    {
      id: 'caja-al-cerrar',
      area: 'administracion',
      titulo: 'Cuento la caja al cerrar y no sé si está completa',
      senal: 'Cientos de ventas chicas sin nota, más recargas y copias. Lo que hay en el cajón es lo único que se sabe.',
      frecuente: true,
      matices: [{ id: 'varios', pregunta: '¿Cobra más de una persona en el día?', si: 'Varias personas cobran', no: 'Una sola persona cobra' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta, aunque sea de un lápiz, queda registrada con quién la cobró. El total del día ya no depende del cajón.', pide: { varios: true } },
        { sol: 'corte-de-caja', para: 'Al cerrar, el sistema dice cuánto debe haber. Se cuenta, y si faltan cuarenta pesos, se ve en qué turno fue.' },
        { sol: 'tablero-ventas', para: 'La venta del día en su teléfono mientras ocurre. Si sale a surtir, sabe cómo va el mostrador sin llamar.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: un cierre con pasos fijos: contar, anotar el fondo, separar recargas. Con la hora y el nombre de quien cerró.' },
      ],
    },
    {
      id: 'escuelas-a-credito',
      area: 'administracion',
      titulo: 'Les surto a escuelas y oficinas y tardan en pagar',
      senal: 'Pedidos grandes a crédito y con factura. Las notas se juntan y nadie lleva la cuenta de quién debe qué.',
      matices: [{ id: 'cotiza', pregunta: '¿Le piden cotización formal antes de comprar?', si: 'Piden cotización formal', no: 'Compran de palabra' }],
      rutas: [
        { sol: 'fiado', para: 'Cada escuela y cada despacho con su cuenta: notas, abonos y saldo. Se cobra con el estado de cuenta en la mano.' },
        { sol: 'cotizador', para: 'La dirección pide cotización y sale en un minuto, con sus precios y lista para autorizarse. Lo cotizado es lo que después se cobra.', pide: { cotiza: true } },
        { sol: 'cobro-en-linea', para: 'El saldo se envía con un enlace para pagar. El pago queda aplicado a esa cuenta, sin buscarlo después en el banco.' },
        { sol: 'base-clientes', para: 'Lo mínimo: una ficha por cliente con sus datos de facturación y quién autoriza los pagos. No se piden otra vez en cada compra.' },
      ],
    },

    // ── Logística ──
    {
      id: 'entregas-dias-fuertes',
      area: 'logistica',
      titulo: 'El 14 de febrero y el 10 de mayo se cruzan las entregas',
      senal: 'Arreglos y regalos a domicilio con hora prometida. Alguno sale tarde o llega a la dirección equivocada.',
      matices: [{ id: 'reparto', pregunta: '¿Entrega con repartidor propio?', si: 'Reparto propio', no: 'Sin repartidor fijo' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada regalo con su etapa: por armar, listo, en camino, entregado. A mediodía se ve cuáles faltan y a qué hora se prometieron.' },
        { sol: 'rastreo-cliente', para: 'Quien mandó el regalo ve cuando ya se entregó. No llama tres veces a preguntar si ya llegó la sorpresa.', pide: { reparto: true } },
        { sol: 'cobro-en-linea', para: 'El arreglo se paga con un enlace al pedirlo. El día fuerte solo se arma y se entrega; nadie cobra en la puerta.' },
        { sol: 'agenda-interna', para: 'Lo mínimo: las entregas del día en una agenda, por hora y colonia. Se ve cuándo ya no cabe otra a las dos de la tarde.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'preguntan-si-tengo',
      area: 'comunicacion',
      titulo: 'Me escriben para preguntar si tengo tal cosa',
      senal: '"¿Tiene la monografía del sistema solar?", "¿a cómo las copias?". Contestar le quita tiempo al mostrador.',
      matices: [{ id: 'servicios', pregunta: '¿Lo que más preguntan son precios de copias e impresiones?', si: 'Preguntan por servicios', no: 'Preguntan por artículos' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'Horario y precios de copias, impresión a color y engargolado se contestan solos. A usted le llega lo que hay que ir a buscar.', pide: { servicios: true } },
        { sol: 'catalogo-whatsapp', para: 'Lo que más buscan, en un enlace: monografías, mapas, material para maquetas. Quien lo abre ve si lo hay y lo aparta.', pide: { servicios: false } },
        { sol: 'perfil-google', para: 'Parte de los mensajes es para saber si está abierto. Con el horario real en Google, sábados y vacaciones incluidos, muchos sobran.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: las respuestas de siempre ya escritas. Quien tenga el celular contesta con un toque y vuelve al mostrador.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'sobra-de-temporada',
      area: 'rentabilidad',
      titulo: 'Lo que sobra de temporada se queda un año guardado',
      senal: 'Peluches de febrero, mochilas de agosto, adornos de diciembre. Se compró de más y es dinero dormido.',
      matices: [{ id: 'registro', pregunta: '¿Tiene anotado cuánto vendió la temporada pasada?', si: 'Tiene sus ventas anotadas', no: 'Compra de memoria' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada venta de temporada queda registrada. El año que entra, la compra de San Valentín se hace con el número de este año.', pide: { registro: false } },
        { sol: 'tablero-ventas', para: 'Durante la temporada se ve qué sale y qué no. Lo que va lento se rebaja el 10 de febrero, no el 15, cuando ya pasó.' },
        { sol: 'promos-segmentadas', para: 'El remate le llega a quien compra regalos o a las maestras que decoran salón. Se mueve esa semana, no el año siguiente.' },
        { sol: 'catalogo-whatsapp', para: 'Lo mínimo: un catálogo de remate con lo que quedó, compartido por WhatsApp y en sus estados antes de guardarlo.' },
      ],
    },
    {
      id: 'ventas-de-a-diez',
      area: 'rentabilidad',
      titulo: 'Vendo todo el día y son puras ventas de a diez pesos',
      senal: 'Mucho movimiento en el mostrador y poca utilidad. No se sabe si dejan más las copias, los útiles o los regalos.',
      matices: [{ id: 'costo', pregunta: '¿Sabe cuánto le cuesta cada copia o impresión?', si: 'Conoce su costo por copia', no: 'El precio se puso "a ojo"' }],
      rutas: [
        { sol: 'costeo', para: 'Cada copia con su costo: papel, tóner y la renta de la copiadora. Se ve si la impresión a color deja o solo desgasta el equipo.', pide: { costo: false } },
        { sol: 'tablero-ventas', para: 'Copias, útiles, regalos y recargas, lado a lado. Se ve qué parte del mostrador paga la renta.' },
        { sol: 'punto-de-venta', para: 'Con cada venta registrada por tipo, las ventas chicas dejan de ser un montón de monedas y se vuelven un número.' },
        { sol: 'reporte-diario', para: 'Lo mínimo: cada noche, un mensaje con lo vendido y lo que dejó. Un mes de esos mensajes ya dice dónde está el negocio.' },
      ],
    },
  ],
}
