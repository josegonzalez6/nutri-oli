import { describe, expect, it } from "vitest";

import {
  aggregateFoodItems,
  calculateEquivalentQuantity,
  calculateFoodItem,
  calculateMacroPortions,
  calculateRecipeNutrition,
  createNutritionFoodFromBedca,
  getNutrient,
  type NutritionFood
} from "./nutrient-engine";

const bread: NutritionFood = {
  id: "food:bread",
  name: "Pan integral",
  referenceAmount: 100,
  referenceUnit: "g",
  nutrients: [
    { code: "energy_kcal", unit: "kcal", amountPerReference: 240, dataKind: "official" },
    { code: "carbohydrates", unit: "g", amountPerReference: 42, dataKind: "official" },
    { code: "protein", unit: "g", amountPerReference: 9, dataKind: "official" },
    { code: "fat", unit: "g", amountPerReference: 3.5, dataKind: "official" },
    { code: "fiber", unit: "g", amountPerReference: null, dataKind: "unknown" }
  ]
};

const egg: NutritionFood = {
  id: "food:egg",
  name: "Huevo",
  referenceAmount: 100,
  referenceUnit: "g",
  nutrients: [
    { code: "energy_kcal", unit: "kcal", amountPerReference: 143, dataKind: "official" },
    { code: "carbohydrates", unit: "g", amountPerReference: 0.7, dataKind: "official" },
    { code: "protein", unit: "g", amountPerReference: 12.6, dataKind: "official" },
    { code: "fat", unit: "g", amountPerReference: 9.5, dataKind: "official" },
    { code: "fiber", unit: "g", amountPerReference: 0, dataKind: "official" }
  ]
};

describe("nutrition nutrient engine", () => {
  it("scales nutrients from grams without converting missing data into zero", () => {
    const item = calculateFoodItem(bread, { kind: "grams", grams: 50 });

    expect(
      getNutrient({ nutrients: item.nutrients, coverageRatio: 1, issues: [] }, "energy_kcal")
        ?.amount
    ).toBe(120);
    expect(
      getNutrient({ nutrients: item.nutrients, coverageRatio: 1, issues: [] }, "fiber")?.amount
    ).toBeNull();
    expect(
      getNutrient({ nutrients: item.nutrients, coverageRatio: 1, issues: [] }, "fiber")?.coverage
        .ratio
    ).toBe(0);
  });

  it("aggregates foods and marks partial nutrient coverage as not exact", () => {
    const aggregate = aggregateFoodItems([
      calculateFoodItem(bread, { kind: "grams", grams: 50 }),
      calculateFoodItem(egg, { kind: "grams", grams: 60 })
    ]);

    const protein = getNutrient(aggregate, "protein");
    const fiber = getNutrient(aggregate, "fiber");

    expect(protein?.amount).toBe(12.06);
    expect(protein?.coverage.ratio).toBe(1);
    expect(fiber?.amount).toBeNull();
    expect(fiber?.knownAmount).toBe(0);
    expect(fiber?.coverage.ratio).toBeCloseTo(60 / 110, 5);
    expect(aggregate.issues.some((issue) => issue.nutrientCode === "fiber")).toBe(true);
  });

  it("calculates configurable macro portions for mixed foods", () => {
    const aggregate = aggregateFoodItems([
      calculateFoodItem(bread, { kind: "grams", grams: 100 }),
      calculateFoodItem(egg, { kind: "grams", grams: 100 })
    ]);

    const portions = calculateMacroPortions(aggregate, {
      carbohydrateGramsPerPortion: 10,
      proteinGramsPerPortion: 7,
      fatGramsPerPortion: 5
    });

    expect(portions.find((portion) => portion.macro === "carbohydrates")?.portions).toBe(4.27);
    expect(portions.find((portion) => portion.macro === "protein")?.portions).toBe(3.09);
    expect(portions.find((portion) => portion.macro === "fat")?.portions).toBe(2.6);
  });

  it("calculates equivalent grams from a nutrient target and refuses missing or zero data", () => {
    expect(
      calculateEquivalentQuantity(bread, {
        nutrientCode: "carbohydrates",
        amount: 10,
        unit: "g"
      })
    ).toMatchObject({ calculable: true, grams: 23.81 });

    expect(
      calculateEquivalentQuantity(bread, {
        nutrientCode: "fiber",
        amount: 5,
        unit: "g"
      })
    ).toMatchObject({ calculable: false });

    expect(
      calculateEquivalentQuantity(egg, {
        nutrientCode: "fiber",
        amount: 5,
        unit: "g"
      })
    ).toMatchObject({ calculable: false });
  });

  it("calculates recipe totals, per-serving values and per-100g values", () => {
    const recipe = calculateRecipeNutrition({
      name: "Tosta",
      ingredients: [
        { food: bread, quantity: { kind: "grams", grams: 80 } },
        { food: egg, quantity: { kind: "servings", servings: 2, gramsPerServing: 50 } }
      ],
      servings: 2,
      yieldGrams: 170
    });

    expect(getNutrient(recipe.total, "energy_kcal")?.amount).toBe(335);
    expect(getNutrient(recipe.perServing!, "protein")?.amount).toBe(9.9);
    expect(getNutrient(recipe.per100g!, "carbohydrates")?.amount).toBe(20.18);
    expect(getNutrient(recipe.total, "fiber")?.amount).toBeNull();
  });

  it("normalizes BEDCA-like foods into the nutrition engine shape", () => {
    const food = createNutritionFoodFromBedca({
      bedcaId: "2544",
      name: "Aceite de oliva",
      nutrients: [
        { code: "energy_kcal", amountPer100g: 888, trace: false },
        { code: "protein", amountPer100g: 0, trace: true },
        { code: "vitamin_a", amountPer100g: null, trace: false }
      ]
    });

    expect(food.id).toBe("bedca:2544");
    expect(food.nutrients.find((nutrient) => nutrient.code === "energy_kcal")?.unit).toBe("kcal");
    expect(food.nutrients.find((nutrient) => nutrient.code === "vitamin_a")?.dataKind).toBe(
      "unknown"
    );
  });

  it("requires density before converting milliliters into gram-based foods", () => {
    const withoutDensity = calculateFoodItem(bread, { kind: "milliliters", milliliters: 100 });
    const withDensity = calculateFoodItem(bread, {
      kind: "milliliters",
      milliliters: 100,
      densityGramsPerMilliliter: 0.5
    });

    expect(withoutDensity.issues[0]?.code).toBe("density_required");
    expect(
      getNutrient({ nutrients: withDensity.nutrients, coverageRatio: 1, issues: [] }, "energy_kcal")
        ?.amount
    ).toBe(120);
  });
});
