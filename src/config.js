// Conexión con el proyecto de Supabase "SOMA CRM".
// La llave publicable está pensada para vivir en el navegador: lo que protege
// los datos son las políticas de la base (solo el equipo puede leer o escribir).

export const SUPABASE_URL = 'https://sejgalcoyzbzylxoxzpr.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_Ae1232lm8Vu6orU2ZLIwDQ_Zxx5TmjZ'
export const FUNCIONES = `${SUPABASE_URL}/functions/v1`

/** Moneda y región de todo el sistema. */
export const MONEDA = 'MXN'
export const REGION = 'es-MX'
