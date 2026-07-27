begin;

select plan(8);

select has_table('public', 'anthropometry_reports', 'anthropometry reports table exists');

select policies_are(
  'public',
  'anthropometry_reports',
  array[
    'anthropometry_reports_client_select_published',
    'anthropometry_reports_professional_insert',
    'anthropometry_reports_professional_select',
    'anthropometry_reports_professional_update'
  ],
  'anthropometry reports has explicit lifecycle RLS policies'
);

insert into public.anthropometry_sessions (
  id,
  organization_id,
  client_id,
  professional_profile_id,
  status,
  workflow_status,
  measured_at,
  protocol,
  created_by,
  finalized_at,
  finalized_by
)
values
  (
    '00000000-0000-4000-8000-000000000880',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000020',
    'finalized',
    'completed',
    now(),
    'Perfil restringido compatible con ISAK - pendiente de validacion manual',
    '00000000-0000-4000-8000-000000000010',
    now(),
    '00000000-0000-4000-8000-000000000010'
  ),
  (
    '00000000-0000-4000-8000-000000000881',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000020',
    'draft',
    'measuring',
    now(),
    'Perfil restringido compatible con ISAK - pendiente de validacion manual',
    '00000000-0000-4000-8000-000000000010',
    null,
    null
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select lives_ok(
  $$
    insert into public.anthropometry_reports (
      organization_id,
      client_id,
      session_id,
      kind,
      status,
      version,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000880',
      'professional_internal',
      'generated',
      1,
      '00000000-0000-4000-8000-000000000010'
    )
  $$,
  'owner can create an internal report from completed anthropometry'
);

select results_eq(
  $$select count(*)::integer from public.anthropometry_reports where session_id = '00000000-0000-4000-8000-000000000880'$$,
  array[1],
  'owner can read generated internal anthropometry report'
);

select throws_ok(
  $$
    insert into public.anthropometry_reports (
      organization_id,
      client_id,
      session_id,
      kind,
      status,
      version,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000881',
      'professional_internal',
      'generated',
      1,
      '00000000-0000-4000-8000-000000000010'
    )
  $$,
  '42501',
  null,
  'draft anthropometry cannot generate a report'
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
  '00000000-0000-4000-8000-000000000930',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'assistant.reports@nutri-oli.test',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"demo":true}'::jsonb,
  now(),
  now()
);

insert into public.profiles (id, full_name, email)
values (
  '00000000-0000-4000-8000-000000000930',
  'Asistente Informes Demo',
  'assistant.reports@nutri-oli.test'
);

insert into public.organization_members (organization_id, profile_id, role)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000930',
  'assistant'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000930', true);

select results_eq(
  $$select count(*)::integer from public.anthropometry_reports$$,
  array[0],
  'assistant cannot read anthropometry reports'
);

select throws_ok(
  $$
    insert into public.anthropometry_reports (
      organization_id,
      client_id,
      session_id,
      kind,
      status,
      version,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000201',
      '00000000-0000-4000-8000-000000000880',
      'professional_internal',
      'generated',
      2,
      '00000000-0000-4000-8000-000000000930'
    )
  $$,
  '42501',
  null,
  'assistant cannot create anthropometry reports'
);

reset role;

insert into public.organizations (id, name, slug)
values ('00000000-0000-4000-8000-000000000970', 'Consulta Informe Ajena', 'consulta-informe-ajena');

insert into public.clients (id, organization_id, internal_code, display_name, status)
values (
  '00000000-0000-4000-8000-000000000971',
  '00000000-0000-4000-8000-000000000970',
  'OTHER-REPORT-001',
  'Cliente Informe Ajeno',
  'active'
);

insert into public.professional_profiles (
  id,
  organization_id,
  profile_id,
  public_display_name
)
values (
  '00000000-0000-4000-8000-000000000972',
  '00000000-0000-4000-8000-000000000970',
  '00000000-0000-4000-8000-000000000010',
  'Profesional Ajeno'
);

insert into public.anthropometry_sessions (
  id,
  organization_id,
  client_id,
  professional_profile_id,
  status,
  workflow_status,
  protocol
)
values (
  '00000000-0000-4000-8000-000000000973',
  '00000000-0000-4000-8000-000000000970',
  '00000000-0000-4000-8000-000000000971',
  '00000000-0000-4000-8000-000000000972',
  'finalized',
  'completed',
  'Perfil ajeno'
);

insert into public.anthropometry_reports (
  organization_id,
  client_id,
  session_id,
  kind,
  status,
  version
)
values (
  '00000000-0000-4000-8000-000000000970',
  '00000000-0000-4000-8000-000000000971',
  '00000000-0000-4000-8000-000000000973',
  'professional_internal',
  'generated',
  1
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select results_eq(
  $$select count(*)::integer from public.anthropometry_reports where organization_id = '00000000-0000-4000-8000-000000000970'$$,
  array[0],
  'owner cannot read reports from another organization'
);

select * from finish();

rollback;
