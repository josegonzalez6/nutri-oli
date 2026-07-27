create table public.macro_portion_systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 140),
  carbohydrate_grams numeric(7,2) not null check (carbohydrate_grams > 0),
  protein_grams numeric(7,2) not null check (protein_grams > 0),
  fat_grams numeric(7,2) not null check (fat_grams > 0),
  fiber_grams numeric(7,2) check (fiber_grams is null or fiber_grams > 0),
  version integer not null default 1 check (version > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source text not null default 'Definicion profesional interna',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name, version),
  unique (organization_id, id)
);

create table public.exchange_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 140),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,100}$'),
  nutrient_basis text not null check (
    nutrient_basis in ('energy_kcal', 'carbohydrate', 'protein', 'fat', 'fiber')
  ),
  target_amount numeric(9,2) not null check (target_amount > 0),
  target_unit text not null check (target_unit in ('kcal', 'g')),
  tolerance_percent numeric(5,2) not null default 10 check (
    tolerance_percent > 0
    and tolerance_percent <= 50
  ),
  version integer not null default 1 check (version > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source text not null default 'Criterio profesional interno',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (nutrient_basis = 'energy_kcal' and target_unit = 'kcal')
    or (nutrient_basis <> 'energy_kcal' and target_unit = 'g')
  ),
  unique (organization_id, slug, version),
  unique (organization_id, id)
);

create table public.exchange_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  group_id uuid not null,
  food_id uuid references public.foods(id) on delete set null,
  food_name text not null check (char_length(food_name) between 1 and 240),
  grams numeric(9,2) not null check (grams > 0),
  household_measure text,
  energy_kcal numeric(10,2) check (energy_kcal is null or energy_kcal >= 0),
  protein_g numeric(10,2) check (protein_g is null or protein_g >= 0),
  carbohydrate_g numeric(10,2) check (carbohydrate_g is null or carbohydrate_g >= 0),
  fat_g numeric(10,2) check (fat_g is null or fat_g >= 0),
  fiber_g numeric(10,2) check (fiber_g is null or fiber_g >= 0),
  calculation_basis text not null default 'manual_professional_entry',
  notes text,
  excluded boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exchange_items_group_org_fk
    foreign key (organization_id, group_id)
    references public.exchange_groups(organization_id, id)
    on delete cascade
);

create table public.meal_macro_targets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  macro_portion_system_id uuid not null,
  name text not null check (char_length(name) between 2 and 120),
  meal_label text not null check (char_length(meal_label) between 2 and 80),
  carbohydrate_portions numeric(7,2) not null default 0 check (carbohydrate_portions >= 0),
  protein_portions numeric(7,2) not null default 0 check (protein_portions >= 0),
  fat_portions numeric(7,2) not null default 0 check (fat_portions >= 0),
  tolerance_percent numeric(5,2) not null default 10 check (
    tolerance_percent > 0
    and tolerance_percent <= 50
  ),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_macro_targets_system_org_fk
    foreign key (organization_id, macro_portion_system_id)
    references public.macro_portion_systems(organization_id, id)
    on delete cascade
);

create index macro_portion_systems_org_status_idx
on public.macro_portion_systems(organization_id, status, updated_at desc);

create index exchange_groups_org_status_idx
on public.exchange_groups(organization_id, status, updated_at desc);

create index exchange_items_group_idx
on public.exchange_items(group_id, excluded);

create index meal_macro_targets_system_idx
on public.meal_macro_targets(macro_portion_system_id);

create trigger macro_portion_systems_touch_updated_at
before update on public.macro_portion_systems
for each row execute function private.touch_updated_at();

create trigger exchange_groups_touch_updated_at
before update on public.exchange_groups
for each row execute function private.touch_updated_at();

create trigger exchange_items_touch_updated_at
before update on public.exchange_items
for each row execute function private.touch_updated_at();

create trigger meal_macro_targets_touch_updated_at
before update on public.meal_macro_targets
for each row execute function private.touch_updated_at();

alter table public.macro_portion_systems enable row level security;
alter table public.exchange_groups enable row level security;
alter table public.exchange_items enable row level security;
alter table public.meal_macro_targets enable row level security;

grant select, insert, update, delete on public.macro_portion_systems to authenticated;
grant select, insert, update, delete on public.exchange_groups to authenticated;
grant select, insert, update, delete on public.exchange_items to authenticated;
grant select, insert, update, delete on public.meal_macro_targets to authenticated;

create policy "macro_portion_systems_professional_select"
on public.macro_portion_systems
for select
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "macro_portion_systems_professional_mutate"
on public.macro_portion_systems
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy "exchange_groups_professional_select"
on public.exchange_groups
for select
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "exchange_groups_professional_mutate"
on public.exchange_groups
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy "exchange_items_professional_select"
on public.exchange_items
for select
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "exchange_items_professional_mutate"
on public.exchange_items
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);

create policy "meal_macro_targets_professional_select"
on public.meal_macro_targets
for select
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "meal_macro_targets_professional_mutate"
on public.meal_macro_targets
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and created_by = auth.uid()
);
