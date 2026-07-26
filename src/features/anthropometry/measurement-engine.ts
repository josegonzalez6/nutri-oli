export type MeasurementCategory = "basic" | "skinfold" | "girth" | "breadth" | "length" | "other";

export type MeasurementStatus =
  | "pending"
  | "first_recorded"
  | "within_tolerance"
  | "third_required"
  | "completed"
  | "requires_review"
  | "implausible";

export type MeasurementDefinition = {
  slug: string;
  name: string;
  abbreviation: string;
  category: MeasurementCategory;
  unit: "kg" | "cm" | "mm";
  precisionDigits: number;
  plausibleMin: number;
  plausibleMax: number;
  toleranceRelativePercent: number;
  evidenceStatus: string;
};

export type MeasurementInput = {
  definition: MeasurementDefinition;
  firstValue?: string | number | null;
  secondValue?: string | number | null;
  thirdValue?: string | number | null;
};

export type MeasurementEvaluation = {
  status: MeasurementStatus;
  firstValue: number | null;
  secondValue: number | null;
  thirdValue: number | null;
  absoluteDiff: number | null;
  relativeDiffPercent: number | null;
  finalValue: number | null;
  notCalculableReason: string | null;
  plausibleWarning: string | null;
};

export type CalculationResult =
  | {
      status: "calculable";
      value: number;
    }
  | {
      status: "not_calculable";
      reason: string;
    };

export const ANTHROPOMETRY_MEASUREMENT_DEFINITIONS: MeasurementDefinition[] = [
  definition("mass_body", "Masa corporal", "MC", "basic", "kg", 1, 2, 400, 1),
  definition("height_standing", "Talla", "T", "basic", "cm", 1, 30, 260, 1),
  definition("triceps_skinfold", "Pliegue tricipital", "TRI", "skinfold", "mm", 1, 1, 100, 5),
  definition("subscapular_skinfold", "Pliegue subescapular", "SUB", "skinfold", "mm", 1, 1, 100, 5),
  definition("biceps_skinfold", "Pliegue bicipital", "BIC", "skinfold", "mm", 1, 1, 100, 5),
  definition("iliac_crest_skinfold", "Pliegue cresta iliaca", "CI", "skinfold", "mm", 1, 1, 120, 5),
  definition(
    "supraspinale_skinfold",
    "Pliegue supraespinal",
    "SPE",
    "skinfold",
    "mm",
    1,
    1,
    120,
    5
  ),
  definition("abdominal_skinfold", "Pliegue abdominal", "ABD", "skinfold", "mm", 1, 1, 120, 5),
  definition(
    "anterior_thigh_skinfold",
    "Pliegue muslo anterior",
    "MA",
    "skinfold",
    "mm",
    1,
    1,
    120,
    5
  ),
  definition("medial_calf_skinfold", "Pliegue pierna medial", "PM", "skinfold", "mm", 1, 1, 100, 5),
  definition("arm_relaxed_girth", "Perimetro brazo relajado", "BR", "girth", "cm", 1, 5, 80, 1),
  definition("arm_flexed_girth", "Perimetro brazo flexionado", "BF", "girth", "cm", 1, 5, 90, 1),
  definition("waist_girth", "Perimetro cintura", "CIN", "girth", "cm", 1, 20, 250, 1),
  definition("hip_girth", "Perimetro cadera", "CAD", "girth", "cm", 1, 20, 250, 1),
  definition("thigh_girth", "Perimetro muslo", "MUS", "girth", "cm", 1, 10, 120, 1),
  definition("calf_girth", "Perimetro pierna", "PI", "girth", "cm", 1, 8, 80, 1),
  definition("humerus_breadth", "Diametro humero", "HUM", "breadth", "cm", 1, 2, 12, 1),
  definition("femur_breadth", "Diametro femur", "FEM", "breadth", "cm", 1, 3, 18, 1)
];

export const ANTHROPOMETRY_DEFINITION_BY_SLUG = new Map(
  ANTHROPOMETRY_MEASUREMENT_DEFINITIONS.map((item) => [item.slug, item])
);

export function evaluateMeasurement(input: MeasurementInput): MeasurementEvaluation {
  const firstValue = parseMeasurementValue(input.firstValue);
  const secondValue = parseMeasurementValue(input.secondValue);
  const thirdValue = parseMeasurementValue(input.thirdValue);
  const plausibleWarning = readPlausibleWarning(input.definition, [
    firstValue,
    secondValue,
    thirdValue
  ]);

  if (!firstValue && !secondValue && !thirdValue) {
    return baseEvaluation("pending", firstValue, secondValue, thirdValue, null, plausibleWarning);
  }

  if (firstValue && !secondValue) {
    return baseEvaluation(
      "first_recorded",
      firstValue,
      secondValue,
      thirdValue,
      "Falta la segunda medicion.",
      plausibleWarning
    );
  }

  if (!firstValue || !secondValue) {
    return baseEvaluation(
      "requires_review",
      firstValue,
      secondValue,
      thirdValue,
      "Faltan mediciones previas obligatorias.",
      plausibleWarning
    );
  }

  const absoluteDiff = roundToPrecision(Math.abs(firstValue - secondValue), 2);
  const relativeDiffPercent = calculateRelativeDifferencePercent(firstValue, secondValue);

  if (relativeDiffPercent === null) {
    return {
      ...baseEvaluation(
        "requires_review",
        firstValue,
        secondValue,
        thirdValue,
        "No calculable: los valores deben ser mayores que cero.",
        plausibleWarning
      ),
      absoluteDiff
    };
  }

  if (relativeDiffPercent <= input.definition.toleranceRelativePercent && !thirdValue) {
    return {
      status: plausibleWarning ? "implausible" : "within_tolerance",
      firstValue,
      secondValue,
      thirdValue,
      absoluteDiff,
      relativeDiffPercent,
      finalValue: roundToPrecision(
        (firstValue + secondValue) / 2,
        input.definition.precisionDigits
      ),
      notCalculableReason: null,
      plausibleWarning
    };
  }

  if (relativeDiffPercent > input.definition.toleranceRelativePercent && !thirdValue) {
    return {
      status: "third_required",
      firstValue,
      secondValue,
      thirdValue,
      absoluteDiff,
      relativeDiffPercent,
      finalValue: null,
      notCalculableReason: "Tercera medicion necesaria por discrepancia.",
      plausibleWarning
    };
  }

  const finalValue = median([firstValue, secondValue, thirdValue].filter(isNumber));

  return {
    status: plausibleWarning ? "implausible" : "completed",
    firstValue,
    secondValue,
    thirdValue,
    absoluteDiff,
    relativeDiffPercent,
    finalValue:
      finalValue === null ? null : roundToPrecision(finalValue, input.definition.precisionDigits),
    notCalculableReason: finalValue === null ? "No calculable: faltan mediciones." : null,
    plausibleWarning
  };
}

export function calculateRelativeDifferencePercent(firstValue: number, secondValue: number) {
  if (firstValue <= 0 || secondValue <= 0) {
    return null;
  }

  const average = (firstValue + secondValue) / 2;

  if (average <= 0) {
    return null;
  }

  return roundToPrecision((Math.abs(firstValue - secondValue) / average) * 100, 3);
}

export function calculateSafeBmi(
  weightKg: number | null,
  heightCm: number | null
): CalculationResult {
  if (!weightKg) {
    return { status: "not_calculable", reason: "Falta la masa corporal." };
  }

  if (!heightCm) {
    return { status: "not_calculable", reason: "Falta la talla." };
  }

  const heightM = heightCm / 100;

  if (heightM <= 0) {
    return { status: "not_calculable", reason: "La talla debe ser mayor que cero." };
  }

  return { status: "calculable", value: roundToPrecision(weightKg / (heightM * heightM), 1) };
}

export function calculateSafeWaistToHeight(
  waistCm: number | null,
  heightCm: number | null
): CalculationResult {
  if (!waistCm) {
    return { status: "not_calculable", reason: "Falta el perimetro de cintura." };
  }

  if (!heightCm) {
    return { status: "not_calculable", reason: "Falta la talla." };
  }

  if (heightCm <= 0) {
    return { status: "not_calculable", reason: "La talla debe ser mayor que cero." };
  }

  return { status: "calculable", value: roundToPrecision(waistCm / heightCm, 3) };
}

export function calculateSafeSkinfoldSum(values: Array<number | null>): CalculationResult {
  const presentValues = values.filter((value): value is number => Boolean(value));
  const missing = values.length - presentValues.length;

  if (missing > 0) {
    return {
      status: "not_calculable",
      reason: `Faltan ${missing} pliegues requeridos.`
    };
  }

  return {
    status: "calculable",
    value: roundToPrecision(
      presentValues.reduce((sum, value) => sum + value, 0),
      1
    )
  };
}

export function parseMeasurementValue(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function roundToPrecision(value: number, precision: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
}

function definition(
  slug: string,
  name: string,
  abbreviation: string,
  category: MeasurementCategory,
  unit: "kg" | "cm" | "mm",
  precisionDigits: number,
  plausibleMin: number,
  plausibleMax: number,
  toleranceRelativePercent: number
): MeasurementDefinition {
  return {
    slug,
    name,
    abbreviation,
    category,
    unit,
    precisionDigits,
    plausibleMin,
    plausibleMax,
    toleranceRelativePercent,
    evidenceStatus: "NEEDS_MANUAL_VALIDATION"
  };
}

function baseEvaluation(
  status: MeasurementStatus,
  firstValue: number | null,
  secondValue: number | null,
  thirdValue: number | null,
  notCalculableReason: string | null,
  plausibleWarning: string | null
): MeasurementEvaluation {
  return {
    status,
    firstValue,
    secondValue,
    thirdValue,
    absoluteDiff: null,
    relativeDiffPercent: null,
    finalValue: null,
    notCalculableReason,
    plausibleWarning
  };
}

function readPlausibleWarning(
  definition: MeasurementDefinition,
  values: Array<number | null>
): string | null {
  const invalid = values.find(
    (value) =>
      value !== null && (value < definition.plausibleMin || value > definition.plausibleMax)
  );

  return invalid
    ? `Valor fuera del rango tecnico plausible para ${definition.name}. Revisa unidad e instrumento.`
    : null;
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? null;
}

function isNumber(value: number | null): value is number {
  return value !== null;
}
