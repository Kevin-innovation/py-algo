create table if not exists public.cleanup_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  deleted_count integer not null,
  retention_days integer not null,
  executed_at timestamptz not null default now(),
  initiated_by uuid references auth.users(id)
);

create index if not exists idx_cleanup_audit_executed_at on public.cleanup_audit_logs(executed_at desc);

create or replace function public.cleanup_expired_session_events(
  p_retention_days integer default 30,
  p_initiated_by uuid default null
)
returns table(deleted_count integer, executed_at timestamptz)
language plpgsql
security definer
as $$
declare
  v_deleted_count integer;
  v_executed_at timestamptz := now();
begin
  with deleted as (
    delete from public.session_events
    where created_at < (v_executed_at - make_interval(days => p_retention_days))
    returning 1
  )
  select count(*) into v_deleted_count from deleted;

  insert into public.cleanup_audit_logs (deleted_count, retention_days, executed_at, initiated_by)
  values (v_deleted_count, p_retention_days, v_executed_at, p_initiated_by);

  return query select v_deleted_count, v_executed_at;
end;
$$;

revoke all on function public.cleanup_expired_session_events(integer, uuid) from public;
grant execute on function public.cleanup_expired_session_events(integer, uuid) to authenticated;
