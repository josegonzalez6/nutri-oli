import { describe, expect, it } from "vitest";

import { anthropometrySchema, consultationSchema, intakeSchema } from "./schemas";

const clientId = "00000000-0000-4000-8000-000000000201";

describe("clinical schemas", () => {
  it("accepts declared intake data and professional notes", () => {
    const parsed = intakeSchema.safeParse({
      clientId,
      motive: "Primera visita",
      allergies: "No declaradas",
      professionalNote: "Nota clinica privada"
    });

    expect(parsed.success).toBe(true);
  });

  it("requires valid consultation ids and supports finalization mode", () => {
    const parsed = consultationSchema.safeParse({
      clientId,
      consultationType: "first_visit",
      reason: "Seguimiento",
      nextReviewAt: "2026-07-30T10:00:00+02:00",
      mode: "finalize"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid anthropometry values", () => {
    const parsed = anthropometrySchema.safeParse({
      clientId,
      protocol: "custom",
      massKg: -1,
      heightCm: 171
    });

    expect(parsed.success).toBe(false);
  });
});
