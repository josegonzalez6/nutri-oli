create extension if not exists btree_gist with schema extensions;

create table public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  weekday integer not null check (weekday between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  location text,
  online boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null check (char_length(reason) between 2 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  previous_status public.appointment_status,
  new_status public.appointment_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  reason text,
  changed_at timestamptz not null default now()
);

create index professional_availability_professional_idx
on public.professional_availability(organization_id, professional_profile_id, weekday)
where active = true;

create index availability_exceptions_professional_idx
on public.availability_exceptions(organization_id, professional_profile_id, starts_at);

create index appointment_status_history_appointment_idx
on public.appointment_status_history(appointment_id, changed_at desc);

alter table public.appointments
add constraint appointments_no_professional_overlap
exclude using gist (
  professional_profile_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
)
where (status in ('requested', 'confirmed'));

create trigger professional_availability_touch_updated_at
before update on public.professional_availability
for each row execute function private.touch_updated_at();

create trigger availability_exceptions_touch_updated_at
before update on public.availability_exceptions
for each row execute function private.touch_updated_at();

create or replace function private.record_appointment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_status_history (
      appointment_id,
      organization_id,
      previous_status,
      new_status,
      changed_by,
      reason
    )
    values (
      new.id,
      new.organization_id,
      null,
      new.status,
      new.created_by,
      'created'
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.appointment_status_history (
      appointment_id,
      organization_id,
      previous_status,
      new_status,
      changed_by,
      reason
    )
    values (
      new.id,
      new.organization_id,
      old.status,
      new.status,
      auth.uid(),
      'status_changed'
    );
  end if;

  return new;
end;
$$;

create trigger appointments_record_status_insert
after insert on public.appointments
for each row execute function private.record_appointment_status_change();

create trigger appointments_record_status_update
after update of status on public.appointments
for each row execute function private.record_appointment_status_change();

alter table public.professional_availability enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointment_status_history enable row level security;

create policy "professional_availability_member_select"
on public.professional_availability
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "professional_availability_owner_mutate"
on public.professional_availability
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "availability_exceptions_member_select"
on public.availability_exceptions
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "availability_exceptions_owner_mutate"
on public.availability_exceptions
for all
to authenticated
using (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]))
with check (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "appointment_status_history_professional_or_client_select"
on public.appointment_status_history
for select
to authenticated
using (
  private.is_org_member(organization_id)
  or exists (
    select 1
    from public.appointments a
    where a.id = appointment_status_history.appointment_id
      and private.is_client_profile(a.client_id)
  )
);

grant select on
  public.organizations,
  public.profiles,
  public.organization_members,
  public.professional_profiles,
  public.clients,
  public.client_profiles,
  public.client_assignments,
  public.services,
  public.appointments,
  public.feature_flags,
  public.audit_events
to authenticated;

grant insert, update, delete on
  public.clients,
  public.client_profiles,
  public.client_assignments,
  public.services,
  public.appointments
to authenticated;

grant insert on public.audit_events to authenticated;

grant select on public.professional_availability to authenticated;
grant insert, update, delete on public.professional_availability to authenticated;
grant select on public.availability_exceptions to authenticated;
grant insert, update, delete on public.availability_exceptions to authenticated;
grant select on public.appointment_status_history to authenticated;
grant execute on function private.record_appointment_status_change() to authenticated;
