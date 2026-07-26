create type public.clinical_record_status as enum (
  'draft',
  'submitted',
  'reviewed',
  'finalized',
  'archived'
);

alter table public.appointments
add constraint appointments_organization_id_id_unique unique (organization_id, id);

create table public.clinical_intake_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  version integer not null default 1 check (version > 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  sections jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name, version),
  check (jsonb_typeof(sections) = 'array')
);

create table public.clinical_intake_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null,
  template_id uuid references public.clinical_intake_templates(id) on delete set null,
  status public.clinical_record_status not null default 'draft',
  responses jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinical_intake_responses_organization_client_fk
    foreign key (organization_id, client_id)
    references public.clients(organization_id, id)
    on delete cascade,
  check (jsonb_typeof(responses) = 'object')
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null,
  professional_profile_id uuid not null,
  appointment_id uuid,
  consultation_type text not null default 'first_visit' check (consultation_type in ('first_visit', 'follow_up')),
  status public.clinical_record_status not null default 'draft' check (status in ('draft', 'finalized', 'archived')),
  started_at timestamptz not null default now(),
  finalized_at timestamptz,
  reason text,
  evolution text,
  adherence text,
  difficulties text,
  symptoms text,
  objectives text,
  intervention text,
  recommendations text,
  tasks text,
  next_review_at timestamptz,
  private_note text,
  shared_summary text,
  assessment text,
  nutrition_diagnosis text,
  intervention_plan text,
  monitoring_plan text,
  pes_statement text,
  created_by uuid references public.profiles(id) on delete set null,
  finalized_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultations_organization_client_fk
    foreign key (organization_id, client_id)
    references public.clients(organization_id, id)
    on delete restrict,
  constraint consultations_organization_professional_fk
    foreign key (organization_id, professional_profile_id)
    references public.professional_profiles(organization_id, id)
    on delete restrict,
  constraint consultations_organization_appointment_fk
    foreign key (organization_id, appointment_id)
    references public.appointments(organization_id, id)
    on delete no action,
  check ((status = 'finalized' and finalized_at is not null) or status <> 'finalized')
);

create table public.consultation_addenda (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  content text not null check (char_length(content) between 3 and 5000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.anthropometry_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null,
  professional_profile_id uuid not null,
  consultation_id uuid references public.consultations(id) on delete set null,
  status public.clinical_record_status not null default 'draft' check (status in ('draft', 'finalized', 'archived')),
  measured_at timestamptz not null default now(),
  protocol text not null default 'custom',
  conditions text,
  instrument text,
  calibration_notes text,
  mass_kg numeric(6,2) check (mass_kg > 0 and mass_kg < 400),
  height_cm numeric(6,2) check (height_cm > 0 and height_cm < 260),
  sitting_height_cm numeric(6,2) check (sitting_height_cm > 0 and sitting_height_cm < 180),
  wingspan_cm numeric(6,2) check (wingspan_cm > 0 and wingspan_cm < 280),
  waist_cm numeric(6,2) check (waist_cm > 0 and waist_cm < 250),
  hip_cm numeric(6,2) check (hip_cm > 0 and hip_cm < 250),
  triceps_mm numeric(6,2) check (triceps_mm > 0 and triceps_mm < 100),
  subscapular_mm numeric(6,2) check (subscapular_mm > 0 and subscapular_mm < 100),
  abdominal_mm numeric(6,2) check (abdominal_mm > 0 and abdominal_mm < 120),
  thigh_mm numeric(6,2) check (thigh_mm > 0 and thigh_mm < 120),
  bmi numeric(5,2) generated always as (
    case
      when mass_kg is not null and height_cm is not null and height_cm > 0
        then round((mass_kg / power(height_cm / 100, 2))::numeric, 2)
      else null
    end
  ) stored,
  waist_to_height_ratio numeric(5,3) generated always as (
    case
      when waist_cm is not null and height_cm is not null and height_cm > 0
        then round((waist_cm / height_cm)::numeric, 3)
      else null
    end
  ) stored,
  skinfold_sum_mm numeric(7,2) generated always as (
    coalesce(triceps_mm, 0)
    + coalesce(subscapular_mm, 0)
    + coalesce(abdominal_mm, 0)
    + coalesce(thigh_mm, 0)
  ) stored,
  visibility jsonb not null default '{"clientCanViewWeight":false,"clientCanViewBmi":false,"clientCanViewWaist":false}'::jsonb,
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anthropometry_sessions_organization_client_fk
    foreign key (organization_id, client_id)
    references public.clients(organization_id, id)
    on delete restrict,
  constraint anthropometry_sessions_organization_professional_fk
    foreign key (organization_id, professional_profile_id)
    references public.professional_profiles(organization_id, id)
    on delete restrict,
  check (jsonb_typeof(visibility) = 'object')
);

create index clinical_intake_templates_org_status_idx on public.clinical_intake_templates(organization_id, status);
create index clinical_intake_responses_client_updated_idx on public.clinical_intake_responses(client_id, updated_at desc);
create index consultations_client_started_idx on public.consultations(client_id, started_at desc);
create index consultation_addenda_consultation_idx on public.consultation_addenda(consultation_id, created_at desc);
create index anthropometry_sessions_client_measured_idx on public.anthropometry_sessions(client_id, measured_at desc);

create trigger clinical_intake_templates_touch_updated_at
before update on public.clinical_intake_templates
for each row execute function private.touch_updated_at();

create trigger clinical_intake_responses_touch_updated_at
before update on public.clinical_intake_responses
for each row execute function private.touch_updated_at();

create trigger consultations_touch_updated_at
before update on public.consultations
for each row execute function private.touch_updated_at();

create trigger anthropometry_sessions_touch_updated_at
before update on public.anthropometry_sessions
for each row execute function private.touch_updated_at();

create or replace function private.prevent_finalized_consultation_update()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'finalized' then
    raise exception 'Finalized consultations are immutable. Create an addendum instead.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger consultations_prevent_finalized_update
before update on public.consultations
for each row execute function private.prevent_finalized_consultation_update();

alter table public.clinical_intake_templates enable row level security;
alter table public.clinical_intake_responses enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_addenda enable row level security;
alter table public.anthropometry_sessions enable row level security;

grant select, insert, update, delete on public.clinical_intake_templates to authenticated;
grant select, insert, update on public.clinical_intake_responses to authenticated;
grant select, insert, update on public.consultations to authenticated;
grant select, insert on public.consultation_addenda to authenticated;
grant select, insert, update on public.anthropometry_sessions to authenticated;
grant execute on function private.prevent_finalized_consultation_update() to authenticated;

create policy "clinical_intake_templates_professional_select"
on public.clinical_intake_templates
for select
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "clinical_intake_templates_owner_mutate"
on public.clinical_intake_templates
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "clinical_intake_responses_professional_select"
on public.clinical_intake_responses
for select
to authenticated
using (
  private.can_read_clinical(organization_id)
  and private.can_read_client(organization_id, client_id)
);

create policy "clinical_intake_responses_professional_mutate"
on public.clinical_intake_responses
for all
to authenticated
using (private.can_mutate_client(organization_id, client_id))
with check (private.can_mutate_client(organization_id, client_id));

create policy "consultations_professional_select"
on public.consultations
for select
to authenticated
using (
  private.can_read_clinical(organization_id)
  and private.can_read_client(organization_id, client_id)
);

create policy "consultations_professional_mutate"
on public.consultations
for all
to authenticated
using (private.can_mutate_client(organization_id, client_id))
with check (private.can_mutate_client(organization_id, client_id));

create policy "consultation_addenda_professional_select"
on public.consultation_addenda
for select
to authenticated
using (
  exists (
    select 1
    from public.consultations c
    where c.id = consultation_id
      and c.organization_id = consultation_addenda.organization_id
      and private.can_read_clinical(c.organization_id)
      and private.can_read_client(c.organization_id, c.client_id)
  )
);

create policy "consultation_addenda_professional_insert"
on public.consultation_addenda
for insert
to authenticated
with check (
  exists (
    select 1
    from public.consultations c
    where c.id = consultation_id
      and c.organization_id = consultation_addenda.organization_id
      and c.status = 'finalized'
      and private.can_mutate_client(c.organization_id, c.client_id)
  )
);

create policy "anthropometry_sessions_professional_select"
on public.anthropometry_sessions
for select
to authenticated
using (
  private.can_read_clinical(organization_id)
  and private.can_read_client(organization_id, client_id)
);

create policy "anthropometry_sessions_professional_mutate"
on public.anthropometry_sessions
for all
to authenticated
using (private.can_mutate_client(organization_id, client_id))
with check (private.can_mutate_client(organization_id, client_id));
