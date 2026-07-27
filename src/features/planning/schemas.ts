import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().nonnegative().optional()
);

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional()
);

const positiveNumber = z.coerce.number().positive();

export const createRecipeSchema = z.object({
  name: z.string().trim().min(2).max(160),
  summary: optionalText,
  servings: positiveNumber.default(1),
  yieldGrams: optionalPositiveNumber,
  prepTimeMinutes: optionalNumber,
  dietaryPattern: optionalText,
  tags: optionalText,
  allergens: optionalText,
  instructions: optionalText
});

export const createRecipeIngredientSchema = z.object({
  recipeId: z.uuid(),
  foodName: z.string().trim().min(2).max(180),
  grams: positiveNumber,
  householdMeasure: optionalText,
  energyKcal: optionalNumber,
  proteinG: optionalNumber,
  carbohydrateG: optionalNumber,
  fatG: optionalNumber,
  fiberG: optionalNumber,
  notes: optionalText
});

export const createDietPlanSchema = z.object({
  clientId: z.uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2).max(180),
  kind: z
    .enum([
      "weekly_menu",
      "typical_day",
      "macro_portions",
      "exchanges",
      "open_guidance",
      "plate_method",
      "mixed"
    ])
    .default("weekly_menu"),
  startsOn: z.string().optional(),
  endsOn: z.string().optional(),
  notes: optionalText
});

export const createDietPlanMealSchema = z.object({
  planId: z.uuid(),
  dayIndex: z.coerce.number().int().min(1).max(14),
  mealLabel: z.string().trim().min(2).max(80),
  scheduledTime: z.string().optional(),
  notes: optionalText
});

export const createDietPlanItemSchema = z.object({
  mealId: z.uuid(),
  itemType: z.enum(["food", "recipe", "free_text"]).default("food"),
  recipeId: z.uuid().optional().or(z.literal("")),
  foodName: z.string().trim().min(2).max(180),
  grams: optionalPositiveNumber,
  householdMeasure: optionalText,
  energyKcal: optionalNumber,
  proteinG: optionalNumber,
  carbohydrateG: optionalNumber,
  fatG: optionalNumber,
  fiberG: optionalNumber,
  notes: optionalText
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type CreateRecipeIngredientInput = z.infer<typeof createRecipeIngredientSchema>;
export type CreateDietPlanInput = z.infer<typeof createDietPlanSchema>;
export type CreateDietPlanMealInput = z.infer<typeof createDietPlanMealSchema>;
export type CreateDietPlanItemInput = z.infer<typeof createDietPlanItemSchema>;
