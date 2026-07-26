alter table public.clients
add constraint clients_organization_id_id_unique unique (organization_id, id);

alter table public.professional_profiles
add constraint professional_profiles_organization_id_id_unique unique (organization_id, id);

alter table public.services
add constraint services_organization_id_id_unique unique (organization_id, id);

alter table public.client_profiles
add constraint client_profiles_organization_client_fk
foreign key (organization_id, client_id)
references public.clients(organization_id, id)
on delete cascade;

alter table public.client_assignments
add constraint client_assignments_organization_client_fk
foreign key (organization_id, client_id)
references public.clients(organization_id, id)
on delete cascade;

alter table public.client_assignments
add constraint client_assignments_organization_professional_fk
foreign key (organization_id, professional_profile_id)
references public.professional_profiles(organization_id, id)
on delete cascade;

alter table public.appointments
add constraint appointments_organization_client_fk
foreign key (organization_id, client_id)
references public.clients(organization_id, id)
on delete restrict;

alter table public.appointments
add constraint appointments_organization_professional_fk
foreign key (organization_id, professional_profile_id)
references public.professional_profiles(organization_id, id)
on delete restrict;

alter table public.appointments
add constraint appointments_organization_service_fk
foreign key (organization_id, service_id)
references public.services(organization_id, id)
on delete no action;

alter table public.professional_availability
add constraint professional_availability_organization_professional_fk
foreign key (organization_id, professional_profile_id)
references public.professional_profiles(organization_id, id)
on delete cascade;

alter table public.availability_exceptions
add constraint availability_exceptions_organization_professional_fk
foreign key (organization_id, professional_profile_id)
references public.professional_profiles(organization_id, id)
on delete cascade;

create or replace function private.is_assigned_professional(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.client_assignments ca
    join public.professional_profiles pp on pp.id = ca.professional_profile_id
    where ca.client_id = target_client_id
      and pp.profile_id = auth.uid()
  );
$$;

create or replace function private.can_read_client(
  target_organization_id uuid,
  target_client_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    private.has_org_role(target_organization_id, array['owner', 'auditor']::public.organization_role[])
    or (
      private.has_org_role(target_organization_id, array['nutritionist']::public.organization_role[])
      and private.is_assigned_professional(target_client_id)
    )
    or private.is_client_profile(target_client_id);
$$;

create or replace function private.can_mutate_client(
  target_organization_id uuid,
  target_client_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    private.has_org_role(target_organization_id, array['owner']::public.organization_role[])
    or (
      private.has_org_role(target_organization_id, array['nutritionist']::public.organization_role[])
      and private.is_assigned_professional(target_client_id)
    );
$$;

create or replace function private.storage_object_organization_id(object_name text)
returns uuid
language sql
security definer
set search_path = public, storage
stable
as $$
  select case
    when (storage.foldername(object_name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (storage.foldername(object_name))[1]::uuid
    else null
  end;
$$;

grant execute on function private.is_assigned_professional(uuid) to authenticated;
grant execute on function private.can_read_client(uuid, uuid) to authenticated;
grant execute on function private.can_mutate_client(uuid, uuid) to authenticated;
grant execute on function private.storage_object_organization_id(text) to authenticated;

drop policy "clients_professional_select" on public.clients;
drop policy "clients_professional_mutate" on public.clients;

create policy "clients_authorized_select"
on public.clients
for select
to authenticated
using (private.can_read_client(organization_id, id));

create policy "clients_professional_insert"
on public.clients
for insert
to authenticated
with check (private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[]));

create policy "clients_professional_update"
on public.clients
for update
to authenticated
using (private.can_mutate_client(organization_id, id))
with check (private.can_mutate_client(organization_id, id));

create policy "clients_owner_delete"
on public.clients
for delete
to authenticated
using (private.has_org_role(organization_id, array['owner']::public.organization_role[]));

drop policy "private_storage_member_read" on storage.objects;
drop policy "private_storage_professional_write" on storage.objects;

create policy "private_storage_member_read"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('clinical-documents', 'progress-photos', 'message-attachments', 'professional-assets')
  and private.storage_object_organization_id(name) is not null
  and private.is_org_member(private.storage_object_organization_id(name))
);

create policy "private_storage_professional_write"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('clinical-documents', 'progress-photos', 'message-attachments', 'professional-assets')
  and private.storage_object_organization_id(name) is not null
  and private.has_org_role(
    private.storage_object_organization_id(name),
    array['owner', 'nutritionist']::public.organization_role[]
  )
);
