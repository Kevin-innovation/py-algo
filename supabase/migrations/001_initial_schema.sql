create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('admin', 'teacher', 'student')),
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  join_code text not null unique,
  join_code_expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists idx_classes_teacher_id on public.classes(teacher_id);
create index if not exists idx_classes_join_code on public.classes(join_code);
create index if not exists idx_classes_is_active on public.classes(is_active);

create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  unique(class_id, student_id)
);

create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_enrollments_class_id on public.enrollments(class_id);
create index if not exists idx_enrollments_class_active on public.enrollments(class_id, is_active);

create table if not exists public.coding_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  exercise_id text,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  started_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists idx_coding_sessions_student_id on public.coding_sessions(student_id);
create index if not exists idx_coding_sessions_class_id on public.coding_sessions(class_id);
create index if not exists idx_coding_sessions_class_status on public.coding_sessions(class_id, status);
create index if not exists idx_coding_sessions_started_at on public.coding_sessions(started_at);
create index if not exists idx_coding_sessions_last_heartbeat on public.coding_sessions(last_heartbeat_at);

create table if not exists public.session_events (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.coding_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  event_type text not null check (event_type in ('code_diff', 'code_snapshot', 'run', 'input', 'output', 'error')),
  sequence_number integer not null,
  payload jsonb not null default '{}',
  code_snapshot text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_session_events_session_id on public.session_events(session_id, sequence_number);
create index if not exists idx_session_events_class_id on public.session_events(class_id, created_at);
create index if not exists idx_session_events_student_id on public.session_events(student_id);
create index if not exists idx_session_events_created_at on public.session_events(created_at);

create table if not exists public.consent_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null default 'data_collection' check (consent_type in ('data_collection', 'monitoring', 'code_storage')),
  consented_at timestamptz not null default now(),
  consent_version text not null default '1.0',
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_consent_records_user_id on public.consent_records(user_id, consent_type);
create index if not exists idx_consent_records_consent_type on public.consent_records(consent_type);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_classes_updated_at on public.classes;
create trigger update_classes_updated_at
  before update on public.classes
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_enrollments_updated_at on public.enrollments;
create trigger update_enrollments_updated_at
  before update on public.enrollments
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_coding_sessions_updated_at on public.coding_sessions;
create trigger update_coding_sessions_updated_at
  before update on public.coding_sessions
  for each row
  execute function public.update_updated_at_column();
