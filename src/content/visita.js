// Textos de la primera y la segunda visita. {negocio}, {plural}, {contacto}, {fecha} y {hora}
// se sustituyen al presentar.
//
// La voz es la de la skill soma-copywriting: un narrador que dice las cosas como son. Frases
// declarativas en una sola respiración, futuro simple («prepararemos», «recibirá») y
// sugerencias con «debería» o «podría». Sin metáforas, sin remates y sin preguntas de adorno.
// Al cliente, de usted.

export const V1 = {
  portada: { kicker: 'Para {negocio}', lema: 'We solve what holds you back.', sub: 'Resolvemos lo que detiene a su negocio.', cta: 'Empezar', para: 'Esta visita es para' },
  acuerdo: {
    nav: 'Antes de empezar',
    titulo: ['Antes de', 'empezar'],
    somos: 'Somos Soma, escuchamos cómo trabaja un negocio y construimos lo que le hace falta.',
    puntos: [
      { t: 'Hoy no vendemos nada', d: 'Hoy no traemos precios, solo venimos a entender {negocio}.' },
      { t: 'Usted marca el ritmo', d: 'Si tiene que atender algo, la presentación lo esperará.' },
      { t: 'Puede decir que no', d: 'Si algo no aplica en su negocio, debería decírnoslo.' },
    ],
  },
  suele: {
    nav: 'Lo que suele pasar',
    titulo: ['Lo que suele', 'pasar'],
    intro: 'Esto es lo que más pasa en {plural}.',
    mas: 'Ver más',
    menos: 'Ver menos',
    otraPh: 'Escriba aquí si le pasa otra cosa',
    agregar: 'Agregar',
    cuenta: ['Toque las que le pasan a usted', '1 marcada', '{n} marcadas'],
  },
  diag: {
    nav: 'Diagnóstico',
    preguntas: 'Para afinar',
    registrado: 'Anotado',
    noEncaja: 'No encaja',
    demo: 'Ver demostración',
    interesa: 'Me interesa',
    no: 'No me convence',
    notaPh: 'Anote aquí lo que dijo',
    medidaT: 'A la medida',
    medidaD: 'Ninguna ruta encaja del todo, diseñaremos una para {negocio}.',
    propioD: 'Este problema es de {negocio}, diseñaremos su solución desde cero.',
    vacioT: 'Todavía no hay nada marcado',
    vacioD: 'Debería regresar un paso y tocar lo que le pasa.',
    ejes: { cliente: 'Su cliente lo hace solo', equipo: 'Su equipo, con mejor herramienta', automatico: 'Pasa solo, por detrás', ligera: 'El paso más corto' },
  },
  ronda: {
    nav: 'Antes de cerrar',
    titulo: ['Antes de', 'cerrar'],
    intro: 'Estas tres también pasan seguido en {plural}.',
    si: 'También me pasa',
    no: 'No',
    vacio: 'Ya revisamos lo importante.',
  },
  alcance: {
    nav: 'Alcance',
    titulo: ['¿Hasta dónde', 'quiere llegar?'],
    intro: 'El presupuesto cambia el alcance, la calidad es la misma.',
    presupuesto: 'Para ubicarnos',
    forma: '¿Cómo le acomoda pagar?',
    formas: [
      { id: 'contado', t: 'Un solo pago', d: 'El sistema queda a su nombre.' },
      { id: 'mensual', t: 'Membresía Soma', d: 'Una mensualidad que incluye soporte y mejoras.' },
      { id: 'nose', t: 'Todavía no lo sé', d: 'Lo veremos con la propuesta.' },
    ],
    nota: 'Los precios se verán en la próxima visita, con su sistema enfrente.',
  },
  expediente: {
    nav: 'Lo que entendimos',
    titulo: ['Esto es lo que', 'entendimos'],
    sello: 'Expediente abierto',
    tambien: 'También mencionó',
    medida: 'Ruta a la medida',
    sinRuta: 'Se definirá en la demostración',
    falta: 'Si algo no es así, debería corregirnos.',
    faltaPh: 'Escriba aquí lo que falte',
    vacio: 'Todavía no hay nada anotado, puede volver al diagnóstico.',
  },
  agenda: {
    nav: 'Siguiente paso',
    titulo: ['El siguiente', 'paso'],
    intro: 'Con esto prepararemos una demostración para {negocio}, en la próxima visita la probará usted.',
    dia: '¿Qué día le queda bien?',
    hora: '¿A qué hora?',
    mensaje: 'Acordarlo por mensaje',
    quien: '¿Con quién quedamos?',
    decide: '¿Quién decide en {negocio}?',
    decideSi: 'Yo decido',
    decideNo: 'Alguien más',
    decisorPh: 'Nombre de quien decide',
    decisorNota: 'La próxima visita debería ser con esa persona, así usted no tendrá que explicarle todo.',
    diaDecisor: '¿Qué día estará {quien}?',
    nombre: 'Nombre',
    puesto: 'Puesto',
    tel: 'WhatsApp',
    agendar: 'Apartar fecha',
    guardar: 'Guardar contacto',
    listo: 'Quedamos el {fecha} a las {hora}.',
    listoCon: 'Quedamos el {fecha} a las {hora}, con {quien}.',
    listoMsg: 'Le escribiremos para acordar el día.',
    falta: 'Falta elegir el día y la hora.',
  },
  cierre: {
    nav: 'Gracias',
    gracias: 'Gracias',
    cita: 'Nos veremos el {fecha} a las {hora}.',
    mensaje: 'Le escribiremos pronto para acordar el día.',
    cuerpo: 'Lo que nos contó se queda con nosotros, con eso armaremos su demostración.',
    lema: 'We solve what holds you back.',
    terminar: 'Terminar',
  },
}

export const V2 = {
  // cortoDesde: el corto del aro empieza en su último plano, «En orden»
  portada: { kicker: 'De vuelta en {negocio}', lema: 'Esto es lo que construimos.', sub: 'Hoy lo probará usted.', cta: 'Empezar', para: 'Lo construimos para', cortoDesde: 7 },
  recap: {
    nav: 'Lo que nos contó',
    titulo: ['Lo que', 'nos contó'],
    intro: 'Esto nos contó el {fecha}, si algo cambió lo ajustaremos.',
    sinFecha: 'Esto fue lo que nos contó, si algo cambió lo ajustaremos.',
    resuelve: 'Lo resuelve',
    medida: 'Solución a la medida',
    vacio: 'No hay hallazgos anotados de la primera visita.',
  },
  demo: {
    nav: 'Su sistema',
    titulo: ['Su', 'sistema'],
    intro: 'Este es el sistema de {negocio}, debería tocarlo y tratar de romperlo.',
    abrir: 'Verlo en grande',
    pestana: 'Abrir en otra pestaña',
    sinUrl: 'Estas piezas resuelven lo que nos contó, puede probar la que quiera.',
    probar: 'Probar',
  },
  precio: {
    nav: 'Cómo se paga',
    titulo: ['Cómo', 'se paga'],
    intro: 'Hay dos maneras de tenerlo, el sistema es el mismo en las dos.',
    contadoT: 'Un solo pago',
    contadoD: 'El sistema queda a su nombre, sin mensualidades.',
    membT: 'Membresía Soma',
    membD: 'Se paga mes a mes e incluye soporte y mejoras.',
    plazos: [
      { id: 'mensual', t: 'Mes a mes', meses: 1 },
      { id: 'semestral', t: '6 meses', meses: 6 },
      { id: 'anual', t: '12 meses', meses: 12 },
    ],
    alMes: 'al mes',
    total: 'Total',
    ahorra: 'Ahorra {monto}',
    incluye: 'Incluye',
    prueba: 'Puede probarlo {dias} días sin costo antes de decidir.',
    sinPrecio: 'Todavía no hay precios en esta propuesta.',
    mantenimiento: 'Soporte y mantenimiento',
  },
  pago: {
    nav: 'Formas de pago',
    titulo: ['Formas', 'de pago'],
    intro: 'Las tres formas quedan registradas y recibirá su comprobante.',
    tarjeta: { t: 'Tarjeta', d: 'Recibirá un enlace seguro para pagar desde su teléfono.' },
    transferencia: { t: 'Transferencia', d: 'Se paga a esta cuenta y nos comparte el comprobante.' },
    efectivo: { t: 'Efectivo', d: 'Se paga en persona y recibirá su recibo.' },
    sinBanco: 'Los datos de la cuenta le llegarán por mensaje.',
  },
  decision: {
    nav: 'Su decisión',
    titulo: ['Su', 'decisión'],
    intro: 'Puede decidir hoy o tomarse unos días.',
    opciones: [
      { id: 'contado', t: 'Lo quiero, en un solo pago' },
      { id: 'mensual', t: 'Lo quiero, con Membresía Soma' },
      { id: 'prueba', t: 'Quiero probarlo primero' },
      { id: 'pensar', t: 'Lo voy a pensar' },
    ],
    listo: { contado: 'Prepararemos la entrega y le diremos cómo pagar.', mensual: 'Activaremos su membresía y le diremos cómo pagar.', prueba: 'Le daremos acceso y lo acompañaremos esos días.', pensar: 'Le escribiremos en unos días.' },
  },
  cierre: { nav: 'Gracias', gracias: 'Gracias', cuerpo: 'Seguiremos en contacto, puede escribirnos cuando quiera.', lema: 'We solve what holds you back.', terminar: 'Terminar' },
}

// Espacios: escenas que ya tienen su lugar en la presentación pero todavía no su contenido.
// Cada una dice qué va ahí, para llenarla después con fotos, video, datos o una animación.
// Se apagan todas juntas con ESPACIOS_EN_OBRA en src/config.js.
export const ESPACIOS = {
  obra: 'Espacio en construcción',
  trabajo: {
    nav: 'Trabajo real',
    titulo: ['Trabajo', 'real'],
    intro: 'Aquí irán fotos y video de sistemas que ya entregamos.',
    huecos: [
      { t: 'Foto del sistema en uso', d: 'Una pantalla del sistema funcionando en un negocio.' },
      { t: 'Video corto', d: 'El dueño usándolo en un día normal.' },
      { t: 'Antes y después', d: 'Cómo se hacía y cómo se hace ahora.' },
    ],
  },
  casos: {
    nav: 'Quien ya lo usa',
    titulo: ['Quien ya', 'lo usa'],
    intro: 'Aquí irá lo que dicen los negocios que ya trabajan con Soma.',
    huecos: [
      { t: 'Negocio y giro', d: 'El nombre del negocio y a qué se dedica.' },
      { t: 'Lo que resolvimos', d: 'El problema que tenía y qué cambió.' },
      { t: 'En sus palabras', d: 'Una frase del dueño, con su permiso.' },
    ],
  },
  entrega: {
    nav: 'Después del sí',
    titulo: ['Después', 'del sí'],
    intro: 'Aquí irá el calendario de entrega, etapa por etapa.',
    huecos: [
      { t: 'Qué recibe', d: 'Lo que se entrega en cada etapa.' },
      { t: 'Qué necesitamos', d: 'Los datos y accesos que le pediremos.' },
      { t: 'Cuándo arranca', d: 'La fecha en que su personal empieza a usarlo.' },
    ],
  },
}
