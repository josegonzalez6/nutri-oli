import { z } from "zod";

const positiveDecimal = z.number().finite().positive();

export const bmiInputSchema = z.object({
  weightKg: positiveDecimal,
  heightCm: positiveDecimal
});

export type BmiInput = z.infer<typeof bmiInputSchema>;

export function calculateBmi(input: BmiInput): number {
  const { weightKg, heightCm } = bmiInputSchema.parse(input);
  const heightM = heightCm / 100;

  return roundToPrecision(weightKg / (heightM * heightM), 1);
}

export const waistToHeightInputSchema = z.object({
  waistCm: positiveDecimal,
  heightCm: positiveDecimal
});

export type WaistToHeightInput = z.infer<typeof waistToHeightInputSchema>;

export function calculateWaistToHeightRatio(input: WaistToHeightInput): number {
  const { waistCm, heightCm } = waistToHeightInputSchema.parse(input);

  return roundToPrecision(waistCm / heightCm, 2);
}

function roundToPrecision(value: number, precision: number): number {
  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
}
