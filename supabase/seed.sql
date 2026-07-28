insert into public.organizations (id, name, slug, locale, time_zone)
values ('00000000-0000-4000-8000-000000000001', 'Consulta Demo Nutri-Oli', 'consulta-demo', 'es', 'Europe/Madrid')
on conflict (id) do nothing;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone,
  phone_change,
  phone_change_token,
  email_change_token_current,
  reauthentication_token,
  is_super_admin,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'jose@nutri-oli.test',
  crypt('gonzalez', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  null,
  '',
  '',
  '',
  '',
  false,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"demo":true}'::jsonb,
  now(),
  now()
)
on conflict (id) do update
set encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    confirmation_token = excluded.confirmation_token,
    recovery_token = excluded.recovery_token,
    email_change_token_new = excluded.email_change_token_new,
    email_change = excluded.email_change,
    phone = excluded.phone,
    phone_change = excluded.phone_change,
    phone_change_token = excluded.phone_change_token,
    email_change_token_current = excluded.email_change_token_current,
    reauthentication_token = excluded.reauthentication_token,
    is_super_admin = excluded.is_super_admin,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000010',
  'jose@nutri-oli.test',
  '00000000-0000-4000-8000-000000000010',
  '{"sub":"00000000-0000-4000-8000-000000000010","email":"jose@nutri-oli.test","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (provider_id, provider) do update
set identity_data = excluded.identity_data,
    updated_at = now();

insert into public.profiles (id, full_name, email, preferred_locale)
values (
  '00000000-0000-4000-8000-000000000010',
  'Profesional Demo',
  'jose@nutri-oli.test',
  'es'
)
on conflict (id) do update set full_name = excluded.full_name, email = excluded.email;

insert into public.organization_members (
  organization_id,
  profile_id,
  role,
  can_access_clinical_notes
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000010',
  'owner',
  true
)
on conflict (organization_id, profile_id) do update set role = excluded.role, can_access_clinical_notes = excluded.can_access_clinical_notes;

insert into public.professional_profiles (
  id,
  organization_id,
  profile_id,
  license_number,
  public_display_name
)
values (
  '00000000-0000-4000-8000-000000000020',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000010',
  null,
  'Profesional Demo'
)
on conflict (organization_id, profile_id) do update set public_display_name = excluded.public_display_name;

insert into public.services (id, organization_id, name, duration_minutes, price_cents)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Primera visita demo', 60, 6000),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Seguimiento demo', 45, 4500),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Antropometria demo', 45, 5000)
on conflict (id) do nothing;

insert into public.feature_flags (organization_id, key, enabled)
values
  ('00000000-0000-4000-8000-000000000001', 'ai_drafts', false),
  ('00000000-0000-4000-8000-000000000001', 'public_booking', false),
  ('00000000-0000-4000-8000-000000000001', 'google_calendar', false)
on conflict (organization_id, key) do update set enabled = excluded.enabled;

insert into public.clients (
  id,
  organization_id,
  internal_code,
  display_name,
  status,
  date_of_birth,
  email,
  phone,
  objective_summary,
  created_by
)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    'CLI-001',
    'Cliente Demo A',
    'active',
    '1992-03-14',
    'cliente.demo.a@example.test',
    null,
    'Primera evaluacion nutricional',
    '00000000-0000-4000-8000-000000000010'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    'CLI-002',
    'Cliente Demo B',
    'active',
    '1986-09-02',
    'cliente.demo.b@example.test',
    null,
    'Seguimiento de adherencia',
    '00000000-0000-4000-8000-000000000010'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000001',
    'CLI-003',
    'Cliente Demo C',
    'lead',
    '1998-12-20',
    'cliente.demo.c@example.test',
    null,
    'Control antropometrico',
    '00000000-0000-4000-8000-000000000010'
  )
on conflict (organization_id, internal_code) do update set
  display_name = excluded.display_name,
  status = excluded.status,
  objective_summary = excluded.objective_summary;

insert into public.client_assignments (
  organization_id,
  client_id,
  professional_profile_id
)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000020'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000020'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000020')
on conflict (client_id, professional_profile_id) do nothing;

insert into public.professional_availability (
  id,
  organization_id,
  professional_profile_id,
  weekday,
  starts_at,
  ends_at,
  location,
  online
)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 1, '09:00', '14:00', 'Consulta demo', true),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 3, '15:00', '20:00', 'Consulta demo', true),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 5, '09:00', '13:00', 'Consulta demo', false)
on conflict (id) do nothing;

insert into public.appointments (
  id,
  organization_id,
  client_id,
  professional_profile_id,
  service_id,
  starts_at,
  ends_at,
  status,
  modality,
  location,
  administrative_notes,
  created_by
)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000020',
    '00000000-0000-4000-8000-000000000101',
    '2026-07-27 10:30:00+02',
    '2026-07-27 11:30:00+02',
    'confirmed',
    'in_person',
    'Consulta demo',
    'Consentimientos pendientes de revisar.',
    '00000000-0000-4000-8000-000000000010'
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000020',
    '00000000-0000-4000-8000-000000000102',
    '2026-07-27 12:00:00+02',
    '2026-07-27 12:45:00+02',
    'requested',
    'online',
    null,
    'Recordatorio sin datos clinicos.',
    '00000000-0000-4000-8000-000000000010'
  ),
  (
    '00000000-0000-4000-8000-000000000403',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000020',
    '00000000-0000-4000-8000-000000000103',
    '2026-07-27 17:30:00+02',
    '2026-07-27 18:15:00+02',
    'confirmed',
    'in_person',
    'Consulta demo',
    'Medicion con consentimiento especifico.',
    '00000000-0000-4000-8000-000000000010'
  )
on conflict (id) do update set
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  administrative_notes = excluded.administrative_notes;

insert into public.clinical_intake_templates (
  id,
  organization_id,
  name,
  version,
  sections,
  created_by
)
values (
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000001',
  'Anamnesis inicial Nutri-Oli',
  1,
  '[{"title":"Motivo y objetivos"},{"title":"Historia clinica"},{"title":"Historia nutricional"},{"title":"Estilo de vida"}]'::jsonb,
  '00000000-0000-4000-8000-000000000010'
)
on conflict (organization_id, name, version) do nothing;

insert into public.clinical_intake_responses (
  id,
  organization_id,
  client_id,
  template_id,
  status,
  responses,
  created_by
)
values (
  '00000000-0000-4000-8000-000000000511',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000501',
  'draft',
  '{
    "motive":{"value":"Mejorar organizacion alimentaria","kind":"declared"},
    "objectives":{"value":"Preparar una pauta sostenible","kind":"declared"},
    "allergies":{"value":"No declaradas","kind":"declared"},
    "intolerances":{"value":"No declaradas","kind":"declared"},
    "medication":{"value":"No declarada","kind":"declared"},
    "supplements":{"value":"No declarados","kind":"declared"},
    "professionalNote":{"value":"Registro ficticio local/test.","kind":"professional_note"}
  }'::jsonb,
  '00000000-0000-4000-8000-000000000010'
)
on conflict (id) do update set responses = excluded.responses;

insert into public.consultations (
  id,
  organization_id,
  client_id,
  professional_profile_id,
  consultation_type,
  status,
  reason,
  objectives,
  intervention,
  recommendations,
  tasks,
  private_note,
  shared_summary,
  assessment,
  nutrition_diagnosis,
  intervention_plan,
  monitoring_plan,
  pes_statement,
  created_by
)
values (
  '00000000-0000-4000-8000-000000000521',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000020',
  'first_visit',
  'draft',
  'Primera visita ficticia local/test',
  'Definir objetivos iniciales',
  'Educacion nutricional inicial',
  'Organizar comidas principales',
  'Completar registros previos al seguimiento',
  'Nota privada ficticia para validar permisos',
  'Resumen compartible pendiente de revisar',
  'Assessment demo',
  'Diagnostico nutricional manual demo',
  'Intervencion demo',
  'Monitorizar adherencia y medidas',
  'PES introducido manualmente por el profesional',
  '00000000-0000-4000-8000-000000000010'
)
on conflict (id) do update set reason = excluded.reason;

insert into public.anthropometry_sessions (
  id,
  organization_id,
  client_id,
  professional_profile_id,
  consultation_id,
  measured_at,
  protocol,
  mass_kg,
  height_cm,
  waist_cm,
  hip_cm,
  triceps_mm,
  subscapular_mm,
  abdominal_mm,
  thigh_mm,
  instrument,
  observations,
  created_by
)
values (
  '00000000-0000-4000-8000-000000000531',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000020',
  '00000000-0000-4000-8000-000000000521',
  '2026-07-26 10:00:00+02',
  'custom',
  72.40,
  171.50,
  82.10,
  98.00,
  14.20,
  16.00,
  21.50,
  24.00,
  'Instrumental ficticio local/test',
  'Sesion ficticia para validar persistencia.',
  '00000000-0000-4000-8000-000000000010'
)
on conflict (id) do update set mass_kg = excluded.mass_kg;
