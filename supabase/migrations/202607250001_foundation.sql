create schema if not exists private;

create type public.organization_role as enum (
  'owner',
  'nutritionist',
  'assistant',
  'auditor',
  'client'
);

create type public.appointment_status as enum (
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type public.appointment_modality as enum (
  'in_person',
  'online'
);

create type public.audit_event_type as enum (
  'profile_accessed',
  'organization_changed',
  'client_changed',
  'appointment_changed',
  'permission_changed',
  'consent_changed',
  'security_event'
);

create extension if not exists "pgcrypto" with schema extensions;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  locale text not null default 'es' check (locale in ('es', 'ca')),
  time_zone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null,
  preferred_locale text not null default 'es' check (preferred_locale in ('es', 'ca')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null,
  can_access_clinical_notes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id),
  check (
    role in ('owner', 'nutritionist', 'auditor')
    or can_access_clinical_notes = false
  )
);

create table public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  license_number text,
  public_display_name text not null,
  mfa_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  internal_code text not null,
  display_name text not null check (char_length(display_name) between 2 and 160),
  status text not null default 'active' check (status in ('lead', 'active', 'paused', 'archived')),
  date_of_birth date,
  email text,
  phone text,
  objective_summary text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, internal_code)
);

create table public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  portal_enabled boolean not null default false,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, client_id),
  unique (profile_id)
);

create table public.client_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_id, professional_profile_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  duration_minutes integer not null check (duration_minutes between 10 and 480),
  price_cents integer check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  professional_profile_id uuid not null references public.professional_profiles(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  time_zone text not null default 'Europe/Madrid',
  status public.appointment_status not null default 'requested',
  modality public.appointment_modality not null default 'in_person',
  location text,
  meeting_url text,
  administrative_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null check (key ~ '^[a-z0-9_]{2,80}$'),
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type public.audit_event_type not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
);

create index organization_members_profile_id_idx on public.organization_members(profile_id);
create index professional_profiles_org_profile_idx on public.professional_profiles(organization_id, profile_id);
create index clients_org_status_idx on public.clients(organization_id, status);
create index client_profiles_profile_id_idx on public.client_profiles(profile_id);
create index client_assignments_org_client_idx on public.client_assignments(organization_id, client_id);
create index appointments_org_starts_idx on public.appointments(organization_id, starts_at);
create index appointments_client_starts_idx on public.appointments(client_id, starts_at);
create index audit_events_org_created_idx on public.audit_events(organization_id, created_at desc);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_touch_updated_at
before update on public.organizations
for each row execute function private.touch_updated_at();

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

create trigger organization_members_touch_updated_at
before update on public.organization_members
for each row execute function private.touch_updated_at();

create trigger professional_profiles_touch_updated_at
before update on public.professional_profiles
for each row execute function private.touch_updated_at();

create trigger clients_touch_updated_at
before update on public.clients
for each row execute function private.touch_updated_at();

create trigger client_profiles_touch_updated_at
before update on public.client_profiles
for each row execute function private.touch_updated_at();

create trigger services_touch_updated_at
before update on public.services
for each row execute function private.touch_updated_at();

create trigger appointments_touch_updated_at
before update on public.appointments
for each row execute function private.touch_updated_at();

create trigger feature_flags_touch_updated_at
before update on public.feature_flags
for each row execute function private.touch_updated_at();

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.profile_id = auth.uid()
  );
$$;

create or replace function private.has_org_role(
  target_organization_id uuid,
  allowed_roles public.organization_role[]
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.profile_id = auth.uid()
      and om.role = any(allowed_roles)
  );
$$;

create or replace function private.can_read_clinical(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.profile_id = auth.uid()
      and (
        om.role in ('owner', 'nutritionist', 'auditor')
        or om.can_access_clinical_notes = true
      )
  );
$$;

create or replace function private.is_client_profile(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.client_profiles cp
    where cp.client_id = target_client_id
      and cp.profile_id = auth.uid()
      and cp.portal_enabled = true
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, public.organization_role[]) to authenticated;
grant execute on function private.can_read_clinical(uuid) to authenticated;
grant execute on function private.is_client_profile(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_assignments enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_events enable row level security;

create policy "organizations_member_select"
on public.organizations
for select
to authenticated
using (private.is_org_member(id));

create policy "organizations_owner_update"
on public.organizations
for update
to authenticated
using (private.has_org_role(id, array['owner']::public.organization_role[]))
with check (private.has_org_role(id, array['owner']::public.organization_role[]));

create policy "profiles_self_select"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "organization_members_member_select"
on public.organization_members
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "organization_members_owner_mutate"
on public.organization_members
for all
to authenticated
using (private.has_org_role(organization_id, array['owner']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy "professional_profiles_member_select"
on public.professional_profiles
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "professional_profiles_owner_mutate"
on public.professional_profiles
for all
to authenticated
using (private.has_org_role(organization_id, array['owner']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy "clients_professional_select"
on public.clients
for select
to authenticated
using (
  private.can_read_clinical(organization_id)
  or private.is_client_profile(id)
);

create policy "clients_professional_mutate"
on public.clients
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "client_profiles_professional_select"
on public.client_profiles
for select
to authenticated
using (private.can_read_clinical(organization_id) or profile_id = auth.uid());

create policy "client_profiles_owner_mutate"
on public.client_profiles
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "client_assignments_professional_select"
on public.client_assignments
for select
to authenticated
using (private.can_read_clinical(organization_id));

create policy "client_assignments_owner_mutate"
on public.client_assignments
for all
to authenticated
using (private.has_org_role(organization_id, array['owner']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy "services_member_select"
on public.services
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "services_owner_mutate"
on public.services
for all
to authenticated
using (private.has_org_role(organization_id, array['owner']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy "appointments_professional_or_client_select"
on public.appointments
for select
to authenticated
using (
  private.is_org_member(organization_id)
  or private.is_client_profile(client_id)
);

create policy "appointments_professional_mutate"
on public.appointments
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist', 'assistant']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner', 'nutritionist', 'assistant']::public.organization_role[]));

create policy "feature_flags_member_select"
on public.feature_flags
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "feature_flags_owner_mutate"
on public.feature_flags
for all
to authenticated
using (private.has_org_role(organization_id, array['owner']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner']::public.organization_role[]));

create policy "audit_events_privileged_select"
on public.audit_events
for select
to authenticated
using (organization_id is not null and private.has_org_role(organization_id, array['owner', 'auditor']::public.organization_role[]));

create policy "audit_events_authenticated_insert"
on public.audit_events
for insert
to authenticated
with check (actor_profile_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('clinical-documents', 'clinical-documents', false, 10485760, array['application/pdf']),
  ('progress-photos', 'progress-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('message-attachments', 'message-attachments', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('professional-assets', 'professional-assets', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "private_storage_member_read"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('clinical-documents', 'progress-photos', 'message-attachments', 'professional-assets')
  and private.is_org_member((storage.foldername(name))[1]::uuid)
);

create policy "private_storage_professional_write"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('clinical-documents', 'progress-photos', 'message-attachments', 'professional-assets')
  and private.has_org_role((storage.foldername(name))[1]::uuid, array['owner', 'nutritionist']::public.organization_role[])
);
