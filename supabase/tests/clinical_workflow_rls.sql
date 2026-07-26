begin;

select plan(23);

select has_table('public', 'clinical_intake_templates', 'clinical intake templates table exists');
select has_table('public', 'clinical_intake_responses', 'clinical intake responses table exists');
select has_table('public', 'consultations', 'consultations table exists');
select has_table('public', 'consultation_addenda', 'consultation addenda table exists');
select has_table('public', 'anthropometry_sessions', 'anthropometry sessions table exists');
select has_table('public', 'anthropometry_session_measurements', 'anthropometry session measurements table exists');
select has_table('public', 'anthropometry_protocols', 'anthropometry protocols table exists');
select has_table('public', 'anthropometry_measurement_definitions', 'anthropometry measurement definitions table exists');

select policies_are(
  'public',
  'consultations',
  array['consultations_professional_mutate', 'consultations_professional_select'],
  'consultations has explicit professional RLS policies'
);

select policies_are(
  'public',
  'anthropometry_sessions',
  array[
    'anthropometry_sessions_professional_delete_draft',
    'anthropometry_sessions_professional_insert',
    'anthropometry_sessions_professional_select',
    'anthropometry_sessions_professional_update'
  ],
  'anthropometry sessions has explicit professional RLS policies by action'
);

select policies_are(
  'public',
  'anthropometry_session_measurements',
  array['anthropometry_session_measurements_mutate', 'anthropometry_session_measurements_select'],
  'anthropometry detailed measurements has explicit RLS policies'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select results_eq(
  $$select count(*)::integer from public.consultations where client_id = '00000000-0000-4000-8000-000000000201'$$,
  array[1],
  'assigned professional can read own client consultations'
);

select lives_ok(
  $$
    insert into public.anthropometry_sessions (
      organization_id,
      client_id,
      professional_profile_id,
      mass_kg,
      height_cm,
      waist_cm,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000020',
      73.2,
      171.5,
      82.5,
      '00000000-0000-4000-8000-000000000010'
    )
  $$,
  'assigned professional can create anthropometry for own client'
);

select results_eq(
  $$
    select skinfold_sum_mm is null
    from public.anthropometry_sessions
    where client_id = '00000000-0000-4000-8000-000000000201'
    order by created_at desc
    limit 1
  $$,
  array[true],
  'missing skinfolds are not converted to zero'
);

select lives_ok(
  $$
    update public.anthropometry_sessions
    set workflow_status = 'completed',
        status = 'finalized',
        finalized_at = now(),
        finalized_by = '00000000-0000-4000-8000-000000000010'
    where client_id = '00000000-0000-4000-8000-000000000201'
      and mass_kg = 73.2
  $$,
  'draft anthropometry can be finalized once'
);

select results_eq(
  $$
    with updated as (
      update public.anthropometry_sessions
      set observations = 'forged edit after finalization'
      where client_id = '00000000-0000-4000-8000-000000000201'
        and mass_kg = 73.2
      returning 1
    )
    select count(*)::integer from updated
  $$,
  array[0],
  'completed anthropometry session is immutable through RLS'
);

select lives_ok(
  $$
    update public.consultations
    set status = 'finalized',
        finalized_at = now(),
        finalized_by = '00000000-0000-4000-8000-000000000010'
    where id = '00000000-0000-4000-8000-000000000521'
  $$,
  'draft consultation can be finalized once'
);

select throws_ok(
  $$
    update public.consultations
    set private_note = 'forged edit after finalization'
    where id = '00000000-0000-4000-8000-000000000521'
  $$,
  'P0001',
  null,
  'finalized consultation is immutable'
);

reset role;

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
values (
  '00000000-0000-4000-8000-000000000920',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'assistant.clinical@nutri-oli.test',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"demo":true}'::jsonb,
  now(),
  now()
);

insert into public.profiles (id, full_name, email)
values (
  '00000000-0000-4000-8000-000000000920',
  'Asistente Clinico Demo',
  'assistant.clinical@nutri-oli.test'
);

insert into public.organization_members (organization_id, profile_id, role)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000920',
  'assistant'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000920', true);

select results_eq(
  $$select count(*)::integer from public.consultations$$,
  array[0],
  'assistant cannot read clinical consultations or private notes'
);

select results_eq(
  $$select count(*)::integer from public.clinical_intake_responses$$,
  array[0],
  'assistant cannot read anamnesis responses'
);

select results_eq(
  $$select count(*)::integer from public.anthropometry_sessions$$,
  array[0],
  'assistant cannot read anthropometry sessions'
);

select results_eq(
  $$select count(*)::integer from public.anthropometry_session_measurements$$,
  array[0],
  'assistant cannot read detailed anthropometry measurements'
);

select throws_ok(
  $$
    insert into public.anthropometry_sessions (
      organization_id,
      client_id,
      professional_profile_id,
      mass_kg,
      height_cm,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000020',
      74,
      172,
      '00000000-0000-4000-8000-000000000920'
    )
  $$,
  '42501',
  null,
  'assistant cannot insert anthropometry'
);

select * from finish();

rollback;
