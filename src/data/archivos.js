// Archivos (grabaciones y comprobantes). Se guardan primero en este dispositivo, en IndexedDB,
// y suben a Supabase Storage cuando hay sesión y conexión. Nada se pierde si se va la señal.

let nube = null
let dbP = null

function db() {
  if (dbP) return dbP
  dbP = new Promise((ok, mal) => {
    const r = indexedDB.open('soma-archivos', 1)
    r.onupgradeneeded = () => {
      r.result.createObjectStore('blobs')
      r.result.createObjectStore('trozos')
    }
    r.onsuccess = () => ok(r.result)
    r.onerror = () => mal(r.error)
  })
  return dbP
}

async function tx(almacen, modo, fn) {
  const d = await db()
  return new Promise((ok, mal) => {
    const t = d.transaction(almacen, modo)
    const res = fn(t.objectStore(almacen))
    t.oncomplete = () => ok(res?.result)
    t.onerror = () => mal(t.error)
  })
}

const clave = (bucket, ruta) => `${bucket}/${ruta}`

export const archivos = {
  conectar(n) {
    nube = n
  },

  /** Guarda un archivo aquí y lo deja en espera de subir. */
  async guardar(bucket, ruta, blob) {
    await tx('blobs', 'readwrite', (s) => s.put({ blob, bucket, ruta, subido: false, tipo: blob.type }, clave(bucket, ruta)))
    archivos.subirPendientes()
    return ruta
  },

  /** URL para reproducir o descargar: la copia local si existe; si no, un enlace temporal de la nube. */
  async url(bucket, ruta) {
    if (!ruta) return null
    try {
      const local = await tx('blobs', 'readonly', (s) => s.get(clave(bucket, ruta)))
      if (local?.blob) return URL.createObjectURL(local.blob)
    } catch {}
    if (!nube?.activo?.()) return null
    const { data } = await nube.sb.storage.from(bucket).createSignedUrl(ruta, 3600)
    return data?.signedUrl || null
  },

  async subirPendientes() {
    if (!nube?.activo?.() || !navigator.onLine) return
    let llaves = []
    try {
      llaves = await tx('blobs', 'readonly', (s) => s.getAllKeys())
    } catch {
      return
    }
    for (const k of llaves) {
      const a = await tx('blobs', 'readonly', (s) => s.get(k))
      if (!a || a.subido) continue
      const { error } = await nube.sb.storage.from(a.bucket).upload(a.ruta, a.blob, { upsert: true, contentType: a.tipo || undefined })
      if (!error) await tx('blobs', 'readwrite', (s) => s.put({ ...a, subido: true }, k))
    }
  },

  // Trozos de una grabación en curso: si la pestaña se cierra, lo grabado hasta ahí se recupera.
  async ponTrozo(id, n, blob) {
    await tx('trozos', 'readwrite', (s) => s.put(blob, `${id}:${String(n).padStart(6, '0')}`))
  },

  async juntaTrozos(id, tipo) {
    const d = await db()
    const partes = await new Promise((ok, mal) => {
      const out = []
      const t = d.transaction('trozos', 'readonly')
      const r = t.objectStore('trozos').openCursor(IDBKeyRange.bound(`${id}:`, `${id}:￿`))
      r.onsuccess = () => {
        const c = r.result
        if (!c) return
        out.push(c.value)
        c.continue()
      }
      t.oncomplete = () => ok(out)
      t.onerror = () => mal(t.error)
    })
    return partes.length ? new Blob(partes, { type: tipo || partes[0].type }) : null
  },

  async borraTrozos(id) {
    await tx('trozos', 'readwrite', (s) => s.delete(IDBKeyRange.bound(`${id}:`, `${id}:￿`)))
  },

  /** Grabaciones que quedaron a medias (ids de visita). */
  async trozosHuerfanos() {
    try {
      const llaves = await tx('trozos', 'readonly', (s) => s.getAllKeys())
      return [...new Set(llaves.map((k) => String(k).split(':')[0]))]
    } catch {
      return []
    }
  },
}

if (typeof window !== 'undefined') addEventListener('online', () => archivos.subirPendientes())
