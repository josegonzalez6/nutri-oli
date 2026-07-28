begin;

select plan(17);

select has_table('public', 'recipes', 'recipes table exists');
select has_table('public', 'recipe_ingredients', 'recipe ingredients table exists');
select has_table('public', 'diet_plans', 'diet plans table exists');
select has_table('public', 'diet_plan_meals', 'diet plan meals table exists');
select has_table('public', 'diet_plan_items', 'diet plan items table exists');

select policies_are('public', 'recipes', array['recipes_professional_mutate', 'recipes_professional_select'], 'recipes policies are professional-only');
select policies_are('public', 'recipe_ingredients', array['recipe_ingredients_professional_mutate', 'recipe_ingredients_professional_select'], 'recipe ingredient policies are professional-only');
select policies_are('public', 'diet_plans', array['diet_plans_professional_mutate', 'diet_plans_professional_select'], 'diet plan policies are professional-only');
select policies_are('public', 'diet_plan_meals', array['diet_plan_meals_professional_mutate', 'diet_plan_meals_professional_select'], 'diet plan meal policies are professional-only');
select policies_are('public', 'diet_plan_items', array['diet_plan_items_professional_mutate', 'diet_plan_items_professional_select'], 'diet plan item policies are professional-only');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000010', true);

select lives_ok($$
  insert into public.recipes (id, organization_id, name, servings, created_by)
  values ('00000000-0000-4000-8000-000000001101', '00000000-0000-4000-8000-000000000001', 'Receta RLS', 2, '00000000-0000-4000-8000-000000000010');
  insert into public.recipe_ingredients (id, organization_id, recipe_id, food_name, grams, energy_kcal, protein_g, carbohydrate_g, fat_g, fiber_g, created_by)
  values ('00000000-0000-4000-8000-000000001102', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000001101', 'Ingrediente RLS', 100, 100, 5, 10, 2, 3, '00000000-0000-4000-8000-000000000010');
  insert into public.diet_plans (id, organization_id, client_id, name, created_by)
  values ('00000000-0000-4000-8000-000000001103', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', 'Plan RLS', '00000000-0000-4000-8000-000000000010');
  insert into public.diet_plan_meals (id, organization_id, plan_id, day_index, meal_label, created_by)
  values ('00000000-0000-4000-8000-000000001104', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000001103', 1, 'Desayuno', '00000000-0000-4000-8000-000000000010');
  insert into public.diet_plan_items (id, organization_id, meal_id, item_type, food_name, grams, energy_kcal, protein_g, carbohydrate_g, fat_g, fiber_g, created_by)
  values ('00000000-0000-4000-8000-000000001105', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000001104', 'food', 'Alimento RLS', 50, 50, 2, 5, 1, 1, '00000000-0000-4000-8000-000000000010');
$$, 'owner can create recipe and plan graph');

select results_eq($$ select count(*)::integer from public.recipes where id = '00000000-0000-4000-8000-000000001101' $$, array[1], 'owner can read recipes');
select results_eq($$ select count(*)::integer from public.diet_plan_items where id = '00000000-0000-4000-8000-000000001105' $$, array[1], 'owner can read plan items');

reset role;
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-4000-8000-000000001130', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'assistant.planning@nutri-oli.test', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"demo":true}'::jsonb, now(), now());
insert into public.profiles (id, full_name, email) values ('00000000-0000-4000-8000-000000001130', 'Asistente Planificacion Demo', 'assistant.planning@nutri-oli.test');
insert into public.organization_members (organization_id, profile_id, role) values ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000001130', 'assistant');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000001130', true);
select results_eq($$ select count(*)::integer from public.recipes $$, array[0], 'assistant cannot read recipes');
select results_eq($$ select count(*)::integer from public.diet_plans $$, array[0], 'assistant cannot read diet plans');
select throws_ok($$ insert into public.recipes (organization_id, name, created_by) values ('00000000-0000-4000-8000-000000000001', 'Receta bloqueada', '00000000-0000-4000-8000-000000001130') $$, '42501', null, 'assistant cannot create recipes');
select throws_ok($$ insert into public.diet_plans (organization_id, name, created_by) values ('00000000-0000-4000-8000-000000000001', 'Plan bloqueado', '00000000-0000-4000-8000-000000001130') $$, '42501', null, 'assistant cannot create diet plans');

select * from finish();
rollback;
