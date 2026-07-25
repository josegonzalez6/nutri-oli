import { describe, expect, it } from "vitest";

import { calculateBmi, calculateWaistToHeightRatio } from "./calculations";

describe("anthropometry calculations", () => {
  it("calculates BMI with explicit metric units", () => {
    expect(calculateBmi({ weightKg: 72.4, heightCm: 174 })).toBe(23.9);
  });

  it("calculates waist-to-height ratio without diagnostic interpretation", () => {
    expect(calculateWaistToHeightRatio({ waistCm: 82, heightCm: 174 })).toBe(0.47);
  });

  it("rejects impossible zero or negative values", () => {
    expect(() => calculateBmi({ weightKg: 0, heightCm: 174 })).toThrow();
    expect(() => calculateWaistToHeightRatio({ waistCm: 82, heightCm: -1 })).toThrow();
  });
});
