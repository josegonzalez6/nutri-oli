import Link from "next/link";

import {
  calculateSafeBmi,
  calculateSafeSkinfoldSum,
  calculateSafeWaistToHeight
} from "./measurement-engine";
import type { CalculationResult } from "./measurement-engine";
import type {
  AnthropometrySession,
  AnthropometrySessionMeasurement
} from "@/features/clinical/repository";
import type { Locale } from "@/i18n/routing";

export function AnthropometryResultsPanel({
  locale,
  clientId,
  session,
  measurements,
  previousMeasurements
}: {
  locale: Locale;
  clientId: string;
  session: AnthropometrySession | null;
  measurements: AnthropometrySessionMeasurement[];
  previousMeasurements: AnthropometrySessionMeasurement[];
}) {
  if (!session) {
    return (
      <section className="mt-6 rounded-md border border-dashed border-[var(--border)] bg-[var(--background)] p-4">
        <h3 className="font-semibold">Resultados antropometricos</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Crea y guarda una sesion antropometrica para ver resultados, control de calidad e informe.
        </p>
      </section>
    );
  }

  const bmi = calculateSafeBmi(session.massKg, session.heightCm);
  const waistToHeight = calculateSafeWaistToHeight(session.waistCm, session.heightCm);
  const skinfoldSum = calculateSafeSkinfoldSum([
    findFinal(measurements, "triceps_skinfold"),
    findFinal(measurements, "subscapular_skinfold"),
    findFinal(measurements, "biceps_skinfold"),
    findFinal(measurements, "iliac_crest_skinfold"),
    findFinal(measurements, "supraspinale_skinfold"),
    findFinal(measurements, "abdominal_skinfold"),
    findFinal(measurements, "anterior_thigh_skinfold"),
    findFinal(measurements, "medial_calf_skinfold")
  ]);
  const thirdTaken = measurements.filter((item) => item.thirdValue !== null);
  const completed = measurements.filter((item) => item.finalValue !== null);
  const reportAvailable = ["completed", "validated"].includes(session.workflowStatus);

  return (
    <section className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold">Resultados antropometricos</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Estimaciones y mediciones finales de la sesion seleccionada. No se promedian modelos
            predictivos.
          </p>
        </div>
        {reportAvailable ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--olive-dark)] px-4 text-sm font-semibold text-white"
            href={`/${locale}/profesional/clientes/${clientId}/antropometria/${session.id}/informe`}
          >
            Descargar PDF
          </Link>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Finaliza la sesion para generar el PDF.
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <ResultCard label="IMC" value={formatCalculation(bmi)} />
        <ResultCard label="Cintura/talla" value={formatCalculation(waistToHeight)} />
        <ResultCard label="Sumatorio 8 pliegues" value={formatCalculation(skinfoldSum, "mm")} />
        <ResultCard label="Terceras tomas" value={`${thirdTaken.length}`} />
      </div>

      <div
        aria-label="Tabla desplazable de resultados antropometricos"
        className="mt-5 overflow-x-auto"
      >
        <a className="sr-only focus:not-sr-only" href="#anthropometry-results-after-table">
          Saltar tabla de resultados
        </a>
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-[var(--muted)]">
              <th className="border-b border-[var(--border)] py-2 pr-3">Medida</th>
              <th className="border-b border-[var(--border)] px-3 py-2">Brutos</th>
              <th className="border-b border-[var(--border)] px-3 py-2">Final</th>
              <th className="border-b border-[var(--border)] px-3 py-2">Calidad</th>
              <th className="border-b border-[var(--border)] py-2 pl-3">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((measurement) => {
              const previous = previousMeasurements.find((item) => item.slug === measurement.slug);
              return (
                <tr key={measurement.id}>
                  <td className="border-b border-[var(--border)] py-2 pr-3 font-medium">
                    {measurement.name}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">
                    {[measurement.firstValue, measurement.secondValue, measurement.thirdValue]
                      .filter((value) => value !== null)
                      .map((value) => formatNumber(value, measurement.unit))
                      .join(" / ") || "No calculable"}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">
                    {formatNumber(measurement.finalValue, measurement.unit)}
                  </td>
                  <td className="border-b border-[var(--border)] px-3 py-2">
                    {qualityLabel(measurement)}
                  </td>
                  <td className="border-b border-[var(--border)] py-2 pl-3">
                    {formatDelta(measurement.finalValue, previous?.finalValue, measurement.unit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div id="anthropometry-results-after-table" />

      <div className="mt-4 rounded-md border border-[var(--border)] bg-white p-3 text-sm">
        <p className="font-semibold">Limitaciones</p>
        <ul className="mt-2 space-y-1 text-[var(--muted)]">
          <li>
            Medicion realizada con protocolo compatible con ISAK; no implica certificacion ISAK.
          </li>
          <li>IMC y cintura/talla son indices simples, no diagnosticos ni composicion corporal.</li>
          <li>
            Las ecuaciones predictivas avanzadas siguen deshabilitadas hasta validacion clinica.
          </li>
          <li>
            Medidas completadas: {completed.length}. Valores ausentes se muestran como No
            calculable.
          </li>
        </ul>
      </div>
    </section>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-white p-3">
      <p className="text-xs font-medium uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function findFinal(measurements: AnthropometrySessionMeasurement[], slug: string) {
  return measurements.find((item) => item.slug === slug)?.finalValue ?? null;
}

function formatCalculation(result: CalculationResult, unit = "") {
  return result.status === "calculable"
    ? `${result.value.toLocaleString("es-ES")}${unit ? ` ${unit}` : ""}`
    : `No calculable: ${result.reason}`;
}

function formatNumber(value: number | null | undefined, unit: string) {
  return value === null || value === undefined
    ? "No calculable"
    : `${value.toLocaleString("es-ES")}${unit ? ` ${unit}` : ""}`;
}

function formatDelta(current: number | null, previous: number | null | undefined, unit: string) {
  if (current === null || previous === null || previous === undefined) {
    return "No calculable";
  }

  const delta = Math.round((current - previous) * 10) / 10;
  const prefix = delta > 0 ? "+" : "";
  return `${prefix}${delta.toLocaleString("es-ES")} ${unit}`;
}

function qualityLabel(measurement: AnthropometrySessionMeasurement) {
  if (measurement.status === "third_required") {
    return "Tercera requerida";
  }

  if (measurement.status === "completed" && measurement.thirdValue !== null) {
    return `Mediana de 3; dif. ${formatNumber(measurement.relativeDiffPercent, "%")}`;
  }

  if (measurement.status === "within_tolerance") {
    return `Dentro de tolerancia; dif. ${formatNumber(measurement.relativeDiffPercent, "%")}`;
  }

  return measurement.status === "pending" ? "No calculable" : measurement.status;
}
