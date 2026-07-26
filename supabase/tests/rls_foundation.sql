begin;

select plan(16);

select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'clients', 'clients table exists');
select has_table('public', 'appointments', 'appointments table exists');
select has_table('public', 'audit_events', 'audit events table exists');
select has_table('public', 'food_sources', 'food sources table exists');
select has_table('public', 'foods', 'foods table exists');
select has_table('public', 'nutrients', 'nutrients table exists');
select has_table('public', 'food_nutrients', 'food nutrients table exists');

select policies_are(
  'public',
  'clients',
  array[
    'clients_authorized_select',
    'clients_owner_delete',
    'clients_professional_insert',
    'clients_professional_update'
  ],
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

select policies_are(
  'public',
  'foods',
  array['foods_public_or_member_select', 'foods_professional_mutate'],
  'foods table has explicit RLS policies'
);

select policies_are(
  'public',
  'food_nutrients',
  array['food_nutrients_public_or_member_select'],
  'food nutrients table has explicit RLS policies'
);

select * from finish();

rollback;
