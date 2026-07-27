alter table public.anthropometry_sessions
  add constraint anthropometry_sessions_organization_client_id_id_unique
  unique (organization_id, client_id, id);

create table public.anthropometry_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null,
  session_id uuid not null,
  kind text not null check (kind in ('professional_internal', 'client_shared')),
  status text not null default 'generated' check (status in ('generated', 'published', 'revoked')),
  version integer not null default 1 check (version > 0),
  storage_object_path text,
  generated_at timestamptz not null default now(),
  published_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  revoked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint anthropometry_reports_client_org_fk
    foreign key (organization_id, client_id)
    references public.clients(organization_id, id)
    on delete restrict,
  constraint anthropometry_reports_session_client_org_fk
    foreign key (organization_id, client_id, session_id)
    references public.anthropometry_sessions(organization_id, client_id, id)
    on delete restrict,
  constraint anthropometry_reports_lifecycle_check
    check (
      (
        status = 'generated'
        and published_at is null
        and revoked_at is null
      )
      or (
        status = 'published'
        and published_at is not null
        and revoked_at is null
      )
      or (
        status = 'revoked'
        and revoked_at is not null
      )
    ),
  unique (organization_id, session_id, kind, version)
);

create index anthropometry_reports_client_idx
on public.anthropometry_reports(organization_id, client_id, generated_at desc);

create index anthropometry_reports_session_idx
on public.anthropometry_reports(session_id);

create trigger anthropometry_reports_touch_updated_at
before update on public.anthropometry_reports
for each row execute function private.touch_updated_at();

alter table public.anthropometry_reports enable row level security;

grant select, insert, update on public.anthropometry_reports to authenticated;

create policy "anthropometry_reports_professional_select"
on public.anthropometry_reports
for select
to authenticated
using (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and private.can_read_client(organization_id, client_id)
);

create policy "anthropometry_reports_client_select_published"
on public.anthropometry_reports
for select
to authenticated
using (
  kind = 'client_shared'
  and status = 'published'
  and revoked_at is null
  and private.is_client_profile(client_id)
);

create policy "anthropometry_reports_professional_insert"
on public.anthropometry_reports
for insert
to authenticated
with check (
  kind = 'professional_internal'
  and status = 'generated'
  and created_by = auth.uid()
  and private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and private.can_mutate_client(organization_id, client_id)
  and exists (
    select 1
    from public.anthropometry_sessions s
    where s.id = session_id
      and s.organization_id = anthropometry_reports.organization_id
      and s.client_id = anthropometry_reports.client_id
      and s.workflow_status in ('completed', 'validated')
  )
);

create policy "anthropometry_reports_professional_update"
on public.anthropometry_reports
for update
to authenticated
using (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and private.can_mutate_client(organization_id, client_id)
)
with check (
  private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
  and private.can_mutate_client(organization_id, client_id)
);
