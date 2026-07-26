begin;

select plan(13);

select has_table('public', 'clinical_intake_templates', 'clinical intake templates table exists');
select has_table('public', 'clinical_intake_responses', 'clinical intake responses table exists');
select has_table('public', 'consultations', 'consultations table exists');
select has_table('public', 'consultation_addenda', 'consultation addenda table exists');
select has_table('public', 'anthropometry_sessions', 'anthropometry sessions table exists');

select policies_are(
  'public',
  'consultations',
  array['consultations_professional_mutate', 'consultations_professional_select'],
  'consultations has explicit professional RLS policies'
);

select policies_are(
  'public',
  'anthropometry_sessions',
  array['anthropometry_sessions_professional_mutate', 'anthropometry_sessions_professional_select'],
  'anthropometry sessions has explicit professional RLS policies'
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

select * from finish();

rollback;
