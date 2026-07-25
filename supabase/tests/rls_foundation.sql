begin;

select plan(10);

select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'clients', 'clients table exists');
select has_table('public', 'appointments', 'appointments table exists');
select has_table('public', 'audit_events', 'audit events table exists');

select policies_are(
  'public',
  'clients',
  array['clients_professional_select', 'clients_professional_mutate'],
  'clients table has explicit RLS policies'
);

select policies_are(
  'public',
  'appointments',
  array['appointments_professional_or_client_select', 'appointments_professional_mutate'],
  'appointments table has professional and client policies'
);

select is(
  (select public from storage.buckets where id = 'clinical-documents'),
  false,
  'clinical documents bucket is private'
);

select is(
  (select public from storage.buckets where id = 'progress-photos'),
  false,
  'progress photos bucket is private'
);

select is(
  (select setting from pg_settings where name = 'row_security'),
  'on',
  'row security is available'
);

select * from finish();

rollback;
