export type MacroValues = {
  energyKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
};

export type MacroPortionSystem = {
  carbohydrateGrams: number;
  proteinGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
};

export type MacroPortionResult = {
  carbohydratePortions: number | null;
  proteinPortions: number | null;
  fatPortions: number | null;
  fiberPortions: number | null;
  completenessPercent: number;
};

export type ExchangeFitResult = {
  status: "within_tolerance" | "outside_tolerance" | "not_calculable";
  difference: number | null;
  differencePercent: number | null;
  reason: string | null;
};

export function calculateMacroPortions(
  values: MacroValues,
  system: MacroPortionSystem
): MacroPortionResult {
  const calculated = {
    carbohydratePortions: divide(values.carbohydrateG, system.carbohydrateGrams),
    proteinPortions: divide(values.proteinG, system.proteinGrams),
    fatPortions: divide(values.fatG, system.fatGrams),
    fiberPortions: system.fiberGrams ? divide(values.fiberG, system.fiberGrams) : null
  };
  const available = [
    values.energyKcal,
    values.proteinG,
    values.carbohydrateG,
    values.fatG,
    values.fiberG
  ].filter((value) => value !== null).length;

  return {
    ...calculated,
    completenessPercent: round((available / 5) * 100, 0)
  };
}

export function calculateExchangeFit({
  actualAmount,
  targetAmount,
  tolerancePercent
}: {
  actualAmount: number | null;
  targetAmount: number;
  tolerancePercent: number;
}): ExchangeFitResult {
  if (actualAmount === null) {
    return {
      status: "not_calculable",
      difference: null,
      differencePercent: null,
      reason: "Dato nutricional ausente."
    };
  }

  if (targetAmount <= 0) {
    return {
      status: "not_calculable",
      difference: null,
      differencePercent: null,
      reason: "Objetivo invalido."
    };
  }

  const difference = round(actualAmount - targetAmount, 2);
  const differencePercent = round((Math.abs(difference) / targetAmount) * 100, 2);

  return {
    status: differencePercent <= tolerancePercent ? "within_tolerance" : "outside_tolerance",
    difference,
    differencePercent,
    reason: null
  };
}

export function calculatePerPortionFromPer100g(valuePer100g: number | null, grams: number) {
  if (valuePer100g === null || grams <= 0) {
    return null;
  }

  return round((valuePer100g * grams) / 100, 2);
}

function divide(value: number | null, portionSize: number) {
  if (value === null || portionSize <= 0) {
    return null;
  }

  return round(value / portionSize, 2);
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
