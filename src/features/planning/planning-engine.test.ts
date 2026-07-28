import { describe, expect, it } from "vitest";

import { calculatePlanningTotals, scalePlanningTotals } from "./planning-engine";

describe("planning engine", () => {
  it("sums known recipe or plan nutrients", () => {
    const totals = calculatePlanningTotals([
      { energyKcal: 120, proteinG: 4, carbohydrateG: 18, fatG: 3, fiberG: 2 },
      { energyKcal: 80, proteinG: 8, carbohydrateG: 2, fatG: 4, fiberG: 1 }
    ]);

    expect(totals).toEqual({
      energyKcal: 200,
      proteinG: 12,
      carbohydrateG: 20,
      fatG: 7,
      fiberG: 3,
      completenessPercent: 100
    });
  });

  it("does not convert missing nutrients to zero", () => {
    const totals = calculatePlanningTotals([
      { energyKcal: 120, proteinG: 4, carbohydrateG: null, fatG: 3, fiberG: null },
      { energyKcal: 80, proteinG: 8, carbohydrateG: 2, fatG: 4, fiberG: 1 }
    ]);

    expect(totals.carbohydrateG).toBeNull();
    expect(totals.fiberG).toBeNull();
    expect(totals.energyKcal).toBe(200);
    expect(totals.completenessPercent).toBe(80);
  });

  it("scales recipe totals per serving", () => {
    const perServing = scalePlanningTotals(
      {
        energyKcal: 301,
        proteinG: 15,
        carbohydrateG: 44,
        fatG: 8,
        fiberG: 6,
        completenessPercent: 100
      },
      2
    );

    expect(perServing.energyKcal).toBe(150.5);
    expect(perServing.proteinG).toBe(7.5);
    expect(perServing.completenessPercent).toBe(100);
  });
});
