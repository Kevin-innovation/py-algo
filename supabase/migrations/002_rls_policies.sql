alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.coding_sessions enable row level security;
alter table public.session_events enable row level security;
alter table public.consent_records enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "classes_select_teacher_or_enrolled" on public.classes;
create policy "classes_select_teacher_or_enrolled" on public.classes
  for select
  using (
    teacher_id = auth.uid()
    or exists (
      select 1
      from public.enrollments e
      where e.class_id = classes.id
        and e.student_id = auth.uid()
        and e.is_active = true
    )
  );

drop policy if exists "classes_insert_teacher_only" on public.classes;
create policy "classes_insert_teacher_only" on public.classes
  for insert
  with check (teacher_id = auth.uid());

drop policy if exists "classes_update_teacher_only" on public.classes;
create policy "classes_update_teacher_only" on public.classes
  for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "enrollments_select_teacher_or_owner" on public.enrollments;
create policy "enrollments_select_teacher_or_owner" on public.enrollments
  for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.classes c
      where c.id = enrollments.class_id
        and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "enrollments_insert_owner_only" on public.enrollments;
create policy "enrollments_insert_owner_only" on public.enrollments
  for insert
  with check (student_id = auth.uid());

drop policy if exists "coding_sessions_select_teacher_or_owner" on public.coding_sessions;
create policy "coding_sessions_select_teacher_or_owner" on public.coding_sessions
  for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.classes c
      where c.id = coding_sessions.class_id
        and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "coding_sessions_insert_owner_only" on public.coding_sessions;
create policy "coding_sessions_insert_owner_only" on public.coding_sessions
  for insert
  with check (student_id = auth.uid());

drop policy if exists "coding_sessions_update_owner_only" on public.coding_sessions;
create policy "coding_sessions_update_owner_only" on public.coding_sessions
  for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "session_events_select_teacher_or_owner" on public.session_events;
create policy "session_events_select_teacher_or_owner" on public.session_events
  for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.classes c
      where c.id = session_events.class_id
        and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "session_events_insert_owner_only" on public.session_events;
create policy "session_events_insert_owner_only" on public.session_events
  for insert
  with check (student_id = auth.uid());

drop policy if exists "consent_records_select_owner" on public.consent_records;
create policy "consent_records_select_owner" on public.consent_records
  for select
  using (user_id = auth.uid());

drop policy if exists "consent_records_insert_owner" on public.consent_records;
create policy "consent_records_insert_owner" on public.consent_records
  for insert
  with check (user_id = auth.uid());

drop policy if exists "service_role_bypass_profiles" on public.profiles;
create policy "service_role_bypass_profiles" on public.profiles
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_bypass_classes" on public.classes;
create policy "service_role_bypass_classes" on public.classes
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_bypass_enrollments" on public.enrollments;
create policy "service_role_bypass_enrollments" on public.enrollments
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_bypass_coding_sessions" on public.coding_sessions;
create policy "service_role_bypass_coding_sessions" on public.coding_sessions
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_bypass_session_events" on public.session_events;
create policy "service_role_bypass_session_events" on public.session_events
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "service_role_bypass_consent_records" on public.consent_records;
create policy "service_role_bypass_consent_records" on public.consent_records
  for all
  to service_role
  using (true)
  with check (true);
