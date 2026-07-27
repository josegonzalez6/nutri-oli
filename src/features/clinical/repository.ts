import "server-only";

import type { PoolClient } from "pg";

import {
  ANTHROPOMETRY_DEFINITION_BY_SLUG,
  ANTHROPOMETRY_MEASUREMENT_DEFINITIONS,
  evaluateMeasurement
} from "@/features/anthropometry/measurement-engine";
import type { MeasurementStatus } from "@/features/anthropometry/measurement-engine";

import type {
  AnthropometryInput,
  AnthropometryWorkflowInput,
  ConsultationInput,
  IntakeInput
} from "./schemas";
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
  workflowStatus: string;
  measuredAt: string;
  protocol: string;
  protocolId: string | null;
  profileSlug: string | null;
  protocolVersion: string | null;
  conditions: string | null;
  instrument: string | null;
  anthropometristName: string | null;
  center: string | null;
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

export type AnthropometryProtocol = {
  id: string;
  slug: string;
  name: string;
  version: string;
  profileKind: string;
  isakCompatibilityNote: string;
  requiresAccreditationNotice: boolean;
  evidenceStatus: string;
};

export type AnthropometryMeasurementDefinition = {
  id: string;
  slug: string;
  name: string;
  abbreviation: string;
  category: string;
  unit: string;
  precisionDigits: number;
  plausibleMin: number;
  plausibleMax: number;
  toleranceRelativePercent: number;
  helpTitle: string;
  helpSummary: string;
  helpPosition: string;
  helpLandmark: string;
  helpTechnique: string;
  helpCommonErrors: string[];
  helpInstrument: string;
  helpSource: string;
  helpProtocolVersion: string;
  evidenceStatus: string;
  sortOrder: number;
};

export type AnthropometrySessionMeasurement = {
  id: string;
  sessionId: string;
  slug: string;
  name: string;
  abbreviation: string;
  category: string;
  unit: string;
  firstValue: number | null;
  secondValue: number | null;
  thirdValue: number | null;
  absoluteDiff: number | null;
  relativeDiffPercent: number | null;
  toleranceRelativePercent: number;
  finalValue: number | null;
  status: MeasurementStatus;
  plausibleWarning: string | null;
  observations: string | null;
};

export type AnthropometryReportRecord = {
  id: string;
  kind: "professional_internal" | "client_shared";
  status: "generated" | "published" | "revoked";
  version: number;
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
  anthropometryProtocols: AnthropometryProtocol[];
  anthropometryDefinitions: AnthropometryMeasurementDefinition[];
  anthropometryMeasurements: AnthropometrySessionMeasurement[];
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
  workflow_status: string;
  measured_at: Date | string;
  protocol: string;
  protocol_id: string | null;
  profile_slug: string | null;
  protocol_version: string | null;
  conditions: string | null;
  instrument: string | null;
  anthropometrist_name: string | null;
  center: string | null;
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

type AnthropometryProtocolRow = {
  id: string;
  slug: string;
  name: string;
  version: string;
  profile_kind: string;
  isak_compatibility_note: string;
  requires_accreditation_notice: boolean;
  evidence_status: string;
};

type AnthropometryDefinitionRow = {
  id: string;
  slug: string;
  name: string;
  abbreviation: string;
  category: string;
  unit: string;
  precision_digits: number;
  plausible_min: string | number;
  plausible_max: string | number;
  tolerance_relative_percent: string | number;
  help_title: string;
  help_summary: string;
  help_position: string;
  help_landmark: string;
  help_technique: string;
  help_common_errors: string[];
  help_instrument: string;
  help_source: string;
  help_protocol_version: string;
  evidence_status: string;
  sort_order: number;
};

type AnthropometryMeasurementRow = {
  id: string;
  session_id: string;
  slug: string;
  name: string;
  abbreviation: string;
  category: string;
  unit: string;
  first_value: string | number | null;
  second_value: string | number | null;
  third_value: string | number | null;
  absolute_diff: string | number | null;
  relative_diff_percent: string | number | null;
  tolerance_relative_percent: string | number;
  final_value: string | number | null;
  status: MeasurementStatus;
  plausible_warning: string | null;
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
      const protocols = await client.query<AnthropometryProtocolRow>(
        `select
          id,
          slug,
          name,
          version,
          profile_kind,
          isak_compatibility_note,
          requires_accreditation_notice,
          evidence_status
        from public.anthropometry_protocols
        where organization_id is null or organization_id = $1
        order by organization_id nulls first, name`,
        [context.organizationId]
      );
      const defaultProtocol =
        protocols.rows.find((row) => row.slug === "compatible_isak_restricted_v0") ??
        protocols.rows[0];
      const selectedProtocolId = anthropometry.rows[0]?.protocol_id ?? defaultProtocol?.id ?? null;
      const definitions = await client.query<AnthropometryDefinitionRow>(
        `select
          d.id,
          d.slug,
          d.name,
          d.abbreviation,
          d.category,
          d.unit,
          d.precision_digits,
          d.plausible_min,
          d.plausible_max,
          pm.tolerance_relative_percent,
          d.help_title,
          d.help_summary,
          d.help_position,
          d.help_landmark,
          d.help_technique,
          d.help_common_errors,
          d.help_instrument,
          d.help_source,
          d.help_protocol_version,
          d.evidence_status,
          pm.sort_order
        from public.anthropometry_protocol_measurements pm
        join public.anthropometry_measurement_definitions d on d.id = pm.measurement_definition_id
        where pm.protocol_id = $1
        order by pm.sort_order`,
        [selectedProtocolId]
      );
      const anthropometrySessionIds = anthropometry.rows.map((row) => row.id);
      const measurements =
        anthropometrySessionIds.length > 0
          ? await client.query<AnthropometryMeasurementRow>(
              `select
                sm.id,
                sm.session_id,
                d.slug,
                d.name,
                d.abbreviation,
                sm.category,
                sm.unit,
                sm.first_value,
                sm.second_value,
                sm.third_value,
                sm.absolute_diff,
                sm.relative_diff_percent,
                sm.tolerance_relative_percent,
                sm.final_value,
                sm.status,
                sm.plausible_warning,
                sm.observations
              from public.anthropometry_session_measurements sm
              join public.anthropometry_measurement_definitions d on d.id = sm.measurement_definition_id
              where sm.organization_id = $1
                and sm.session_id = any($2::uuid[])
              order by sm.session_id, d.sort_order`,
              [context.organizationId, anthropometrySessionIds]
            )
          : { rows: [] };
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
          anthropometryProtocols: protocols.rows.map(toAnthropometryProtocol),
          anthropometryDefinitions: definitions.rows.map(toAnthropometryDefinition),
          anthropometryMeasurements: measurements.rows.map(toAnthropometryMeasurement),
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

export async function saveAnthropometryWorkflow(input: AnthropometryWorkflowInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const protocol = await loadProtocolForWorkflow(client, context, input.protocolSlug);
    const definitions = await loadDefinitionsForProtocol(client, protocol.id);
    const evaluated = definitions.map((definition) => {
      const measurement = input.measurements[definition.slug];
      const engineDefinition =
        ANTHROPOMETRY_DEFINITION_BY_SLUG.get(definition.slug) ??
        ANTHROPOMETRY_MEASUREMENT_DEFINITIONS[0];
      const evaluation = evaluateMeasurement({
        definition: {
          ...engineDefinition,
          plausibleMin: definition.plausibleMin,
          plausibleMax: definition.plausibleMax,
          precisionDigits: definition.precisionDigits,
          toleranceRelativePercent: definition.toleranceRelativePercent
        },
        firstValue: measurement?.firstValue,
        secondValue: measurement?.secondValue,
        thirdValue: measurement?.thirdValue
      });

      return {
        definition,
        evaluation,
        observations: typeof measurement?.observations === "string" ? measurement.observations : ""
      };
    });

    if (
      input.mode === "finalize" &&
      evaluated.some(({ evaluation }) => evaluation.status === "third_required")
    ) {
      throw new Error("third measurement required");
    }

    if (
      input.mode === "finalize" &&
      evaluated.some(({ evaluation }) => evaluation.status === "implausible")
    ) {
      throw new Error("implausible anthropometry value");
    }

    if (
      input.mode === "finalize" &&
      evaluated.some(({ evaluation }) => evaluation.finalValue === null)
    ) {
      throw new Error("incomplete anthropometry workflow");
    }

    const summary = buildAnthropometrySummary(evaluated);
    const visibility = {
      clientCanViewWeight: input.clientCanViewWeight,
      clientCanViewBmi: input.clientCanViewBmi,
      clientCanViewWaist: input.clientCanViewWaist
    };
    const sessionId = input.sessionId
      ? await updateAnthropometryWorkflowSession(
          client,
          context,
          input,
          protocol,
          summary,
          visibility,
          "measuring",
          "draft",
          "",
          ""
        )
      : await insertAnthropometryWorkflowSession(
          client,
          context,
          input,
          protocol,
          summary,
          visibility,
          "measuring",
          "draft",
          "",
          ""
        );

    for (const item of evaluated) {
      await upsertAnthropometryMeasurement(client, context, sessionId, item);
    }

    if (input.mode === "finalize") {
      await completeAnthropometryWorkflowSession(client, context, sessionId, input.clientId);
    }

    await recordClinicalAudit(client, context, "anthropometry_sessions", sessionId, {
      action:
        input.mode === "finalize"
          ? "finalized"
          : input.sessionId
            ? "draft_updated"
            : "draft_created",
      protocolSlug: protocol.slug,
      measurementCount: evaluated.length
    });
  });

  assertReadyOutcome(outcome);
}

export async function ensureAnthropometryReportGenerated(
  clientId: string,
  sessionId: string
): Promise<RepositoryResult<AnthropometryReportRecord>> {
  try {
    const result = await withProfessionalTransaction(async (client, context) => {
      const session = await client.query<{ id: string }>(
        `select id
        from public.anthropometry_sessions
        where organization_id = $1
          and client_id = $2
          and id = $3
          and workflow_status in ('completed', 'validated')
        limit 1`,
        [context.organizationId, clientId, sessionId]
      );

      if (!session.rows[0]) {
        throw new Error("Anthropometry report requires a completed session.");
      }

      const report = await client.query<{
        id: string;
        kind: "professional_internal" | "client_shared";
        status: "generated" | "published" | "revoked";
        version: number;
      }>(
        `insert into public.anthropometry_reports (
          organization_id,
          client_id,
          session_id,
          kind,
          status,
          version,
          created_by
        )
        values ($1, $2, $3, 'professional_internal', 'generated', 1, $4)
        on conflict (organization_id, session_id, kind, version) do update
        set
          generated_at = now(),
          updated_at = now()
        returning id, kind, status, version`,
        [context.organizationId, clientId, sessionId, context.profileId]
      );
      const row = report.rows[0];

      if (!row) {
        throw new Error("Anthropometry report could not be recorded.");
      }

      await recordClinicalAudit(client, context, "anthropometry_reports", row.id, {
        action: "generated_for_download",
        clientId,
        sessionId,
        kind: row.kind,
        version: row.version
      });

      return {
        status: "ready" as const,
        data: {
          id: row.id,
          kind: row.kind,
          status: row.status,
          version: row.version
        }
      };
    });

    return result.status === "ready" ? result : toRepositoryResult(result);
  } catch (error) {
    console.error(
      "[clinical] failed to record anthropometry report",
      error instanceof Error ? error.message : error
    );
    return { status: "error", message: "Anthropometry report could not be generated." };
  }
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

type WorkflowProtocol = {
  id: string;
  slug: string;
  name: string;
  version: string;
};

type WorkflowDefinition = {
  id: string;
  slug: string;
  category: string;
  unit: "kg" | "cm" | "mm";
  precisionDigits: number;
  plausibleMin: number;
  plausibleMax: number;
  toleranceRelativePercent: number;
  toleranceAbsolute: number | null;
};

type EvaluatedMeasurement = {
  definition: WorkflowDefinition;
  evaluation: ReturnType<typeof evaluateMeasurement>;
  observations: string;
};

type AnthropometrySummary = {
  massKg: number | null;
  heightCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  tricepsMm: number | null;
  subscapularMm: number | null;
  abdominalMm: number | null;
  thighMm: number | null;
};

async function loadProtocolForWorkflow(
  client: PoolClient,
  context: ReadyProfessionalContext,
  protocolSlug: string
): Promise<WorkflowProtocol> {
  const result = await client.query<WorkflowProtocol>(
    `select id, slug, name, version
    from public.anthropometry_protocols
    where slug = $1
      and active = true
      and (organization_id is null or organization_id = $2)
    order by organization_id nulls first
    limit 1`,
    [protocolSlug, context.organizationId]
  );
  const protocol = result.rows[0];

  if (!protocol) {
    throw new Error("Anthropometry protocol not found.");
  }

  return protocol;
}

async function loadDefinitionsForProtocol(
  client: PoolClient,
  protocolId: string
): Promise<WorkflowDefinition[]> {
  const result = await client.query<{
    id: string;
    slug: string;
    category: string;
    unit: "kg" | "cm" | "mm";
    precision_digits: number;
    plausible_min: string | number;
    plausible_max: string | number;
    tolerance_relative_percent: string | number;
    tolerance_absolute: string | number | null;
  }>(
    `select
      d.id,
      d.slug,
      d.category,
      d.unit,
      d.precision_digits,
      d.plausible_min,
      d.plausible_max,
      pm.tolerance_relative_percent,
      pm.tolerance_absolute
    from public.anthropometry_protocol_measurements pm
    join public.anthropometry_measurement_definitions d on d.id = pm.measurement_definition_id
    where pm.protocol_id = $1
    order by pm.sort_order`,
    [protocolId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    unit: row.unit,
    precisionDigits: row.precision_digits,
    plausibleMin: Number(row.plausible_min),
    plausibleMax: Number(row.plausible_max),
    toleranceRelativePercent: Number(row.tolerance_relative_percent),
    toleranceAbsolute: toNumber(row.tolerance_absolute)
  }));
}

async function insertAnthropometryWorkflowSession(
  client: PoolClient,
  context: ReadyProfessionalContext,
  input: AnthropometryWorkflowInput,
  protocol: WorkflowProtocol,
  summary: AnthropometrySummary,
  visibility: Record<string, boolean>,
  workflowStatus: string,
  status: string,
  finalizedAt: string,
  finalizedBy: string
) {
  const result = await client.query<{ id: string }>(
    `insert into public.anthropometry_sessions (
      organization_id,
      client_id,
      professional_profile_id,
      consultation_id,
      status,
      workflow_status,
      measured_at,
      protocol,
      protocol_id,
      profile_slug,
      protocol_version,
      anthropometrist_name,
      accreditation_level,
      accreditation_number,
      center,
      conditions,
      fasting_state,
      previous_exercise,
      declared_hydration,
      laterality,
      instrument,
      instrument_brand,
      instrument_model,
      instrument_serial_number,
      instrument_precision,
      instrument_calibrated_at,
      calibration_notes,
      mass_kg,
      height_cm,
      waist_cm,
      hip_cm,
      triceps_mm,
      subscapular_mm,
      abdominal_mm,
      thigh_mm,
      visibility,
      observations,
      consent_confirmed,
      finalized_at,
      finalized_by,
      created_by
    )
    values (
      $1, $2, $3, nullif($4, '')::uuid, $5, $6,
      coalesce(nullif($7, '')::timestamptz, now()), $8, $9, $10, $11,
      nullif($12, ''), nullif($13, ''), nullif($14, ''), nullif($15, ''),
      nullif($16, ''), nullif($17, ''), nullif($18, ''), nullif($19, ''), $20,
      nullif($21, ''), nullif($22, ''), nullif($23, ''), nullif($24, ''),
      nullif($25, ''), nullif($26, '')::date, nullif($27, ''),
      $28, $29, $30, $31, $32, $33, $34, $35,
      $36::jsonb, nullif($37, ''), $38,
      nullif($39, '')::timestamptz, nullif($40, '')::uuid, $41
    )
    returning id`,
    [
      context.organizationId,
      input.clientId,
      context.professionalProfileId,
      input.consultationId ?? "",
      status,
      workflowStatus,
      input.measuredAt ?? "",
      protocol.name,
      protocol.id,
      input.protocolSlug,
      protocol.version,
      input.anthropometristName ?? "",
      input.accreditationLevel ?? "",
      input.accreditationNumber ?? "",
      input.center ?? "",
      input.conditions ?? "",
      input.fastingState ?? "",
      input.previousExercise ?? "",
      input.declaredHydration ?? "",
      input.laterality,
      input.instrument ?? "",
      input.instrumentBrand ?? "",
      input.instrumentModel ?? "",
      input.instrumentSerialNumber ?? "",
      input.instrumentPrecision ?? "",
      input.instrumentCalibratedAt ?? "",
      input.calibrationNotes ?? "",
      summary.massKg,
      summary.heightCm,
      summary.waistCm,
      summary.hipCm,
      summary.tricepsMm,
      summary.subscapularMm,
      summary.abdominalMm,
      summary.thighMm,
      JSON.stringify(visibility),
      input.observations ?? "",
      input.consentConfirmed,
      finalizedAt,
      finalizedBy,
      context.profileId
    ]
  );

  return result.rows[0]?.id ?? "";
}

async function updateAnthropometryWorkflowSession(
  client: PoolClient,
  context: ReadyProfessionalContext,
  input: AnthropometryWorkflowInput,
  protocol: WorkflowProtocol,
  summary: AnthropometrySummary,
  visibility: Record<string, boolean>,
  workflowStatus: string,
  status: string,
  finalizedAt: string,
  finalizedBy: string
) {
  const result = await client.query<{ id: string }>(
    `update public.anthropometry_sessions
    set
      status = $1,
      workflow_status = $2,
      measured_at = coalesce(nullif($3, '')::timestamptz, measured_at),
      protocol = $4,
      protocol_id = $5,
      profile_slug = $6,
      protocol_version = $7,
      anthropometrist_name = nullif($8, ''),
      accreditation_level = nullif($9, ''),
      accreditation_number = nullif($10, ''),
      center = nullif($11, ''),
      conditions = nullif($12, ''),
      fasting_state = nullif($13, ''),
      previous_exercise = nullif($14, ''),
      declared_hydration = nullif($15, ''),
      laterality = $16,
      instrument = nullif($17, ''),
      instrument_brand = nullif($18, ''),
      instrument_model = nullif($19, ''),
      instrument_serial_number = nullif($20, ''),
      instrument_precision = nullif($21, ''),
      instrument_calibrated_at = nullif($22, '')::date,
      calibration_notes = nullif($23, ''),
      mass_kg = $24,
      height_cm = $25,
      waist_cm = $26,
      hip_cm = $27,
      triceps_mm = $28,
      subscapular_mm = $29,
      abdominal_mm = $30,
      thigh_mm = $31,
      visibility = $32::jsonb,
      observations = nullif($33, ''),
      consent_confirmed = $34,
      finalized_at = nullif($35, '')::timestamptz,
      finalized_by = nullif($36, '')::uuid,
      updated_at = now()
    where id = $37
      and organization_id = $38
      and client_id = $39
      and workflow_status not in ('completed', 'validated', 'cancelled', 'superseded')
    returning id`,
    [
      status,
      workflowStatus,
      input.measuredAt ?? "",
      protocol.name,
      protocol.id,
      input.protocolSlug,
      protocol.version,
      input.anthropometristName ?? "",
      input.accreditationLevel ?? "",
      input.accreditationNumber ?? "",
      input.center ?? "",
      input.conditions ?? "",
      input.fastingState ?? "",
      input.previousExercise ?? "",
      input.declaredHydration ?? "",
      input.laterality,
      input.instrument ?? "",
      input.instrumentBrand ?? "",
      input.instrumentModel ?? "",
      input.instrumentSerialNumber ?? "",
      input.instrumentPrecision ?? "",
      input.instrumentCalibratedAt ?? "",
      input.calibrationNotes ?? "",
      summary.massKg,
      summary.heightCm,
      summary.waistCm,
      summary.hipCm,
      summary.tricepsMm,
      summary.subscapularMm,
      summary.abdominalMm,
      summary.thighMm,
      JSON.stringify(visibility),
      input.observations ?? "",
      input.consentConfirmed,
      finalizedAt,
      finalizedBy,
      input.sessionId,
      context.organizationId,
      input.clientId
    ]
  );

  if (result.rowCount === 0) {
    throw new Error("locked anthropometry session");
  }

  return result.rows[0]?.id ?? input.sessionId;
}

async function upsertAnthropometryMeasurement(
  client: PoolClient,
  context: ReadyProfessionalContext,
  sessionId: string,
  item: EvaluatedMeasurement
) {
  await client.query(
    `insert into public.anthropometry_session_measurements (
      organization_id,
      session_id,
      measurement_definition_id,
      category,
      unit,
      first_value,
      second_value,
      third_value,
      absolute_diff,
      relative_diff_percent,
      tolerance_relative_percent,
      tolerance_absolute,
      final_value,
      status,
      plausible_warning,
      observations,
      updated_by
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, nullif($16, ''), $17)
    on conflict (session_id, measurement_definition_id) do update
    set
      first_value = excluded.first_value,
      second_value = excluded.second_value,
      third_value = excluded.third_value,
      absolute_diff = excluded.absolute_diff,
      relative_diff_percent = excluded.relative_diff_percent,
      tolerance_relative_percent = excluded.tolerance_relative_percent,
      tolerance_absolute = excluded.tolerance_absolute,
      final_value = excluded.final_value,
      status = excluded.status,
      plausible_warning = excluded.plausible_warning,
      observations = excluded.observations,
      updated_by = excluded.updated_by,
      updated_at = now()`,
    [
      context.organizationId,
      sessionId,
      item.definition.id,
      item.definition.category,
      item.definition.unit,
      item.evaluation.firstValue,
      item.evaluation.secondValue,
      item.evaluation.thirdValue,
      item.evaluation.absoluteDiff,
      item.evaluation.relativeDiffPercent,
      item.definition.toleranceRelativePercent,
      item.definition.toleranceAbsolute,
      item.evaluation.finalValue,
      item.evaluation.status,
      item.evaluation.plausibleWarning,
      item.observations,
      context.profileId
    ]
  );
}

async function completeAnthropometryWorkflowSession(
  client: PoolClient,
  context: ReadyProfessionalContext,
  sessionId: string,
  clientId: string
) {
  const result = await client.query(
    `update public.anthropometry_sessions
    set
      status = 'finalized',
      workflow_status = 'completed',
      finalized_at = now(),
      finalized_by = $1,
      updated_at = now()
    where id = $2
      and organization_id = $3
      and client_id = $4
      and workflow_status not in ('completed', 'validated', 'cancelled', 'superseded')`,
    [context.profileId, sessionId, context.organizationId, clientId]
  );

  if (result.rowCount === 0) {
    throw new Error("locked anthropometry session");
  }
}

function buildAnthropometrySummary(items: EvaluatedMeasurement[]): AnthropometrySummary {
  return {
    massKg: finalValue(items, "mass_body"),
    heightCm: finalValue(items, "height_standing"),
    waistCm: finalValue(items, "waist_girth"),
    hipCm: finalValue(items, "hip_girth"),
    tricepsMm: finalValue(items, "triceps_skinfold"),
    subscapularMm: finalValue(items, "subscapular_skinfold"),
    abdominalMm: finalValue(items, "abdominal_skinfold"),
    thighMm: finalValue(items, "anterior_thigh_skinfold")
  };
}

function finalValue(items: EvaluatedMeasurement[], slug: string): number | null {
  return items.find((item) => item.definition.slug === slug)?.evaluation.finalValue ?? null;
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
    workflowStatus: row.workflow_status,
    measuredAt: toIso(row.measured_at) ?? "",
    protocol: row.protocol,
    protocolId: row.protocol_id,
    profileSlug: row.profile_slug,
    protocolVersion: row.protocol_version,
    conditions: row.conditions,
    instrument: row.instrument,
    anthropometristName: row.anthropometrist_name,
    center: row.center,
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

function toAnthropometryProtocol(row: AnthropometryProtocolRow): AnthropometryProtocol {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    version: row.version,
    profileKind: row.profile_kind,
    isakCompatibilityNote: row.isak_compatibility_note,
    requiresAccreditationNotice: row.requires_accreditation_notice,
    evidenceStatus: row.evidence_status
  };
}

function toAnthropometryDefinition(
  row: AnthropometryDefinitionRow
): AnthropometryMeasurementDefinition {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    abbreviation: row.abbreviation,
    category: row.category,
    unit: row.unit,
    precisionDigits: row.precision_digits,
    plausibleMin: Number(row.plausible_min),
    plausibleMax: Number(row.plausible_max),
    toleranceRelativePercent: Number(row.tolerance_relative_percent),
    helpTitle: row.help_title,
    helpSummary: row.help_summary,
    helpPosition: row.help_position,
    helpLandmark: row.help_landmark,
    helpTechnique: row.help_technique,
    helpCommonErrors: row.help_common_errors,
    helpInstrument: row.help_instrument,
    helpSource: row.help_source,
    helpProtocolVersion: row.help_protocol_version,
    evidenceStatus: row.evidence_status,
    sortOrder: row.sort_order
  };
}

function toAnthropometryMeasurement(
  row: AnthropometryMeasurementRow
): AnthropometrySessionMeasurement {
  return {
    id: row.id,
    sessionId: row.session_id,
    slug: row.slug,
    name: row.name,
    abbreviation: row.abbreviation,
    category: row.category,
    unit: row.unit,
    firstValue: toNumber(row.first_value),
    secondValue: toNumber(row.second_value),
    thirdValue: toNumber(row.third_value),
    absoluteDiff: toNumber(row.absolute_diff),
    relativeDiffPercent: toNumber(row.relative_diff_percent),
    toleranceRelativePercent: Number(row.tolerance_relative_percent),
    finalValue: toNumber(row.final_value),
    status: row.status,
    plausibleWarning: row.plausible_warning,
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
