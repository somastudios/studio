// Hotel pequeño, posada, cabañas o varias unidades en plataformas.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").

export default {
  id: 'hotel',
  familia: 'estancia',
  nombre: 'Hotel o hospedaje',
  plural: 'hoteles',
  icono: 'hotel',
  acento: '#1f4e5f',
  orden: 10,
  vocab: {
    cliente: 'el huésped',
    clientes: 'los huéspedes',
    personal: 'la recepción',
    empleado: 'la camarista',
    cita: 'reservación',
    citas: 'reservaciones',
    lugar: 'hotel',
  },

  // Para quien presenta, antes de entrar.
  apertura: '¿Cómo se les llena más el hotel: por las plataformas o con la gente que les llama directo?',
  observa: [
    'Dónde se anotan las reservaciones: libreta, pizarrón de llaves, hoja de cálculo o un sistema.',
    'Cuántas veces suena el teléfono o el WhatsApp mientras atienden a alguien en el mostrador.',
    'Si la clave del wifi, los horarios o las reglas están en un letrero pegado con cinta.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Habitación sencilla (noche)', precio: 650, categoria: 'Hospedaje' },
      { nombre: 'Habitación doble (noche)', precio: 850, categoria: 'Hospedaje' },
      { nombre: 'Habitación familiar (noche)', precio: 1250, categoria: 'Hospedaje' },
      { nombre: 'Cabaña para seis (noche)', precio: 2400, categoria: 'Hospedaje' },
      { nombre: 'Desayuno completo', precio: 120, categoria: 'Alimentos' },
      { nombre: 'Café y pan dulce', precio: 55, categoria: 'Alimentos' },
      { nombre: 'Cena ligera a la habitación', precio: 140, categoria: 'Alimentos' },
      { nombre: 'Persona adicional', precio: 150, categoria: 'Extras' },
      { nombre: 'Salida tarde (hasta las 4)', precio: 250, categoria: 'Extras' },
      { nombre: 'Mascota por noche', precio: 150, categoria: 'Extras' },
      { nombre: 'Lavandería por carga', precio: 90, categoria: 'Extras' },
      { nombre: 'Leña para chimenea', precio: 80, categoria: 'Extras' },
      { nombre: 'Dos noches entre semana con desayuno', precio: 1500, categoria: 'Paquetes' },
      { nombre: 'Fin de semana en cabaña', precio: 4500, categoria: 'Paquetes' },
    ],
    servicios: [
      { nombre: 'Habitación sencilla, una noche', precio: 650, minutos: 1440 },
      { nombre: 'Habitación doble, una noche', precio: 850, minutos: 1440 },
      { nombre: 'Habitación familiar, una noche', precio: 1250, minutos: 1440 },
      { nombre: 'Cabaña para seis, una noche', precio: 2400, minutos: 1440 },
      { nombre: 'Fin de semana en cabaña (dos noches)', precio: 4500, minutos: 2880 },
    ],
    personal: ['Rosario', 'Beto', 'Yolanda', 'Iván'],
    clientes: ['Familia Covarrubias', 'Ing. Michel', 'Sra. Larios', 'Rodrigo Chávez', 'Dra. Villalvazo', 'Fernanda Rolón'],
    insumos: [
      { nombre: 'Juego de sábanas matrimonial', unidad: 'juegos', hay: 18, minimo: 24 },
      { nombre: 'Toalla de baño', unidad: 'pzas', hay: 64, minimo: 50 },
      { nombre: 'Almohada', unidad: 'pzas', hay: 30, minimo: 28 },
      { nombre: 'Jabón de tocador', unidad: 'pzas', hay: 35, minimo: 40 },
      { nombre: 'Shampoo en sobre', unidad: 'pzas', hay: 210, minimo: 100 },
      { nombre: 'Papel higiénico', unidad: 'rollos', hay: 96, minimo: 60 },
      { nombre: 'Agua embotellada', unidad: 'pzas', hay: 48, minimo: 36 },
      { nombre: 'Cloro', unidad: 'L', hay: 12, minimo: 8 },
    ],
  },

  problemas: [
    // ── Organización ──
    {
      id: 'sobreventa',
      area: 'organizacion',
      titulo: 'Vendimos la misma habitación dos veces',
      senal: 'Una reservación entró por teléfono y otra por la plataforma. Los dos huéspedes llegan el mismo día.',
      frecuente: true,
      matices: [
        { id: 'plataformas', pregunta: '¿Vende también por Booking, Airbnb u otra plataforma?', si: 'Vende por plataformas', no: 'Solo venta directa' },
        { id: 'varios', pregunta: '¿Toman reservaciones varias personas o varios turnos?', si: 'Varios anotan reservaciones', no: 'Una sola persona anota' },
      ],
      rutas: [
        { sol: 'agenda-interna', para: 'Un solo calendario de habitaciones para teléfono, WhatsApp, mostrador y plataforma. Quien aparta la 12 la deja ocupada para todos los turnos.' },
        { sol: 'agenda-en-linea', para: 'La reservación directa entra sola al calendario. El huésped solo ve las habitaciones que de verdad están libres esas noches.', pide: { plataformas: false } },
        { sol: 'bitacora-turno', para: 'Lo que el turno de la mañana apartó de palabra queda escrito para el de la noche. Nadie renta una habitación ya prometida.', pide: { varios: true } },
        { sol: 'proceso-claro', para: 'Antes de cualquier sistema: un solo calendario manda, y se acuerda quién cierra la fecha en la plataforma cuando se vende por teléfono.' },
      ],
    },
    {
      id: 'habitaciones-listas',
      area: 'organizacion',
      titulo: 'Recepción no sabe qué habitaciones ya están limpias',
      senal: 'El huésped llega a las tres y hay que subir a preguntar si su habitación ya quedó.',
      frecuente: true,
      matices: [{ id: 'celular', pregunta: '¿Las camaristas usarían su celular para marcar una habitación lista?', si: 'Camaristas con celular', no: 'Prefieren papel o radio' }],
      rutas: [
        { sol: 'seguimiento-pedidos', para: 'Cada habitación en un tablero: por limpiar, en limpieza, revisada, lista. Recepción lo ve desde el mostrador, sin subir ni llamar.' },
        { sol: 'aviso-listo', para: 'Cuando la camarista termina la 8, recepción recibe el aviso en ese momento y ya puede entregarla.', pide: { celular: true } },
        { sol: 'pantalla-cocina', para: 'La lista de limpieza se ordena sola: primero las habitaciones con llegada hoy, después las demás. Cada una con el tiempo que lleva.' },
        { sol: 'checklist-turnos', para: 'Una lista por habitación: baño, blancos, amenidades, control de la tele. Se palomea y queda quién la dejó lista y a qué hora.' },
      ],
    },
    {
      id: 'fallas-olvidadas',
      area: 'organizacion',
      titulo: 'Lo que se descompone se reporta de palabra y se olvida',
      senal: 'El huésped avisó que el aire de la 14 no enfría. Nadie lo anotó y el siguiente huésped se queja de lo mismo.',
      matices: [{ id: 'planta', pregunta: '¿Tiene a alguien de mantenimiento de planta?', si: 'Mantenimiento de planta', no: 'Llama a un técnico externo' }],
      rutas: [
        { sol: 'ordenes-trabajo', para: 'Cada falla le llega a su encargado con habitación y descripción. Cuando la cierra, recepción sabe que la 14 ya se puede rentar.', pide: { planta: true } },
        { sol: 'llamado-mesa', para: 'Un código en la habitación: el huésped avisa con un toque que no hay agua caliente, y recepción sabe en cuál.' },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje con las fallas que siguen abiertas y en qué habitación. Usted decide cuál urge antes del fin de semana.' },
        { sol: 'bitacora-turno', para: 'Lo mínimo: la falla que se reportó en la noche queda escrita para quien abre en la mañana. Aunque el técnico venga el jueves, no se olvida.' },
      ],
    },

    // ── Atención ──
    {
      id: 'apartan-no-llegan',
      area: 'atencion',
      titulo: 'Apartan por teléfono y no llegan',
      senal: 'En puente se guarda la habitación de palabra, se rechaza a otros y a las diez de la noche sigue sola.',
      frecuente: true,
      matices: [{ id: 'anticipo', pregunta: '¿Pediría anticipo para apartar en puentes y temporada alta?', si: 'Anticipo aceptado', no: 'Sin anticipo' }],
      rutas: [
        { sol: 'anticipo-reserva', para: 'En puentes y en feria, la habitación se aparta con la primera noche pagada. Si no llegan, esa noche ya no se pierde completa.', pide: { anticipo: true } },
        { sol: 'recordatorios', para: 'Un mensaje un día antes para confirmar la llegada y la hora. Si cancelan, la habitación todavía se alcanza a ofrecer.' },
        { sol: 'lista-espera', para: 'Cuando el hotel está lleno, quien llamó queda anotado. Si alguien cancela, la habitación se le ofrece primero a esa persona.' },
        { sol: 'respuestas-rapidas', para: 'La política de apartado ya escrita: hasta qué hora se guarda la habitación sin anticipo. Se manda igual a todos, sin discutir.' },
      ],
    },
    {
      id: 'registro-lento',
      area: 'atencion',
      titulo: 'El registro de llegada es lento y a mano',
      senal: 'Viernes por la tarde: tres familias en el mostrador llenando la hoja de registro con la misma pluma.',
      matices: [{ id: 'antes', pregunta: '¿Sus huéspedes pagarían y darían sus datos desde el celular antes de llegar?', si: 'Registro anticipado bienvenido', no: 'Prefieren hacerlo en mostrador' }],
      rutas: [
        { sol: 'formatos-digitales', para: 'La hoja de registro y el reglamento se llenan y se firman en una pantalla. Nadie descifra letra ni archiva papel.' },
        { sol: 'cobro-en-linea', para: 'El huésped liquida su estancia desde antes con un enlace. En el mostrador solo se identifica y recibe su llave.', pide: { antes: true } },
        { sol: 'expediente-cliente', para: 'Quien ya se hospedó no vuelve a dictar sus datos. Su ficha aparece con nombre, placas y la habitación que prefiere.' },
        { sol: 'agenda-interna', para: 'La reservación ya trae nombre, noches y saldo. Cuando llega el huésped, recepción la abre y entrega, sin buscar en la libreta.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'mensajes-tarde',
      area: 'comunicacion',
      titulo: 'Preguntan precio por WhatsApp y se contesta tarde',
      senal: 'Quien pregunta a las once de la noche ya reservó en otro lado cuando le contestan.',
      frecuente: true,
      matices: [{ id: 'mostrador', pregunta: '¿Quien contesta los mensajes es quien atiende el mostrador?', si: 'Recepción contesta todo', no: 'Hay alguien para mensajes' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'La disponibilidad se consulta sola. El huésped pone sus fechas, ve qué hay y aparta sin esperar a que alguien conteste.' },
        { sol: 'respuesta-automatica', para: 'Tarifas, hora de entrada, estacionamiento y si se aceptan mascotas se contestan solos, a cualquier hora. Lo demás pasa a recepción.', pide: { mostrador: true } },
        { sol: 'seguimiento-prospectos', para: 'Quien preguntó queda anotado con sus fechas. Si no apartó, al día siguiente alguien le vuelve a escribir.' },
        { sol: 'respuestas-rapidas', para: 'Tarifas por tipo de habitación, ubicación y datos para el anticipo, ya escritos. Se contesta completo con un toque.' },
      ],
    },
    {
      id: 'preguntan-lo-mismo',
      area: 'comunicacion',
      titulo: 'Todos preguntan lo mismo: wifi, desayuno, hora de salida',
      senal: 'Recepción repite la clave del internet veinte veces al día, y de madrugada le tocan al velador.',
      matices: [{ id: 'extras', pregunta: '¿Ofrece desayuno, lavandería o algo que se pida desde la habitación?', si: 'Vende servicios extra', no: 'Solo hospedaje' }],
      rutas: [
        { sol: 'pedidos-qr', para: 'Desde la habitación, el huésped pide su desayuno o toallas extra con el celular. El cargo queda anotado en su cuenta.', pide: { extras: true } },
        { sol: 'llamado-mesa', para: 'Un toque para pedir algo a recepción, con el número de habitación ya incluido. De noche nadie adivina quién llamó.' },
        { sol: 'respuesta-automatica', para: 'La clave del wifi y los horarios se contestan solos por WhatsApp, también a las dos de la mañana.' },
        { sol: 'menu-digital', para: 'Un código en cada habitación con la clave del wifi, los horarios y dónde comer cerca. Se corrige en un minuto, sin reimprimir.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'temporada-baja',
      area: 'clientes',
      titulo: 'Entre semana y en temporada baja el hotel se queda solo',
      senal: 'En feria y en puentes no cabe nadie. Un martes de febrero hay tres habitaciones ocupadas.',
      frecuente: true,
      matices: [
        { id: 'trabajo', pregunta: '¿Recibe gente que viene por trabajo: agentes de ventas, técnicos, médicos?', si: 'Recibe viajeros de trabajo', no: 'Su huésped viene de descanso' },
        { id: 'contacto', pregunta: '¿Guarda el teléfono de quienes ya se hospedaron?', si: 'Tiene contacto de sus huéspedes', no: 'No guarda contactos' },
      ],
      rutas: [
        { sol: 'promos-segmentadas', para: 'Una tarifa de entre semana para quienes vinieron en puente. Le llega a quien ya conoce el hotel y sabe cómo llegar.', pide: { contacto: true } },
        { sol: 'seguimiento-prospectos', para: 'Las empresas que mandan gente cada mes, anotadas con su contacto y su siguiente llamada. El convenio no se queda en plática.', pide: { trabajo: true } },
        { sol: 'tarjeta-lealtad', para: 'Cada noche suma. Quien viene seguido, por trabajo o a ver a la familia, tiene un motivo para volver al mismo hotel.' },
        { sol: 'catalogo-whatsapp', para: 'Los paquetes de entre semana en un enlace que se comparte: dos noches con desayuno, tarifa de trabajo. Quien elige uno escribe ya decidido.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'blancos-perdidos',
      area: 'inventarios',
      titulo: 'Toallas y sábanas se pierden y nadie lleva la cuenta',
      senal: 'Juegos incompletos, toallas manchadas que siguen en uso y compras de urgencia antes de un puente.',
      matices: [{ id: 'lavanderia', pregunta: '¿La ropa de cama se lava fuera del hotel?', si: 'Lavandería externa', no: 'Se lava en el hotel' }],
      rutas: [
        { sol: 'inventario-escaner', para: 'Lo que sale a lavandería y lo que regresa se registra con el celular. Si salieron cuarenta toallas y volvieron treinta y seis, se nota ese día.', pide: { lavanderia: true } },
        { sol: 'inventario-alertas', para: 'Cada tipo de blanco con su mínimo según sus habitaciones. Cuando los juegos matrimoniales bajan de veinticuatro, usted se entera antes del puente.' },
        { sol: 'merma', para: 'La toalla manchada y la sábana rota se dan de baja con su motivo. A fin de año se sabe cuánto hay que reponer y por qué.' },
        { sol: 'checklist-turnos', para: 'Un conteo fijo cada lunes, por piso, en una lista que se palomea. Lo mínimo para saber qué hay.' },
      ],
    },

    // ── Administración ──
    {
      id: 'rentas-sin-registro',
      area: 'administracion',
      titulo: 'Hay noches rentadas que no aparecen en la caja',
      senal: 'Llegadas sin reservación que se cobran en efectivo. Al otro día la habitación amaneció usada y no hay registro.',
      matices: [{ id: 'presente', pregunta: '¿Usted o alguien de su familia está en el hotel todos los días?', si: 'El dueño está presente', no: 'El dueño no siempre está' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Ninguna llave se entrega sin registrar la renta. Cada cobro queda con habitación, hora y quién lo recibió.' },
        { sol: 'corte-de-caja', para: 'Al cambiar de turno, lo cobrado se compara con las habitaciones ocupadas. La diferencia tiene turno y nombre.' },
        { sol: 'tablero-ventas', para: 'Ocupación e ingreso del día en su teléfono, en vivo. Usted ve cuántas habitaciones hay rentadas sin estar en el hotel.', pide: { presente: false } },
        { sol: 'reporte-diario', para: 'Al cerrar el turno de noche, un mensaje con las habitaciones ocupadas y el dinero recibido. Si no coinciden, usted lo ve primero.' },
      ],
    },
    {
      id: 'anticipos-enredados',
      area: 'administracion',
      titulo: 'No sé qué anticipos ya cayeron ni de quién son',
      senal: 'Llega la foto de un comprobante por WhatsApp. Alguien tiene que revisar el banco y anotarlo en la reservación.',
      matices: [{ id: 'banco', pregunta: '¿Solo usted puede revisar la cuenta del banco?', si: 'Solo el dueño ve el banco', no: 'Recepción puede revisar' }],
      rutas: [
        { sol: 'cobro-en-linea', para: 'El anticipo se paga con un enlace y queda ligado a su reservación. Recepción lo ve confirmado sin pedirle a usted que revise el banco.', pide: { banco: true } },
        { sol: 'anticipo-reserva', para: 'Apartar y dejar el anticipo es un solo paso. La reservación nace con su pago anotado.' },
        { sol: 'fiado', para: 'Cada reservación con su saldo: cuánto dejó, cuánto falta y cuándo liquida. Cuando llega el huésped no hay nada que aclarar.' },
        { sol: 'proceso-claro', para: 'Una regla sola: quién confirma cada depósito y dónde lo anota. Sin confirmación, la reservación no se da por pagada.' },
      ],
    },

    // ── Logística ──
    {
      id: 'entrega-cabanas',
      area: 'logistica',
      titulo: 'Entregar llaves y limpiar entre huéspedes es puro mensaje',
      senal: 'Sale uno a las doce y entra otro a las tres. Quien limpia se entera por WhatsApp, si alcanza a verlo.',
      matices: [{ id: 'lejos', pregunta: '¿Sus cabañas o departamentos están en lugares distintos?', si: 'Unidades en varios lugares', no: 'Todo en un mismo terreno' }],
      rutas: [
        { sol: 'agenda-interna', para: 'Entradas y salidas de todas las unidades en un calendario que también ve quien limpia. Sabe a cuál ir y a qué hora.' },
        { sol: 'aviso-listo', para: 'Cuando la cabaña queda limpia, usted recibe el aviso y puede confirmarle la entrada al huésped sin ir a revisar.', pide: { lejos: true } },
        { sol: 'checklist-turnos', para: 'Una lista por unidad al terminar la limpieza: camas, baño, gas, leña, llaves en su lugar. Se sabe quién la cerró y cuándo.' },
        { sol: 'respuestas-rapidas', para: 'Las instrucciones de llegada ya escritas: ubicación, dónde está la llave y a qué hora entrar. Se mandan con un toque.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'comision-plataformas',
      area: 'rentabilidad',
      titulo: 'Las plataformas se quedan con buena parte de cada noche',
      senal: 'Casi todo entra por Booking o Airbnb, y de cada reservación se va una comisión.',
      frecuente: true,
      matices: [
        { id: 'pagina', pregunta: '¿Tiene página propia donde se pueda reservar?', si: 'Ya tiene página con reservas', no: 'Solo está en plataformas' },
        { id: 'repiten', pregunta: '¿Tiene huéspedes que regresan varias veces al año?', si: 'Hay huéspedes que regresan', no: 'Casi todos vienen una vez' },
      ],
      rutas: [
        { sol: 'sitio-web', para: 'Una página propia con fotos, tarifas y botón para reservar. Quien lo vio en la plataforma y busca el hotel por su nombre puede apartar directo.', pide: { pagina: false } },
        { sol: 'base-clientes', para: 'Quien ya se hospedó queda registrado con su teléfono. La siguiente vez le escribe a usted, y esa noche no paga comisión.', pide: { repiten: true } },
        { sol: 'costeo', para: 'Cuánto deja una noche vendida directo y cuánto una de plataforma, ya con la comisión. Se ve en qué fechas conviene abrirla y en cuáles no.' },
        { sol: 'perfil-google', para: 'Lo primero: que al buscar el hotel por su nombre aparezcan su teléfono y su WhatsApp, y no solo el anuncio de la plataforma.' },
      ],
    },
    {
      id: 'extras-sin-cobrar',
      area: 'rentabilidad',
      titulo: 'Los extras se quedan sin cobrar',
      senal: 'Persona adicional, salida tarde, lo del frigobar. Se usa, y al hacer la cuenta ya nadie se acuerda.',
      matices: [{ id: 'alimentos', pregunta: '¿Vende alimentos o bebidas dentro del hotel?', si: 'Vende alimentos y bebidas', no: 'Solo cargos de hospedaje' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada extra se carga a la habitación cuando sucede. Al salir, la cuenta ya está completa y con ticket.' },
        { sol: 'pedidos-qr', para: 'El desayuno y las bebidas se piden desde el celular y se suman solos a la cuenta de la habitación.', pide: { alimentos: true } },
        { sol: 'bitacora-turno', para: 'Lo que la camarista encuentra al revisar la habitación llega a recepción antes de que el huésped pague.' },
        { sol: 'menu-digital', para: 'Los extras con su precio a la vista del huésped desde que llega. Nadie se sorprende al pagar.' },
      ],
    },
  ],
}
