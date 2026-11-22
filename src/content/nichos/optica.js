// Óptica: examen de la vista, armazones en exhibición, trabajos de laboratorio, apartados y abonos.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").

export default {
  id: 'optica',
  familia: 'salud',
  nombre: 'Óptica',
  plural: 'ópticas',
  icono: 'optica',
  acento: '#34407a',
  orden: 30,
  // En mostrador se le dice "cliente"; la palabra de fábrica se conserva.
  vocab: {
    cliente: 'el cliente',
    clientes: 'los clientes',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos que tiene bastante armazón en exhibición. ¿Cuánto tarda hoy en entregar unos lentes?',
  observa: [
    'Cuántos armazones hay en exhibición y si cada uno tiene etiqueta con precio o código.',
    'Si hay un cajón o una repisa con trabajos terminados esperando a que los recojan.',
    'Cómo se cotiza: de memoria, con lista impresa o con calculadora.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Armazón de acetato', precio: 1200, categoria: 'Armazones' },
      { nombre: 'Armazón metálico', precio: 950, categoria: 'Armazones' },
      { nombre: 'Armazón infantil flexible', precio: 850, categoria: 'Armazones' },
      { nombre: 'Armazón de marca', precio: 2800, categoria: 'Armazones' },
      { nombre: 'Micas monofocales', precio: 700, categoria: 'Micas' },
      { nombre: 'Micas bifocales', precio: 1300, categoria: 'Micas' },
      { nombre: 'Micas progresivas', precio: 3200, categoria: 'Micas' },
      { nombre: 'Antirreflejante', precio: 450, categoria: 'Tratamientos' },
      { nombre: 'Filtro de luz azul', precio: 550, categoria: 'Tratamientos' },
      { nombre: 'Fotocromático', precio: 900, categoria: 'Tratamientos' },
      { nombre: 'Lentes de contacto mensuales', precio: 650, categoria: 'Contacto y accesorios' },
      { nombre: 'Solución multipropósito', precio: 180, categoria: 'Contacto y accesorios' },
      { nombre: 'Estuche rígido', precio: 120, categoria: 'Contacto y accesorios' },
      { nombre: 'Líquido limpiador', precio: 80, categoria: 'Contacto y accesorios' },
    ],
    servicios: [
      { nombre: 'Examen de la vista', precio: 150, minutos: 20 },
      { nombre: 'Adaptación de lentes de contacto', precio: 350, minutos: 40 },
      { nombre: 'Entrega y ajuste de lentes', precio: 0, minutos: 15 },
      { nombre: 'Ajuste y limpieza de armazón', precio: 0, minutos: 10 },
      { nombre: 'Reparación de armazón', precio: 120, minutos: 20 },
    ],
    personal: ['Patricia', 'Héctor', 'Mónica', 'Saúl'],
    clientes: ['Sra. Aguilar', 'Rubén Cisneros', 'Mtra. Olivia', 'Don Joaquín', 'Ximena Robles', 'Familia Nava'],
    insumos: [
      { nombre: 'Armazón de acetato', unidad: 'pzas', hay: 38, minimo: 30 },
      { nombre: 'Armazón infantil flexible', unidad: 'pzas', hay: 6, minimo: 12 },
      { nombre: 'Lentes de contacto mensuales', unidad: 'cajas', hay: 4, minimo: 8 },
      { nombre: 'Solución multipropósito', unidad: 'pzas', hay: 15, minimo: 10 },
      { nombre: 'Estuches rígidos', unidad: 'pzas', hay: 60, minimo: 40 },
      { nombre: 'Paños de microfibra', unidad: 'pzas', hay: 120, minimo: 80 },
      { nombre: 'Plaquetas', unidad: 'pares', hay: 45, minimo: 30 },
      { nombre: 'Tornillos surtidos', unidad: 'juegos', hay: 12, minimo: 6 },
    ],
  },

  problemas: [
    // ── Logística ──
    {
      id: 'ya-estan-mis-lentes',
      area: 'logistica',
      titulo: 'Llaman a preguntar si ya están sus lentes',
      senal: 'Se prometió una fecha, el laboratorio se atrasó y el cliente se entera hasta que viene.',
      frecuente: true,
      matices: [{ id: 'lab', pregunta: '¿Manda las micas a un laboratorio de fuera?', si: 'Laboratorio externo', no: 'Bisela en la óptica' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada trabajo con su orden: graduación, armazón, laboratorio y fecha prometida. Cuando los lentes llegan, el cliente recibe el aviso.' },
        { sol: 'rastreo-cliente', para: 'El cliente abre su enlace y ve en qué van: en laboratorio, en biselado, listos para recoger. Sin llamar.' },
        { sol: 'seguimiento-pedidos', para: 'Todos los trabajos en un tablero. Se ve cuáles llevan más de cinco días en el laboratorio y hay que reclamar.', pide: { lab: true } },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: dos mensajes ya escritos, "sus lentes están listos" y "el laboratorio se atrasó un día". Avisar antes de que pregunten.' },
      ],
    },
    {
      id: 'trabajo-se-repite',
      area: 'logistica',
      titulo: 'Llegan mal los lentes y hay que repetir el trabajo',
      senal: 'Una graduación mal copiada o un tratamiento que no era. Se descubre con el cliente enfrente.',
      matices: [{ id: 'mano', pregunta: '¿La orden al laboratorio se llena a mano?', si: 'Orden a mano', no: 'Orden capturada' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'La graduación se captura una vez, en el examen, y de ahí pasa a la orden. Nadie la vuelve a copiar a mano.', pide: { mano: true } },
        { sol: 'expediente-cliente', para: 'Graduación, distancia entre pupilas y altura quedan en la ficha del cliente. La siguiente orden sale de ahí, no de la memoria.' },
        { sol: 'merma', para: 'Cada trabajo repetido se anota con su motivo: captura, laboratorio o medida. Se ve de dónde vienen los errores y cuánto cuestan.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: al recibir del laboratorio, una lista: graduación, tratamiento, centrado. Se revisa antes de avisar al cliente.' },
      ],
    },

    // ── Administración ──
    {
      id: 'lentes-no-recogen',
      area: 'administracion',
      titulo: 'Hay lentes terminados que nadie recoge',
      senal: 'Trabajos con medio anticipo que llevan meses en el cajón, con el laboratorio ya pagado.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pide al menos la mitad de anticipo?', si: 'Anticipo de la mitad o más', no: 'Anticipo chico o sin anticipo' }],
      rutas: [
        { sol: 'fiado', para: 'Cada apartado con su saldo y la fecha en que quedó listo. Se ve cuánto dinero está detenido en el cajón de entregas.' },
        { sol: 'cobro-en-linea', para: 'El saldo se liquida con un enlace y los lentes los recoge quien sea, o se le envían. Se acaba el "no he podido pasar".' },
        { sol: 'recordatorios', para: 'Al quedar listos sale el aviso. Si no pasa, llega otro a la semana y otro al mes, amables y con el saldo pendiente.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: una regla de anticipo que cubra al menos el laboratorio, escrita en la nota. Hoy depende de quién atienda.', pide: { anticipo: false } },
      ],
    },
    {
      id: 'abonos-en-notas',
      area: 'administracion',
      titulo: 'Vendo a pagos y pierdo la cuenta de los abonos',
      senal: 'Notas de remisión con los abonos anotados al reverso. Si se pierde la nota, se pierde la cuenta.',
      matices: [{ id: 'credito', pregunta: '¿Entrega los lentes antes de que terminen de pagar?', si: 'Entrega y cobra después', no: 'Entrega hasta liquidar' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Quien ya se llevó sus lentes y paga por quincena aparece en una lista: cuánto resta, cuándo le toca y quién se atrasó.', pide: { credito: true } },
        { sol: 'fiado', para: 'Cada nota con sus abonos y su saldo. El cliente pregunta cuánto debe y la respuesta no depende de encontrar un papel.' },
        { sol: 'punto-de-venta', para: 'Cada abono se cobra con recibo y baja del saldo en el momento. El cliente se lleva su comprobante y usted el registro.' },
        { sol: 'reporte-diario', para: 'Cada noche: cuánto entró por ventas, cuánto por abonos y qué saldos vencen en la semana.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'vuelven-hasta-romperlos',
      area: 'clientes',
      titulo: 'El cliente vuelve hasta que se le rompen los lentes',
      senal: 'El examen que usted recomienda cada año no se hace. Pasan tres o cuatro, o regresa con otra óptica.',
      frecuente: true,
      matices: [{ id: 'fecha', pregunta: '¿Tiene la fecha del último examen de cada cliente?', si: 'Tiene fecha del último examen', no: 'No lleva ese registro' }],
      rutas: [
        { sol: 'reactivacion', para: 'Al cumplirse un año del examen, el sistema prepara la invitación a revisión con el nombre del cliente. Usted decide cuándo sale.', pide: { fecha: true } },
        { sol: 'promos-segmentadas', para: 'En agosto, antes del regreso a clases, una invitación solo para las familias con niños que usan lentes.' },
        { sol: 'agenda-en-linea', para: 'La invitación lleva un enlace para apartar el examen. Del mensaje a la cita hay un toque, no una llamada.' },
        { sol: 'base-clientes', para: 'Para empezar: cada cliente con su teléfono y la fecha de su último examen. Sin esa lista no hay a quién invitar.', pide: { fecha: false } },
      ],
    },
    {
      id: 'cadenas-dos-por-uno',
      area: 'clientes',
      titulo: 'Las cadenas con su 2x1 se llevan a la gente',
      senal: 'El cliente compara por precio y por anuncio. Lo que usted hace mejor no se ve desde la calle.',
      matices: [{ id: 'google', pregunta: '¿Tiene su ficha de Google al día?', si: 'Aparece bien en Google', no: 'Casi no aparece en línea' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página que explica lo que la cadena no: quién hace el examen, qué incluye cada paquete y cuánto cuesta ya completo.' },
        { sol: 'tarjeta-lealtad', para: 'Quien ya le compró tiene motivo para volver: ajustes y limpiezas registrados en su tarjeta y beneficio en el segundo par.' },
        { sol: 'resenas', para: 'Al entregar los lentes, una invitación a opinar. La atención que usted da empieza a verse en Google.' },
        { sol: 'perfil-google', para: 'Lo primero: aparecer al buscar "óptica" con horario, fotos del local y teléfono. Hoy aparece la cadena y usted no.', pide: { google: false } },
      ],
    },

    // ── Atención ──
    {
      id: 'cotizar-tarda',
      area: 'atencion',
      titulo: 'Cotizar unos lentes tarda y a veces sale mal la cuenta',
      senal: 'Armazón, tipo de mica y tratamientos: se suma con calculadora y lista de precios en mano.',
      frecuente: true,
      matices: [{ id: 'dueno', pregunta: '¿Solo usted se sabe bien los precios?', si: 'Solo el dueño cotiza bien', no: 'Todo el equipo cotiza' }],
      rutas: [
        { sol: 'cotizador', para: 'Armazón, mica y tratamiento se eligen en pantalla y el total sale solo. El cliente se lleva dos opciones por WhatsApp.' },
        { sol: 'punto-de-venta', para: 'Los precios viven en el sistema, no en una lista impresa. Lo cotizado se cobra tal cual, con su anticipo y su saldo.' },
        { sol: 'seguimiento-prospectos', para: 'Quien cotizó y dijo "lo pienso" queda anotado con lo que le gustó. A los tres días, alguien le escribe.' },
        { sol: 'menu-digital', para: 'Lo mínimo: la lista vigente de micas y tratamientos en el celular de todo el equipo. Cotizar no espera a que usted llegue.', pide: { dueno: true } },
      ],
    },
    {
      id: 'examen-sabado',
      area: 'atencion',
      titulo: 'Los sábados se juntan todos para examen',
      senal: 'Un solo optometrista, exámenes de veinte minutos y gente esperando de pie entre los exhibidores.',
      matices: [{ id: 'cita', pregunta: '¿Hace los exámenes con cita?', si: 'Examen con cita', no: 'Examen sin cita' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El examen se aparta desde el celular, con horario. El sábado se reparte en vez de amontonarse a mediodía.' },
        { sol: 'turnos-virtuales', para: 'Quien llega sin cita toma turno y ve cuántos van antes. Mientras, elige armazón con calma o da una vuelta.', pide: { cita: false } },
        { sol: 'recordatorios', para: 'El recordatorio del viernes confirma o libera el lugar. El mejor horario del sábado no se queda apartado y vacío.', pide: { cita: true } },
        { sol: 'agenda-interna', para: 'Para empezar: los exámenes del día en una vista. En mostrador saben a qué hora sí pueden ofrecer uno.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'armazones-parados',
      area: 'inventarios',
      titulo: 'Tengo armazones que llevan años en la vitrina',
      senal: 'Modelos que no se mueven ocupan el exhibidor, y los que sí salen no se reponen a tiempo.',
      frecuente: true,
      matices: [{ id: 'codigo', pregunta: '¿Cada armazón tiene su etiqueta o código?', si: 'Armazones con código', no: 'Sin código ni etiqueta' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Cada armazón que entra o se vende se registra con el celular. Se sabe cuánto tiempo lleva cada pieza en exhibición.', pide: { codigo: true } },
        { sol: 'compras-sugeridas', para: 'Según lo que sí sale (marca, forma, rango de precio), la lista para el proveedor se arma sola. Se repone lo que se vende.' },
        { sol: 'promos-segmentadas', para: 'Los modelos con más de un año se ofrecen como segundo par a quienes compraron hace poco. Salen sin rematar la vitrina.' },
        { sol: 'catalogo-whatsapp', para: 'Lo más corto: los armazones detenidos en un catálogo con enlace y precio especial, para compartir en redes y por WhatsApp.' },
      ],
    },
    {
      id: 'falta-armazon',
      area: 'inventarios',
      titulo: 'No sé si falta un armazón hasta que lo busco',
      senal: 'Cientos de piezas pequeñas en exhibición. El conteo se hace una vez al año, si se hace.',
      matices: [{ id: 'varios', pregunta: '¿Atienden varias personas en mostrador?', si: 'Varias personas en mostrador', no: 'Atiende una sola persona' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Un conteo rápido con el celular, charola por charola. Lo que el sistema dice que hay se compara con lo que está.' },
        { sol: 'punto-de-venta', para: 'Cada armazón vendido baja de la existencia al cobrarse y queda quién lo vendió. Lo que falta sin venta, se nota.', pide: { varios: true } },
        { sol: 'merma', para: 'Lo roto en pruebas, lo extraviado y lo cambiado por garantía se anota con su motivo. Deja de ser un faltante sin explicación.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: al cerrar, contar las charolas de mayor precio. Diez minutos, con el nombre de quien cerró.' },
      ],
    },

    // ── Organización ──
    {
      id: 'graduaciones-tarjetas',
      area: 'organizacion',
      titulo: 'Las graduaciones están en tarjetas y notas viejas',
      senal: 'El cliente pide su graduación anterior y hay que buscar en cajas de notas, año por año.',
      frecuente: true,
      matices: [{ id: 'compu', pregunta: '¿Usa computadora en el gabinete de examen?', si: 'Hay computadora en el gabinete', no: 'Todo se anota a mano' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada cliente con sus exámenes por fecha: graduación, distancia entre pupilas y qué lentes se llevó. Se ve cómo ha cambiado.', pide: { compu: true } },
        { sol: 'formatos-digitales', para: 'El cliente llena sus datos en una tableta antes del examen. Llegan legibles a su ficha y quedan resguardados.' },
        { sol: 'base-clientes', para: 'Nombre, teléfono, última compra y último examen. Aunque la graduación siga en tarjeta, se sabe en qué caja buscarla.' },
        { sol: 'proceso-claro', para: 'Lo mínimo: archivar por apellido y no por fecha, con un folio que también vaya en la nota de venta.', pide: { compu: false } },
      ],
    },
    {
      id: 'garantias-de-memoria',
      area: 'organizacion',
      titulo: 'Las garantías y los ajustes se atienden de memoria',
      senal: 'Llega con el armazón roto y nadie sabe cuándo lo compró ni si todavía tiene garantía.',
      matices: [{ id: 'nota', pregunta: '¿El cliente suele traer su nota de compra?', si: 'Trae su nota', no: 'Casi nunca la trae' }],
      rutas: [
        { sol: 'base-clientes', para: 'Se busca al cliente por nombre y aparece qué compró y cuándo. La garantía ya no depende de que guarde un papel.', pide: { nota: false } },
        { sol: 'ordenes-trabajo', para: 'Cada reparación o garantía entra con su orden: qué se recibió, qué se le va a hacer y cuándo se entrega.' },
        { sol: 'formatos-digitales', para: 'Al entregar, el cliente firma en pantalla qué cubre la garantía y qué no. Queda guardado junto a su compra.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: qué cubre la garantía y por cuánto tiempo, ya escrito. Todo el equipo responde lo mismo.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'cuanto-salen',
      area: 'comunicacion',
      titulo: 'Preguntan por mensaje cuánto salen unos lentes',
      senal: 'No hay respuesta corta. Se contesta tarde, con un "depende", y la persona no vuelve a escribir.',
      matices: [{ id: 'paquetes', pregunta: '¿Maneja paquetes con precio cerrado?', si: 'Tiene paquetes con precio', no: 'Todo se cotiza por separado' }],
      rutas: [
        { sol: 'respuesta-automatica', para: 'El precio de los paquetes, el horario y el costo del examen se contestan solos. Lo que depende de la graduación pasa a una persona.', pide: { paquetes: true } },
        { sol: 'agenda-en-linea', para: 'La respuesta termina con un enlace para apartar el examen. Sin graduación no hay precio exacto, y dicho así se entiende.' },
        { sol: 'seguimiento-prospectos', para: 'Cada persona que preguntó queda anotada con lo que buscaba. Si no vino en la semana, alguien le escribe.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: qué hace variar el precio (mica, tratamiento, armazón), ya escrito y con rangos. Se envía con un toque.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'promos-sin-margen',
      area: 'rentabilidad',
      titulo: 'Con tanta promoción ya no sé si gano',
      senal: 'Dos por uno, descuentos y meses sin intereses para competir. El laboratorio cobra lo mismo.',
      matices: [{ id: 'costos', pregunta: '¿Tiene a la mano el costo de cada armazón y cada mica?', si: 'Tiene sus costos', no: 'Los costos están en facturas' }],
      rutas: [
        { sol: 'costeo', para: 'Un par completo con todo: armazón, micas, tratamiento, estuche y comisión de la tarjeta. Se ve cuánto deja un 2x1 antes de anunciarlo.', pide: { costos: false } },
        { sol: 'tablero-ventas', para: 'Qué se vendió en el mes y con qué descuento. Se ve si la promoción trajo más pares o solo bajó el precio de los mismos.' },
        { sol: 'promos-segmentadas', para: 'En vez de descuento para todos, la oferta va a quien lleva dos años sin cambiar lentes. Se descuenta menos y a quien sí lo ocupa.' },
        { sol: 'menu-digital', para: 'Lo más corto: paquetes con precio cerrado y a la vista, armados con su margen. Competir con claridad y no solo con descuento.' },
      ],
    },
  ],
}
