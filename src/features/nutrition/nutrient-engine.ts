export type NutrientUnit = "kcal" | "kJ" | "g" | "mg" | "ug";

export type NutrientDataKind = "official" | "label" | "estimated" | "calculated" | "unknown";

export type NutrientValue = {
  code: string;
  name?: string;
  unit: NutrientUnit;
  amountPerReference: number | null;
  dataKind: NutrientDataKind;
  trace?: boolean;
  source?: string;
};

export type NutritionFood = {
  id: string;
  name: string;
  referenceAmount: number;
  referenceUnit: "g" | "ml";
  nutrients: ReadonlyArray<NutrientValue>;
};

export type QuantityInput =
  | { kind: "grams"; grams: number }
  | { kind: "milliliters"; milliliters: number; densityGramsPerMilliliter?: number | null }
  | { kind: "portion"; grams: number; label?: string }
  | { kind: "servings"; servings: number; gramsPerServing: number };

export type NutritionIssue = {
  code:
    | "invalid_quantity"
    | "density_required"
    | "missing_nutrient"
    | "unit_mismatch"
    | "not_calculable";
  message: string;
  nutrientCode?: string;
};

export type NutrientCoverage = {
  knownItems: number;
  totalItems: number;
  knownWeightGrams: number;
  totalWeightGrams: number;
  ratio: number;
};

export type CalculatedNutrient = {
  code: string;
  unit: NutrientUnit;
  amount: number | null;
  knownAmount: number;
  trace: boolean;
  dataKinds: NutrientDataKind[];
  coverage: NutrientCoverage;
  issues: NutritionIssue[];
};

export type CalculatedFoodItem = {
  foodId: string;
  foodName: string;
  quantity: QuantityInput;
  weightGrams: number | null;
  nutrients: CalculatedNutrient[];
  issues: NutritionIssue[];
};

export type NutritionAggregate = {
  nutrients: CalculatedNutrient[];
  coverageRatio: number;
  issues: NutritionIssue[];
};

export type RecipeInput = {
  name: string;
  ingredients: ReadonlyArray<{ food: NutritionFood; quantity: QuantityInput }>;
  servings?: number | null;
  yieldGrams?: number | null;
};

export type RecipeNutrition = {
  name: string;
  total: NutritionAggregate;
  perServing: NutritionAggregate | null;
  per100g: NutritionAggregate | null;
};

export type MacroPortionSystem = {
  carbohydrateGramsPerPortion: number;
  proteinGramsPerPortion: number;
  fatGramsPerPortion: number;
  fiberGramsPerPortion?: number | null;
};

export type MacroPortion = {
  macro: "carbohydrates" | "protein" | "fat" | "fiber";
  grams: number | null;
  portions: number | null;
  gramsPerPortion: number;
  coverageRatio: number;
};

export type EquivalentQuantityResult =
  | {
      calculable: true;
      grams: number;
      nutrientCode: string;
      targetAmount: number;
      unit: NutrientUnit;
      amountPer100g: number;
    }
  | {
      calculable: false;
      nutrientCode: string;
      targetAmount: number;
      unit: NutrientUnit;
      reason: string;
    };

export type BedcaLikeFood = {
  bedcaId: string;
  name: string;
  nutrients: ReadonlyArray<{
    code: string;
    amountPer100g: number | null;
    trace: boolean;
  }>;
};

export function createNutritionFoodFromBedca(food: BedcaLikeFood): NutritionFood {
  return {
    id: `bedca:${food.bedcaId}`,
    name: food.name,
    referenceAmount: 100,
    referenceUnit: "g",
    nutrients: food.nutrients.map((nutrient) => ({
      code: nutrient.code,
      unit: inferNutrientUnit(nutrient.code),
      amountPerReference: nutrient.amountPer100g,
      dataKind: nutrient.amountPer100g === null ? "unknown" : "official",
      trace: nutrient.trace,
      source: "BEDCA local"
    }))
  };
}

export function calculateFoodItem(
  food: NutritionFood,
  quantity: QuantityInput
): CalculatedFoodItem {
  const normalized = normalizeQuantity(food, quantity);

  if (normalized.weightGrams === null || normalized.factor === null) {
    return {
      foodId: food.id,
      foodName: food.name,
      quantity,
      weightGrams: normalized.weightGrams,
      nutrients: food.nutrients.map((nutrient) =>
        buildSingleNutrient(nutrient, null, 0, normalized.weightGrams)
      ),
      issues: normalized.issues
    };
  }

  const factor = normalized.factor;
  const weightGrams = normalized.weightGrams;

  return {
    foodId: food.id,
    foodName: food.name,
    quantity,
    weightGrams,
    nutrients: food.nutrients.map((nutrient) =>
      buildSingleNutrient(
        nutrient,
        nutrient.amountPerReference === null
          ? null
          : roundNutrientAmount(nutrient.amountPerReference * factor, nutrient.unit),
        weightGrams,
        weightGrams
      )
    ),
    issues: []
  };
}

export function aggregateFoodItems(items: ReadonlyArray<CalculatedFoodItem>): NutritionAggregate {
  const codes = Array.from(
    new Set(items.flatMap((item) => item.nutrients.map((nutrient) => nutrient.code)))
  ).sort();

  const nutrients = codes.map((code) => aggregateNutrient(code, items));
  const allIssues = items.flatMap((item) => item.issues).concat(nutrients.flatMap((n) => n.issues));

  return {
    nutrients,
    coverageRatio: calculateAverageCoverage(nutrients),
    issues: allIssues
  };
}

export function calculateRecipeNutrition(recipe: RecipeInput): RecipeNutrition {
  const ingredientItems = recipe.ingredients.map((ingredient) =>
    calculateFoodItem(ingredient.food, ingredient.quantity)
  );
  const total = aggregateFoodItems(ingredientItems);

  return {
    name: recipe.name,
    total,
    perServing: scaleAggregate(total, validPositive(recipe.servings) ? 1 / recipe.servings : null),
    per100g: scaleAggregate(
      total,
      validPositive(recipe.yieldGrams) ? 100 / recipe.yieldGrams : null
    )
  };
}

export function calculateMacroPortions(
  aggregate: NutritionAggregate,
  system: MacroPortionSystem
): MacroPortion[] {
  return [
    macroPortion(aggregate, "carbohydrates", system.carbohydrateGramsPerPortion),
    macroPortion(aggregate, "protein", system.proteinGramsPerPortion),
    macroPortion(aggregate, "fat", system.fatGramsPerPortion),
    ...(validPositive(system.fiberGramsPerPortion)
      ? [macroPortion(aggregate, "fiber", system.fiberGramsPerPortion)]
      : [])
  ];
}

export function calculateEquivalentQuantity(
  food: NutritionFood,
  target: { nutrientCode: string; amount: number; unit: NutrientUnit }
): EquivalentQuantityResult {
  const nutrient = food.nutrients.find((candidate) => candidate.code === target.nutrientCode);

  if (!validPositive(target.amount)) {
    return {
      calculable: false,
      nutrientCode: target.nutrientCode,
      targetAmount: target.amount,
      unit: target.unit,
      reason: "La cantidad objetivo debe ser positiva."
    };
  }

  if (!nutrient) {
    return {
      calculable: false,
      nutrientCode: target.nutrientCode,
      targetAmount: target.amount,
      unit: target.unit,
      reason: "El alimento no contiene ese nutriente en su perfil."
    };
  }

  if (nutrient.unit !== target.unit) {
    return {
      calculable: false,
      nutrientCode: target.nutrientCode,
      targetAmount: target.amount,
      unit: target.unit,
      reason: `Unidad incompatible: ${nutrient.unit}.`
    };
  }

  if (!validPositive(nutrient.amountPerReference)) {
    return {
      calculable: false,
      nutrientCode: target.nutrientCode,
      targetAmount: target.amount,
      unit: target.unit,
      reason: "No calculable: dato ausente o cero en el alimento de referencia."
    };
  }

  const grams = (target.amount * food.referenceAmount) / nutrient.amountPerReference;

  return {
    calculable: true,
    grams: roundNutrientAmount(grams, "g"),
    nutrientCode: target.nutrientCode,
    targetAmount: target.amount,
    unit: target.unit,
    amountPer100g: nutrient.amountPerReference
  };
}

export function getNutrient(
  aggregate: NutritionAggregate,
  code: string
): CalculatedNutrient | null {
  return aggregate.nutrients.find((nutrient) => nutrient.code === code) ?? null;
}

function normalizeQuantity(
  food: NutritionFood,
  quantity: QuantityInput
): { factor: number | null; weightGrams: number | null; issues: NutritionIssue[] } {
  if (!validPositive(food.referenceAmount)) {
    return invalidQuantity("La cantidad de referencia del alimento debe ser positiva.");
  }

  if (quantity.kind === "grams" || quantity.kind === "portion") {
    if (!validPositive(quantity.grams)) {
      return invalidQuantity("La cantidad en gramos debe ser positiva.");
    }

    return {
      factor: quantity.grams / food.referenceAmount,
      weightGrams: quantity.grams,
      issues: []
    };
  }

  if (quantity.kind === "servings") {
    if (!validPositive(quantity.servings) || !validPositive(quantity.gramsPerServing)) {
      return invalidQuantity("Las raciones y gramos por racion deben ser positivos.");
    }

    const grams = quantity.servings * quantity.gramsPerServing;
    return { factor: grams / food.referenceAmount, weightGrams: grams, issues: [] };
  }

  if (!validPositive(quantity.milliliters)) {
    return invalidQuantity("La cantidad en mililitros debe ser positiva.");
  }

  if (food.referenceUnit === "ml") {
    return {
      factor: quantity.milliliters / food.referenceAmount,
      weightGrams: null,
      issues: []
    };
  }

  if (!validPositive(quantity.densityGramsPerMilliliter)) {
    return {
      factor: null,
      weightGrams: null,
      issues: [
        {
          code: "density_required",
          message: "No calculable: se necesita densidad para convertir ml a g."
        }
      ]
    };
  }

  const grams = quantity.milliliters * quantity.densityGramsPerMilliliter;
  return { factor: grams / food.referenceAmount, weightGrams: grams, issues: [] };
}

function invalidQuantity(message: string): {
  factor: number | null;
  weightGrams: number | null;
  issues: NutritionIssue[];
} {
  return {
    factor: null,
    weightGrams: null,
    issues: [{ code: "invalid_quantity", message }]
  };
}

function buildSingleNutrient(
  nutrient: NutrientValue,
  amount: number | null,
  knownWeightGrams: number,
  totalWeightGrams: number | null
): CalculatedNutrient {
  const known = amount !== null;

  return {
    code: nutrient.code,
    unit: nutrient.unit,
    amount,
    knownAmount: amount ?? 0,
    trace: nutrient.trace === true,
    dataKinds: [nutrient.dataKind],
    coverage: {
      knownItems: known ? 1 : 0,
      totalItems: 1,
      knownWeightGrams: known ? knownWeightGrams : 0,
      totalWeightGrams: totalWeightGrams ?? 0,
      ratio: known ? 1 : 0
    },
    issues: known
      ? []
      : [
          {
            code: "missing_nutrient",
            nutrientCode: nutrient.code,
            message: "No calculable: dato nutricional ausente."
          }
        ]
  };
}

function aggregateNutrient(
  code: string,
  items: ReadonlyArray<CalculatedFoodItem>
): CalculatedNutrient {
  const matching = items
    .map((item) => ({
      item,
      nutrient: item.nutrients.find((candidate) => candidate.code === code)
    }))
    .filter((entry) => entry.nutrient !== undefined);

  const units = Array.from(new Set(matching.map((entry) => entry.nutrient?.unit)));
  const validUnits = units.filter((unit) => unit !== undefined);

  if (validUnits.length !== 1) {
    return {
      code,
      unit: "g",
      amount: null,
      knownAmount: 0,
      trace: false,
      dataKinds: [],
      coverage: {
        knownItems: 0,
        totalItems: items.length,
        knownWeightGrams: 0,
        totalWeightGrams: 0,
        ratio: 0
      },
      issues: [{ code: "unit_mismatch", nutrientCode: code, message: "Unidades incompatibles." }]
    };
  }

  const knownEntries = matching.filter((entry) => entry.nutrient?.amount !== null);
  const totalWeightGrams = sumNumbers(items.map((item) => item.weightGrams));
  const knownWeightGrams = sumNumbers(
    knownEntries.map((entry) => (entry.nutrient?.amount !== null ? entry.item.weightGrams : null))
  );
  const knownAmount = sumNumbers(knownEntries.map((entry) => entry.nutrient?.amount ?? null));
  const coverageRatio =
    totalWeightGrams > 0 ? knownWeightGrams / totalWeightGrams : knownEntries.length / items.length;

  return {
    code,
    unit: validUnits[0],
    amount:
      knownEntries.length === items.length ? roundNutrientAmount(knownAmount, validUnits[0]) : null,
    knownAmount: roundNutrientAmount(knownAmount, validUnits[0]),
    trace: matching.some((entry) => entry.nutrient?.trace === true),
    dataKinds: Array.from(new Set(matching.flatMap((entry) => entry.nutrient?.dataKinds ?? []))),
    coverage: {
      knownItems: knownEntries.length,
      totalItems: items.length,
      knownWeightGrams,
      totalWeightGrams,
      ratio: clampCoverage(coverageRatio)
    },
    issues:
      knownEntries.length === items.length
        ? []
        : [
            {
              code: "missing_nutrient",
              nutrientCode: code,
              message: "No calculable como total exacto: uno o mas ingredientes no tienen dato."
            }
          ]
  };
}

function scaleAggregate(
  aggregate: NutritionAggregate,
  factor: number | null
): NutritionAggregate | null {
  if (factor === null || !Number.isFinite(factor) || factor <= 0) {
    return null;
  }

  const nutrients = aggregate.nutrients.map((nutrient) => ({
    ...nutrient,
    amount:
      nutrient.amount === null
        ? null
        : roundNutrientAmount(nutrient.amount * factor, nutrient.unit),
    knownAmount: roundNutrientAmount(nutrient.knownAmount * factor, nutrient.unit)
  }));

  return {
    nutrients,
    coverageRatio: aggregate.coverageRatio,
    issues: aggregate.issues
  };
}

function macroPortion(
  aggregate: NutritionAggregate,
  macro: MacroPortion["macro"],
  gramsPerPortion: number
): MacroPortion {
  const nutrient = getNutrient(aggregate, macro);
  const grams = nutrient?.amount ?? null;

  return {
    macro,
    grams,
    portions: grams === null ? null : roundNutrientAmount(grams / gramsPerPortion, "g"),
    gramsPerPortion,
    coverageRatio: nutrient?.coverage.ratio ?? 0
  };
}

function calculateAverageCoverage(nutrients: ReadonlyArray<CalculatedNutrient>): number {
  if (nutrients.length === 0) {
    return 1;
  }

  return clampCoverage(
    nutrients.reduce((sum, nutrient) => sum + nutrient.coverage.ratio, 0) / nutrients.length
  );
}

function sumNumbers(values: ReadonlyArray<number | null | undefined>): number {
  return values.reduce<number>(
    (sum, value) => (typeof value === "number" && Number.isFinite(value) ? sum + value : sum),
    0
  );
}

function validPositive(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function clampCoverage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function roundNutrientAmount(value: number, unit: NutrientUnit): number {
  const decimals = unit === "kcal" || unit === "kJ" ? 0 : 2;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function inferNutrientUnit(code: string): NutrientUnit {
  if (code.endsWith("_kcal") || code === "energy_kcal") {
    return "kcal";
  }

  if (code.endsWith("_kj") || code === "energy_kj") {
    return "kJ";
  }

  if (
    code.includes("vitamin_a") ||
    code.includes("vitamin_d") ||
    code.includes("folate") ||
    code.includes("vitamin_b12") ||
    code.includes("iodine") ||
    code.includes("selenium")
  ) {
    return "ug";
  }

  if (
    code.includes("cholesterol") ||
    code.includes("calcium") ||
    code.includes("iron") ||
    code.includes("potassium") ||
    code.includes("magnesium") ||
    code.includes("sodium") ||
    code.includes("phosphorus") ||
    code.includes("zinc") ||
    code.includes("vitamin_e") ||
    code.includes("vitamin_b1") ||
    code.includes("vitamin_b2") ||
    code.includes("vitamin_b3") ||
    code.includes("vitamin_b6") ||
    code.includes("vitamin_c")
  ) {
    return "mg";
  }

  return "g";
}
