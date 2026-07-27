import { z } from "zod";

const optionalText = (max = 1000) => z.string().trim().max(max).optional().or(z.literal(""));
const positiveNumber = z.coerce.number().positive();
const nonNegativeOptionalNumber = z.coerce.number().nonnegative().optional().or(z.literal(""));

export const createMacroPortionSystemSchema = z.object({
  name: z.string().trim().min(2).max(140),
  carbohydrateGrams: positiveNumber,
  proteinGrams: positiveNumber,
  fatGrams: positiveNumber,
  fiberGrams: positiveNumber.optional().or(z.literal("")),
  source: optionalText(500)
});

export const createExchangeGroupSchema = z.object({
  name: z.string().trim().min(2).max(140),
  nutrientBasis: z.enum(["energy_kcal", "carbohydrate", "protein", "fat", "fiber"]),
  targetAmount: positiveNumber,
  targetUnit: z.enum(["kcal", "g"]),
  tolerancePercent: z.coerce.number().positive().max(50),
  source: optionalText(500)
});

export const createExchangeItemSchema = z.object({
  groupId: z.string().uuid(),
  foodName: z.string().trim().min(1).max(240),
  grams: positiveNumber,
  householdMeasure: optionalText(160),
  energyKcal: nonNegativeOptionalNumber,
  proteinG: nonNegativeOptionalNumber,
  carbohydrateG: nonNegativeOptionalNumber,
  fatG: nonNegativeOptionalNumber,
  fiberG: nonNegativeOptionalNumber,
  notes: optionalText(700)
});

export const createMealMacroTargetSchema = z.object({
  macroPortionSystemId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  mealLabel: z.string().trim().min(2).max(80),
  carbohydratePortions: z.coerce.number().nonnegative(),
  proteinPortions: z.coerce.number().nonnegative(),
  fatPortions: z.coerce.number().nonnegative(),
  tolerancePercent: z.coerce.number().positive().max(50)
});

export type CreateMacroPortionSystemInput = z.infer<typeof createMacroPortionSystemSchema>;
export type CreateExchangeGroupInput = z.infer<typeof createExchangeGroupSchema>;
export type CreateExchangeItemInput = z.infer<typeof createExchangeItemSchema>;
export type CreateMealMacroTargetInput = z.infer<typeof createMealMacroTargetSchema>;
