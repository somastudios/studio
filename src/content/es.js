// Todo el texto de la presentación vive aquí.
// Para cambiar una frase no hace falta tocar ninguna escena.

/** Datos de contacto. Un campo vacío simplemente no se muestra. */
export const CONTACT = {
  whatsapp: '', // p. ej. '+52 000 000 0000'
  correo: '', // p. ej. 'hola@dominio.com'
  web: '', // p. ej. 'dominio.com'
  instagram: '', // p. ej. '@usuario'
}

export const C = {
  brand: 'SOMA',
  studio: 'Studio',
  ui: {
    index: 'Índice',
    close: 'Cerrar',
    prev: 'Anterior',
    next: 'Siguiente',
    hintKeys: 'Flechas para avanzar · M abre el índice',
    hintTouch: 'Deslice para avanzar',
    example: 'Ejemplo ilustrativo',
  },

  s0: {
    nav: 'Portada',
    kicker: 'Ingeniería de soluciones para empresas',
    lema: 'We solve what holds you back.',
    sub: 'Resolvemos lo que detiene a su negocio.',
    cta: 'Comenzar',
  },

  s1: {
    nav: 'Premisa',
    title: ['Primero', 'el problema'],
    oldLabel: 'La pregunta habitual',
    old: '¿Cuánto cuesta una página web?',
    oursLabel: 'La nuestra',
    ours: '¿Qué está deteniendo a su negocio?',
    body: 'No llegamos con un producto que colocar. Antes de proponer cualquier cosa, entendemos cómo opera su negocio y dónde se está frenando. La solución se diseña después, alrededor de eso.',
  },

  s2: {
    nav: 'Dónde se detiene',
    title: ['¿Dónde se', 'detiene?'],
    intro: 'Un negocio rara vez se detiene en todo. Suele detenerse en un punto.',
    prompt: 'Seleccione un área',
    signals: 'Señales habituales',
    areas: [
      {
        icon: 'clientes',
        name: 'Clientes',
        signals: ['Llegan pocos clientes nuevos.', 'Nadie da seguimiento a quien pidió información.', 'No se sabe qué canal trae las ventas.'],
      },
      {
        icon: 'atencion',
        name: 'Atención',
        signals: ['Los clientes esperan demasiado.', 'Las solicitudes se olvidan en horas pico.', 'Los mensajes tardan horas en responderse.'],
      },
      {
        icon: 'organizacion',
        name: 'Organización',
        signals: ['La información vive en papel, chats y memoria.', 'Las tareas se pierden entre un turno y otro.', 'Dos personas atienden lo mismo sin saberlo.'],
      },
      {
        icon: 'inventarios',
        name: 'Inventarios',
        signals: ['Los insumos se terminan sin aviso.', 'Lo registrado no coincide con lo físico.', 'Hay merma que nadie mide.'],
      },
      {
        icon: 'administracion',
        name: 'Administración',
        signals: ['No se sabe con certeza cuánto se vendió hoy.', 'Los reportes se arman a mano.', 'Cada sucursal lleva sus números aparte.'],
      },
      {
        icon: 'logistica',
        name: 'Logística',
        signals: ['Las entregas se retrasan.', 'Los pedidos salen con errores.', 'Nadie sabe en qué etapa va cada orden.'],
      },
      {
        icon: 'comunicacion',
        name: 'Comunicación',
        signals: ['Las instrucciones se pierden entre mensajes.', 'Cada área ve una versión distinta.', 'Los avisos llegan tarde.'],
      },
      {
        icon: 'rentabilidad',
        name: 'Rentabilidad',
        signals: ['Se vende mucho y queda poco.', 'No se conoce el costo real de cada producto.', 'No se sabe qué deja más margen.'],
      },
    ],
  },

  s3: {
    nav: 'Síntoma y causa',
    title: ['El síntoma', 'no es', 'la causa'],
    body: 'Una misma queja puede tener cinco orígenes distintos, y cada uno pide una respuesta diferente. Por eso diagnosticamos antes de proponer.',
    cta: 'Buscar la causa',
    symptomLabel: 'Síntoma',
    symptom: 'Ventas bajas',
    causeLabel: 'Causa posible',
    answerLabel: 'Respuesta',
    causes: [
      { name: 'Visibilidad', cause: 'Quien lo busca no lo encuentra.', answer: 'Presencia en búsquedas locales y un sitio comercial.' },
      { name: 'Conversión', cause: 'Lo visitan, pero no compran ni reservan.', answer: 'Páginas de destino y optimización comercial.' },
      { name: 'Precio', cause: 'No se conoce el costo real de lo que se vende.', answer: 'Análisis de costos y márgenes por producto.' },
      { name: 'Atención', cause: 'Las consultas tardan horas en responderse.', answer: 'Automatización de la primera respuesta.' },
      { name: 'Retención', cause: 'Compran una vez y no regresan.', answer: 'CRM y programa de fidelización.' },
    ],
  },

  s4: {
    nav: 'Método',
    title: 'Cómo trabajamos',
    steps: [
      { name: 'Diagnóstico', text: 'Una pregunta a la vez. Escuchamos cómo opera su negocio y separamos los síntomas de sus causas.' },
      { name: 'Soluciones', text: 'Para cada causa existen varias rutas. Elegimos la que respeta la forma en que usted quiere operar.' },
      { name: 'Demostración', text: 'Le mostramos la solución funcionando con datos de ejemplo, antes de que tome cualquier decisión.' },
      { name: 'Plano', text: 'Dejamos por escrito el alcance: módulos, integraciones, prioridades e indicadores de éxito.' },
      { name: 'Implementación', text: 'Construimos, ponemos en marcha y medimos si el problema realmente quedó resuelto.' },
    ],
  },

  s5: {
    nav: 'Rutas',
    kicker: 'Ejemplo ilustrativo · Restaurante',
    title: ['Su forma de operar', 'decide la ruta'],
    problemLabel: 'Problema',
    problem: 'El servicio en mesa es lento.',
    yes: 'Sí',
    no: 'No',
    questions: [
      { key: 'self', text: '¿Sus clientes pueden pedir por su cuenta?' },
      { key: 'waiter', text: '¿Quiere conservar la atención del mesero?' },
      { key: 'kitchen', text: '¿El cuello de botella está en cocina?' },
    ],
    tag: 'Restricción registrada · Atención humana',
    routes: [
      { name: 'Pedidos por QR', text: 'El cliente ordena desde su teléfono y la orden llega directa a cocina.' },
      { name: 'Asistente para meseros', text: 'El trato personal se conserva. La tecnología trabaja detrás: comandas digitales, panel de cocina y solicitudes por mesa.' },
      { name: 'Gestión de cocina', text: 'Cola de preparación con prioridades y aviso al mesero cuando un platillo está listo.' },
      { name: 'Seguir diagnosticando', text: 'Si ninguna ruta aplica, lo decimos. No forzamos una solución.' },
    ],
  },

  s6: {
    nav: 'Qué construimos',
    title: ['Qué', 'construimos'],
    note: 'Si su problema requiere una especialidad que no tenemos, se lo decimos y buscamos al aliado correcto. Prometemos la mejor ruta, no lo imposible.',
    items: [
      { name: 'Software a medida', text: 'Sistemas diseñados alrededor de un proceso específico de su empresa.' },
      { name: 'Sitios y tiendas', text: 'Presencia comercial, catálogos y comercio en línea que convierten visitas en ventas.' },
      { name: 'Aplicaciones internas', text: 'Herramientas para su personal: piso, cocina, taller u oficina.' },
      { name: 'CRM y seguimiento', text: 'Clientes, prospectos e historial en un solo lugar.' },
      { name: 'Automatización', text: 'Tareas repetitivas que dejan de depender de la memoria de alguien.' },
      { name: 'Sistemas administrativos', text: 'Inventarios, órdenes, cotizaciones y control operativo.' },
      { name: 'Inteligencia artificial', text: 'Asistentes y análisis aplicados a casos concretos, con supervisión humana.' },
      { name: 'Integraciones', text: 'Conectamos lo que ya utiliza: pagos, mensajería, mapas y calendarios.' },
      { name: 'Producción audiovisual', text: 'Fotografía y video de producto para su comunicación comercial.' },
      { name: 'Analítica', text: 'Indicadores claros para decidir con datos.' },
    ],
  },

  s7: {
    nav: 'Principios',
    title: ['Seis', 'principios'],
    items: [
      { name: 'Problema primero', text: 'No proponemos tecnología sin entender antes la necesidad.' },
      { name: 'Adaptabilidad', text: 'Cada negocio opera distinto. La solución se ajusta a usted, no al revés.' },
      { name: 'Innovación', text: 'Buscamos la manera más inteligente de resolver, no la más habitual.' },
      { name: 'Eficiencia', text: 'Menos tiempo perdido, menos errores, menos recursos desperdiciados.' },
      { name: 'Resolución', text: 'No nos limitamos a señalar el problema: construimos lo que lo resuelve.' },
      { name: 'Evolución', text: 'Lo que construimos puede crecer al ritmo de su negocio.' },
    ],
  },

  s8: {
    nav: 'Alcances',
    title: 'Tres alcances',
    body: 'Su inversión define hasta dónde llega el alcance. La calidad es la misma en los tres.',
    note: 'Los rangos de inversión se presentan junto con la propuesta, después del diagnóstico.',
    items: [
      { name: 'Essential', tag: 'Un problema prioritario, resuelto.', text: 'Un sitio comercial, un sistema de reservaciones, un CRM básico, un menú digital o un cotizador.' },
      { name: 'Advanced', tag: 'Varias áreas, conectadas.', text: 'Sitio, CRM, automatizaciones, tablero de indicadores y administración de usuarios trabajando juntos.' },
      { name: 'Enterprise', tag: 'La operación completa, a la medida.', text: 'Sistemas multisucursal, integraciones externas, automatización avanzada, analítica y soporte definido.' },
    ],
  },

  s9: {
    nav: 'Siguiente paso',
    title: ['El siguiente', 'paso'],
    body: 'Una segunda reunión. Preparamos una demostración adaptada a su empresa con lo que conversamos hoy, para que vea cómo funcionaría antes de decidir.',
    steps: [
      { when: 'Hoy', what: 'Diagnóstico' },
      { when: 'En una semana', what: 'Demostración adaptada' },
      { when: 'Después', what: 'Alcance, inversión y calendario' },
    ],
    lema: 'We solve what holds you back.',
    restart: 'Volver al inicio',
    contactLabels: { whatsapp: 'WhatsApp', correo: 'Correo', web: 'Web', instagram: 'Instagram' },
  },
}
