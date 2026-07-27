import { describe, expect, it } from "vitest";

import { buildAnthropometryReportPdf } from "./report-pdf";

describe("anthropometry PDF report", () => {
  it("builds a PDF document without exposing invalid values", () => {
    const pdf = buildAnthropometryReportPdf({
      title: "Informe antropometrico",
      subtitle: "Sesion de prueba",
      issuedAt: "27/7/26, 10:00",
      professionalName: "Profesional Demo",
      clientName: "Cliente Demo",
      protocol: "Compatible ISAK 0.1",
      status: "measuring",
      conditions: "",
      measurements: [
        {
          label: "Masa corporal",
          value: "final 74,2 kg; brutos 74 kg / 74,4 kg; estado within_tolerance"
        }
      ],
      calculations: [{ label: "IMC", value: "25,2" }],
      limitations: ["Los datos ausentes se muestran como No calculable."]
    });

    expect(pdf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(pdf.toString("utf8")).toContain("Nutri-Oli");
    expect(pdf.toString("utf8")).not.toContain("NaN");
    expect(pdf.toString("utf8")).not.toContain("Infinity");
  });
});
