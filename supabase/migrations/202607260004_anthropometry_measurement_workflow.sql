create table public.anthropometry_protocols (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  version text not null,
  profile_kind text not null check (
    profile_kind in (
      'isak_restricted',
      'isak_full',
      'basic_nutrition_control',
      'body_composition',
      'sports_nutrition',
      'custom'
    )
  ),
  isak_compatibility_note text not null,
  requires_accreditation_notice boolean not null default false,
  evidence_status text not null check (
    evidence_status in (
      'VERIFIED_PRIMARY_SOURCE',
      'VERIFIED_SECONDARY_SOURCE',
      'NEEDS_MANUAL_VALIDATION',
      'EXPERIMENTAL',
      'DISABLED',
      'REJECTED'
    )
  ),
  source_citation text not null,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index anthropometry_protocols_global_slug_version_idx
on public.anthropometry_protocols(slug, version)
where organization_id is null;

create unique index anthropometry_protocols_org_slug_version_idx
on public.anthropometry_protocols(organization_id, slug, version)
where organization_id is not null;

create table public.anthropometry_measurement_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  abbreviation text not null,
  category text not null check (
    category in ('basic', 'skinfold', 'girth', 'breadth', 'length', 'other')
  ),
  unit text not null check (unit in ('kg', 'cm', 'mm')),
  precision_digits integer not null default 1 check (precision_digits between 0 and 2),
  plausible_min numeric(8,2) not null check (plausible_min > 0),
  plausible_max numeric(8,2) not null check (plausible_max > plausible_min),
  help_title text not null,
  help_summary text not null,
  help_position text not null,
  help_landmark text not null,
  help_technique text not null,
  help_common_errors text[] not null default array[]::text[],
  help_instrument text not null,
  help_source text not null,
  help_protocol_version text not null,
  evidence_status text not null check (
    evidence_status in (
      'VERIFIED_PRIMARY_SOURCE',
      'VERIFIED_SECONDARY_SOURCE',
      'NEEDS_MANUAL_VALIDATION',
      'EXPERIMENTAL',
      'DISABLED',
      'REJECTED'
    )
  ),
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.anthropometry_protocol_measurements (
  protocol_id uuid not null references public.anthropometry_protocols(id) on delete cascade,
  measurement_definition_id uuid not null references public.anthropometry_measurement_definitions(id) on delete restrict,
  sort_order integer not null,
  required boolean not null default true,
  tolerance_relative_percent numeric(5,2) not null check (tolerance_relative_percent > 0 and tolerance_relative_percent <= 25),
  tolerance_absolute numeric(8,2),
  final_value_rule text not null check (
    final_value_rule in ('mean_two_median_three_pending_validation', 'professional_review_required')
  ),
  tolerance_source text not null,
  tolerance_validated_on date,
  evidence_status text not null check (
    evidence_status in (
      'VERIFIED_PRIMARY_SOURCE',
      'VERIFIED_SECONDARY_SOURCE',
      'NEEDS_MANUAL_VALIDATION',
      'EXPERIMENTAL',
      'DISABLED',
      'REJECTED'
    )
  ),
  created_at timestamptz not null default now(),
  primary key (protocol_id, measurement_definition_id)
);

alter table public.anthropometry_sessions
  add column workflow_status text not null default 'draft' check (
    workflow_status in (
      'draft',
      'measuring',
      'requires_review',
      'completed',
      'validated',
      'cancelled',
      'superseded'
    )
  ),
  add column protocol_id uuid references public.anthropometry_protocols(id) on delete set null,
  add column profile_slug text,
  add column protocol_version text,
  add column anthropometrist_name text,
  add column accreditation_level text,
  add column accreditation_number text,
  add column center text,
  add column fasting_state text,
  add column previous_exercise text,
  add column declared_hydration text,
  add column laterality text not null default 'right',
  add column instrument_brand text,
  add column instrument_model text,
  add column instrument_serial_number text,
  add column instrument_precision text,
  add column instrument_calibrated_at date,
  add column consent_confirmed boolean not null default false,
  add column finalized_at timestamptz,
  add column finalized_by uuid references public.profiles(id) on delete set null;

alter table public.anthropometry_sessions
  drop column skinfold_sum_mm;

alter table public.anthropometry_sessions
  add column skinfold_sum_mm numeric(7,2) generated always as (
    case
      when triceps_mm is not null
        and subscapular_mm is not null
        and abdominal_mm is not null
        and thigh_mm is not null
        then triceps_mm + subscapular_mm + abdominal_mm + thigh_mm
      else null
    end
  ) stored;

alter table public.consultations
  add constraint consultations_organization_client_id_unique
  unique (organization_id, client_id, id);

alter table public.anthropometry_sessions
  add constraint anthropometry_sessions_organization_id_unique
  unique (organization_id, id);

alter table public.anthropometry_sessions
  add constraint anthropometry_sessions_consultation_same_client_fk
  foreign key (organization_id, client_id, consultation_id)
  references public.consultations(organization_id, client_id, id)
  on delete restrict;

create table public.anthropometry_session_measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid not null references public.anthropometry_sessions(id) on delete cascade,
  measurement_definition_id uuid not null references public.anthropometry_measurement_definitions(id) on delete restrict,
  category text not null check (
    category in ('basic', 'skinfold', 'girth', 'breadth', 'length', 'other')
  ),
  unit text not null check (unit in ('kg', 'cm', 'mm')),
  first_value numeric(8,2) check (first_value > 0),
  second_value numeric(8,2) check (second_value > 0),
  third_value numeric(8,2) check (third_value > 0),
  absolute_diff numeric(8,2),
  relative_diff_percent numeric(7,3),
  tolerance_relative_percent numeric(5,2) not null check (tolerance_relative_percent > 0),
  tolerance_absolute numeric(8,2),
  final_value numeric(8,2) check (final_value > 0),
  status text not null default 'pending' check (
    status in (
      'pending',
      'first_recorded',
      'within_tolerance',
      'third_required',
      'completed',
      'requires_review',
      'implausible'
    )
  ),
  plausible_warning text,
  observations text,
  override_reason text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, measurement_definition_id),
  constraint anthropometry_session_measurements_session_org_fk
    foreign key (organization_id, session_id)
    references public.anthropometry_sessions(organization_id, id)
    on delete cascade
);

create table public.anthropometry_equation_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  authors text not null,
  year integer,
  reference text not null,
  doi text,
  category text not null,
  population text not null,
  min_age integer,
  max_age integer,
  sex_applicability text not null default 'not_applicable',
  required_inputs jsonb not null default '[]'::jsonb,
  output_name text not null,
  output_unit text not null,
  standard_error text,
  r_squared text,
  limitations text not null,
  validation_external text not null default 'No registrada',
  implementation_status text not null check (
    implementation_status in (
      'VERIFIED_PRIMARY_SOURCE',
      'VERIFIED_SECONDARY_SOURCE',
      'NEEDS_MANUAL_VALIDATION',
      'EXPERIMENTAL',
      'DISABLED',
      'REJECTED'
    )
  ),
  enabled boolean not null default false,
  reviewed_at date,
  reviewer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.anthropometry_protocols enable row level security;
alter table public.anthropometry_measurement_definitions enable row level security;
alter table public.anthropometry_protocol_measurements enable row level security;
alter table public.anthropometry_session_measurements enable row level security;
alter table public.anthropometry_equation_catalog enable row level security;

create index anthropometry_session_measurements_session_idx
on public.anthropometry_session_measurements(session_id);

create index anthropometry_session_measurements_definition_idx
on public.anthropometry_session_measurements(measurement_definition_id);

create index anthropometry_sessions_workflow_status_idx
on public.anthropometry_sessions(client_id, workflow_status, measured_at desc);

create trigger anthropometry_protocols_touch_updated_at
before update on public.anthropometry_protocols
for each row execute function private.touch_updated_at();

create trigger anthropometry_measurement_definitions_touch_updated_at
before update on public.anthropometry_measurement_definitions
for each row execute function private.touch_updated_at();

create trigger anthropometry_session_measurements_touch_updated_at
before update on public.anthropometry_session_measurements
for each row execute function private.touch_updated_at();

create trigger anthropometry_equation_catalog_touch_updated_at
before update on public.anthropometry_equation_catalog
for each row execute function private.touch_updated_at();

create or replace function private.prevent_locked_anthropometry_session_update()
returns trigger
language plpgsql
as $$
begin
  if old.workflow_status in ('completed', 'validated', 'cancelled', 'superseded') then
    raise exception 'Locked anthropometry sessions are immutable. Create a new session or addendum.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger anthropometry_sessions_prevent_locked_update
before update on public.anthropometry_sessions
for each row execute function private.prevent_locked_anthropometry_session_update();

create or replace function private.prevent_locked_anthropometry_measurement_update()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.anthropometry_sessions s
    where s.id = coalesce(old.session_id, new.session_id)
      and s.workflow_status in ('completed', 'validated', 'cancelled', 'superseded')
  ) then
    raise exception 'Locked anthropometry measurements are immutable. Create a new session or addendum.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger anthropometry_session_measurements_prevent_locked_update
before update or delete on public.anthropometry_session_measurements
for each row execute function private.prevent_locked_anthropometry_measurement_update();

grant select, insert, update, delete on public.anthropometry_protocols to authenticated;
grant select on public.anthropometry_measurement_definitions to authenticated;
grant select on public.anthropometry_protocol_measurements to authenticated;
grant select, insert, update, delete on public.anthropometry_session_measurements to authenticated;
grant select on public.anthropometry_equation_catalog to authenticated;
grant execute on function private.prevent_locked_anthropometry_session_update() to authenticated;
grant execute on function private.prevent_locked_anthropometry_measurement_update() to authenticated;

create policy "anthropometry_protocols_select"
on public.anthropometry_protocols
for select
to authenticated
using (
  organization_id is null
  or private.has_org_role(organization_id, array['owner', 'nutritionist']::public.organization_role[])
);

create policy "anthropometry_protocols_org_mutate"
on public.anthropometry_protocols
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

create policy "anthropometry_measurement_definitions_select"
on public.anthropometry_measurement_definitions
for select
to authenticated
using (active = true);

create policy "anthropometry_protocol_measurements_select"
on public.anthropometry_protocol_measurements
for select
to authenticated
using (
  exists (
    select 1
    from public.anthropometry_protocols p
    where p.id = protocol_id
      and (
        p.organization_id is null
        or private.has_org_role(p.organization_id, array['owner', 'nutritionist']::public.organization_role[])
      )
  )
);

create policy "anthropometry_session_measurements_select"
on public.anthropometry_session_measurements
for select
to authenticated
using (
  exists (
    select 1
    from public.anthropometry_sessions s
    where s.id = session_id
      and s.organization_id = anthropometry_session_measurements.organization_id
      and private.can_read_clinical(s.organization_id)
      and private.can_read_client(s.organization_id, s.client_id)
  )
);

create policy "anthropometry_session_measurements_mutate"
on public.anthropometry_session_measurements
for all
to authenticated
using (
  exists (
    select 1
    from public.anthropometry_sessions s
    where s.id = session_id
      and s.organization_id = anthropometry_session_measurements.organization_id
      and s.workflow_status not in ('completed', 'validated', 'cancelled', 'superseded')
      and private.can_mutate_client(s.organization_id, s.client_id)
  )
)
with check (
  exists (
    select 1
    from public.anthropometry_sessions s
    where s.id = session_id
      and s.organization_id = anthropometry_session_measurements.organization_id
      and s.workflow_status not in ('completed', 'validated', 'cancelled', 'superseded')
      and private.can_mutate_client(s.organization_id, s.client_id)
  )
);

drop policy "anthropometry_sessions_professional_mutate" on public.anthropometry_sessions;

create policy "anthropometry_sessions_professional_insert"
on public.anthropometry_sessions
for insert
to authenticated
with check (
  private.can_mutate_client(organization_id, client_id)
  and created_by = auth.uid()
  and exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_profile_id
      and pp.organization_id = anthropometry_sessions.organization_id
      and pp.profile_id = auth.uid()
  )
);

create policy "anthropometry_sessions_professional_update"
on public.anthropometry_sessions
for update
to authenticated
using (
  workflow_status not in ('completed', 'validated', 'cancelled', 'superseded')
  and private.can_mutate_client(organization_id, client_id)
)
with check (
  private.can_mutate_client(organization_id, client_id)
  and exists (
    select 1
    from public.professional_profiles pp
    where pp.id = professional_profile_id
      and pp.organization_id = anthropometry_sessions.organization_id
      and pp.profile_id = auth.uid()
  )
);

create policy "anthropometry_sessions_professional_delete_draft"
on public.anthropometry_sessions
for delete
to authenticated
using (
  workflow_status = 'draft'
  and private.can_mutate_client(organization_id, client_id)
  and created_by = auth.uid()
);

create policy "anthropometry_equation_catalog_select"
on public.anthropometry_equation_catalog
for select
to authenticated
using (true);

insert into public.anthropometry_protocols (
  slug,
  name,
  version,
  profile_kind,
  isak_compatibility_note,
  requires_accreditation_notice,
  evidence_status,
  source_citation
)
values
  (
    'compatible_isak_restricted_v0',
    'Perfil restringido compatible con ISAK - pendiente de validacion manual',
    '0.1',
    'isak_restricted',
    'Medicion realizada con protocolo compatible con ISAK. No implica certificacion ISAK ni sustituye el manual vigente.',
    true,
    'NEEDS_MANUAL_VALIDATION',
    'ISAK Global describe estandares internacionales y acreditacion; lista local pendiente de validacion contra manual autorizado.'
  ),
  (
    'basic_nutrition_control_v0',
    'Control nutricional basico',
    '0.1',
    'basic_nutrition_control',
    'Perfil operativo propio de Nutri-Oli para seguimiento nutricional basico.',
    false,
    'NEEDS_MANUAL_VALIDATION',
    'Definicion interna pendiente de validacion clinica.'
  )
on conflict do nothing;

insert into public.anthropometry_measurement_definitions (
  slug,
  name,
  abbreviation,
  category,
  unit,
  precision_digits,
  plausible_min,
  plausible_max,
  help_title,
  help_summary,
  help_position,
  help_landmark,
  help_technique,
  help_common_errors,
  help_instrument,
  help_source,
  help_protocol_version,
  evidence_status,
  sort_order
)
values
  ('mass_body', 'Masa corporal', 'MC', 'basic', 'kg', 1, 2, 400, 'Masa corporal', 'Registra la masa corporal en una bascula calibrada.', 'Persona de pie, estable y con ropa ligera si procede.', 'La bascula debe estar nivelada y tarada.', 'Lee el valor cuando la bascula este estable.', array['bascula sin tarar', 'ropa o calzado no registrado', 'lectura antes de estabilizar'], 'Bascula con precision registrada.', 'Procedimiento operativo Nutri-Oli pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 10),
  ('height_standing', 'Talla', 'T', 'basic', 'cm', 1, 30, 260, 'Talla', 'Registra la estatura de pie con estadimetro.', 'Persona erguida, estable y mirando al frente.', 'Contacto correcto con el estadimetro segun tecnica validada.', 'Lee en centimetros tras colocar el cabezal.', array['postura no vertical', 'calzado', 'cabezal inclinado'], 'Estadimetro con precision registrada.', 'Procedimiento operativo Nutri-Oli pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 20),
  ('triceps_skinfold', 'Pliegue tricipital', 'TRI', 'skinfold', 'mm', 1, 1, 100, 'Pliegue tricipital', 'Estima el espesor del pliegue cutaneo en la region posterior del brazo.', 'Persona relajada, brazo suelto.', 'Punto anatomico posterior del brazo pendiente de validacion contra manual autorizado.', 'Aplica el plicometro perpendicular al pliegue y lee en milimetros.', array['punto incorrecto', 'incluir musculo', 'repetir sobre tejido comprimido'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 110),
  ('subscapular_skinfold', 'Pliegue subescapular', 'SUB', 'skinfold', 'mm', 1, 1, 100, 'Pliegue subescapular', 'Estima el espesor del pliegue bajo la escapula.', 'Persona de pie y relajada.', 'Referencia escapular pendiente de validacion contra manual autorizado.', 'Toma el pliegue con orientacion registrada y lee en milimetros.', array['orientacion incorrecta', 'punto desplazado', 'lectura tardia'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 120),
  ('biceps_skinfold', 'Pliegue bicipital', 'BIC', 'skinfold', 'mm', 1, 1, 100, 'Pliegue bicipital', 'Estima el espesor del pliegue anterior del brazo.', 'Persona relajada, brazo suelto.', 'Punto anterior del brazo pendiente de validacion contra manual autorizado.', 'Aplica el plicometro sin comprimir tejido muscular.', array['punto incorrecto', 'pinza demasiado profunda', 'brazo en tension'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 130),
  ('iliac_crest_skinfold', 'Pliegue cresta iliaca', 'CI', 'skinfold', 'mm', 1, 1, 120, 'Pliegue cresta iliaca', 'Estima el espesor del pliegue en la zona de cresta iliaca.', 'Persona de pie.', 'Referencia iliaca pendiente de validacion contra manual autorizado.', 'Registra orientacion y lectura en milimetros.', array['confundir con supraespinal', 'orientacion no registrada', 'punto no marcado'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 140),
  ('supraspinale_skinfold', 'Pliegue supraespinal', 'SPE', 'skinfold', 'mm', 1, 1, 120, 'Pliegue supraespinal', 'Estima el espesor del pliegue supraespinal.', 'Persona de pie y relajada.', 'Referencia supraespinal pendiente de validacion contra manual autorizado.', 'Toma el pliegue con orientacion registrada y lee en milimetros.', array['confundir con cresta iliaca', 'orientacion incorrecta', 'lectura tardia'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 150),
  ('abdominal_skinfold', 'Pliegue abdominal', 'ABD', 'skinfold', 'mm', 1, 1, 120, 'Pliegue abdominal', 'Estima el espesor del pliegue cutaneo abdominal.', 'Persona de pie, abdomen relajado.', 'Referencia abdominal pendiente de validacion contra manual autorizado.', 'Evita tension abdominal y registra lectura en milimetros.', array['abdomen contraido', 'punto desplazado', 'pinza irregular'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 160),
  ('anterior_thigh_skinfold', 'Pliegue muslo anterior', 'MA', 'skinfold', 'mm', 1, 1, 120, 'Pliegue muslo anterior', 'Estima el espesor del pliegue en la cara anterior del muslo.', 'Persona con pierna relajada segun tecnica validada.', 'Punto del muslo pendiente de validacion contra manual autorizado.', 'Toma el pliegue sin incluir musculo y lee en milimetros.', array['cuadriceps en tension', 'pliegue oblicuo no indicado', 'lectura inmediata incorrecta'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 170),
  ('medial_calf_skinfold', 'Pliegue pierna medial', 'PM', 'skinfold', 'mm', 1, 1, 100, 'Pliegue pierna medial', 'Estima el espesor del pliegue en la pierna medial.', 'Persona en posicion estable segun tecnica validada.', 'Referencia medial de pierna pendiente de validacion contra manual autorizado.', 'Registra lectura en milimetros y evita tejido comprimido.', array['punto no medial', 'pierna en tension', 'repeticion demasiado rapida'], 'Plicometro con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 180),
  ('arm_relaxed_girth', 'Perimetro brazo relajado', 'BR', 'girth', 'cm', 1, 5, 80, 'Perimetro brazo relajado', 'Registra el contorno del brazo en reposo.', 'Brazo relajado.', 'Nivel anatomico pendiente de validacion contra manual autorizado.', 'Cinta horizontal, sin comprimir tejido.', array['cinta inclinada', 'compresion excesiva', 'brazo contraido'], 'Cinta antropometrica con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 210),
  ('arm_flexed_girth', 'Perimetro brazo flexionado', 'BF', 'girth', 'cm', 1, 5, 90, 'Perimetro brazo flexionado', 'Registra el contorno del brazo flexionado y contraido.', 'Brazo en posicion de flexion segun tecnica validada.', 'Punto maximo pendiente de validacion contra manual autorizado.', 'Cinta sin comprimir y lectura en centimetros.', array['contraccion inconsistente', 'cinta inclinada', 'punto no maximo'], 'Cinta antropometrica con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 220),
  ('waist_girth', 'Perimetro cintura', 'CIN', 'girth', 'cm', 1, 20, 250, 'Perimetro cintura', 'Registra el contorno de cintura en centimetros.', 'Persona de pie y relajada.', 'Nivel de cintura pendiente de validacion segun protocolo seleccionado.', 'Cinta horizontal sin comprimir; registra momento respiratorio si procede.', array['cinta oblicua', 'abdomen contraido', 'nivel anatomico mezclado entre protocolos'], 'Cinta antropometrica con precision registrada.', 'Procedimiento operativo Nutri-Oli pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 230),
  ('hip_girth', 'Perimetro cadera', 'CAD', 'girth', 'cm', 1, 20, 250, 'Perimetro cadera', 'Registra el contorno de cadera/gluteo.', 'Persona de pie.', 'Nivel maximo o referencia pendiente de validacion segun protocolo.', 'Cinta horizontal sin comprimir.', array['cinta inclinada', 'punto no maximo', 'ropa no registrada'], 'Cinta antropometrica con precision registrada.', 'Procedimiento operativo Nutri-Oli pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 240),
  ('thigh_girth', 'Perimetro muslo', 'MUS', 'girth', 'cm', 1, 10, 120, 'Perimetro muslo', 'Registra el contorno del muslo.', 'Persona en posicion estable segun protocolo.', 'Nivel del muslo pendiente de validacion contra manual autorizado.', 'Cinta perpendicular al eje del segmento.', array['cinta oblicua', 'pierna en tension', 'nivel no marcado'], 'Cinta antropometrica con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 250),
  ('calf_girth', 'Perimetro pierna', 'PI', 'girth', 'cm', 1, 8, 80, 'Perimetro pierna', 'Registra el contorno de la pierna.', 'Persona estable, musculo relajado salvo indicacion de protocolo.', 'Nivel de pierna pendiente de validacion contra manual autorizado.', 'Cinta sin compresion.', array['punto no maximo', 'cinta inclinada', 'apoyo desigual'], 'Cinta antropometrica con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 260),
  ('humerus_breadth', 'Diametro humero', 'HUM', 'breadth', 'cm', 1, 2, 12, 'Diametro humero', 'Registra la anchura biepicondilea del humero si el protocolo la requiere.', 'Brazo colocado segun tecnica validada.', 'Puntos oseos pendientes de validacion contra manual autorizado.', 'Aplica antropometro pequeno sin presion excesiva.', array['puntos oseos incorrectos', 'instrumento mal alineado', 'presion excesiva'], 'Antropometro pequeno con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 310),
  ('femur_breadth', 'Diametro femur', 'FEM', 'breadth', 'cm', 1, 3, 18, 'Diametro femur', 'Registra la anchura biepicondilea del femur si el protocolo la requiere.', 'Persona sentada o posicion definida por protocolo validado.', 'Puntos oseos pendientes de validacion contra manual autorizado.', 'Aplica antropometro pequeno y registra lectura en centimetros.', array['puntos oseos incorrectos', 'rodilla mal posicionada', 'presion excesiva'], 'Antropometro pequeno con precision registrada.', 'ISAK/antropometria: ayuda original pendiente de validacion manual.', '0.1', 'NEEDS_MANUAL_VALIDATION', 320)
on conflict (slug) do nothing;

insert into public.anthropometry_protocol_measurements (
  protocol_id,
  measurement_definition_id,
  sort_order,
  required,
  tolerance_relative_percent,
  tolerance_absolute,
  final_value_rule,
  tolerance_source,
  tolerance_validated_on,
  evidence_status
)
select
  p.id,
  d.id,
  d.sort_order,
  d.slug in (
    'mass_body',
    'height_standing',
    'triceps_skinfold',
    'subscapular_skinfold',
    'biceps_skinfold',
    'iliac_crest_skinfold',
    'supraspinale_skinfold',
    'abdominal_skinfold',
    'anterior_thigh_skinfold',
    'medial_calf_skinfold',
    'arm_relaxed_girth',
    'arm_flexed_girth',
    'waist_girth',
    'hip_girth',
    'thigh_girth',
    'calf_girth',
    'humerus_breadth',
    'femur_breadth'
  ) as required,
  case when d.category = 'skinfold' then 5.00 else 1.00 end,
  null,
  'mean_two_median_three_pending_validation',
  'Tolerancia provisional Nutri-Oli: 5% pliegues, 1% otras medidas. Pendiente de validacion contra fuente autorizada.',
  null,
  'NEEDS_MANUAL_VALIDATION'
from public.anthropometry_protocols p
cross join public.anthropometry_measurement_definitions d
where p.slug = 'compatible_isak_restricted_v0'
  and d.slug in (
    'mass_body',
    'height_standing',
    'triceps_skinfold',
    'subscapular_skinfold',
    'biceps_skinfold',
    'iliac_crest_skinfold',
    'supraspinale_skinfold',
    'abdominal_skinfold',
    'anterior_thigh_skinfold',
    'medial_calf_skinfold',
    'arm_relaxed_girth',
    'arm_flexed_girth',
    'waist_girth',
    'hip_girth',
    'thigh_girth',
    'calf_girth',
    'humerus_breadth',
    'femur_breadth'
  )
on conflict do nothing;

insert into public.anthropometry_protocol_measurements (
  protocol_id,
  measurement_definition_id,
  sort_order,
  required,
  tolerance_relative_percent,
  tolerance_absolute,
  final_value_rule,
  tolerance_source,
  tolerance_validated_on,
  evidence_status
)
select
  p.id,
  d.id,
  d.sort_order,
  true,
  case when d.category = 'skinfold' then 5.00 else 1.00 end,
  null,
  'mean_two_median_three_pending_validation',
  'Tolerancia provisional Nutri-Oli: 5% pliegues, 1% otras medidas. Pendiente de validacion clinica.',
  null,
  'NEEDS_MANUAL_VALIDATION'
from public.anthropometry_protocols p
join public.anthropometry_measurement_definitions d
  on d.slug in ('mass_body', 'height_standing', 'waist_girth', 'hip_girth')
where p.slug = 'basic_nutrition_control_v0'
on conflict do nothing;

insert into public.anthropometry_equation_catalog (
  slug,
  name,
  authors,
  year,
  reference,
  doi,
  category,
  population,
  min_age,
  max_age,
  sex_applicability,
  required_inputs,
  output_name,
  output_unit,
  standard_error,
  r_squared,
  limitations,
  validation_external,
  implementation_status,
  enabled,
  reviewed_at,
  reviewer
)
values
  (
    'bmi',
    'Indice de masa corporal',
    'Adolphe Quetelet; uso clinico OMS',
    null,
    'World Health Organization. Body mass index - BMI.',
    null,
    'index',
    'Adultos; indice antropometrico, no composicion corporal.',
    null,
    null,
    'all',
    '[{"slug":"mass_body","unit":"kg"},{"slug":"height_standing","unit":"cm"}]'::jsonb,
    'IMC',
    'kg/m2',
    null,
    null,
    'Indice de cribado. No estima grasa corporal ni diagnostica por si solo.',
    'Uso extendido en guias clinicas; interpretacion requiere contexto profesional.',
    'VERIFIED_SECONDARY_SOURCE',
    true,
    current_date,
    'Nutri-Oli technical review'
  ),
  (
    'waist_to_height_ratio',
    'Indice cintura/talla',
    'Varios autores',
    null,
    'Indice antropometrico simple calculado como cintura dividida por talla.',
    null,
    'index',
    'Adultos; requiere validacion de punto de cintura segun protocolo.',
    null,
    null,
    'all',
    '[{"slug":"waist_girth","unit":"cm"},{"slug":"height_standing","unit":"cm"}]'::jsonb,
    'Cintura/talla',
    'ratio',
    null,
    null,
    'Depende del protocolo de cintura; no sustituye evaluacion clinica.',
    'Pendiente de revision clinica de puntos de corte antes de mostrar interpretacion.',
    'VERIFIED_SECONDARY_SOURCE',
    true,
    current_date,
    'Nutri-Oli technical review'
  ),
  (
    'durnin_womersley_1974_density',
    'Densidad corporal por pliegues',
    'J. V. G. A. Durnin; J. Womersley',
    1974,
    'Body fat assessed from total body density and its estimation from skinfold thickness: measurements on 481 men and women aged from 16 to 72 years. British Journal of Nutrition.',
    '10.1079/BJN19740060',
    'body_density_prediction',
    '209 hombres y 272 mujeres de 16 a 72 anos; requiere coeficientes por edad y sexo.',
    16,
    72,
    'male_female_specific',
    '[{"slug":"biceps_skinfold","unit":"mm"},{"slug":"triceps_skinfold","unit":"mm"},{"slug":"subscapular_skinfold","unit":"mm"},{"slug":"iliac_crest_skinfold","unit":"mm"}]'::jsonb,
    'Densidad corporal',
    'g/ml',
    null,
    null,
    'No habilitada hasta revisar tablas de coeficientes contra fuente primaria y validacion de poblacion.',
    'Fuente primaria localizada; implementacion pendiente de transcripcion verificada.',
    'NEEDS_MANUAL_VALIDATION',
    false,
    current_date,
    'Nutri-Oli technical review'
  ),
  (
    'lee_2000_skeletal_muscle_mass',
    'Masa muscular esqueletica total',
    'R. C. Lee et al.',
    2000,
    'Total-body skeletal muscle mass: development and cross-validation of anthropometric prediction models. American Journal of Clinical Nutrition.',
    '10.1093/ajcn/72.3.796',
    'skeletal_muscle_prediction',
    'Adultos sanos no obesos; modelo desarrollado contra MRI.',
    18,
    null,
    'model_specific',
    '[]'::jsonb,
    'Masa muscular esqueletica',
    'kg',
    null,
    null,
    'No habilitada hasta verificar formula, unidades, variables poblacionales y codificacion exacta.',
    'Fuente primaria localizada; implementacion pendiente de revision clinico-tecnica.',
    'NEEDS_MANUAL_VALIDATION',
    false,
    current_date,
    'Nutri-Oli technical review'
  ),
  (
    'poortmans_2005_pediatric_skeletal_muscle_mass',
    'Masa muscular esqueletica pediatrica',
    'J. R. Poortmans et al.',
    2005,
    'Estimation of total-body skeletal muscle mass in children and adolescents. Medicine and Science in Sports and Exercise.',
    '10.1249/01.MSS.0000152804.93039.CE',
    'skeletal_muscle_prediction',
    'Ninos y adolescentes; no aplicable automaticamente a adultos.',
    null,
    18,
    'model_specific',
    '[]'::jsonb,
    'Masa muscular esqueletica',
    'kg',
    null,
    null,
    'Deshabilitada para adultos. Requiere edad, sexo y variables concretas verificadas.',
    'Fuente primaria localizada; uso pediatrico pendiente de validacion clinica.',
    'DISABLED',
    false,
    current_date,
    'Nutri-Oli technical review'
  )
on conflict (slug) do update
set
  reference = excluded.reference,
  doi = excluded.doi,
  population = excluded.population,
  limitations = excluded.limitations,
  implementation_status = excluded.implementation_status,
  enabled = excluded.enabled,
  updated_at = now();
