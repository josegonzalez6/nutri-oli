import {
  Activity,
  AlertTriangle,
  CalendarPlus,
  ClipboardList,
  FileText,
  HeartPulse,
  MessageSquare,
  Ruler,
  Send,
  Stethoscope,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { StatePanel } from "@/components/state-panel";
import { AnthropometryMeasurementWorkflow } from "@/features/anthropometry/measurement-workflow";
import { AnthropometryResultsPanel } from "@/features/anthropometry/results-panel";
import { ActionForm } from "@/features/clients-agenda/action-form";
import { clientStatusLabel } from "@/features/clients-agenda/labels";
import { formatDateTime } from "@/features/clients-agenda/time";
import { saveConsultationAction, saveIntakeAction } from "@/features/clinical/actions";
import type { ClinicalWorkspace, IntakeValue } from "@/features/clinical/repository";
import { loadClinicalWorkspace } from "@/features/clinical/repository";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const inputClass = "min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm";
const sectionClass = "rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm";

const intakeSections = [
  {
    title: "Motivo y objetivos",
    fields: [
      ["motive", "Motivo de consulta"],
      ["objectives", "Objetivos"],
      ["expectations", "Expectativas"]
    ]
  },
  {
    title: "Historia clinica",
    fields: [
      ["personalHistory", "Antecedentes personales"],
      ["familyHistory", "Antecedentes familiares"],
      ["diagnosedConditions", "Patologias diagnosticadas"],
      ["allergies", "Alergias"],
      ["intolerances", "Intolerancias"],
      ["medication", "Medicacion"],
      ["supplements", "Suplementos"]
    ]
  },
  {
    title: "Historia nutricional",
    fields: [
      ["digestiveSymptoms", "Sintomas digestivos"],
      ["bowelMovements", "Deposiciones"],
      ["weightHistory", "Historia ponderal"],
      ["previousDiets", "Dietas previas"],
      ["foodRelationship", "Relacion con la comida"],
      ["recall24h", "Recordatorio 24 horas"],
      ["consumptionFrequency", "Frecuencia de consumo"]
    ]
  },
  {
    title: "Preferencias y contexto",
    fields: [
      ["preferences", "Preferencias"],
      ["aversions", "Aversiones"],
      ["restrictions", "Restricciones"],
      ["schedule", "Horarios y lugar de comidas"],
      ["cookingCapacity", "Capacidad culinaria"],
      ["budget", "Presupuesto"],
      ["work", "Trabajo"],
      ["household", "Convivencia"]
    ]
  },
  {
    title: "Estilo de vida",
    fields: [
      ["sleep", "Sueno"],
      ["stress", "Estres"],
      ["hydration", "Hidratacion"],
      ["alcohol", "Alcohol"],
      ["tobacco", "Tabaco"],
      ["physicalActivity", "Actividad fisica"],
      ["training", "Entrenamiento"],
      ["menstrualHealth", "Salud menstrual, embarazo, lactancia o menopausia"],
      ["barriers", "Barreras"],
      ["motivation", "Disponibilidad para el cambio"]
    ]
  }
] as const;

export default async function ClientClinicalPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: requestedLocale, id } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const workspace = await loadClinicalWorkspace(id);

  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        {workspace.status === "not_configured" ? (
          <StatePanel
            description={`Configura ${workspace.missing.join(", ")} para abrir la ficha clinica.`}
            title="Supabase no configurado"
            tone="warning"
          />
        ) : null}
        {workspace.status === "error" ? (
          <StatePanel
            description="No se muestran datos parciales cuando falla la autorizacion o la lectura clinica."
            title="No se pudo abrir la ficha"
            tone="danger"
          />
        ) : null}
        {workspace.status === "ready" ? (
          <ClinicalWorkspaceView locale={locale} workspace={workspace.data} />
        ) : null}
      </div>
    </AppShell>
  );
}

function ClinicalWorkspaceView({
  workspace,
  locale
}: {
  workspace: ClinicalWorkspace;
  locale: Locale;
}) {
  const latestConsultation = workspace.consultations[0] ?? null;
  const latestAnthropometry = workspace.anthropometry[0] ?? null;
  const editableAnthropometry =
    workspace.anthropometry.find((session) => !isLockedAnthropometry(session.workflowStatus)) ??
    null;
  const previousAnthropometry =
    workspace.anthropometry.find((session) => session.id !== editableAnthropometry?.id) ?? null;
  const editableAnthropometryMeasurements = editableAnthropometry
    ? workspace.anthropometryMeasurements.filter(
        (measurement) => measurement.sessionId === editableAnthropometry.id
      )
    : [];
  const previousAnthropometryMeasurements = previousAnthropometry
    ? workspace.anthropometryMeasurements.filter(
        (measurement) => measurement.sessionId === previousAnthropometry.id
      )
    : [];
  const draftConsultation =
    workspace.consultations.find((consultation) => consultation.status === "draft") ?? null;

  return (
    <>
      <header className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
              <Link
                className="font-medium text-[var(--olive-dark)]"
                href={`/${locale}/profesional/clientes`}
              >
                Clientes
              </Link>
              <span>/</span>
              <span>{workspace.client.internalCode}</span>
              {workspace.context.source === "development_fallback" ? (
                <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs">
                  desarrollo/test
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              {workspace.client.displayName}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
              {ageFromDate(workspace.client.dateOfBirth)} · {workspace.client.email ?? "Sin email"}{" "}
              · {workspace.client.phone ?? "Sin telefono"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-sm">
                {clientStatusLabel(workspace.client.status)}
              </span>
              <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-sm">
                Objetivo: {workspace.client.objectiveSummary ?? "pendiente"}
              </span>
              <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-sm">
                Profesional: {workspace.client.professionalName ?? "sin asignar"}
              </span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[24rem]">
            <QuickAction
              href="#consulta"
              icon={<Stethoscope aria-hidden="true" />}
              label="Iniciar consulta"
            />
            <QuickAction
              href="#antropometria"
              icon={<Ruler aria-hidden="true" />}
              label="Registrar medida"
            />
            <QuickAction
              href={`/${locale}/profesional/agenda`}
              icon={<CalendarPlus aria-hidden="true" />}
              label="Programar cita"
            />
            <QuickAction
              href="#anamnesis"
              icon={<Send aria-hidden="true" />}
              label="Enviar formulario"
            />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric
            label="Ultima visita"
            value={
              workspace.client.lastVisitAt
                ? formatDateTime(workspace.client.lastVisitAt)
                : "Sin finalizar"
            }
          />
          <Metric
            label="Proxima cita"
            value={
              workspace.client.nextAppointmentAt
                ? formatDateTime(workspace.client.nextAppointmentAt)
                : "Sin cita"
            }
          />
          <Metric label="Plan activo" value="Pendiente" />
          <Metric label="Portal" value="Invitacion pendiente" />
        </div>
      </header>

      <nav
        aria-label="Pestanas de ficha"
        className="mt-4 flex gap-2 overflow-x-auto border-b border-[var(--border)] pb-2 text-sm"
      >
        {[
          ["#resumen", "Resumen"],
          ["#anamnesis", "Historia clinica y nutricional"],
          ["#consulta", "Consultas"],
          ["#antropometria", "Antropometria"],
          ["#progreso", "Progreso"],
          ["#timeline", "Linea temporal"]
        ].map(([href, label]) => (
          <a
            className="min-h-10 min-w-fit rounded-md px-3 py-2 font-medium text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
            href={href}
            key={href}
          >
            {label}
          </a>
        ))}
      </nav>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" id="resumen">
        <div className={sectionClass}>
          <div className="flex items-center gap-3">
            <UserRound aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
            <h2 className="text-xl font-semibold">Resumen clinico</h2>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <SummaryItem
              label="Objetivo principal"
              value={workspace.client.objectiveSummary ?? "Pendiente de registrar"}
            />
            <SummaryItem
              label="Alergias"
              value={readIntake(workspace.intake?.responses, "allergies")}
            />
            <SummaryItem
              label="Intolerancias"
              value={readIntake(workspace.intake?.responses, "intolerances")}
            />
            <SummaryItem
              label="Patologias comunicadas"
              value={readIntake(workspace.intake?.responses, "diagnosedConditions")}
            />
            <SummaryItem
              label="Medicacion"
              value={readIntake(workspace.intake?.responses, "medication")}
            />
            <SummaryItem
              label="Suplementos"
              value={readIntake(workspace.intake?.responses, "supplements")}
            />
          </dl>
        </div>
        <div className={sectionClass}>
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden="true" className="size-5 text-[var(--amber)]" />
            <h2 className="text-xl font-semibold">Alertas y seguimiento</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Metric
              label="IMC ultimo"
              value={latestAnthropometry?.bmi ? latestAnthropometry.bmi.toFixed(2) : "Sin medida"}
            />
            <Metric
              label="Cintura/talla"
              value={
                latestAnthropometry?.waistToHeightRatio
                  ? latestAnthropometry.waistToHeightRatio.toFixed(3)
                  : "Sin medida"
              }
            />
            <Metric label="Adherencia" value={latestConsultation?.adherence ?? "Pendiente"} />
            <Metric label="Tareas" value={latestConsultation?.tasks ?? "Sin tareas"} />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${sectionClass}`} id="anamnesis">
        <div className="flex items-center gap-3">
          <HeartPulse aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
          <h2 className="text-xl font-semibold">Anamnesis y entrevista clinica</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Cada respuesta se guarda como dato declarado; la nota final queda marcada como nota
          profesional.
        </p>
        <ActionForm action={saveIntakeAction} submitLabel="Guardar anamnesis">
          <input name="clientId" type="hidden" value={workspace.client.id} />
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {intakeSections.map((section) => (
              <fieldset
                className="rounded-md border border-[var(--border)] p-4"
                key={section.title}
              >
                <legend className="px-1 text-sm font-semibold">{section.title}</legend>
                <div className="mt-3 space-y-3">
                  {section.fields.map(([name, label]) => (
                    <TextAreaField
                      defaultValue={readRawIntake(workspace.intake?.responses, name)}
                      key={name}
                      label={label}
                      name={name}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
            <fieldset className="rounded-md border border-[var(--border)] p-4 lg:col-span-2">
              <legend className="px-1 text-sm font-semibold">Nota profesional</legend>
              <TextAreaField
                defaultValue={readRawIntake(workspace.intake?.responses, "professionalNote")}
                label="Nota privada del profesional"
                name="professionalNote"
              />
            </fieldset>
          </div>
        </ActionForm>
      </section>

      <section className={`mt-6 ${sectionClass}`} id="consulta">
        <div className="flex items-center gap-3">
          <Stethoscope aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
          <h2 className="text-xl font-semibold">Iniciar consulta</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Guarda borradores durante la visita. Al finalizar, la consulta queda inmutable y las
          correcciones se haran por addendum.
        </p>
        <ActionForm action={saveConsultationAction} submitLabel="Guardar consulta">
          <input name="clientId" type="hidden" value={workspace.client.id} />
          <input name="consultationId" type="hidden" value={draftConsultation?.id ?? ""} />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Tipo
              <select
                className={inputClass}
                defaultValue={draftConsultation?.consultationType ?? "first_visit"}
                name="consultationType"
              >
                <option value="first_visit">Primera visita</option>
                <option value="follow_up">Seguimiento</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Proxima revision
              <input
                className={inputClass}
                defaultValue={draftConsultation?.nextReviewAt ?? ""}
                name="nextReviewAt"
                placeholder="2026-07-30T10:00:00+02:00"
              />
            </label>
            {[
              ["reason", "Motivo", draftConsultation?.reason],
              ["evolution", "Evolucion", draftConsultation?.evolution],
              ["adherence", "Adherencia", draftConsultation?.adherence],
              ["difficulties", "Dificultades", draftConsultation?.difficulties],
              ["symptoms", "Sintomas", draftConsultation?.symptoms],
              ["objectives", "Objetivos", draftConsultation?.objectives],
              ["assessment", "Assessment", draftConsultation?.assessment],
              ["nutritionDiagnosis", "Nutrition diagnosis", draftConsultation?.nutritionDiagnosis],
              ["pesStatement", "Diagnostico PES manual", draftConsultation?.pesStatement],
              ["intervention", "Intervencion", draftConsultation?.intervention],
              ["interventionPlan", "Intervention plan", draftConsultation?.interventionPlan],
              ["monitoringPlan", "Monitoring and evaluation", draftConsultation?.monitoringPlan],
              ["recommendations", "Recomendaciones", draftConsultation?.recommendations],
              ["tasks", "Tareas", draftConsultation?.tasks],
              ["sharedSummary", "Resumen compartido con cliente", draftConsultation?.sharedSummary],
              ["privateNote", "Nota privada", draftConsultation?.privateNote]
            ].map(([name, label, value]) => (
              <TextAreaField
                defaultValue={value ?? ""}
                key={name}
                label={label ?? ""}
                name={name ?? ""}
              />
            ))}
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium">
            <input name="mode" type="checkbox" value="finalize" />
            Finalizar y bloquear consulta
          </label>
        </ActionForm>
      </section>

      <section className={`mt-6 ${sectionClass}`} id="antropometria">
        <div className="flex items-center gap-3">
          <Ruler aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
          <h2 className="text-xl font-semibold">Antropometria</h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Flujo clinico con primera, segunda y tercera medicion cuando la discrepancia supera la
          tolerancia configurada.
        </p>
        <div className="mt-4">
          <AnthropometryMeasurementWorkflow
            clientId={workspace.client.id}
            consultationId={draftConsultation?.id ?? ""}
            definitions={workspace.anthropometryDefinitions}
            editableMeasurements={editableAnthropometryMeasurements}
            editableSession={editableAnthropometry}
            previousMeasurements={previousAnthropometryMeasurements}
            previousSession={previousAnthropometry}
            protocols={workspace.anthropometryProtocols}
          />
        </div>
        <AnthropometryResultsPanel
          clientId={workspace.client.id}
          locale={locale}
          measurements={
            latestAnthropometry
              ? workspace.anthropometryMeasurements.filter(
                  (measurement) => measurement.sessionId === latestAnthropometry.id
                )
              : []
          }
          previousMeasurements={previousAnthropometryMeasurements}
          session={latestAnthropometry}
        />
        <div className="mt-6">
          <h3 className="font-semibold">Sesiones registradas</h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {workspace.anthropometry.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No hay sesiones antropometricas.</p>
            ) : (
              workspace.anthropometry.map((session) => (
                <article
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  key={session.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{formatDateTime(session.measuredAt)}</p>
                    <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs">
                      {session.workflowStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{session.protocol}</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <Metric label="Masa" value={formatNumber(session.massKg, "kg")} />
                    <Metric label="IMC" value={formatNumber(session.bmi, "")} />
                    <Metric
                      label="Cintura/talla"
                      value={formatNumber(session.waistToHeightRatio, "")}
                    />
                    <Metric label="Pliegues" value={formatNumber(session.skinfoldSumMm, "mm")} />
                    <Metric label="Cintura" value={formatNumber(session.waistCm, "cm")} />
                    <Metric label="Cadera" value={formatNumber(session.hipCm, "cm")} />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className={`mt-6 ${sectionClass}`} id="timeline">
        <div className="flex items-center gap-3">
          <Activity aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
          <h2 className="text-xl font-semibold">Linea temporal</h2>
        </div>
        <ol className="mt-4 space-y-3">
          {workspace.timeline.map((item) => (
            <li
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              key={`${item.kind}-${item.id}`}
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-[var(--muted)]">
                {formatDateTime(item.happenedAt)} · {item.detail ?? "sin detalle"}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3" id="progreso">
        <DisabledModule icon={<ClipboardList aria-hidden="true" />} title="Planes" />
        <DisabledModule icon={<MessageSquare aria-hidden="true" />} title="Mensajes" />
        <DisabledModule icon={<FileText aria-hidden="true" />} title="Documentos" />
      </section>
    </>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue = ""
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea className={inputClass} defaultValue={defaultValue} name={name} rows={3} />
    </label>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold hover:bg-[var(--surface-strong)]"
      href={href}
    >
      <span className="size-4">{icon}</span>
      {label}
    </a>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs font-medium uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1 text-[var(--muted)]">{value}</dd>
    </div>
  );
}

function DisabledModule({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <section className={sectionClass} aria-label={`${title} pendiente`}>
      <div className="text-[var(--muted)]">{icon}</div>
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Modulo oculto de la navegacion principal hasta tener persistencia, RLS y E2E.
      </p>
    </section>
  );
}

function readIntake(responses: Record<string, IntakeValue> | undefined, key: string) {
  return readRawIntake(responses, key) || "No declarado";
}

function readRawIntake(responses: Record<string, IntakeValue> | undefined, key: string) {
  return responses?.[key]?.value ?? "";
}

function ageFromDate(date: string | null) {
  if (!date) {
    return "Edad no registrada";
  }

  const birth = new Date(`${date}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return `${age} anos`;
}

function isLockedAnthropometry(status: string) {
  return ["completed", "validated", "cancelled", "superseded"].includes(status);
}

function formatNumber(value: number | null, unit: string) {
  return value === null
    ? "No calculable"
    : `${value.toLocaleString("es-ES")}${unit ? ` ${unit}` : ""}`;
}
