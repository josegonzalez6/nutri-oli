begin;

select plan(12);

select has_table('public', 'macro_portion_systems', 'macro portion systems table exists');
select has_table('public', 'exchange_groups', 'exchange groups table exists');
select has_table('public', 'exchange_items', 'exchange items table exists');
select has_table('public', 'meal_macro_targets', 'meal macro targets table exists');

select policies_are(
  'public',
  'macro_portion_systems',
  array[
    'macro_portion_systems_professional_mutate',
    'macro_portion_systems_professional_select'
  ],
  'macro portion systems have professional-only policies'
);

select policies_are(
  'public',
  'exchange_groups',
  array[
    'exchange_groups_professional_mutate',
    'exchange_groups_professional_select'
  ],
  'exchange groups have professional-only policies'
);

select policies_are(
  'public',
  'exchange_items',
  array[
    'exchange_items_professional_mutate',
    'exchange_items_professional_select'
  ],
  'exchange items have professional-only policies'
);

select policies_are(
  'public',
  'meal_macro_targets',
  array[
    'meal_macro_targets_professional_mutate',
    'meal_macro_targets_professional_select'
  ],
  'meal macro targets have professional-only policies'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select lives_ok(
  $$
    insert into public.macro_portion_systems (
      id,
      organization_id,
      name,
      carbohydrate_grams,
      protein_grams,
      fat_grams,
      fiber_grams,
      source,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000001001',
      '00000000-0000-4000-8000-000000000001',
      'Sistema RLS',
      10,
      7,
      5,
      3,
      'Criterio ficticio de test',
      '00000000-0000-4000-8000-000000000010'
    );

    insert into public.exchange_groups (
      id,
      organization_id,
      name,
      slug,
      nutrient_basis,
      target_amount,
      target_unit,
      tolerance_percent,
      source,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000001002',
      '00000000-0000-4000-8000-000000000001',
      'Fruta RLS',
      'fruta-rls',
      'carbohydrate',
      10,
      'g',
      10,
      'Criterio ficticio de test',
      '00000000-0000-4000-8000-000000000010'
    );

    insert into public.exchange_items (
      id,
      organization_id,
      group_id,
      food_name,
      grams,
      household_measure,
      energy_kcal,
      protein_g,
      carbohydrate_g,
      fat_g,
      fiber_g,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000001003',
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000001002',
      'Manzana ficticia RLS',
      130,
      '1 pieza',
      67,
      0.3,
      10,
      0.2,
      2.4,
      '00000000-0000-4000-8000-000000000010'
    );

    insert into public.meal_macro_targets (
      id,
      organization_id,
      macro_portion_system_id,
      name,
      meal_label,
      carbohydrate_portions,
      protein_portions,
      fat_portions,
      tolerance_percent,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000001004',
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000001001',
      'Dia tipo RLS',
      'Desayuno',
      4,
      2,
      1,
      10,
      '00000000-0000-4000-8000-000000000010'
    );
  $$,
  'owner can create macro exchange configuration'
);

select results_eq(
  $$
    select (
      (select count(*) from public.macro_portion_systems where id = '00000000-0000-4000-8000-000000001001') +
      (select count(*) from public.exchange_groups where id = '00000000-0000-4000-8000-000000001002') +
      (select count(*) from public.exchange_items where id = '00000000-0000-4000-8000-000000001003') +
      (select count(*) from public.meal_macro_targets where id = '00000000-0000-4000-8000-000000001004')
    )::integer
  $$,
  array[4],
  'owner can read macro exchange configuration'
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
  '00000000-0000-4000-8000-000000001030',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'assistant.macro@nutri-oli.test',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"demo":true}'::jsonb,
  now(),
  now()
);

insert into public.profiles (id, full_name, email)
values (
  '00000000-0000-4000-8000-000000001030',
  'Asistente Macro Demo',
  'assistant.macro@nutri-oli.test'
);

insert into public.organization_members (organization_id, profile_id, role)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000001030',
  'assistant'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001030', true);

select results_eq(
  $$
    select (
      (select count(*) from public.macro_portion_systems) +
      (select count(*) from public.exchange_groups) +
      (select count(*) from public.exchange_items) +
      (select count(*) from public.meal_macro_targets)
    )::integer
  $$,
  array[0],
  'assistant cannot read macro exchange configuration'
);

select throws_ok(
  $$
    insert into public.macro_portion_systems (
      organization_id,
      name,
      carbohydrate_grams,
      protein_grams,
      fat_grams,
      created_by
    )
    values (
      '00000000-0000-4000-8000-000000000001',
      'Sistema asistente denegado',
      10,
      7,
      5,
      '00000000-0000-4000-8000-000000001030'
    )
  $$,
  '42501',
  null,
  'assistant cannot create macro exchange configuration'
);

select * from finish();

rollback;
