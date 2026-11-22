import { archivos } from '../data/archivos.js'

// Graba el audio de la visita. El permiso del micrófono se pide en la presala, para que el aviso
// del navegador no aparezca frente al cliente. Lo grabado se guarda por trozos: si la pestaña se
// cierra, se recupera hasta el último trozo.

let flujo = null
let rec = null
let visita = null
let n = 0
let t0 = 0
let acumulado = 0
const oyentes = new Set()
const avisa = () => oyentes.forEach((fn) => fn())

export const grabadora = {
  get soportada() {
    return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
  },
  get lista() {
    return !!flujo
  },
  get grabando() {
    return rec?.state === 'recording'
  },
  get segundos() {
    return Math.round(acumulado + (grabadora.grabando ? (performance.now() - t0) / 1000 : 0))
  },
  alCambiar(fn) {
    oyentes.add(fn)
    return () => oyentes.delete(fn)
  },

  /** Pide el micrófono. Devuelve true si quedó listo. */
  async pedirPermiso() {
    if (flujo) return true
    if (!grabadora.soportada) return false
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      avisa()
      return true
    } catch {
      flujo = null
      return false
    }
  },

  soltar() {
    flujo?.getTracks().forEach((t) => t.stop())
    flujo = null
    avisa()
  },

  async iniciar(visitaId) {
    if (rec || !(await grabadora.pedirPermiso())) return false
    visita = visitaId
    n = 0
    acumulado = 0
    const tipo = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) || ''
    rec = new MediaRecorder(flujo, tipo ? { mimeType: tipo, audioBitsPerSecond: 32000 } : undefined)
    rec.ondataavailable = (e) => e.data.size && archivos.ponTrozo(visita, n++, e.data).catch(() => {})
    rec.start(5000)
    t0 = performance.now()
    avisa()
    return true
  },

  alternar() {
    if (!rec) return
    if (rec.state === 'recording') {
      acumulado += (performance.now() - t0) / 1000
      rec.pause()
    } else if (rec.state === 'paused') {
      rec.resume()
      t0 = performance.now()
    }
    avisa()
  },

  /** Termina y guarda. Devuelve { ruta, seg } o null si no había grabación. */
  async detener() {
    if (!rec) return null
    const seg = grabadora.segundos
    const tipo = rec.mimeType
    const id = visita
    await new Promise((ok) => {
      rec.onstop = ok
      try {
        rec.stop()
      } catch {
        ok()
      }
    })
    rec = null
    grabadora.soltar()
    await new Promise((r) => setTimeout(r, 150))
    return guardarTrozos(id, tipo, seg)
  },
}

async function guardarTrozos(id, tipo, seg) {
  const blob = await archivos.juntaTrozos(id, tipo)
  if (!blob) return null
  const ruta = `${id}.${/mp4/.test(blob.type) ? 'm4a' : 'webm'}`
  await archivos.guardar('grabaciones', ruta, blob)
  await archivos.borraTrozos(id)
  return { ruta, seg }
}

/** Rescata una grabación que quedó a medias (por ejemplo, si se cerró la pestaña). */
export const rescatarGrabacion = (visitaId) => guardarTrozos(visitaId, '', null)
