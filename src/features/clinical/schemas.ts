import { z } from "zod";

const optionalText = (max = 2000) => z.string().trim().max(max).optional().or(z.literal(""));
const optionalNumber = z.coerce.number().positive().optional().or(z.literal(""));

export const intakeSchema = z.object({
  clientId: z.string().uuid(),
  motive: optionalText(1200),
  objectives: optionalText(1200),
  expectations: optionalText(1200),
  personalHistory: optionalText(2000),
  familyHistory: optionalText(2000),
  diagnosedConditions: optionalText(2000),
  allergies: optionalText(1200),
  intolerances: optionalText(1200),
  medication: optionalText(1200),
  supplements: optionalText(1200),
  digestiveSymptoms: optionalText(1200),
  bowelMovements: optionalText(1200),
  weightHistory: optionalText(1200),
  previousDiets: optionalText(1200),
  foodRelationship: optionalText(1200),
  recall24h: optionalText(2000),
  consumptionFrequency: optionalText(2000),
  preferences: optionalText(1200),
  aversions: optionalText(1200),
  restrictions: optionalText(1200),
  schedule: optionalText(1200),
  cookingCapacity: optionalText(1200),
  budget: optionalText(600),
  work: optionalText(800),
  household: optionalText(800),
  sleep: optionalText(800),
  stress: optionalText(800),
  hydration: optionalText(800),
  alcohol: optionalText(800),
  tobacco: optionalText(800),
  physicalActivity: optionalText(1200),
  training: optionalText(1200),
  menstrualHealth: optionalText(1200),
  barriers: optionalText(1200),
  motivation: optionalText(1200),
  professionalNote: optionalText(2000)
});

export const consultationSchema = z.object({
  clientId: z.string().uuid(),
  consultationId: z.string().uuid().optional().or(z.literal("")),
  consultationType: z.enum(["first_visit", "follow_up"]).default("first_visit"),
  reason: optionalText(1200),
  evolution: optionalText(2000),
  adherence: optionalText(1200),
  difficulties: optionalText(1200),
  symptoms: optionalText(1200),
  objectives: optionalText(1200),
  intervention: optionalText(2000),
  recommendations: optionalText(2000),
  tasks: optionalText(1200),
  nextReviewAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  privateNote: optionalText(3000),
  sharedSummary: optionalText(3000),
  assessment: optionalText(2000),
  nutritionDiagnosis: optionalText(2000),
  interventionPlan: optionalText(2000),
  monitoringPlan: optionalText(2000),
  pesStatement: optionalText(2000),
  mode: z.enum(["draft", "finalize"]).default("draft")
});

export const anthropometrySchema = z.object({
  clientId: z.string().uuid(),
  consultationId: z.string().uuid().optional().or(z.literal("")),
  measuredAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  protocol: z.string().trim().min(2).max(120).default("custom"),
  conditions: optionalText(1000),
  instrument: optionalText(1000),
  calibrationNotes: optionalText(1000),
  massKg: optionalNumber,
  heightCm: optionalNumber,
  sittingHeightCm: optionalNumber,
  wingspanCm: optionalNumber,
  waistCm: optionalNumber,
  hipCm: optionalNumber,
  tricepsMm: optionalNumber,
  subscapularMm: optionalNumber,
  abdominalMm: optionalNumber,
  thighMm: optionalNumber,
  observations: optionalText(2000),
  clientCanViewWeight: z.coerce.boolean().default(false),
  clientCanViewBmi: z.coerce.boolean().default(false),
  clientCanViewWaist: z.coerce.boolean().default(false)
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export type ConsultationInput = z.infer<typeof consultationSchema>;
export type AnthropometryInput = z.infer<typeof anthropometrySchema>;
