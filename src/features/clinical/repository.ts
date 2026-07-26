import "server-only";

import type { PoolClient } from "pg";

import type { AnthropometryInput, ConsultationInput, IntakeInput } from "./schemas";
import type { RepositoryResult } from "@/features/clients-agenda/repository";
import { withProfessionalTransaction } from "@/server/professional-context";
import type { ProfessionalContext } from "@/server/professional-context";

type ReadyProfessionalContext = Extract<ProfessionalContext, { status: "ready" }>;

export type ClinicalClient = {
  id: string;
  internalCode: string;
  displayName: string;
  status: string;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  objectiveSummary: string | null;
  professionalName: string | null;
  lastVisitAt: string | null;
  nextAppointmentAt: string | null;
};

export type IntakeResponse = {
  id: string;
  status: string;
  responses: Record<string, IntakeValue>;
  updatedAt: string;
};

export type IntakeValue = {
  value: string;
  kind: "declared" | "professional_note";
};

export type ConsultationRecord = {
  id: string;
  consultationType: string;
  status: string;
  startedAt: string;
  finalizedAt: string | null;
  reason: string | null;
  evolution: string | null;
  adherence: string | null;
  difficulties: string | null;
  symptoms: string | null;
  objectives: string | null;
  intervention: string | null;
  recommendations: string | null;
  tasks: string | null;
  nextReviewAt: string | null;
  privateNote: string | null;
  sharedSummary: string | null;
  assessment: string | null;
  nutritionDiagnosis: string | null;
  interventionPlan: string | null;
  monitoringPlan: string | null;
  pesStatement: string | null;
};

export type AnthropometrySession = {
  id: string;
  status: string;
  measuredAt: string;
  protocol: string;
  conditions: string | null;
  instrument: string | null;
  massKg: number | null;
  heightCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  tricepsMm: number | null;
  subscapularMm: number | null;
  abdominalMm: number | null;
  thighMm: number | null;
  bmi: number | null;
  waistToHeightRatio: number | null;
  skinfoldSumMm: number | null;
  observations: string | null;
};

export type ClientTimelineItem = {
  id: string;
  kind: "appointment" | "consultation" | "anthropometry" | "intake";
  happenedAt: string;
  title: string;
  detail: string | null;
};

export type ClinicalWorkspace = {
  context: {
    organizationName: string;
    role: ReadyProfessionalContext["role"];
    source: ReadyProfessionalContext["source"];
  };
  client: ClinicalClient;
  intake: IntakeResponse | null;
  consultations: ConsultationRecord[];
  anthropometry: AnthropometrySession[];
  timeline: ClientTimelineItem[];
};

type ClientRow = {
  id: string;
  internal_code: string;
  display_name: string;
  status: string;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  objective_summary: string | null;
  professional_name: string | null;
  last_visit_at: Date | string | null;
  next_appointment_at: Date | string | null;
};

type IntakeRow = {
  id: string;
  status: string;
  responses: Record<string, IntakeValue>;
  updated_at: Date | string;
};

type ConsultationRow = {
  id: string;
  consultation_type: string;
  status: string;
  started_at: Date | string;
  finalized_at: Date | string | null;
  reason: string | null;
  evolution: string | null;
  adherence: string | null;
  difficulties: string | null;
  symptoms: string | null;
  objectives: string | null;
  intervention: string | null;
  recommendations: string | null;
  tasks: string | null;
  next_review_at: Date | string | null;
  private_note: string | null;
  shared_summary: string | null;
  assessment: string | null;
  nutrition_diagnosis: string | null;
  intervention_plan: string | null;
  monitoring_plan: string | null;
  pes_statement: string | null;
};

type AnthropometryRow = {
  id: string;
  status: string;
  measured_at: Date | string;
  protocol: string;
  conditions: string | null;
  instrument: string | null;
  mass_kg: string | number | null;
  height_cm: string | number | null;
  waist_cm: string | number | null;
  hip_cm: string | number | null;
  triceps_mm: string | number | null;
  subscapular_mm: string | number | null;
  abdominal_mm: string | number | null;
  thigh_mm: string | number | null;
  bmi: string | number | null;
  waist_to_height_ratio: string | number | null;
  skinfold_sum_mm: string | number | null;
  observations: string | null;
};

type TimelineRow = {
  id: string;
  kind: ClientTimelineItem["kind"];
  happened_at: Date | string;
  title: string;
  detail: string | null;
};

export async function loadClinicalWorkspace(
  clientId: string
): Promise<RepositoryResult<ClinicalWorkspace>> {
  try {
    const result = await withProfessionalTransaction(async (client, context) => {
      const clientResult = await client.query<ClientRow>(
        `select
          c.id,
          c.internal_code,
          c.display_name,
          c.status,
          c.date_of_birth::text,
          c.email,
          c.phone,
          c.objective_summary,
          pp.public_display_name as professional_name,
          max(con.finalized_at) as last_visit_at,
          min(a.starts_at) filter (where a.status in ('requested', 'confirmed') and a.starts_at >= now()) as next_appointment_at
        from public.clients c
        left join public.client_assignments ca on ca.client_id = c.id and ca.organization_id = c.organization_id
        left join public.professional_profiles pp on pp.id = ca.professional_profile_id
        left join public.consultations con on con.client_id = c.id and con.status = 'finalized'
        left join public.appointments a on a.client_id = c.id
        where c.organization_id = $1 and c.id = $2
        group by c.id, pp.public_display_name`,
        [context.organizationId, clientId]
      );
      const clientRow = clientResult.rows[0];

      if (!clientRow) {
        throw new Error("Client not found or permission denied.");
      }

      const intake = await client.query<IntakeRow>(
        `select id, status, responses, updated_at
        from public.clinical_intake_responses
        where organization_id = $1 and client_id = $2
        order by updated_at desc
        limit 1`,
        [context.organizationId, clientId]
      );
      const consultations = await client.query<ConsultationRow>(
        `select *
        from public.consultations
        where organization_id = $1 and client_id = $2
        order by started_at desc
        limit 20`,
        [context.organizationId, clientId]
      );
      const anthropometry = await client.query<AnthropometryRow>(
        `select *
        from public.anthropometry_sessions
        where organization_id = $1 and client_id = $2
        order by measured_at desc
        limit 20`,
        [context.organizationId, clientId]
      );
      const timeline = await client.query<TimelineRow>(
        `select id, kind, happened_at, title, detail
        from (
          select id, 'appointment'::text as kind, starts_at as happened_at, 'Cita' as title, status::text as detail
          from public.appointments
          where organization_id = $1 and client_id = $2
          union all
          select id, 'consultation'::text as kind, started_at as happened_at, 'Consulta' as title, status::text as detail
          from public.consultations
          where organization_id = $1 and client_id = $2
          union all
          select id, 'anthropometry'::text as kind, measured_at as happened_at, 'Antropometria' as title, bmi::text as detail
          from public.anthropometry_sessions
          where organization_id = $1 and client_id = $2
          union all
          select id, 'intake'::text as kind, updated_at as happened_at, 'Anamnesis' as title, status::text as detail
          from public.clinical_intake_responses
          where organization_id = $1 and client_id = $2
        ) items
        order by happened_at desc
        limit 30`,
        [context.organizationId, clientId]
      );

      return {
        status: "ready" as const,
        data: {
          context: {
            organizationName: context.organizationName,
            role: context.role,
            source: context.source
          },
          client: toClient(clientRow),
          intake: intake.rows[0] ? toIntake(intake.rows[0]) : null,
          consultations: consultations.rows.map(toConsultation),
          anthropometry: anthropometry.rows.map(toAnthropometry),
          timeline: timeline.rows.map(toTimeline)
        }
      };
    });

    return result.status === "ready" ? result : toRepositoryResult(result);
  } catch (error) {
    console.error(
      "[clinical] failed to load workspace",
      error instanceof Error ? error.message : error
    );
    return { status: "error", message: "Clinical workspace could not be loaded." };
  }
}

export async function saveIntake(input: IntakeInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const responses = buildIntakeResponses(input);
    const existing = await client.query<{ id: string }>(
      `select id
      from public.clinical_intake_responses
      where organization_id = $1 and client_id = $2 and status = 'draft'
      order by updated_at desc
      limit 1`,
      [context.organizationId, input.clientId]
    );
    const existingId = existing.rows[0]?.id;

    if (existingId) {
      await client.query(
        `update public.clinical_intake_responses
        set responses = $1::jsonb, updated_at = now()
        where id = $2 and organization_id = $3`,
        [JSON.stringify(responses), existingId, context.organizationId]
      );
      await recordClinicalAudit(client, context, "clinical_intake_responses", existingId, {
        action: "draft_updated"
      });
      return;
    }

    const result = await client.query<{ id: string }>(
      `insert into public.clinical_intake_responses (
        organization_id,
        client_id,
        status,
        responses,
        created_by
      )
      values ($1, $2, 'draft', $3::jsonb, $4)
      returning id`,
      [context.organizationId, input.clientId, JSON.stringify(responses), context.profileId]
    );
    await recordClinicalAudit(
      client,
      context,
      "clinical_intake_responses",
      result.rows[0]?.id ?? null,
      {
        action: "draft_created"
      }
    );
  });

  assertReadyOutcome(outcome);
}

export async function saveConsultation(input: ConsultationInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const status = input.mode === "finalize" ? "finalized" : "draft";
    const finalizedAt = input.mode === "finalize" ? new Date().toISOString() : "";
    const finalizedBy = input.mode === "finalize" ? context.profileId : "";

    if (input.consultationId) {
      const result = await client.query<{ id: string }>(
        `update public.consultations
        set
          consultation_type = $1,
          status = $2,
          finalized_at = nullif($3, '')::timestamptz,
          finalized_by = nullif($4, '')::uuid,
          reason = nullif($5, ''),
          evolution = nullif($6, ''),
          adherence = nullif($7, ''),
          difficulties = nullif($8, ''),
          symptoms = nullif($9, ''),
          objectives = nullif($10, ''),
          intervention = nullif($11, ''),
          recommendations = nullif($12, ''),
          tasks = nullif($13, ''),
          next_review_at = nullif($14, '')::timestamptz,
          private_note = nullif($15, ''),
          shared_summary = nullif($16, ''),
          assessment = nullif($17, ''),
          nutrition_diagnosis = nullif($18, ''),
          intervention_plan = nullif($19, ''),
          monitoring_plan = nullif($20, ''),
          pes_statement = nullif($21, ''),
          updated_at = now()
        where id = $22 and organization_id = $23 and client_id = $24 and status = 'draft'
        returning id`,
        consultationParams(input, context, status, finalizedAt, finalizedBy, input.consultationId)
      );

      if (result.rowCount === 0) {
        throw new Error("Consultation cannot be updated.");
      }

      await recordClinicalAudit(client, context, "consultations", input.consultationId, {
        action: status === "finalized" ? "finalized" : "draft_updated"
      });
      return;
    }

    const result = await client.query<{ id: string }>(
      `insert into public.consultations (
        organization_id,
        client_id,
        professional_profile_id,
        consultation_type,
        status,
        finalized_at,
        finalized_by,
        reason,
        evolution,
        adherence,
        difficulties,
        symptoms,
        objectives,
        intervention,
        recommendations,
        tasks,
        next_review_at,
        private_note,
        shared_summary,
        assessment,
        nutrition_diagnosis,
        intervention_plan,
        monitoring_plan,
        pes_statement,
        created_by
      )
      values (
        $1, $2, $3, $4, $5, nullif($6, '')::timestamptz, nullif($7, '')::uuid,
        nullif($8, ''), nullif($9, ''), nullif($10, ''), nullif($11, ''), nullif($12, ''),
        nullif($13, ''), nullif($14, ''), nullif($15, ''), nullif($16, ''),
        nullif($17, '')::timestamptz, nullif($18, ''), nullif($19, ''), nullif($20, ''),
        nullif($21, ''), nullif($22, ''), nullif($23, ''), nullif($24, ''), $25
      )
      returning id`,
      [
        context.organizationId,
        input.clientId,
        context.professionalProfileId,
        input.consultationType,
        status,
        finalizedAt,
        finalizedBy,
        input.reason ?? "",
        input.evolution ?? "",
        input.adherence ?? "",
        input.difficulties ?? "",
        input.symptoms ?? "",
        input.objectives ?? "",
        input.intervention ?? "",
        input.recommendations ?? "",
        input.tasks ?? "",
        input.nextReviewAt ?? "",
        input.privateNote ?? "",
        input.sharedSummary ?? "",
        input.assessment ?? "",
        input.nutritionDiagnosis ?? "",
        input.interventionPlan ?? "",
        input.monitoringPlan ?? "",
        input.pesStatement ?? "",
        context.profileId
      ]
    );
    await recordClinicalAudit(client, context, "consultations", result.rows[0]?.id ?? null, {
      action: status === "finalized" ? "finalized" : "draft_created"
    });
  });

  assertReadyOutcome(outcome);
}

export async function saveAnthropometry(input: AnthropometryInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const visibility = {
      clientCanViewWeight: input.clientCanViewWeight,
      clientCanViewBmi: input.clientCanViewBmi,
      clientCanViewWaist: input.clientCanViewWaist
    };
    const result = await client.query<{ id: string }>(
      `insert into public.anthropometry_sessions (
        organization_id,
        client_id,
        professional_profile_id,
        consultation_id,
        measured_at,
        protocol,
        conditions,
        instrument,
        calibration_notes,
        mass_kg,
        height_cm,
        sitting_height_cm,
        wingspan_cm,
        waist_cm,
        hip_cm,
        triceps_mm,
        subscapular_mm,
        abdominal_mm,
        thigh_mm,
        visibility,
        observations,
        created_by
      )
      values (
        $1, $2, $3, nullif($4, '')::uuid, coalesce(nullif($5, '')::timestamptz, now()), $6,
        nullif($7, ''), nullif($8, ''), nullif($9, ''),
        $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20::jsonb, nullif($21, ''), $22
      )
      returning id`,
      [
        context.organizationId,
        input.clientId,
        context.professionalProfileId,
        input.consultationId ?? "",
        input.measuredAt ?? "",
        input.protocol,
        input.conditions ?? "",
        input.instrument ?? "",
        input.calibrationNotes ?? "",
        toNullableNumber(input.massKg),
        toNullableNumber(input.heightCm),
        toNullableNumber(input.sittingHeightCm),
        toNullableNumber(input.wingspanCm),
        toNullableNumber(input.waistCm),
        toNullableNumber(input.hipCm),
        toNullableNumber(input.tricepsMm),
        toNullableNumber(input.subscapularMm),
        toNullableNumber(input.abdominalMm),
        toNullableNumber(input.thighMm),
        JSON.stringify(visibility),
        input.observations ?? "",
        context.profileId
      ]
    );

    await recordClinicalAudit(
      client,
      context,
      "anthropometry_sessions",
      result.rows[0]?.id ?? null,
      {
        action: "created",
        hasBmi: Boolean(input.massKg && input.heightCm)
      }
    );
  });

  assertReadyOutcome(outcome);
}

function consultationParams(
  input: ConsultationInput,
  context: ReadyProfessionalContext,
  status: "draft" | "finalized",
  finalizedAt: string,
  finalizedBy: string,
  consultationId: string
) {
  return [
    input.consultationType,
    status,
    finalizedAt,
    finalizedBy,
    input.reason ?? "",
    input.evolution ?? "",
    input.adherence ?? "",
    input.difficulties ?? "",
    input.symptoms ?? "",
    input.objectives ?? "",
    input.intervention ?? "",
    input.recommendations ?? "",
    input.tasks ?? "",
    input.nextReviewAt ?? "",
    input.privateNote ?? "",
    input.sharedSummary ?? "",
    input.assessment ?? "",
    input.nutritionDiagnosis ?? "",
    input.interventionPlan ?? "",
    input.monitoringPlan ?? "",
    input.pesStatement ?? "",
    consultationId,
    context.organizationId,
    input.clientId
  ];
}

function buildIntakeResponses(input: IntakeInput): Record<string, IntakeValue> {
  const values = Object.fromEntries(
    Object.entries(input).filter(([key]) => key !== "clientId")
  ) as Record<string, string | undefined>;
  const responses: Record<string, IntakeValue> = {};

  Object.entries(values).forEach(([key, value]) => {
    responses[key] = {
      value: typeof value === "string" ? value : "",
      kind: key === "professionalNote" ? "professional_note" : "declared"
    };
  });

  return responses;
}

function toRepositoryResult<T>(
  result: Exclude<ProfessionalContext, { status: "ready" }>
): RepositoryResult<T> {
  if (result.status === "not_configured") {
    return result;
  }

  if (result.status === "auth_required") {
    return { status: "error", message: "Authentication required." };
  }

  return { status: "error", message: "Permission denied." };
}

function assertReadyOutcome(outcome: unknown) {
  const blockedOutcome =
    typeof outcome === "object" &&
    outcome !== null &&
    "status" in outcome &&
    outcome.status !== "ready"
      ? (outcome as Exclude<ProfessionalContext, { status: "ready" }>)
      : null;

  if (blockedOutcome) {
    if (blockedOutcome.status === "not_configured") {
      throw new Error(`Database is not configured: ${blockedOutcome.missing.join(", ")}`);
    }

    if (blockedOutcome.status === "auth_required") {
      throw new Error("Authentication required.");
    }

    throw new Error("Permission denied.");
  }
}

async function recordClinicalAudit(
  client: PoolClient,
  context: ReadyProfessionalContext,
  targetTable: string,
  targetId: string | null,
  metadata: Record<string, unknown>
) {
  await client.query(
    `insert into public.audit_events (
      organization_id,
      actor_profile_id,
      event_type,
      target_table,
      target_id,
      metadata
    )
    values ($1, $2, 'client_changed', $3, $4, $5::jsonb)`,
    [context.organizationId, context.profileId, targetTable, targetId, JSON.stringify(metadata)]
  );
}

function toClient(row: ClientRow): ClinicalClient {
  return {
    id: row.id,
    internalCode: row.internal_code,
    displayName: row.display_name,
    status: row.status,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    phone: row.phone,
    objectiveSummary: row.objective_summary,
    professionalName: row.professional_name,
    lastVisitAt: toIso(row.last_visit_at),
    nextAppointmentAt: toIso(row.next_appointment_at)
  };
}

function toIntake(row: IntakeRow): IntakeResponse {
  return {
    id: row.id,
    status: row.status,
    responses: row.responses,
    updatedAt: toIso(row.updated_at) ?? ""
  };
}

function toConsultation(row: ConsultationRow): ConsultationRecord {
  return {
    id: row.id,
    consultationType: row.consultation_type,
    status: row.status,
    startedAt: toIso(row.started_at) ?? "",
    finalizedAt: toIso(row.finalized_at),
    reason: row.reason,
    evolution: row.evolution,
    adherence: row.adherence,
    difficulties: row.difficulties,
    symptoms: row.symptoms,
    objectives: row.objectives,
    intervention: row.intervention,
    recommendations: row.recommendations,
    tasks: row.tasks,
    nextReviewAt: toIso(row.next_review_at),
    privateNote: row.private_note,
    sharedSummary: row.shared_summary,
    assessment: row.assessment,
    nutritionDiagnosis: row.nutrition_diagnosis,
    interventionPlan: row.intervention_plan,
    monitoringPlan: row.monitoring_plan,
    pesStatement: row.pes_statement
  };
}

function toAnthropometry(row: AnthropometryRow): AnthropometrySession {
  return {
    id: row.id,
    status: row.status,
    measuredAt: toIso(row.measured_at) ?? "",
    protocol: row.protocol,
    conditions: row.conditions,
    instrument: row.instrument,
    massKg: toNumber(row.mass_kg),
    heightCm: toNumber(row.height_cm),
    waistCm: toNumber(row.waist_cm),
    hipCm: toNumber(row.hip_cm),
    tricepsMm: toNumber(row.triceps_mm),
    subscapularMm: toNumber(row.subscapular_mm),
    abdominalMm: toNumber(row.abdominal_mm),
    thighMm: toNumber(row.thigh_mm),
    bmi: toNumber(row.bmi),
    waistToHeightRatio: toNumber(row.waist_to_height_ratio),
    skinfoldSumMm: toNumber(row.skinfold_sum_mm),
    observations: row.observations
  };
}

function toTimeline(row: TimelineRow): ClientTimelineItem {
  return {
    id: row.id,
    kind: row.kind,
    happenedAt: toIso(row.happened_at) ?? "",
    title: row.title,
    detail: row.detail
  };
}

function toIso(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNumber(value: string | number | null): number | null {
  return value === null ? null : Number(value);
}

function toNullableNumber(value: unknown): number | null {
  return value === "" || value === undefined || value === null ? null : Number(value);
}
