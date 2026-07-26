begin;

select plan(20);

select has_table('public', 'professional_availability', 'professional availability table exists');
select has_table('public', 'availability_exceptions', 'availability exceptions table exists');
select has_table('public', 'appointment_status_history', 'appointment status history table exists');

select policies_are(
  'public',
  'professional_availability',
  array['professional_availability_member_select', 'professional_availability_owner_mutate'],
  'professional availability has explicit RLS policies'
);

select policies_are(
  'public',
  'availability_exceptions',
  array['availability_exceptions_member_select', 'availability_exceptions_owner_mutate'],
  'availability exceptions has explicit RLS policies'
);

select policies_are(
  'public',
  'appointment_status_history',
  array['appointment_status_history_professional_or_client_select'],
  'appointment status history has explicit RLS policies'
);

select isnt_empty(
  $$select 1 from pg_constraint where conname = 'appointments_no_professional_overlap'$$,
  'appointments prevent active overlapping reservations'
);

select is(
  private.storage_object_organization_id('not-a-uuid/client/document/file.pdf'),
  null,
  'storage organization helper rejects malformed paths without casting errors'
);

select is(
  (
    select count(*)::integer
    from public.appointment_status_history
    where appointment_id = '00000000-0000-4000-8000-000000000401'
      and previous_status is null
      and new_status = 'confirmed'
  ),
  1,
  'appointment creation is recorded in status history'
);

update public.appointments
set status = 'confirmed'
where id = '00000000-0000-4000-8000-000000000402';

select is(
  (
    select count(*)::integer
    from public.appointment_status_history
    where appointment_id = '00000000-0000-4000-8000-000000000402'
  ),
  2,
  'appointment status updates are recorded in status history'
);

select throws_ok(
  $$
    insert into public.appointments (
      organization_id,
      client_id,
      professional_profile_id,
      service_id,
      starts_at,
      ends_at,
      status,
      modality,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000020',
      '00000000-0000-4000-8000-000000000102',
      '2026-07-27 10:45:00+02',
      '2026-07-27 11:15:00+02',
      'confirmed',
      'in_person',
      '00000000-0000-4000-8000-000000000010'
    )
  $$,
  '23P01',
  null,
  'active overlapping appointments are rejected'
);

insert into public.organizations (id, name, slug)
values ('00000000-0000-4000-8000-000000000901', 'Otra Consulta Demo', 'otra-consulta-demo');

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-4000-8000-000000000910',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'other.professional@nutri-oli.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"demo":true}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000920',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'assistant.demo@nutri-oli.test',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"demo":true}'::jsonb,
    now(),
    now()
  );

insert into public.profiles (id, full_name, email)
values
  (
    '00000000-0000-4000-8000-000000000910',
    'Otro Profesional Demo',
    'other.professional@nutri-oli.test'
  ),
  (
    '00000000-0000-4000-8000-000000000920',
    'Asistente Demo',
    'assistant.demo@nutri-oli.test'
  );

insert into public.organization_members (organization_id, profile_id, role)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000920',
  'assistant'
);

insert into public.professional_profiles (
  id,
  organization_id,
  profile_id,
  public_display_name
)
values (
  '00000000-0000-4000-8000-000000000904',
  '00000000-0000-4000-8000-000000000901',
  '00000000-0000-4000-8000-000000000910',
  'Otro Profesional Demo'
);

insert into public.clients (id, organization_id, internal_code, display_name, status)
values (
  '00000000-0000-4000-8000-000000000902',
  '00000000-0000-4000-8000-000000000901',
  'OTHER-001',
  'Cliente Otra Org',
  'active'
);

select throws_ok(
  $$
    insert into public.appointments (
      organization_id,
      client_id,
      professional_profile_id,
      service_id,
      starts_at,
      ends_at,
      status,
      modality
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000902',
      '00000000-0000-4000-8000-000000000020',
      null,
      '2026-07-28 08:00:00+02',
      '2026-07-28 08:45:00+02',
      'requested',
      'online'
    )
  $$,
  '23503',
  null,
  'cross-organization appointment client foreign key is rejected'
);

insert into public.appointments (
  id,
  organization_id,
  client_id,
  professional_profile_id,
  service_id,
  starts_at,
  ends_at,
  status,
  modality
)
values (
  '00000000-0000-4000-8000-000000000903',
  '00000000-0000-4000-8000-000000000901',
  '00000000-0000-4000-8000-000000000902',
  '00000000-0000-4000-8000-000000000904',
  null,
  '2026-07-28 10:00:00+02',
  '2026-07-28 10:45:00+02',
  'requested',
  'online'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select throws_ok(
  $$
    insert into public.clients (
      organization_id,
      internal_code,
      display_name,
      status
    )
    values (
      '00000000-0000-4000-8000-000000000901',
      'FORGED-CLIENT',
      'Cliente Forjado',
      'active'
    )
  $$,
  '42501',
  null,
  'professional cannot create clients in another organization'
);

select throws_ok(
  $$
    insert into public.appointments (
      organization_id,
      client_id,
      professional_profile_id,
      service_id,
      starts_at,
      ends_at,
      status,
      modality
    )
    values (
      '00000000-0000-4000-8000-000000000901',
      '00000000-0000-4000-8000-000000000902',
      '00000000-0000-4000-8000-000000000904',
      null,
      '2026-07-28 11:00:00+02',
      '2026-07-28 11:45:00+02',
      'requested',
      'online'
    )
  $$,
  '42501',
  null,
  'professional cannot create appointments in another organization'
);

select results_eq(
  $$select count(*)::integer from public.clients where internal_code like 'CLI-%'$$,
  array[3],
  'professional can read assigned organization clients'
);

select results_eq(
  $$select count(*)::integer from public.clients where organization_id = '00000000-0000-4000-8000-000000000901'$$,
  array[0],
  'professional cannot read clients from another organization'
);

select results_eq(
  $$select count(*)::integer from public.appointments where organization_id = '00000000-0000-4000-8000-000000000901'$$,
  array[0],
  'professional cannot read appointments from another organization'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000920', true);

select results_eq(
  $$select count(*)::integer from public.clients$$,
  array[0],
  'assistant cannot read client clinical records by default'
);

select results_eq(
  $$select count(*)::integer from public.appointments where organization_id = '00000000-0000-4000-8000-000000000001'$$,
  array[3],
  'assistant can read appointment schedule in own organization'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select lives_ok(
  $$
    insert into public.appointments (
      organization_id,
      client_id,
      professional_profile_id,
      service_id,
      starts_at,
      ends_at,
      status,
      modality,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000020',
      '00000000-0000-4000-8000-000000000102',
      '2026-08-03 09:00:00+02',
      '2026-08-03 09:45:00+02',
      'requested',
      'online',
      '00000000-0000-4000-8000-000000000010'
    )
  $$,
  'professional can create a non-overlapping appointment in own organization'
);

reset role;

select * from finish();

rollback;
