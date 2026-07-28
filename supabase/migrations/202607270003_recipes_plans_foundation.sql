create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  summary text,
  servings numeric(8, 2) not null default 1 check (servings > 0),
  yield_grams numeric(10, 2) check (yield_grams is null or yield_grams > 0),
  prep_time_minutes integer check (prep_time_minutes is null or prep_time_minutes >= 0),
  instructions text,
  tags text[] not null default '{}',
  allergens text[] not null default '{}',
  dietary_pattern text,
  status text not null default 'draft' check (status in ('draft', 'under_review', 'published', 'archived')),
  visibility text not null default 'professional' check (visibility in ('professional', 'client_visible')),
  version integer not null default 1 check (version > 0),
  source text not null default 'Receta profesional interna',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name, version),
  unique (organization_id, id)
);

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipe_id uuid not null,
  food_id uuid references public.foods(id) on delete set null,
  food_name text not null,
  grams numeric(10, 2) not null check (grams > 0),
  household_measure text,
  energy_kcal numeric(10, 2) check (energy_kcal is null or energy_kcal >= 0),
  protein_g numeric(10, 2) check (protein_g is null or protein_g >= 0),
  carbohydrate_g numeric(10, 2) check (carbohydrate_g is null or carbohydrate_g >= 0),
  fat_g numeric(10, 2) check (fat_g is null or fat_g >= 0),
  fiber_g numeric(10, 2) check (fiber_g is null or fiber_g >= 0),
  notes text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, recipe_id) references public.recipes(organization_id, id) on delete cascade
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid,
  name text not null,
  kind text not null default 'weekly_menu' check (
    kind in (
      'weekly_menu',
      'typical_day',
      'macro_portions',
      'exchanges',
      'open_guidance',
      'plate_method',
      'mixed'
    )
  ),
  status text not null default 'draft' check (
    status in ('draft', 'under_review', 'scheduled', 'published', 'withdrawn', 'archived')
  ),
  version integer not null default 1 check (version > 0),
  starts_on date,
  ends_on date,
  visibility_settings jsonb not null default jsonb_build_object(
    'showKcal', true,
    'showMacros', true,
    'showMicros', false,
    'showPortions', true
  ),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name, version),
  unique (organization_id, id),
  constraint diet_plans_date_order check (ends_on is null or starts_on is null or ends_on >= starts_on),
  foreign key (organization_id, client_id) references public.clients(organization_id, id)
);

create table if not exists public.diet_plan_meals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null,
  day_index integer not null default 1 check (day_index between 1 and 14),
  meal_label text not null,
  scheduled_time time,
  notes text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  foreign key (organization_id, plan_id) references public.diet_plans(organization_id, id) on delete cascade
);

create table if not exists public.diet_plan_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  meal_id uuid not null,
  recipe_id uuid,
  item_type text not null default 'food' check (item_type in ('food', 'recipe', 'free_text')),
  food_name text not null,
  grams numeric(10, 2) check (grams is null or grams > 0),
  household_measure text,
  energy_kcal numeric(10, 2) check (energy_kcal is null or energy_kcal >= 0),
  protein_g numeric(10, 2) check (protein_g is null or protein_g >= 0),
  carbohydrate_g numeric(10, 2) check (carbohydrate_g is null or carbohydrate_g >= 0),
  fat_g numeric(10, 2) check (fat_g is null or fat_g >= 0),
  fiber_g numeric(10, 2) check (fiber_g is null or fiber_g >= 0),
  notes text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, meal_id) references public.diet_plan_meals(organization_id, id) on delete cascade,
  foreign key (organization_id, recipe_id) references public.recipes(organization_id, id) on delete set null
);

create index if not exists recipes_organization_status_idx on public.recipes(organization_id, status);
create index if not exists recipe_ingredients_recipe_idx on public.recipe_ingredients(organization_id, recipe_id);
create index if not exists diet_plans_organization_status_idx on public.diet_plans(organization_id, status);
create index if not exists diet_plans_client_idx on public.diet_plans(organization_id, client_id);
create index if not exists diet_plan_meals_plan_idx on public.diet_plan_meals(organization_id, plan_id);
create index if not exists diet_plan_items_meal_idx on public.diet_plan_items(organization_id, meal_id);

drop trigger if exists recipes_touch_updated_at on public.recipes;
create trigger recipes_touch_updated_at
before update on public.recipes
for each row execute function private.touch_updated_at();

drop trigger if exists recipe_ingredients_touch_updated_at on public.recipe_ingredients;
create trigger recipe_ingredients_touch_updated_at
before update on public.recipe_ingredients
for each row execute function private.touch_updated_at();

drop trigger if exists diet_plans_touch_updated_at on public.diet_plans;
create trigger diet_plans_touch_updated_at
before update on public.diet_plans
for each row execute function private.touch_updated_at();

drop trigger if exists diet_plan_meals_touch_updated_at on public.diet_plan_meals;
create trigger diet_plan_meals_touch_updated_at
before update on public.diet_plan_meals
for each row execute function private.touch_updated_at();

drop trigger if exists diet_plan_items_touch_updated_at on public.diet_plan_items;
create trigger diet_plan_items_touch_updated_at
before update on public.diet_plan_items
for each row execute function private.touch_updated_at();

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.diet_plans enable row level security;
alter table public.diet_plan_meals enable row level security;
alter table public.diet_plan_items enable row level security;

grant select, insert, update, delete on public.recipes to authenticated;
grant select, insert, update, delete on public.recipe_ingredients to authenticated;
grant select, insert, update, delete on public.diet_plans to authenticated;
grant select, insert, update, delete on public.diet_plan_meals to authenticated;
grant select, insert, update, delete on public.diet_plan_items to authenticated;

create policy recipes_professional_select
on public.recipes for select
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy recipes_professional_mutate
on public.recipes for all
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy recipe_ingredients_professional_select
on public.recipe_ingredients for select
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy recipe_ingredients_professional_mutate
on public.recipe_ingredients for all
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy diet_plans_professional_select
on public.diet_plans for select
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy diet_plans_professional_mutate
on public.diet_plans for all
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy diet_plan_meals_professional_select
on public.diet_plan_meals for select
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy diet_plan_meals_professional_mutate
on public.diet_plan_meals for all
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy diet_plan_items_professional_select
on public.diet_plan_items for select
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy diet_plan_items_professional_mutate
on public.diet_plan_items for all
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);
