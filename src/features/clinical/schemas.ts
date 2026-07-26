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

const optionalMeasurementValue = z
  .string()
  .trim()
  .max(20)
  .optional()
  .or(z.literal(""))
  .or(z.number().positive());

export const anthropometryWorkflowSchema = z.object({
  clientId: z.string().uuid(),
  sessionId: z.string().uuid().optional().or(z.literal("")),
  consultationId: z.string().uuid().optional().or(z.literal("")),
  measuredAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  protocolSlug: z.string().trim().min(2).max(120).default("compatible_isak_restricted_v0"),
  anthropometristName: optionalText(160),
  accreditationLevel: optionalText(120),
  accreditationNumber: optionalText(120),
  center: optionalText(160),
  conditions: optionalText(1000),
  fastingState: optionalText(300),
  previousExercise: optionalText(300),
  declaredHydration: optionalText(300),
  laterality: z.enum(["right", "left", "mixed"]).default("right"),
  instrument: optionalText(1000),
  instrumentBrand: optionalText(160),
  instrumentModel: optionalText(160),
  instrumentSerialNumber: optionalText(160),
  instrumentPrecision: optionalText(120),
  instrumentCalibratedAt: z.string().date().optional().or(z.literal("")),
  calibrationNotes: optionalText(1000),
  consentConfirmed: z.coerce.boolean().default(false),
  observations: optionalText(2000),
  clientCanViewWeight: z.coerce.boolean().default(false),
  clientCanViewBmi: z.coerce.boolean().default(false),
  clientCanViewWaist: z.coerce.boolean().default(false),
  mode: z.enum(["draft", "finalize"]).default("draft"),
  measurements: z.record(
    z.string(),
    z.object({
      firstValue: optionalMeasurementValue,
      secondValue: optionalMeasurementValue,
      thirdValue: optionalMeasurementValue,
      observations: optionalText(500)
    })
  )
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export type ConsultationInput = z.infer<typeof consultationSchema>;
export type AnthropometryInput = z.infer<typeof anthropometrySchema>;
export type AnthropometryWorkflowInput = z.infer<typeof anthropometryWorkflowSchema>;
