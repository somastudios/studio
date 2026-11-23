import { abrirApp, alTocar } from '../app/vista.js'
import { ir } from '../app/router.js'
import { entrar, crearCuenta, usarSinCuenta, sesion } from '../app/sesion.js'
import { leerCampos } from '../app/capas.js'
import { esc } from '../app/util.js'
import { store } from '../data/store.js'

// Acceso del equipo. Tres caminos: entrar, crear cuenta con el código de equipo,
// o trabajar solo en este dispositivo sin cuenta.

export function vistaEntrar() {
  if (sesion.usuario) return void ir('/crm', { reemplazar: true })
  const app = abrirApp({ tema: 'ink', titulo: 'Entrar · Soma' })
  let modo = 'entrar'

  function pintar(error = '') {
    const crear = modo === 'crear'
    app.innerHTML = `
      <div class="en">
        <div class="en-marca"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="6.4"/><circle cx="32" cy="32" r="9.4" fill="#216fff"/></svg><p><b>SOMA</b> Studio</p></div>
        <form class="en-caja" novalidate>
          <h1 class="a-h1 en-h">${crear ? 'Crear cuenta' : 'Entrar'}</h1>
          <p class="a-p">${crear ? 'Solo para el equipo. Ten a la mano el código.' : 'Qué bueno verte. Entra para seguir donde te quedaste.'}</p>
          <div class="a-campos en-campos">
            ${crear ? `<label class="a-campo"><span>Tu nombre</span><input class="a-in" name="nombre" autocomplete="name" required /></label>` : ''}
            <label class="a-campo"><span>Correo</span><input class="a-in" name="correo" type="email" autocomplete="email" required /></label>
            <label class="a-campo"><span>Contraseña</span><input class="a-in" name="clave" type="password" autocomplete="${crear ? 'new-password' : 'current-password'}" required />${crear ? '<span class="a-ayuda" style="text-transform:none;letter-spacing:0;font-family:inherit">Mínimo 8 caracteres.</span>' : ''}</label>
            ${crear ? `<label class="a-campo"><span>Código de equipo</span><input class="a-in" name="codigo" autocomplete="off" required /></label>` : ''}
          </div>
          ${error ? `<p class="a-error" role="alert">${esc(error)}</p>` : ''}
          <button type="submit" class="a-btn a-btn--azul a-btn--g en-ok">${crear ? 'Crear cuenta y entrar' : 'Entrar'}</button>
          <p class="en-alt"><button type="button" class="a-enlace" data-modo>${crear ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button></p>
        </form>
        <div class="en-local">
          <p class="a-k">Sin cuenta</p>
          <p class="a-p">${store.estado.persistente ? 'Puedes usar todo sin cuenta, solo en este dispositivo. Cuando inicies sesión, lo que hayas registrado se sube solo.' : 'Puedes probar todo sin cuenta. Ojo: este navegador no guarda, así que al cerrar se borra.'}</p>
          <button type="button" class="a-btn a-btn--pri" data-local>${store.estado.persistente ? 'Usar solo en este dispositivo' : 'Probar sin cuenta'}</button>
          <a class="a-enlace en-gen" href="#/general">Ver la presentación general</a>
        </div>
      </div>`
  }
  pintar()

  const q1 = alTocar(app, '[data-modo]', () => {
    modo = modo === 'crear' ? 'entrar' : 'crear'
    pintar()
  })
  const q2 = alTocar(app, '[data-local]', () => {
    usarSinCuenta()
    ir('/crm')
  })
  const enviar = async (e) => {
    e.preventDefault()
    const c = leerCampos(app)
    if (!c.correo || !c.clave || (modo === 'crear' && (!c.nombre || !c.codigo))) return pintar('Falta llenar algo.')
    const b = app.querySelector('.en-ok')
    b.disabled = true
    b.textContent = 'Un momento…'
    const r = modo === 'crear' ? await crearCuenta(c) : await entrar(c.correo, c.clave)
    if (r.error) return pintar(r.error)
    ir('/crm')
  }
  app.addEventListener('submit', enviar)
  return () => {
    q1()
    q2()
    app.removeEventListener('submit', enviar)
  }
}
