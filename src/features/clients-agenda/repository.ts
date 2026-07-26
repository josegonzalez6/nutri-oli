import "server-only";

import { addMinutes } from "./time";
import type {
  CreateAppointmentInput,
  CreateAvailabilityInput,
  CreateClientInput,
  CreateServiceInput
} from "./schemas";
import { getDatabaseConfig, getDatabasePool } from "@/server/database";
import type { DatabaseConfig } from "@/server/database";

export type RepositoryResult<T> =
  | { status: "ready"; data: T }
  | { status: "not_configured"; missing: string[] }
  | { status: "error"; message: string };

export type ClientListItem = {
  id: string;
  internalCode: string;
  displayName: string;
  status: string;
  email: string | null;
  objectiveSummary: string | null;
  nextAppointmentAt: string | null;
};

export type AppointmentListItem = {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  modality: string;
  location: string | null;
  administrativeNotes: string | null;
};

export type ServiceListItem = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number | null;
};

export type AvailabilityListItem = {
  id: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  location: string | null;
  online: boolean;
};

export type WorkspaceOverview = {
  clients: ClientListItem[];
  appointments: AppointmentListItem[];
  services: ServiceListItem[];
  availability: AvailabilityListItem[];
};

type ReadyDatabaseConfig = Extract<DatabaseConfig, { status: "ready" }>;

type ClientRow = {
  id: string;
  internal_code: string;
  display_name: string;
  status: string;
  email: string | null;
  objective_summary: string | null;
  next_appointment_at: Date | string | null;
};

type AppointmentRow = {
  id: string;
  client_id: string;
  client_name: string;
  service_name: string | null;
  starts_at: Date | string;
  ends_at: Date | string;
  status: string;
  modality: string;
  location: string | null;
  administrative_notes: string | null;
};

type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
};

type AvailabilityRow = {
  id: string;
  weekday: number;
  starts_at: string;
  ends_at: string;
  location: string | null;
  online: boolean;
};

export async function loadWorkspaceOverview(): Promise<RepositoryResult<WorkspaceOverview>> {
  const config = getDatabaseConfig();

  if (config.status !== "ready") {
    return config;
  }

  try {
    const pool = getDatabasePool(config.databaseUrl);
    const [clients, appointments, services, availability] = await Promise.all([
      pool.query<ClientRow>(
        `select
          c.id,
          c.internal_code,
          c.display_name,
          c.status,
          c.email,
          c.objective_summary,
          min(a.starts_at) filter (where a.status in ('requested', 'confirmed') and a.starts_at >= now()) as next_appointment_at
        from public.clients c
        left join public.appointments a on a.client_id = c.id
        where c.organization_id = $1
        group by c.id
        order by c.updated_at desc
        limit 100`,
        [config.organizationId]
      ),
      pool.query<AppointmentRow>(
        `select
          a.id,
          a.client_id,
          c.display_name as client_name,
          s.name as service_name,
          a.starts_at,
          a.ends_at,
          a.status,
          a.modality,
          a.location,
          a.administrative_notes
        from public.appointments a
        join public.clients c on c.id = a.client_id
        left join public.services s on s.id = a.service_id
        where a.organization_id = $1
        order by a.starts_at asc
        limit 100`,
        [config.organizationId]
      ),
      pool.query<ServiceRow>(
        `select id, name, duration_minutes, price_cents
        from public.services
        where organization_id = $1 and active = true
        order by name asc`,
        [config.organizationId]
      ),
      pool.query<AvailabilityRow>(
        `select id, weekday, starts_at::text, ends_at::text, location, online
        from public.professional_availability
        where organization_id = $1 and professional_profile_id = $2 and active = true
        order by weekday asc, starts_at asc`,
        [config.organizationId, config.professionalProfileId]
      )
    ]);

    return {
      status: "ready",
      data: {
        clients: clients.rows.map(toClient),
        appointments: appointments.rows.map(toAppointment),
        services: services.rows.map(toService),
        availability: availability.rows.map(toAvailability)
      }
    };
  } catch (error) {
    console.error(
      "[clients-agenda] failed to load workspace overview",
      error instanceof Error ? error.message : error
    );

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}

export async function createClient(input: CreateClientInput) {
  const config = requireReadyConfig();
  const pool = getDatabasePool(config.databaseUrl);

  const result = await pool.query<{ id: string }>(
    `insert into public.clients (
      organization_id,
      internal_code,
      display_name,
      status,
      date_of_birth,
      email,
      phone,
      objective_summary,
      created_by
    )
    values ($1, $2, $3, $4, nullif($5, '')::date, nullif($6, ''), nullif($7, ''), nullif($8, ''), $9)
    returning id`,
    [
      config.organizationId,
      input.internalCode,
      input.displayName,
      input.status,
      input.dateOfBirth ?? "",
      input.email ?? "",
      input.phone ?? "",
      input.objectiveSummary ?? "",
      config.profileId
    ]
  );

  await recordAudit(pool, config, "client_changed", "clients", result.rows[0]?.id ?? null, {
    action: "created",
    status: input.status
  });
}

export async function updateClientStatus(clientId: string, status: string) {
  const config = requireReadyConfig();
  const pool = getDatabasePool(config.databaseUrl);

  const result = await pool.query<{ id: string; status: string }>(
    `update public.clients
    set status = $1, updated_at = now()
    where id = $2 and organization_id = $3
    returning id, status`,
    [status, clientId, config.organizationId]
  );

  if (result.rowCount === 0) {
    throw new Error("Client not found.");
  }

  await recordAudit(pool, config, "client_changed", "clients", clientId, {
    action: "status_updated",
    status
  });
}

export async function createService(input: CreateServiceInput) {
  const config = requireReadyConfig();
  const pool = getDatabasePool(config.databaseUrl);
  const priceCents =
    input.priceEuros === undefined ? null : Math.round(Number(input.priceEuros) * 100);

  const result = await pool.query<{ id: string }>(
    `insert into public.services (organization_id, name, duration_minutes, price_cents)
    values ($1, $2, $3, $4)
    returning id`,
    [config.organizationId, input.name, input.durationMinutes, priceCents]
  );

  await recordAudit(pool, config, "organization_changed", "services", result.rows[0]?.id ?? null, {
    action: "created",
    durationMinutes: input.durationMinutes
  });
}

export async function createAvailability(input: CreateAvailabilityInput) {
  const config = requireReadyConfig();
  const pool = getDatabasePool(config.databaseUrl);

  const result = await pool.query<{ id: string }>(
    `insert into public.professional_availability (
      organization_id,
      professional_profile_id,
      weekday,
      starts_at,
      ends_at,
      location,
      online
    )
    values ($1, $2, $3, $4::time, $5::time, nullif($6, ''), $7)
    returning id`,
    [
      config.organizationId,
      config.professionalProfileId,
      input.weekday,
      input.startsAt,
      input.endsAt,
      input.location ?? "",
      input.online
    ]
  );

  await recordAudit(
    pool,
    config,
    "organization_changed",
    "professional_availability",
    result.rows[0]?.id ?? null,
    {
      action: "created",
      weekday: input.weekday
    }
  );
}

export async function createAppointment(input: CreateAppointmentInput) {
  const config = requireReadyConfig();
  const pool = getDatabasePool(config.databaseUrl);
  const service = await pool.query<ServiceRow>(
    `select id, duration_minutes, name, price_cents
    from public.services
    where id = $1 and organization_id = $2 and active = true`,
    [input.serviceId, config.organizationId]
  );
  const duration = service.rows[0]?.duration_minutes;

  if (!duration) {
    throw new Error("Service not found.");
  }

  const endsAt = addMinutes(input.startsAt, duration);
  const availability = await pool.query<{ available: boolean; blocked: boolean }>(
    `select
      exists (
        select 1
        from public.professional_availability pa
        where pa.organization_id = $1
          and pa.professional_profile_id = $2
          and pa.active = true
          and pa.weekday = extract(isodow from ($3::timestamptz at time zone 'Europe/Madrid'))::integer
          and pa.starts_at <= (($3::timestamptz at time zone 'Europe/Madrid')::time)
          and pa.ends_at >= (($4::timestamptz at time zone 'Europe/Madrid')::time)
      ) as available,
      exists (
        select 1
        from public.availability_exceptions ae
        where ae.organization_id = $1
          and ae.professional_profile_id = $2
          and tstzrange(ae.starts_at, ae.ends_at, '[)') && tstzrange($3::timestamptz, $4::timestamptz, '[)')
      ) as blocked`,
    [config.organizationId, config.professionalProfileId, input.startsAt, endsAt]
  );

  if (!availability.rows[0]?.available || availability.rows[0]?.blocked) {
    throw new Error("Professional is not available.");
  }

  const result = await pool.query<{ id: string }>(
    `insert into public.appointments (
      organization_id,
      client_id,
      professional_profile_id,
      service_id,
      starts_at,
      ends_at,
      status,
      modality,
      location,
      meeting_url,
      administrative_notes,
      created_by
    )
    values ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7, $8, nullif($9, ''), nullif($10, ''), nullif($11, ''), $12)
    returning id`,
    [
      config.organizationId,
      input.clientId,
      config.professionalProfileId,
      input.serviceId,
      input.startsAt,
      endsAt,
      input.status,
      input.modality,
      input.location ?? "",
      input.meetingUrl ?? "",
      input.administrativeNotes ?? "",
      config.profileId
    ]
  );

  await recordAudit(
    pool,
    config,
    "appointment_changed",
    "appointments",
    result.rows[0]?.id ?? null,
    {
      action: "created",
      status: input.status
    }
  );
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const config = requireReadyConfig();
  const pool = getDatabasePool(config.databaseUrl);

  const result = await pool.query<{ id: string }>(
    `update public.appointments
    set status = $1, updated_at = now()
    where id = $2 and organization_id = $3
    returning id`,
    [status, appointmentId, config.organizationId]
  );

  if (result.rowCount === 0) {
    throw new Error("Appointment not found.");
  }

  await recordAudit(pool, config, "appointment_changed", "appointments", appointmentId, {
    action: "status_updated",
    status
  });
}

function requireReadyConfig() {
  const config = getDatabaseConfig();

  if (config.status !== "ready") {
    throw new Error(`Database is not configured: ${config.missing.join(", ")}`);
  }

  return config;
}

function toClient(row: ClientRow): ClientListItem {
  return {
    id: row.id,
    internalCode: row.internal_code,
    displayName: row.display_name,
    status: row.status,
    email: row.email,
    objectiveSummary: row.objective_summary,
    nextAppointmentAt: toIso(row.next_appointment_at)
  };
}

function toAppointment(row: AppointmentRow): AppointmentListItem {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    serviceName: row.service_name,
    startsAt: toIso(row.starts_at) ?? "",
    endsAt: toIso(row.ends_at) ?? "",
    status: row.status,
    modality: row.modality,
    location: row.location,
    administrativeNotes: row.administrative_notes
  };
}

function toService(row: ServiceRow): ServiceListItem {
  return {
    id: row.id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents
  };
}

function toAvailability(row: AvailabilityRow): AvailabilityListItem {
  return {
    id: row.id,
    weekday: row.weekday,
    startsAt: row.starts_at.slice(0, 5),
    endsAt: row.ends_at.slice(0, 5),
    location: row.location,
    online: row.online
  };
}

function toIso(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function recordAudit(
  pool: ReturnType<typeof getDatabasePool>,
  config: ReadyDatabaseConfig,
  eventType: "client_changed" | "appointment_changed" | "organization_changed",
  targetTable: string,
  targetId: string | null,
  metadata: Record<string, unknown>
) {
  await pool.query(
    `insert into public.audit_events (
      organization_id,
      actor_profile_id,
      event_type,
      target_table,
      target_id,
      metadata
    )
    values ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      config.organizationId,
      config.profileId,
      eventType,
      targetTable,
      targetId,
      JSON.stringify(metadata)
    ]
  );
}
