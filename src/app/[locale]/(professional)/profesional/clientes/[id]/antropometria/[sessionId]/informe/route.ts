import { NextResponse } from "next/server";

import { buildAnthropometryReportPdf } from "@/features/anthropometry/report-pdf";
import {
  calculateSafeBmi,
  calculateSafeSkinfoldSum,
  calculateSafeWaistToHeight
} from "@/features/anthropometry/measurement-engine";
import type { CalculationResult } from "@/features/anthropometry/measurement-engine";
import {
  ensureAnthropometryReportGenerated,
  loadClinicalWorkspace
} from "@/features/clinical/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  {
    params
  }: {
    params: Promise<{ locale: string; id: string; sessionId: string }>;
  }
) {
  const { id: clientId, sessionId } = await params;
  const workspace = await loadClinicalWorkspace(clientId);

  if (workspace.status !== "ready") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const session = workspace.data.anthropometry.find((item) => item.id === sessionId);

  if (!session) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (!["completed", "validated"].includes(session.workflowStatus)) {
    return NextResponse.json(
      { error: "Anthropometry report requires a completed session." },
      { status: 409 }
    );
  }

  const reportRecord = await ensureAnthropometryReportGenerated(clientId, sessionId);

  if (reportRecord.status !== "ready") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const measurements = workspace.data.anthropometryMeasurements.filter(
    (measurement) => measurement.sessionId === session.id
  );
  const bmi = calculateSafeBmi(session.massKg, session.heightCm);
  const waistToHeight = calculateSafeWaistToHeight(session.waistCm, session.heightCm);
  const skinfoldSum = calculateSafeSkinfoldSum([
    finalValue(measurements, "triceps_skinfold"),
    finalValue(measurements, "subscapular_skinfold"),
    finalValue(measurements, "biceps_skinfold"),
    finalValue(measurements, "iliac_crest_skinfold"),
    finalValue(measurements, "supraspinale_skinfold"),
    finalValue(measurements, "abdominal_skinfold"),
    finalValue(measurements, "anterior_thigh_skinfold"),
    finalValue(measurements, "medial_calf_skinfold")
  ]);
  const pdf = buildAnthropometryReportPdf({
    title: "Informe antropometrico",
    subtitle: `Sesion ${new Date(session.measuredAt).toLocaleString("es-ES")}`,
    issuedAt: new Date().toLocaleString("es-ES"),
    professionalName:
      session.anthropometristName ?? workspace.data.client.professionalName ?? "No registrado",
    clientName: workspace.data.client.displayName,
    protocol: `${session.protocol} ${session.protocolVersion ?? ""}`.trim(),
    status: session.workflowStatus,
    conditions: session.conditions ?? "",
    measurements: measurements.map((measurement) => ({
      label: measurement.name,
      value: [
        `final ${formatNullable(measurement.finalValue, measurement.unit)}`,
        `brutos ${
          [measurement.firstValue, measurement.secondValue, measurement.thirdValue]
            .filter((value) => value !== null)
            .map((value) => formatNullable(value, measurement.unit))
            .join(" / ") || "No calculable"
        }`,
        `estado ${measurement.status}`
      ].join("; ")
    })),
    calculations: [
      { label: "IMC", value: formatCalculation(bmi) },
      { label: "Cintura/talla", value: formatCalculation(waistToHeight) },
      { label: "Sumatorio 8 pliegues", value: formatCalculation(skinfoldSum, "mm") }
    ],
    limitations: [
      "Medicion realizada con protocolo compatible con ISAK; no implica certificacion ISAK.",
      "IMC y cintura/talla son indices simples, no diagnosticos.",
      "Las ecuaciones predictivas avanzadas siguen deshabilitadas hasta validacion clinica.",
      "Los datos ausentes se muestran como No calculable y no se convierten en cero."
    ]
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="nutri-oli-antropometria-${session.id}.pdf"`,
      "Content-Type": "application/pdf"
    }
  });
}

function finalValue(
  measurements: Array<{ slug: string; finalValue: number | null }>,
  slug: string
) {
  return measurements.find((measurement) => measurement.slug === slug)?.finalValue ?? null;
}

function formatCalculation(result: CalculationResult, unit = "") {
  return result.status === "calculable"
    ? `${result.value.toLocaleString("es-ES")}${unit ? ` ${unit}` : ""}`
    : `No calculable: ${result.reason}`;
}

function formatNullable(value: number | null | undefined, unit: string) {
  return value === null || value === undefined
    ? "No calculable"
    : `${value.toLocaleString("es-ES")}${unit ? ` ${unit}` : ""}`;
}
