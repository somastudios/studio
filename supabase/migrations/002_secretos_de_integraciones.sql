-- Secretos de integraciones (por ejemplo, la llave de Stripe) guardados cifrados en la bóveda.
-- Solo las funciones del servidor pueden leerlos o escribirlos; desde el navegador, nadie.

create or replace function public.secreto_servidor(p_nombre text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = p_nombre limit 1
$$;

create or replace function public.secreto_servidor_guardar(p_nombre text, p_valor text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = p_nombre limit 1;
  if v_id is null then
    perform vault.create_secret(p_valor, p_nombre, 'Soma: secreto de una integración');
  else
    perform vault.update_secret(v_id, p_valor);
  end if;
end
$$;

revoke all on function public.secreto_servidor(text) from public, anon, authenticated;
revoke all on function public.secreto_servidor_guardar(text, text) from public, anon, authenticated;
grant execute on function public.secreto_servidor(text) to service_role;
grant execute on function public.secreto_servidor_guardar(text, text) to service_role;
