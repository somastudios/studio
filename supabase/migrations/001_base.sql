-- SOMA CRM · base de datos
-- Todo lo que el equipo registra en visitas y en el CRM. Cada tabla existe igual en el dispositivo
-- (src/data/esquema.js) y aquí. Solo el equipo puede leer o escribir.

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── Equipo ─────────────────────────

create table public.equipo (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol text not null default 'miembro',
  creado timestamptz not null default now()
);

alter table public.equipo enable row level security;

-- ¿Quien llama es del equipo? Vive en un esquema que la API no expone.
create schema if not exists privado;

create or replace function privado.es_equipo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.equipo e where e.id = (select auth.uid()))
$$;

revoke all on function privado.es_equipo() from public;
grant usage on schema privado to authenticated;
grant execute on function privado.es_equipo() to authenticated;

create policy "el equipo se ve entre sí" on public.equipo
  for select to authenticated using ((select privado.es_equipo()));

create policy "cada quien edita su nombre" on public.equipo
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Lo que nadie debe leer desde el navegador (por ejemplo, el código para unirse al equipo).
create table privado.config (
  clave text primary key,
  valor text not null
);

-- ───────────────────────── Sincronización ─────────────────────────

-- Cada escritura marca la fila con la hora del servidor: así un dispositivo pide "lo nuevo desde X".
-- Si llega una versión más vieja que la guardada, se ignora: gana la última edición.
create or replace function privado.al_escribir()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.actualizado < old.actualizado then
    return null;
  end if;
  new.sincronizado := clock_timestamp();
  return new;
end
$$;

-- ───────────────────────── Tablas ─────────────────────────

create table public.prospectos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  negocio text,
  nicho text,
  nicho_otro text,
  contacto text,
  puesto text,
  telefono text,
  correo text,
  direccion text,
  etapa text,
  alcance text,
  presupuesto text,
  modalidad_interes text,
  notas text,
  proxima_accion text,
  proxima_fecha date
);

create table public.visitas (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  tipo int,
  inicio timestamptz,
  fin timestamptz,
  presentadores jsonb,
  graba boolean,
  audio_ruta text,
  audio_seg int,
  estado text,
  animo text,
  resultado text,
  notas text,
  datos jsonb
);

create table public.hallazgos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  visita_id uuid,
  area text,
  problema_id text,
  titulo text,
  matices jsonb,
  etiquetas jsonb,
  rutas jsonb,
  elegida text,
  nota text,
  a_medida boolean,
  estado text,
  orden int
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  tipo text,
  inicio timestamptz,
  minutos int,
  lugar text,
  estado text,
  por_mensaje boolean,
  notas text,
  quien jsonb
);

create table public.propuestas (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  titulo text,
  resumen text,
  demo_url text,
  modulos jsonb,
  incluye jsonb,
  precio_contado numeric,
  precio_mensual numeric,
  desc_6 numeric,
  desc_12 numeric,
  prueba_dias int,
  mantenimiento text,
  vigencia date,
  estado text,
  modalidad text,
  notas text
);

create table public.sistemas (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  nombre text,
  url text,
  repo text,
  estado text,
  llave text unique,
  modo_vencido text,
  mensaje text,
  config jsonb,
  notas text,
  ultima_senal timestamptz,
  version text,
  ultima_url text
);

create table public.credenciales (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  sistema_id uuid,
  etiqueta text,
  usuario text,
  url text,
  notas text,
  secreto_id uuid
);

create table public.membresias (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  sistema_id uuid,
  propuesta_id uuid,
  modalidad text,
  monto numeric,
  moneda text,
  inicio date,
  vence date,
  estado text,
  auto boolean,
  notas text,
  stripe_cliente text,
  stripe_suscripcion text
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  membresia_id uuid,
  concepto text,
  monto numeric,
  moneda text,
  metodo text,
  estado text,
  fecha date,
  referencia text,
  comprobante_ruta text,
  enlace text,
  cubre_hasta date,
  registrado_por text,
  notas text,
  stripe_id text
);

create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  membresia_id uuid,
  tipo text,
  canal text,
  mensaje text,
  enviado timestamptz,
  quien text
);

create table public.bitacora (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  creado_por uuid,
  sincronizado timestamptz not null default now(),
  prospecto_id uuid,
  tipo text,
  texto text,
  datos jsonb,
  quien text
);

create table public.ajustes (
  id text primary key,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  eliminado timestamptz,
  sincronizado timestamptz not null default now(),
  valor jsonb
);

-- Mismo trato para todas: marca de sincronización, índice para "lo nuevo desde X",
-- seguridad por fila y una sola regla: solo el equipo.
do $$
declare
  t text;
begin
  foreach t in array array['prospectos','visitas','hallazgos','citas','propuestas','sistemas','credenciales','membresias','pagos','avisos','bitacora','ajustes']
  loop
    execute format('create trigger al_escribir before insert or update on public.%I for each row execute function privado.al_escribir()', t);
    execute format('create index %I on public.%I (sincronizado)', t || '_sincronizado', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "solo el equipo" on public.%I for all to authenticated using ((select privado.es_equipo())) with check ((select privado.es_equipo()))', t);
  end loop;
end
$$;

create index hallazgos_prospecto on public.hallazgos (prospecto_id);
create index visitas_prospecto on public.visitas (prospecto_id);
create index citas_inicio on public.citas (inicio);
create index membresias_vence on public.membresias (vence);
create index membresias_sistema on public.membresias (sistema_id);
create index pagos_membresia on public.pagos (membresia_id);
create index bitacora_prospecto on public.bitacora (prospecto_id);

-- ───────────────────────── Bóveda de credenciales ─────────────────────────

-- La contraseña de un sistema entregado no se guarda en la tabla: se cifra en la bóveda de Supabase.
-- Solo se puede escribir o leer por estas dos funciones, con sesión del equipo, y cada lectura
-- queda anotada en la bitácora.

create or replace function public.credencial_guardar(p_id uuid, p_secreto text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secreto uuid;
begin
  if not privado.es_equipo() then
    raise exception 'no autorizado';
  end if;
  select secreto_id into v_secreto from public.credenciales where id = p_id and eliminado is null;
  if not found then
    raise exception 'la credencial todavía no llega al servidor';
  end if;
  if v_secreto is null then
    v_secreto := vault.create_secret(p_secreto, 'credencial_' || p_id::text, 'Contraseña de un sistema entregado');
    update public.credenciales set secreto_id = v_secreto, actualizado = now() where id = p_id;
  else
    perform vault.update_secret(v_secreto, p_secreto);
    update public.credenciales set actualizado = now() where id = p_id;
  end if;
end
$$;

create or replace function public.credencial_ver(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fila public.credenciales%rowtype;
  v_valor text;
  v_nombre text;
begin
  if not privado.es_equipo() then
    raise exception 'no autorizado';
  end if;
  select * into v_fila from public.credenciales where id = p_id and eliminado is null;
  if not found or v_fila.secreto_id is null then
    return null;
  end if;
  select decrypted_secret into v_valor from vault.decrypted_secrets where id = v_fila.secreto_id;
  select nombre into v_nombre from public.equipo where id = auth.uid();
  insert into public.bitacora (prospecto_id, tipo, texto, quien, creado_por)
  values (v_fila.prospecto_id, 'credencial', 'Se consultó la contraseña de «' || coalesce(v_fila.etiqueta, 'sin nombre') || '».', v_nombre, auth.uid());
  return v_valor;
end
$$;

revoke all on function public.credencial_guardar(uuid, text) from public, anon;
revoke all on function public.credencial_ver(uuid) from public, anon;
grant execute on function public.credencial_guardar(uuid, text) to authenticated;
grant execute on function public.credencial_ver(uuid) to authenticated;

-- ───────────────────────── Archivos ─────────────────────────

insert into storage.buckets (id, name, public)
values ('grabaciones', 'grabaciones', false), ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

create policy "archivos: solo el equipo lee" on storage.objects
  for select to authenticated
  using (bucket_id in ('grabaciones', 'comprobantes') and (select privado.es_equipo()));

create policy "archivos: solo el equipo sube" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('grabaciones', 'comprobantes') and (select privado.es_equipo()));

create policy "archivos: solo el equipo reemplaza" on storage.objects
  for update to authenticated
  using (bucket_id in ('grabaciones', 'comprobantes') and (select privado.es_equipo()))
  with check (bucket_id in ('grabaciones', 'comprobantes') and (select privado.es_equipo()));

create policy "archivos: solo el equipo borra" on storage.objects
  for delete to authenticated
  using (bucket_id in ('grabaciones', 'comprobantes') and (select privado.es_equipo()));

-- ───────────────────────── Código de equipo ─────────────────────────

-- Para crear una cuenta hace falta el código de equipo. Aquí solo se guarda su huella (SHA-256).
alter table privado.config enable row level security;

create or replace function public.codigo_equipo_valido(p_codigo text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from privado.config
    where clave = 'codigo_equipo' and valor = encode(extensions.digest(p_codigo, 'sha256'), 'hex')
  )
$$;

revoke all on function public.codigo_equipo_valido(text) from public, anon, authenticated;
grant execute on function public.codigo_equipo_valido(text) to service_role;

-- Un administrador puede cambiar el código cuando quiera (por ejemplo, si alguien deja el equipo).
create or replace function public.cambiar_codigo_equipo(p_nuevo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.equipo where id = auth.uid() and rol = 'admin') then
    raise exception 'solo un administrador puede cambiar el código';
  end if;
  if length(coalesce(p_nuevo, '')) < 10 then
    raise exception 'el código necesita al menos 10 caracteres';
  end if;
  insert into privado.config (clave, valor)
  values ('codigo_equipo', encode(extensions.digest(p_nuevo, 'sha256'), 'hex'))
  on conflict (clave) do update set valor = excluded.valor;
end
$$;

revoke all on function public.cambiar_codigo_equipo(text) from public, anon;
grant execute on function public.cambiar_codigo_equipo(text) to authenticated;
