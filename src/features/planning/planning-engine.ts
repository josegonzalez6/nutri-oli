export type NutritionLine = {
  energyKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
};

export type NutritionTotals = NutritionLine & {
  completenessPercent: number;
};

export function calculatePlanningTotals(items: ReadonlyArray<NutritionLine>): NutritionTotals {
  return {
    energyKcal: sumNullable(items.map((item) => item.energyKcal)),
    proteinG: sumNullable(items.map((item) => item.proteinG)),
    carbohydrateG: sumNullable(items.map((item) => item.carbohydrateG)),
    fatG: sumNullable(items.map((item) => item.fatG)),
    fiberG: sumNullable(items.map((item) => item.fiberG)),
    completenessPercent:
      items.length === 0
        ? 0
        : Math.round(
            (items.reduce(
              (known, item) =>
                known +
                [item.energyKcal, item.proteinG, item.carbohydrateG, item.fatG, item.fiberG].filter(
                  (value) => value !== null
                ).length,
              0
            ) /
              (items.length * 5)) *
              100
          )
  };
}

export function scalePlanningTotals(total: NutritionTotals, divisor: number): NutritionTotals {
  if (!Number.isFinite(divisor) || divisor <= 0) {
    return {
      ...total,
      energyKcal: null,
      proteinG: null,
      carbohydrateG: null,
      fatG: null,
      fiberG: null
    };
  }

  return {
    energyKcal: divideNullable(total.energyKcal, divisor),
    proteinG: divideNullable(total.proteinG, divisor),
    carbohydrateG: divideNullable(total.carbohydrateG, divisor),
    fatG: divideNullable(total.fatG, divisor),
    fiberG: divideNullable(total.fiberG, divisor),
    completenessPercent: total.completenessPercent
  };
}

function sumNullable(values: ReadonlyArray<number | null>) {
  return values.some((value) => value === null)
    ? null
    : roundNumber(values.reduce<number>((sum, value) => sum + (value as number), 0));
}

function divideNullable(value: number | null, divisor: number) {
  return value === null ? null : roundNumber(value / divisor);
}

function roundNumber(value: number) {
  return Math.round(value * 100) / 100;
}
