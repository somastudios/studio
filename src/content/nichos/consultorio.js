// Consultorio médico: médico general o especialista, nutriólogo, psicólogo, fisioterapia.
// Sigue el contrato de docs/ARQUITECTURA.md ("Contrato de un nicho").

export default {
  id: 'consultorio',
  familia: 'salud',
  nombre: 'Consultorio médico',
  plural: 'consultorios',
  icono: 'consultorio',
  acento: '#1d5c7a',
  orden: 10,
  vocab: {
    cliente: 'el paciente',
    clientes: 'los pacientes',
    personal: 'la recepción',
    empleado: 'la recepcionista',
    producto: 'servicio',
    productos: 'servicios',
    cita: 'consulta',
    citas: 'consultas',
    lugar: 'consultorio',
  },

  // Para quien presenta, antes de entrar.
  apertura: 'Vimos gente en la sala de espera. ¿Atiende con cita o como van llegando?',
  observa: [
    'Si la agenda es una libreta en el escritorio de recepción y quién más la puede consultar.',
    'Dónde viven los expedientes: archivero, carpetas apiladas o computadora.',
    'Cuántos pacientes esperan y si alguno pregunta cuánto falta para pasar.',
  ],

  // Datos de muestra para vestir las demos. Son ilustrativos.
  muestra: {
    productos: [
      { nombre: 'Electrocardiograma', precio: 450, categoria: 'Estudios' },
      { nombre: 'Glucosa capilar', precio: 60, categoria: 'Estudios' },
      { nombre: 'Papanicolaou', precio: 450, categoria: 'Estudios' },
      { nombre: 'Espirometría', precio: 500, categoria: 'Estudios' },
      { nombre: 'Curación', precio: 200, categoria: 'Procedimientos' },
      { nombre: 'Aplicación de inyección', precio: 50, categoria: 'Procedimientos' },
      { nombre: 'Retiro de puntos', precio: 250, categoria: 'Procedimientos' },
      { nombre: 'Lavado de oídos', precio: 350, categoria: 'Procedimientos' },
      { nombre: 'Certificado médico', precio: 150, categoria: 'Documentos' },
      { nombre: 'Resumen clínico', precio: 200, categoria: 'Documentos' },
      { nombre: 'Paquete de 10 sesiones de fisioterapia', precio: 3000, categoria: 'Paquetes' },
      { nombre: 'Plan de nutrición mensual', precio: 900, categoria: 'Paquetes' },
      { nombre: 'Chequeo anual', precio: 1500, categoria: 'Paquetes' },
    ],
    servicios: [
      { nombre: 'Consulta general', precio: 400, minutos: 30 },
      { nombre: 'Consulta de especialidad', precio: 800, minutos: 40 },
      { nombre: 'Consulta de seguimiento', precio: 350, minutos: 20 },
      { nombre: 'Consulta de nutrición', precio: 500, minutos: 45 },
      { nombre: 'Sesión de fisioterapia', precio: 350, minutos: 50 },
      { nombre: 'Sesión de psicología', precio: 500, minutos: 50 },
    ],
    personal: ['Arturo', 'Fernanda', 'Rocío', 'Gabriel'],
    clientes: ['Sra. Villalvazo', 'Don Ernesto', 'Daniela Chávez', 'Mtro. Cárdenas', 'Sra. Magaña', 'Luis Ángel Rojas'],
    insumos: [
      { nombre: 'Guantes de nitrilo', unidad: 'cajas', hay: 2, minimo: 4 },
      { nombre: 'Abatelenguas', unidad: 'paquetes', hay: 6, minimo: 3 },
      { nombre: 'Jeringas de 5 ml', unidad: 'pzas', hay: 40, minimo: 50 },
      { nombre: 'Tiras reactivas de glucosa', unidad: 'cajas', hay: 3, minimo: 2 },
      { nombre: 'Gel antibacterial', unidad: 'L', hay: 4, minimo: 2 },
      { nombre: 'Papel para camilla', unidad: 'rollos', hay: 1, minimo: 3 },
      { nombre: 'Cubrebocas', unidad: 'cajas', hay: 5, minimo: 3 },
      { nombre: 'Recetarios', unidad: 'blocs', hay: 4, minimo: 2 },
    ],
  },

  problemas: [
    // ── Atención ──
    {
      id: 'sala-llena',
      area: 'atencion',
      titulo: 'Se me llena la sala de espera',
      senal: 'Las consultas se alargan, los pacientes se juntan y más de uno se va sin pasar.',
      frecuente: true,
      matices: [{ id: 'cita', pregunta: '¿Atiende solo con cita?', si: 'Atiende con cita', no: 'Por orden de llegada' }],
      rutas: [
        { sol: 'turnos-virtuales', para: 'El paciente toma su ficha desde el celular y espera en su casa o en su coche. Llega cuando faltan dos por pasar.', pide: { cita: false } },
        { sol: 'agenda-interna', para: 'Cada tipo de consulta con su duración: primera vez, cuarenta minutos; revisión, veinte. La agenda deja de encimar pacientes.', pide: { cita: true } },
        { sol: 'pantalla-turnos', para: 'Una pantalla en la sala muestra qué ficha sigue, sin nombres. La recepcionista deja de contestar "¿cuánto me falta?" a cada rato.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: un mensaje ya escrito para avisar que el doctor va con media hora de retraso. El paciente sale más tarde de su casa.' },
      ],
    },
    {
      id: 'no-llegan',
      area: 'atencion',
      titulo: 'Sacan cita y no llegan',
      senal: 'Huecos de media hora que ya nadie ocupa, justo en el horario que más piden.',
      frecuente: true,
      matices: [
        { id: 'anticipo', pregunta: '¿Cobraría un anticipo para apartar la primera cita?', si: 'Anticipo aceptado', no: 'Sin anticipo' },
        { id: 'espera', pregunta: '¿Tiene pacientes esperando días para conseguir cita?', si: 'Hay espera para conseguir cita', no: 'Suele haber lugares libres' },
      ],
      rutas: [
        { sol: 'anticipo-reserva', para: 'La cita de primera vez se aparta con un anticipo que se descuenta al pagar la consulta. Quien aparta, llega.', pide: { anticipo: true } },
        { sol: 'lista-espera', para: 'Cuando alguien cancela, el horario se ofrece a quien pedía cita para antes. El hueco de las seis se vuelve a ocupar.', pide: { espera: true } },
        { sol: 'recordatorios', para: 'Un mensaje un día antes para confirmar o cancelar con un toque. Dice día y hora, nunca el motivo de la consulta.' },
        { sol: 'base-clientes', para: 'Lo mínimo: el celular de cada paciente bien anotado al dar la cita. Sin ese dato no hay forma de confirmar ni de avisar.' },
      ],
    },

    // ── Comunicación ──
    {
      id: 'telefono-no-para',
      area: 'comunicacion',
      titulo: 'El teléfono y el WhatsApp no dejan trabajar',
      senal: 'La recepcionista contesta citas, precios y horarios todo el día, con pacientes enfrente.',
      frecuente: true,
      matices: [{ id: 'enlinea', pregunta: '¿Sus pacientes apartarían cita por su cuenta desde el celular?', si: 'Apartarían en línea', no: 'Prefieren llamar o escribir' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'El paciente ve los horarios libres y aparta solo, aunque sean las once de la noche. La recepción deja de ser conmutador.', pide: { enlinea: true } },
        { sol: 'respuesta-automatica', para: 'Costo de la consulta, horario, dirección y si se atiende sin cita se contestan solos. Lo que es de salud siempre pasa a una persona.' },
        { sol: 'respuestas-rapidas', para: 'Cómo llegar, requisitos de primera vez, formas de pago: ya escritos. La recepcionista responde con un toque.', pide: { enlinea: false } },
        { sol: 'perfil-google', para: 'Lo más corto: horario, teléfono y ubicación correctos en Google. Una parte de las llamadas es solo para preguntar eso.' },
      ],
    },
    {
      id: 'celular-personal',
      area: 'comunicacion',
      titulo: 'Me escriben a mi celular a todas horas',
      senal: 'Resultados, dudas y fotos llegan al WhatsApp personal del doctor, revueltos con lo familiar.',
      matices: [{ id: 'numero', pregunta: '¿El consultorio tiene un número aparte del suyo?', si: 'Hay número del consultorio', no: 'Todo llega a su número personal' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Los estudios que manda el paciente se guardan en su ficha, no en un chat. En la consulta están a la mano y solo los ve quien debe.' },
        { sol: 'respuesta-automatica', para: 'Fuera de horario, el número del consultorio responde solo: cuándo se le contestará y el teléfono de urgencias que usted indique.', pide: { numero: true } },
        { sol: 'agenda-en-linea', para: 'Buena parte de esos mensajes es para pedir cita. Con un enlace para apartarla, dejan de llegar a su chat.' },
        { sol: 'proceso-claro', para: 'Lo primero: un número del consultorio y un acuerdo de qué se contesta ahí, quién y en qué horario. Su celular vuelve a ser suyo.', pide: { numero: false } },
      ],
    },

    // ── Organización ──
    {
      id: 'expedientes-papel',
      area: 'organizacion',
      titulo: 'Los expedientes están en papel y no aparecen',
      senal: 'Carpetas en el archivero. Buscar una tarda, y a veces el paciente pasa sin su historial.',
      frecuente: true,
      matices: [{ id: 'captura', pregunta: '¿Tomaría sus notas en computadora o tableta durante la consulta?', si: 'Escribiría en pantalla', no: 'Prefiere seguir a mano' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada paciente con su ficha: motivo de consulta, notas y estudios por fecha. Se abre en segundos y solo la ve quien debe verla.', pide: { captura: true } },
        { sol: 'formatos-digitales', para: 'La historia clínica de primera vez la llena el paciente en una tableta, en la sala. Llega legible y queda guardada con su firma.' },
        { sol: 'base-clientes', para: 'Sin cambiar su forma de escribir: una lista de pacientes con teléfono, última consulta y el número de carpeta de su expediente.', pide: { captura: false } },
        { sol: 'proceso-claro', para: 'Lo mínimo: acordar cómo se archiva y quién saca desde la mañana las carpetas del día, según la agenda.' },
      ],
    },
    {
      id: 'depende-recepcionista',
      area: 'organizacion',
      titulo: 'Si falta la recepcionista, se detiene el consultorio',
      senal: 'Citas, cobros, llamadas y archivo dependen de una persona y de lo que trae en la cabeza.',
      matices: [{ id: 'propio', pregunta: '¿Los teléfonos de los pacientes están en el celular de ella?', si: 'Contactos en su celular', no: 'Contactos en el consultorio' }],
      rutas: [
        { sol: 'agenda-interna', para: 'La agenda deja de vivir en la libreta del escritorio. El doctor y quien cubra la ven igual, desde su celular.' },
        { sol: 'base-clientes', para: 'Los datos de los pacientes pasan a un registro del consultorio, resguardado. Ya no se van en el celular de nadie.', pide: { propio: true } },
        { sol: 'bitacora-turno', para: 'Lo pendiente queda por escrito: a quién hay que llamar, quién quedó a deber, qué estudio falta. Quien cubre sabe por dónde seguir.' },
        { sol: 'checklist-turnos', para: 'Abrir y cerrar con una lista: confirmar las citas de mañana, hacer el corte, revisar material. Cualquiera puede seguirla.' },
      ],
    },
    {
      id: 'cambio-ultima-hora',
      area: 'organizacion',
      titulo: 'Cuando me sale una urgencia hay que avisarles a todos',
      senal: 'Una cirugía o un imprevisto obliga a llamar uno por uno a los pacientes de la tarde.',
      matices: [{ id: 'seguido', pregunta: '¿Le pasa seguido, por guardias o cirugías?', si: 'Le pasa casi cada semana', no: 'Es ocasional' }],
      rutas: [
        { sol: 'agenda-en-linea', para: 'Usted bloquea la tarde desde su celular y cada paciente recibe un enlace para elegir su nuevo horario. Nadie llama a nadie.', pide: { seguido: true } },
        { sol: 'agenda-interna', para: 'La agenda y el teléfono de cada paciente en la misma vista. Reacomodar una tarde toma minutos, no una hora de llamadas.' },
        { sol: 'recordatorios', para: 'El aviso del cambio sale a todos los de la tarde en un solo paso, y cada quien confirma si le queda el nuevo horario.' },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: el mensaje de "el doctor tuvo una urgencia" ya escrito, con las opciones de horario. Se envía con un toque.' },
      ],
    },

    // ── Clientes ──
    {
      id: 'no-vuelven-seguimiento',
      area: 'clientes',
      titulo: 'Los pacientes no vuelven a su seguimiento',
      senal: 'Se les indica regresar en un mes o en tres, y no se vuelve a saber de ellos.',
      frecuente: true,
      matices: [{ id: 'proxima', pregunta: '¿El paciente sale con la fecha de su siguiente cita?', si: 'Sale con su próxima cita', no: 'Se le dice "regrese en un mes"' }],
      rutas: [
        { sol: 'expediente-cliente', para: 'Cada ficha dice lo que sigue: control en tres meses, estudios pendientes. Se ve quién debía volver y no ha venido.' },
        { sol: 'reactivacion', para: 'El sistema detecta a quién se le pasó su control y prepara el mensaje para invitarlo a retomar. Usted decide a quién se envía.' },
        { sol: 'recordatorios', para: 'De una cita a tres meses nadie se acuerda. El recordatorio llega una semana antes y otra vez la víspera.', pide: { proxima: true } },
        { sol: 'proceso-claro', para: 'Lo mínimo: que nadie salga sin su siguiente cita anotada. Acordamos quién la da y en qué momento, antes de cobrar.', pide: { proxima: false } },
      ],
    },
    {
      id: 'solo-recomendacion',
      area: 'clientes',
      titulo: 'Solo llegan por recomendación',
      senal: 'Quien busca un especialista en internet encuentra a otros, o un teléfono que ya no es el suyo.',
      matices: [{ id: 'fuera', pregunta: '¿Le llegan pacientes de otros municipios?', si: 'Vienen de otros municipios', no: 'Pacientes de la ciudad' }],
      rutas: [
        { sol: 'sitio-web', para: 'Una página con su especialidad, qué atiende, costo de consulta y cómo llegar. Quien viaja una hora llega sabiendo a qué va.', pide: { fuera: true } },
        { sol: 'agenda-en-linea', para: 'Quien lo encuentra a las diez de la noche aparta en ese momento. No tiene que acordarse de llamar al día siguiente.' },
        { sol: 'resenas', para: 'Después de la consulta, una invitación a opinar en Google. El mensaje no menciona el motivo de la visita.' },
        { sol: 'perfil-google', para: 'Lo primero: que al buscar su nombre o su especialidad aparezca con horario, teléfono correcto y ubicación.' },
      ],
    },

    // ── Administración ──
    {
      id: 'facturas-se-juntan',
      area: 'administracion',
      titulo: 'Me piden factura y se me juntan',
      senal: 'Los datos fiscales llegan por WhatsApp, en papelitos o de palabra, y la factura sale días después.',
      frecuente: true,
      matices: [{ id: 'contador', pregunta: '¿Las facturas las hace su contador?', si: 'Factura el contador', no: 'Factura el consultorio' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada consulta cobrada queda con su forma de pago y si pidió factura. A fin de mes la lista está completa. No timbra facturas.' },
        { sol: 'formatos-digitales', para: 'El paciente captura sus datos fiscales una sola vez, en pantalla, sin dictarlos. Quedan guardados para la siguiente consulta.' },
        { sol: 'reporte-diario', para: 'Cada noche, las facturas pedidas ese día llegan a su contador con datos y montos. Él solo las timbra.', pide: { contador: true } },
        { sol: 'respuestas-rapidas', para: 'Lo mínimo: un mensaje ya escrito que pide los datos fiscales completos de una vez, y un día fijo a la semana para facturar.' },
      ],
    },
    {
      id: 'no-se-cuanto-entro',
      area: 'administracion',
      titulo: 'No sé cuánto entró en la semana sin ponerme a sumar',
      senal: 'Efectivo en el cajón, transferencias al celular y una libreta que no siempre se llena.',
      matices: [{ id: 'cobra', pregunta: '¿Cobra la recepcionista?', si: 'Cobra la recepcionista', no: 'Cobra el doctor' }],
      rutas: [
        { sol: 'punto-de-venta', para: 'Cada consulta se cobra y queda anotada: efectivo, tarjeta o transferencia. El recibo sale solo y la libreta ya no hace falta.' },
        { sol: 'tablero-ventas', para: 'Cuántas consultas van hoy y cuánto entró, por semana y por mes. Lo revisa en su celular entre un paciente y otro.' },
        { sol: 'corte-de-caja', para: 'Al cerrar, el sistema dice cuánto debe haber según las consultas del día. Se cuenta y la diferencia queda a la vista.', pide: { cobra: true } },
        { sol: 'reporte-diario', para: 'Cada noche, un mensaje: pacientes atendidos, cuánto entró y por qué medio. Sin abrir ningún sistema.' },
      ],
    },
    {
      id: 'sesiones-paquete',
      area: 'administracion',
      titulo: 'Pierdo la cuenta de las sesiones pagadas',
      senal: 'Paquetes de diez sesiones anotados en una tarjeta. Nadie sabe cuántas van ni cuánto se debe.',
      matices: [{ id: 'adelantado', pregunta: '¿El paquete se paga completo por adelantado?', si: 'Paquete pagado por adelantado', no: 'Se paga en abonos' }],
      rutas: [
        { sol: 'control-mensualidades', para: 'Cada paciente con su paquete: sesiones tomadas, sesiones que le quedan y fecha de vencimiento. Se ve de un vistazo.' },
        { sol: 'fiado', para: 'Si paga en abonos, cada paciente tiene su saldo y sus pagos anotados. Se acaba el "yo ya le había dado".', pide: { adelantado: false } },
        { sol: 'cobro-en-linea', para: 'El paquete se paga con un enlace antes de la primera sesión. El pago queda confirmado y ligado al paciente.', pide: { adelantado: true } },
        { sol: 'tarjeta-lealtad', para: 'Lo más ligero: la tarjeta de sesiones en el celular del paciente. Cada visita marca una y los dos ven cuántas van.' },
      ],
    },

    // ── Inventarios ──
    {
      id: 'material-se-acaba',
      area: 'inventarios',
      titulo: 'El material se acaba cuando más se necesita',
      senal: 'Guantes, jeringas o tiras reactivas que faltan a media consulta. Se manda a alguien a la farmacia.',
      matices: [{ id: 'caduca', pregunta: '¿También se le caducan muestras, vacunas o medicamento?', si: 'También hay caducados', no: 'Solo se acaba el material' }],
      rutas: [
        { sol: 'inventario-alertas', para: 'Cada material con su mínimo. Cuando quedan dos cajas de guantes, llega el aviso para pedir con tiempo.' },
        { sol: 'caducidades', para: 'Muestras médicas y vacunas entran con su fecha. Lo que vence el mes que viene aparece primero.', pide: { caduca: true } },
        { sol: 'compras-sugeridas', para: 'Según lo que se gasta por semana, la lista para el proveedor se arma sola. Se deja de comprar de más por si acaso.' },
        { sol: 'checklist-turnos', para: 'Lo mínimo: cada viernes, una lista de diez renglones para revisar gabinete y cajones. Lo que falta se pide ese día.' },
      ],
    },

    // ── Rentabilidad ──
    {
      id: 'no-se-que-deja',
      area: 'rentabilidad',
      titulo: 'Trabajo todo el día y no sé qué me deja el consultorio',
      senal: 'Renta, sueldos y material suben. El precio de la consulta lleva años igual.',
      matices: [{ id: 'llena', pregunta: '¿Tiene la agenda llena casi todos los días?', si: 'Agenda llena', no: 'Quedan huecos' }],
      rutas: [
        { sol: 'costeo', para: 'Si ya no caben más pacientes, la pregunta es el precio. Renta, sueldos y material repartidos entre las consultas del mes.', pide: { llena: true } },
        { sol: 'tablero-ventas', para: 'Consultas e ingreso por día y por horario. Se ve si el sábado deja o si la tarde del jueves apenas cubre el gasto.' },
        { sol: 'reactivacion', para: 'Los huecos se llenan primero con quienes ya son sus pacientes y dejaron pasar su revisión.', pide: { llena: false } },
        { sol: 'recordatorios', para: 'Lo más corto: cada plantón es una consulta que no se cobra. Confirmar un día antes da tiempo de ocupar el lugar.' },
      ],
    },
  ],
}
