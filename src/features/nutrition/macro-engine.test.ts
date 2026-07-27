import { describe, expect, it } from "vitest";

import {
  calculateExchangeFit,
  calculateMacroPortions,
  calculatePerPortionFromPer100g
} from "./macro-engine";

describe("macro nutrition engine", () => {
  it("calculates mixed macro portions without forcing a single food group", () => {
    expect(
      calculateMacroPortions(
        {
          energyKcal: 250,
          proteinG: 18,
          carbohydrateG: 30,
          fatG: 8,
          fiberG: 6
        },
        {
          carbohydrateGrams: 10,
          proteinGrams: 7,
          fatGrams: 5,
          fiberGrams: 5
        }
      )
    ).toEqual({
      carbohydratePortions: 3,
      proteinPortions: 2.57,
      fatPortions: 1.6,
      fiberPortions: 1.2,
      completenessPercent: 100
    });
  });

  it("preserves missing nutrient values as not calculable", () => {
    expect(
      calculateMacroPortions(
        {
          energyKcal: null,
          proteinG: 12,
          carbohydrateG: null,
          fatG: 4,
          fiberG: null
        },
        {
          carbohydrateGrams: 10,
          proteinGrams: 7,
          fatGrams: 5,
          fiberGrams: null
        }
      )
    ).toEqual({
      carbohydratePortions: null,
      proteinPortions: 1.71,
      fatPortions: 0.8,
      fiberPortions: null,
      completenessPercent: 40
    });
  });

  it("evaluates equivalence tolerance without converting absence to zero", () => {
    expect(
      calculateExchangeFit({ actualAmount: 9.7, targetAmount: 10, tolerancePercent: 5 })
    ).toMatchObject({
      status: "within_tolerance",
      difference: -0.3,
      differencePercent: 3
    });
    expect(
      calculateExchangeFit({ actualAmount: null, targetAmount: 10, tolerancePercent: 5 })
    ).toEqual({
      status: "not_calculable",
      difference: null,
      differencePercent: null,
      reason: "Dato nutricional ausente."
    });
  });

  it("calculates portion values from per-100g nutrient data", () => {
    expect(calculatePerPortionFromPer100g(20, 75)).toBe(15);
    expect(calculatePerPortionFromPer100g(null, 75)).toBeNull();
  });
});
