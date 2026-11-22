/* Soma Connect
   Enlaza un sistema entregado con el CRM de Soma. Una sola línea en el sistema:

     <script src="https://…/soma-connect.js" data-llave="soma_…" data-servidor="https://…/functions/v1/connect" data-version="1.0.0"></script>

   Qué hace:
   · Avisa al CRM que el sistema está vivo cada vez que alguien lo abre.
   · Pregunta por el estado de su membresía. Si está por vencer muestra un aviso; si venció o
     fue suspendido, muestra un aviso o pausa el sistema, según lo configurado en el CRM.
   · SomaConnect.evento(tipo, texto, datos) anota algo en el expediente del cliente.
   · SomaConnect.estado() devuelve la última respuesta ({ estado, vence, dias, modo, config }).

   Si no hay conexión, el sistema sigue funcionando: nunca se pausa por una falla de red. */
;(function () {
  var s = document.currentScript
  if (!s) return
  var llave = s.getAttribute('data-llave')
  var servidor = s.getAttribute('data-servidor')
  var version = s.getAttribute('data-version') || ''
  if (!llave || !servidor) return
  var ultimo = null

  function enviar(cuerpo) {
    return fetch(servidor, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-soma-key': llave }, body: JSON.stringify(cuerpo) }).then(function (r) {
      return r.ok ? r.json() : null
    })
  }

  function fecha(d) {
    try {
      var p = d.split('-')
      return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    } catch (e) {
      return d
    }
  }

  function banda(texto) {
    var b = document.createElement('div')
    b.setAttribute('role', 'status')
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483646;max-width:560px;margin:0 auto;padding:12px 16px;border-radius:12px;background:#050506;color:#efece4;font:500 14px/1.4 system-ui,sans-serif;box-shadow:0 12px 40px -12px rgba(0,0,0,.5);display:flex;gap:12px;align-items:center'
    var t = document.createElement('span')
    t.style.flex = '1'
    t.textContent = texto
    var x = document.createElement('button')
    x.textContent = 'Entendido'
    x.style.cssText = 'flex:none;border:1.5px solid rgba(239,236,228,.4);border-radius:999px;background:none;color:inherit;font:inherit;padding:6px 12px;cursor:pointer'
    x.onclick = function () {
      b.remove()
    }
    b.appendChild(t)
    b.appendChild(x)
    document.body.appendChild(b)
  }

  function pausa(texto) {
    var v = document.createElement('div')
    v.setAttribute('role', 'alertdialog')
    v.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#efece4;color:#050506;font:400 17px/1.5 system-ui,sans-serif'
    v.innerHTML = '<div style="max-width:30rem"><svg width="52" height="52" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#050506" stroke-width="6"/><circle cx="32" cy="32" r="9" fill="#216fff"/></svg><h1 style="font:700 28px/1.15 system-ui,sans-serif;margin:18px 0 8px">El sistema está en pausa</h1><p data-t style="opacity:.75;margin:0"></p></div>'
    v.querySelector('[data-t]').textContent = texto
    document.body.appendChild(v)
    document.documentElement.style.overflow = 'hidden'
  }

  function aplicar(r) {
    if (!r || !r.estado) return
    ultimo = r
    try {
      window.dispatchEvent(new CustomEvent('soma:estado', { detail: r }))
    } catch (e) {}
    var modo = r.modo || 'aviso'
    if (r.estado === 'suspendido') return pausa(r.mensaje || 'Este sistema fue pausado. Para reactivarlo, comuníquese con Soma.')
    if (r.estado === 'vencida') {
      var t = r.mensaje || 'La membresía de este sistema venció' + (r.vence ? ' el ' + fecha(r.vence) : '') + '. Para ponerla al corriente, comuníquese con Soma.'
      if (modo === 'bloqueo') return pausa(t)
      if (modo === 'aviso') return banda(t)
    }
    if (r.estado === 'por_vencer' && modo !== 'nada') {
      var clave = 'soma-aviso-' + r.vence
      try {
        if (sessionStorage.getItem(clave)) return
        sessionStorage.setItem(clave, '1')
      } catch (e) {}
      banda(r.mensaje || (r.dias === 0 ? 'La membresía de este sistema vence hoy.' : 'La membresía de este sistema vence en ' + r.dias + (r.dias === 1 ? ' día' : ' días') + ', el ' + fecha(r.vence) + '.'))
    }
  }

  function arrancar() {
    enviar({ accion: 'ping', version: version, url: location.origin + location.pathname })
      .then(aplicar)
      .catch(function () {})
  }

  window.SomaConnect = {
    estado: function () {
      return ultimo
    },
    evento: function (tipo, texto, datos) {
      return enviar({ accion: 'evento', tipo: tipo, texto: texto, datos: datos || null }).catch(function () {
        return null
      })
    },
    revisar: arrancar,
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar)
  else arrancar()
})()
