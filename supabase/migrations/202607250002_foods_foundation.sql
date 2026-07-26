create type public.food_source_license_status as enum (
  'pending_review',
  'approved',
  'restricted',
  'unknown'
);

create type public.nutrient_category as enum (
  'energy',
  'macronutrient',
  'fatty_acid',
  'vitamin',
  'mineral',
  'other'
);

create table public.food_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  citation text,
  license_name text,
  license_url text,
  license_status public.food_source_license_status not null default 'pending_review',
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nutrients (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]{2,80}$'),
  name text not null check (char_length(name) between 2 and 160),
  unit text not null check (unit in ('g', 'mg', 'ug', 'kcal', 'kJ')),
  category public.nutrient_category not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  source_id uuid references public.food_sources(id) on delete set null,
  external_id text,
  name text not null check (char_length(name) between 1 and 240),
  normalized_name text not null,
  category text,
  normalized_category text,
  brand text,
  default_portion_g numeric(8, 2) not null default 100 check (default_portion_g > 0),
  verified boolean not null default false,
  raw_data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id),
  check (jsonb_typeof(raw_data) = 'object')
);

create table public.food_nutrients (
  food_id uuid not null references public.foods(id) on delete cascade,
  nutrient_id uuid not null references public.nutrients(id) on delete cascade,
  amount_per_100g numeric(14, 5),
  trace boolean not null default false,
  source_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (food_id, nutrient_id),
  check (amount_per_100g is null or amount_per_100g >= 0)
);

create table public.food_synonyms (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  synonym text not null check (char_length(synonym) between 1 and 240),
  normalized_synonym text not null,
  created_at timestamptz not null default now(),
  unique (food_id, normalized_synonym)
);

create index food_sources_slug_idx on public.food_sources(slug);
create index nutrients_code_idx on public.nutrients(code);
create index foods_global_verified_idx on public.foods(verified, normalized_name) where organization_id is null;
create index foods_org_name_idx on public.foods(organization_id, normalized_name);
create index foods_category_idx on public.foods(normalized_category);
create index food_nutrients_nutrient_idx on public.food_nutrients(nutrient_id);
create index food_synonyms_normalized_idx on public.food_synonyms(normalized_synonym);

create trigger food_sources_touch_updated_at
before update on public.food_sources
for each row execute function private.touch_updated_at();

create trigger nutrients_touch_updated_at
before update on public.nutrients
for each row execute function private.touch_updated_at();

create trigger foods_touch_updated_at
before update on public.foods
for each row execute function private.touch_updated_at();

create trigger food_nutrients_touch_updated_at
before update on public.food_nutrients
for each row execute function private.touch_updated_at();

alter table public.food_sources enable row level security;
alter table public.nutrients enable row level security;
alter table public.foods enable row level security;
alter table public.food_nutrients enable row level security;
alter table public.food_synonyms enable row level security;

create policy "food_sources_public_select"
on public.food_sources
for select
to anon, authenticated
using (true);

create policy "nutrients_public_select"
on public.nutrients
for select
to anon, authenticated
using (true);

create policy "foods_public_or_member_select"
on public.foods
for select
to anon, authenticated
using (
  (organization_id is null and verified = true)
  or (organization_id is not null and private.is_org_member(organization_id))
);

create policy "foods_professional_mutate"
on public.foods
for all
to authenticated
using (
  organization_id is not null
  and private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
)
with check (
  organization_id is not null
  and private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
);

create policy "food_nutrients_public_or_member_select"
on public.food_nutrients
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.foods f
    where f.id = food_nutrients.food_id
      and (
        (f.organization_id is null and f.verified = true)
        or (f.organization_id is not null and private.is_org_member(f.organization_id))
      )
  )
);

create policy "food_synonyms_public_or_member_select"
on public.food_synonyms
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.foods f
    where f.id = food_synonyms.food_id
      and (
        (f.organization_id is null and f.verified = true)
        or (f.organization_id is not null and private.is_org_member(f.organization_id))
      )
  )
);

grant select on public.food_sources to anon, authenticated;
grant select on public.nutrients to anon, authenticated;
grant select on public.foods to anon, authenticated;
grant select on public.food_nutrients to anon, authenticated;
grant select on public.food_synonyms to anon, authenticated;
grant insert, update, delete on public.foods to authenticated;
grant insert, update, delete on public.food_nutrients to authenticated;
grant insert, update, delete on public.food_synonyms to authenticated;
