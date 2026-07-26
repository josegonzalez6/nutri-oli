"use client";

import { Info, Save, ShieldCheck } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { saveAnthropometryWorkflowAction } from "@/features/clinical/actions";
import type {
  AnthropometryMeasurementDefinition,
  AnthropometryProtocol,
  AnthropometrySession,
  AnthropometrySessionMeasurement
} from "@/features/clinical/repository";

import {
  ANTHROPOMETRY_DEFINITION_BY_SLUG,
  calculateSafeBmi,
  calculateSafeSkinfoldSum,
  calculateSafeWaistToHeight,
  evaluateMeasurement
} from "./measurement-engine";

const initialState = { status: "idle" as const, message: "" };
const categoryLabels: Record<string, string> = {
  basic: "Medidas basicas",
  skinfold: "Pliegues",
  girth: "Perimetros",
  breadth: "Diametros",
  length: "Longitudes",
  other: "Otras medidas"
};

type MeasurementValues = Record<
  string,
  {
    firstValue: string;
    secondValue: string;
    thirdValue: string;
    observations: string;
  }
>;

export function AnthropometryMeasurementWorkflow({
  clientId,
  consultationId,
  protocols,
  definitions,
  editableSession,
  editableMeasurements,
  previousSession,
  previousMeasurements
}: {
  clientId: string;
  consultationId: string;
  protocols: AnthropometryProtocol[];
  definitions: AnthropometryMeasurementDefinition[];
  editableSession: AnthropometrySession | null;
  editableMeasurements: AnthropometrySessionMeasurement[];
  previousSession: AnthropometrySession | null;
  previousMeasurements: AnthropometrySessionMeasurement[];
}) {
  const [formState, formAction, pending] = useActionState(
    saveAnthropometryWorkflowAction,
    initialState
  );
  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const defaultProtocolSlug =
    protocols.find((protocol) => protocol.slug === "compatible_isak_restricted_v0")?.slug ??
    protocols[0]?.slug ??
    "";
  const [values, setValues] = useState<MeasurementValues>(() =>
    Object.fromEntries(
      definitions.map((definition) => {
        const saved = editableMeasurements.find((item) => item.slug === definition.slug);
        return [
          definition.slug,
          {
            firstValue: formatInput(saved?.firstValue),
            secondValue: formatInput(saved?.secondValue),
            thirdValue: formatInput(saved?.thirdValue),
            observations: saved?.observations ?? ""
          }
        ];
      })
    )
  );
  const evaluations = useMemo(
    () =>
      definitions.map((definition) => {
        const engineDefinition = ANTHROPOMETRY_DEFINITION_BY_SLUG.get(definition.slug);
        const evaluation = evaluateMeasurement({
          definition: {
            slug: definition.slug,
            name: definition.name,
            abbreviation: definition.abbreviation,
            category: engineDefinition?.category ?? "other",
            unit: definition.unit as "kg" | "cm" | "mm",
            precisionDigits: definition.precisionDigits,
            plausibleMin: definition.plausibleMin,
            plausibleMax: definition.plausibleMax,
            toleranceRelativePercent: definition.toleranceRelativePercent,
            evidenceStatus: definition.evidenceStatus
          },
          firstValue: values[definition.slug]?.firstValue,
          secondValue: values[definition.slug]?.secondValue,
          thirdValue: values[definition.slug]?.thirdValue
        });

        return { definition, evaluation };
      }),
    [definitions, values]
  );
  const grouped = groupDefinitions(definitions);
  const completedCount = evaluations.filter(
    ({ evaluation }) =>
      evaluation.status === "within_tolerance" || evaluation.status === "completed"
  ).length;
  const thirdRequired = evaluations.filter(
    ({ evaluation }) => evaluation.status === "third_required"
  ).length;
  const mass = readFinalValue(evaluations, "mass_body");
  const height = readFinalValue(evaluations, "height_standing");
  const waist = readFinalValue(evaluations, "waist_girth");
  const bmi = calculateSafeBmi(mass, height);
  const waistToHeight = calculateSafeWaistToHeight(waist, height);
  const skinfoldSum = calculateSafeSkinfoldSum([
    readFinalValue(evaluations, "triceps_skinfold"),
    readFinalValue(evaluations, "subscapular_skinfold"),
    readFinalValue(evaluations, "biceps_skinfold"),
    readFinalValue(evaluations, "iliac_crest_skinfold"),
    readFinalValue(evaluations, "supraspinale_skinfold"),
    readFinalValue(evaluations, "abdominal_skinfold"),
    readFinalValue(evaluations, "anterior_thigh_skinfold"),
    readFinalValue(evaluations, "medial_calf_skinfold")
  ]);

  function updateValue(slug: string, key: keyof MeasurementValues[string], value: string) {
    setValues((current) => ({
      ...current,
      [slug]: {
        firstValue: current[slug]?.firstValue ?? "",
        secondValue: current[slug]?.secondValue ?? "",
        thirdValue: current[slug]?.thirdValue ?? "",
        observations: current[slug]?.observations ?? "",
        [key]: value
      }
    }));
  }

  return (
    <form action={formAction} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <input name="clientId" type="hidden" value={clientId} />
      <input name="sessionId" type="hidden" value={editableSession?.id ?? ""} />
      <input name="consultationId" type="hidden" value={consultationId} />
      <div className="space-y-4">
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Perfil
              <select
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                defaultValue={editableSession?.profileSlug ?? defaultProtocolSlug}
                name="protocolSlug"
              >
                {protocols.map((protocol) => (
                  <option key={protocol.id} value={protocol.slug}>
                    {protocol.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Fecha y hora
              <input
                className="rounded-md border border-[var(--border)] px-3 py-2"
                name="measuredAt"
                placeholder="2026-07-26T10:00:00+02:00"
                defaultValue=""
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Antropometrista
              <input
                className="rounded-md border border-[var(--border)] px-3 py-2"
                name="anthropometristName"
                defaultValue={editableSession?.anthropometristName ?? ""}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Centro
              <input
                className="rounded-md border border-[var(--border)] px-3 py-2"
                name="center"
                defaultValue={editableSession?.center ?? ""}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Lateralidad
              <select
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                name="laterality"
                defaultValue="right"
              >
                <option value="right">Derecha</option>
                <option value="left">Izquierda</option>
                <option value="mixed">Mixta</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Precision instrumental
              <input
                className="rounded-md border border-[var(--border)] px-3 py-2"
                name="instrumentPrecision"
                placeholder="0,1 cm / 1 mm"
              />
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Textarea label="Condiciones" name="conditions" />
            <Textarea label="Instrumental" name="instrument" />
            <Textarea label="Calibracion" name="calibrationNotes" />
            <Textarea label="Observaciones" name="observations" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input name="consentConfirmed" type="checkbox" /> Consentimiento confirmado
            </label>
            <label className="flex items-center gap-2">
              <input name="clientCanViewWeight" type="checkbox" /> Mostrar peso
            </label>
            <label className="flex items-center gap-2">
              <input name="clientCanViewBmi" type="checkbox" /> Mostrar IMC
            </label>
            <label className="flex items-center gap-2">
              <input name="clientCanViewWaist" type="checkbox" /> Mostrar cintura
            </label>
          </div>
        </div>

        {Object.entries(grouped).map(([category, categoryDefinitions]) => (
          <details
            className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
            key={category}
            open
          >
            <summary className="cursor-pointer text-base font-semibold">
              {categoryLabels[category] ?? category}
            </summary>
            <div className="mt-4 space-y-3">
              {categoryDefinitions.map((definition) => {
                const evaluation = evaluations.find(
                  (item) => item.definition.slug === definition.slug
                )?.evaluation;
                const previous = previousMeasurements.find((item) => item.slug === definition.slug);

                return (
                  <div
                    className="rounded-md border border-[var(--border)] bg-white p-3"
                    key={definition.slug}
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(140px,1fr)_repeat(3,96px)_minmax(120px,0.8fr)_96px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{definition.name}</p>
                          <button
                            aria-expanded={openHelp === definition.slug}
                            aria-label={`Informacion de ${definition.name}`}
                            className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--border)]"
                            onClick={() =>
                              setOpenHelp((current) =>
                                current === definition.slug ? null : definition.slug
                              )
                            }
                            type="button"
                          >
                            <Info aria-hidden="true" className="size-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          {definition.abbreviation} · {definition.unit} · tolerancia{" "}
                          {definition.toleranceRelativePercent}%
                        </p>
                      </div>
                      {(["firstValue", "secondValue", "thirdValue"] as const).map((key, index) => (
                        <label className="grid gap-1 text-xs font-medium" key={key}>
                          {index + 1} toma
                          <input
                            aria-label={`${definition.name} ${attemptLabel(index)}`}
                            className="min-h-11 rounded-md border border-[var(--border)] px-3 text-base"
                            inputMode="decimal"
                            name={`measurement:${definition.slug}:${key}`}
                            value={values[definition.slug]?.[key] ?? ""}
                            onChange={(event) =>
                              updateValue(definition.slug, key, event.currentTarget.value)
                            }
                          />
                        </label>
                      ))}
                      <div className="text-sm">
                        <p className="font-medium">{statusLabel(evaluation?.status)}</p>
                        <p className="text-xs text-[var(--muted)]">
                          Dif. {formatNullable(evaluation?.absoluteDiff, definition.unit)} ·{" "}
                          {formatNullable(evaluation?.relativeDiffPercent, "%")}
                        </p>
                        {evaluation?.notCalculableReason ? (
                          <p className="mt-1 text-xs text-amber-700">
                            {evaluation.notCalculableReason}
                          </p>
                        ) : null}
                        {evaluation?.plausibleWarning ? (
                          <p className="mt-1 text-xs text-red-700">{evaluation.plausibleWarning}</p>
                        ) : null}
                      </div>
                      <div className="text-sm">
                        <p className="text-xs font-medium uppercase text-[var(--muted)]">Final</p>
                        <p className="font-semibold">
                          {formatNullable(evaluation?.finalValue, definition.unit)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          Prev. {formatNullable(previous?.finalValue, definition.unit)}
                        </p>
                      </div>
                    </div>
                    <input
                      name={`measurement:${definition.slug}:observations`}
                      type="hidden"
                      value={values[definition.slug]?.observations ?? ""}
                    />
                    {openHelp === definition.slug ? <MeasureHelp definition={definition} /> : null}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      <aside className="h-fit rounded-md border border-[var(--border)] bg-[var(--background)] p-4 xl:sticky xl:top-4">
        <div className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
          <h3 className="font-semibold">Control de calidad</h3>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Medicion realizada con protocolo compatible con ISAK. No implica certificacion ISAK.
        </p>
        <div className="mt-4 grid gap-2 text-sm">
          <QualityItem
            label="Medidas completadas"
            value={`${completedCount}/${definitions.length}`}
          />
          <QualityItem label="Terceras requeridas" value={`${thirdRequired}`} />
          <QualityItem label="IMC" value={formatCalculation(bmi)} />
          <QualityItem label="Cintura/talla" value={formatCalculation(waistToHeight)} />
          <QualityItem label="Sumatorio pliegues" value={formatCalculation(skinfoldSum, "mm")} />
        </div>
        {previousSession ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Comparando con sesion previa del{" "}
            {new Date(previousSession.measuredAt).toLocaleString("es-ES")}.
          </p>
        ) : (
          <p className="mt-4 text-xs text-[var(--muted)]">No hay sesion previa comparable.</p>
        )}
        <div className="mt-4 grid gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--olive-dark)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            name="mode"
            type="submit"
            value="draft"
          >
            <Save aria-hidden="true" className="size-4" />
            {pending ? "Guardando..." : "Guardar borrador"}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold"
            disabled={pending || thirdRequired > 0}
            name="mode"
            type="submit"
            value="finalize"
          >
            Finalizar sesion
          </button>
        </div>
        {formState.message ? (
          <p
            className={`mt-3 text-sm ${
              formState.status === "error" ? "text-red-700" : "text-[var(--olive-dark)]"
            }`}
            role="status"
          >
            {formState.message}
          </p>
        ) : null}
      </aside>
    </form>
  );
}

function MeasureHelp({ definition }: { definition: AnthropometryMeasurementDefinition }) {
  return (
    <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
      <h4 className="font-semibold">{definition.helpTitle}</h4>
      <p className="mt-2">{definition.helpSummary}</p>
      <dl className="mt-3 grid gap-2 md:grid-cols-2">
        <HelpItem label="Posicion" value={definition.helpPosition} />
        <HelpItem label="Localizacion" value={definition.helpLandmark} />
        <HelpItem label="Tecnica" value={definition.helpTechnique} />
        <HelpItem label="Instrumento" value={definition.helpInstrument} />
      </dl>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Fuente: {definition.helpSource}. Version {definition.helpProtocolVersion}. Estado:{" "}
        {definition.evidenceStatus}.
      </p>
    </div>
  );
}

function Textarea({ label, name }: { label: string; name: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea
        className="min-h-20 rounded-md border border-[var(--border)] px-3 py-2"
        name={name}
      />
    </label>
  );
}

function HelpItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function QualityItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-white p-3">
      <p className="text-xs font-medium uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function groupDefinitions(definitions: AnthropometryMeasurementDefinition[]) {
  return definitions.reduce<Record<string, AnthropometryMeasurementDefinition[]>>(
    (groups, item) => {
      groups[item.category] = [...(groups[item.category] ?? []), item];
      return groups;
    },
    {}
  );
}

function readFinalValue(
  evaluations: Array<{
    definition: AnthropometryMeasurementDefinition;
    evaluation: ReturnType<typeof evaluateMeasurement>;
  }>,
  slug: string
): number | null {
  return evaluations.find((item) => item.definition.slug === slug)?.evaluation.finalValue ?? null;
}

function formatInput(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function formatNullable(value: number | null | undefined, unit: string) {
  return value === null || value === undefined
    ? "No calculable"
    : `${value.toLocaleString("es-ES")}${unit && unit !== "%" ? ` ${unit}` : unit}`;
}

function formatCalculation(
  result: ReturnType<typeof calculateSafeBmi> | ReturnType<typeof calculateSafeWaistToHeight>,
  unit = ""
) {
  return result.status === "calculable"
    ? `${result.value.toLocaleString("es-ES")}${unit ? ` ${unit}` : ""}`
    : `No calculable: ${result.reason}`;
}

function attemptLabel(index: number) {
  return ["primera toma", "segunda toma", "tercera toma"][index] ?? "toma";
}

function statusLabel(status: string | undefined) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "first_recorded":
      return "Primera toma registrada";
    case "within_tolerance":
      return "Dentro de tolerancia";
    case "third_required":
      return "Tercera necesaria";
    case "completed":
      return "Completada";
    case "implausible":
      return "Necesita revision";
    default:
      return "No calculable";
  }
}
