import { describe, expect, it } from "vitest";

import {
  ANTHROPOMETRY_DEFINITION_BY_SLUG,
  calculateRelativeDifferencePercent,
  calculateSafeBmi,
  calculateSafeSkinfoldSum,
  calculateSafeWaistToHeight,
  evaluateMeasurement,
  parseMeasurementValue
} from "./measurement-engine";

const mass = ANTHROPOMETRY_DEFINITION_BY_SLUG.get("mass_body")!;
const triceps = ANTHROPOMETRY_DEFINITION_BY_SLUG.get("triceps_skinfold")!;

describe("anthropometry measurement engine", () => {
  it("parses decimal commas safely", () => {
    expect(parseMeasurementValue("74,5")).toBe(74.5);
    expect(parseMeasurementValue("-2")).toBeNull();
    expect(parseMeasurementValue("12,3,4")).toBeNull();
  });

  it("calculates absolute and relative difference", () => {
    expect(calculateRelativeDifferencePercent(10, 12)).toBe(18.182);
    expect(calculateRelativeDifferencePercent(0, 12)).toBeNull();
  });

  it("accepts two measurements within tolerance and returns the mean", () => {
    expect(
      evaluateMeasurement({ definition: mass, firstValue: "74.0", secondValue: "74.4" })
    ).toMatchObject({
      status: "within_tolerance",
      absoluteDiff: 0.4,
      finalValue: 74.2,
      notCalculableReason: null
    });
  });

  it("requires a third skinfold measurement when tolerance is exceeded", () => {
    expect(
      evaluateMeasurement({ definition: triceps, firstValue: "10", secondValue: "12" })
    ).toMatchObject({
      status: "third_required",
      finalValue: null,
      notCalculableReason: "Tercera medicion necesaria por discrepancia."
    });
  });

  it("uses the median after the third measurement", () => {
    expect(
      evaluateMeasurement({
        definition: triceps,
        firstValue: "10",
        secondValue: "12",
        thirdValue: "10.5"
      })
    ).toMatchObject({
      status: "completed",
      finalValue: 10.5
    });
  });

  it("warns about technically implausible values", () => {
    expect(
      evaluateMeasurement({ definition: mass, firstValue: "1", secondValue: "1" })
    ).toMatchObject({
      status: "implausible",
      plausibleWarning: expect.stringContaining("rango tecnico plausible")
    });
  });

  it("returns not calculable instead of NaN or Infinity", () => {
    expect(calculateSafeBmi(null, 170)).toEqual({
      status: "not_calculable",
      reason: "Falta la masa corporal."
    });
    expect(calculateSafeWaistToHeight(82, null)).toEqual({
      status: "not_calculable",
      reason: "Falta la talla."
    });
  });

  it("does not convert missing skinfolds into zero", () => {
    expect(calculateSafeSkinfoldSum([10, null, 12])).toEqual({
      status: "not_calculable",
      reason: "Faltan 1 pliegues requeridos."
    });
  });
});
