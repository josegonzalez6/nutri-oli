insert into public.organizations (id, name, slug, locale, time_zone)
values ('00000000-0000-4000-8000-000000000001', 'Consulta Demo Nutri-Oli', 'consulta-demo', 'es', 'Europe/Madrid')
on conflict (id) do nothing;

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
