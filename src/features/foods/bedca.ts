export const traceAmount = 0;

export type BedcaProblem = {
  row: number;
  column: string;
  value: unknown;
  reason:
    "required-field-missing" | "spreadsheet-error" | "invalid-number" | "unsafe-spreadsheet-text";
};

export type BedcaRow = Record<string, unknown>;

export type BedcaWorkbookSheet = {
  sheet: string;
  data: unknown[][];
};

export type NutrientDefinition = {
  code: string;
  name: string;
  unit: "g" | "mg" | "ug" | "kcal" | "kJ";
  category: "energy" | "macronutrient" | "fatty_acid" | "vitamin" | "mineral";
  bedcaColumn: string;
};

export type BedcaFood = {
  bedcaId: string;
  name: string;
  normalizedName: string;
  category: string | null;
  normalizedCategory: string | null;
  rawData: BedcaRow;
  nutrients: Array<{
    code: string;
    amountPer100g: number | null;
    trace: boolean;
    sourceValue: string | null;
  }>;
  problems: BedcaProblem[];
};

export const nutrientDefinitions: NutrientDefinition[] = [
  {
    code: "energy_kj",
    name: "Energia",
    unit: "kJ",
    category: "energy",
    bedcaColumn: "Energía (kJ)"
  },
  {
    code: "energy_kcal",
    name: "Energia",
    unit: "kcal",
    category: "energy",
    bedcaColumn: "Energía (kcal)"
  },
  {
    code: "fat",
    name: "Lipidos",
    unit: "g",
    category: "macronutrient",
    bedcaColumn: "Lípidos (g)"
  },
  {
    code: "protein",
    name: "Proteina",
    unit: "g",
    category: "macronutrient",
    bedcaColumn: "Proteina (g)"
  },
  {
    code: "water",
    name: "Agua",
    unit: "g",
    category: "macronutrient",
    bedcaColumn: "Agua (humedad) (g)"
  },
  {
    code: "fiber",
    name: "Fibra dietetica",
    unit: "g",
    category: "macronutrient",
    bedcaColumn: "Fibra, dietetica (g)"
  },
  {
    code: "carbohydrates",
    name: "Carbohidratos",
    unit: "g",
    category: "macronutrient",
    bedcaColumn: "Carbohidratos (g)"
  },
  {
    code: "alcohol",
    name: "Alcohol",
    unit: "g",
    category: "macronutrient",
    bedcaColumn: "Alcohol (etanol) (g)"
  },
  {
    code: "mufa",
    name: "Acidos grasos monoinsaturados",
    unit: "g",
    category: "fatty_acid",
    bedcaColumn: "AGMI (g)"
  },
  {
    code: "pufa",
    name: "Acidos grasos poliinsaturados",
    unit: "g",
    category: "fatty_acid",
    bedcaColumn: "AGPI (g)"
  },
  {
    code: "sfa",
    name: "Acidos grasos saturados",
    unit: "g",
    category: "fatty_acid",
    bedcaColumn: "AGS (g)"
  },
  {
    code: "cholesterol",
    name: "Colesterol",
    unit: "mg",
    category: "fatty_acid",
    bedcaColumn: "Colesterol (mg)"
  },
  {
    code: "vitamin_a",
    name: "Vitamina A",
    unit: "ug",
    category: "vitamin",
    bedcaColumn: "Vitamina A (ug)"
  },
  {
    code: "vitamin_d",
    name: "Vitamina D",
    unit: "ug",
    category: "vitamin",
    bedcaColumn: "Vitamina D (ug)"
  },
  {
    code: "vitamin_e",
    name: "Vitamina E",
    unit: "mg",
    category: "vitamin",
    bedcaColumn: "Viamina E (mg)"
  },
  {
    code: "folate",
    name: "Folato total",
    unit: "ug",
    category: "vitamin",
    bedcaColumn: "folato, total (ug)"
  },
  {
    code: "vitamin_b1",
    name: "Vitamina B1",
    unit: "mg",
    category: "vitamin",
    bedcaColumn: "Vitamina B1 (tiamina) (mg)"
  },
  {
    code: "vitamin_b2",
    name: "Vitamina B2",
    unit: "mg",
    category: "vitamin",
    bedcaColumn: "Vitamina B2 (riboflavina) (mg)"
  },
  {
    code: "vitamin_b3",
    name: "Vitamina B3",
    unit: "mg",
    category: "vitamin",
    bedcaColumn: "Vitamina B3 (niacina) (mg)"
  },
  {
    code: "vitamin_b6",
    name: "Vitamina B6",
    unit: "mg",
    category: "vitamin",
    bedcaColumn: "Vitamina B-6, Total (mg)"
  },
  {
    code: "vitamin_b12",
    name: "Vitamina B12",
    unit: "ug",
    category: "vitamin",
    bedcaColumn: "Vitamina B-12 (ug)"
  },
  {
    code: "vitamin_c",
    name: "Vitamina C",
    unit: "mg",
    category: "vitamin",
    bedcaColumn: "Vitamina C (ácido ascórbico) (mg)"
  },
  { code: "calcium", name: "Calcio", unit: "mg", category: "mineral", bedcaColumn: "calcio (mg)" },
  {
    code: "iron",
    name: "Hierro total",
    unit: "mg",
    category: "mineral",
    bedcaColumn: "hierro, total (mg)"
  },
  {
    code: "potassium",
    name: "Potasio",
    unit: "mg",
    category: "mineral",
    bedcaColumn: "potasio (mg)"
  },
  {
    code: "magnesium",
    name: "Magnesio",
    unit: "mg",
    category: "mineral",
    bedcaColumn: "magnesio (mg)"
  },
  { code: "sodium", name: "Sodio", unit: "mg", category: "mineral", bedcaColumn: "sodio (mg)" },
  {
    code: "phosphorus",
    name: "Fosforo",
    unit: "mg",
    category: "mineral",
    bedcaColumn: "fósforo (mg)"
  },
  { code: "iodine", name: "Ioduro", unit: "ug", category: "mineral", bedcaColumn: "ioduro (ug)" },
  {
    code: "selenium",
    name: "Selenio total",
    unit: "ug",
    category: "mineral",
    bedcaColumn: "selenio, total (ug)"
  },
  { code: "zinc", name: "Zinc", unit: "mg", category: "mineral", bedcaColumn: "zinc (cinc) (mg)" }
];

export function normalizeFoodText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function hasSpreadsheetFormulaPrefix(value: string): boolean {
  return /^[=+\-@\t\r]/.test(value.trimStart());
}

export function safeSpreadsheetText(value: string): string {
  return hasSpreadsheetFormulaPrefix(value) ? `'${value}` : value;
}

export function parseBedcaAmount(
  value: unknown,
  row = 0,
  column = ""
): { amount: number | null; trace: boolean; problem?: BedcaProblem; sourceValue: string | null } {
  if (value === null || value === undefined || value === "") {
    return { amount: null, trace: false, sourceValue: null };
  }

  const sourceValue = String(value).trim();
  if (!sourceValue) {
    return { amount: null, trace: false, sourceValue: null };
  }

  if (/^#(NAME|VALUE|DIV\/0|N\/A|REF|NUM|NULL)!?\??$/i.test(sourceValue)) {
    return {
      amount: null,
      trace: false,
      sourceValue,
      problem: { row, column, value, reason: "spreadsheet-error" }
    };
  }

  if (/^traza$/i.test(sourceValue) || /^trace?s?$/i.test(sourceValue)) {
    return { amount: traceAmount, trace: true, sourceValue };
  }

  const parsed = Number(sourceValue.replace(/\s/g, "").replace(",", "."));
  if (Number.isFinite(parsed)) {
    return { amount: parsed, trace: false, sourceValue };
  }

  return {
    amount: null,
    trace: false,
    sourceValue,
    problem: { row, column, value, reason: "invalid-number" }
  };
}

export function validateBedcaRow(row: BedcaRow, rowNumber = 0): BedcaProblem[] {
  const problems: BedcaProblem[] = [];
  const id = String(row.ID ?? "").trim();
  const name = String(row.Alimento ?? "").trim();
  const category = String(row["Categoría"] ?? "").trim();

  if (!id) {
    problems.push({
      row: rowNumber,
      column: "ID",
      value: row.ID,
      reason: "required-field-missing"
    });
  }

  if (!name) {
    problems.push({
      row: rowNumber,
      column: "Alimento",
      value: row.Alimento,
      reason: "required-field-missing"
    });
  }

  for (const [column, value] of [
    ["Alimento", name],
    ["Categoría", category]
  ] as const) {
    if (value && hasSpreadsheetFormulaPrefix(value)) {
      problems.push({ row: rowNumber, column, value, reason: "unsafe-spreadsheet-text" });
    }
  }

  return problems;
}

export function mapBedcaRow(row: BedcaRow, rowNumber = 0): BedcaFood | null {
  const problems = validateBedcaRow(row, rowNumber);
  const requiredFailure = problems.some((problem) => problem.reason === "required-field-missing");

  if (requiredFailure) {
    return null;
  }

  const name = String(row.Alimento ?? "").trim();
  const category = String(row["Categoría"] ?? "").trim() || null;
  const nutrients = nutrientDefinitions.map((definition) => {
    const parsed = parseBedcaAmount(row[definition.bedcaColumn], rowNumber, definition.bedcaColumn);

    if (parsed.problem) {
      problems.push(parsed.problem);
    }

    return {
      code: definition.code,
      amountPer100g: parsed.amount,
      trace: parsed.trace,
      sourceValue: parsed.sourceValue
    };
  });

  return {
    bedcaId: String(row.ID ?? "").trim(),
    name,
    normalizedName: normalizeFoodText(name),
    category,
    normalizedCategory: category ? normalizeFoodText(category) : null,
    rawData: row,
    nutrients,
    problems
  };
}

export function rowsToObjects(rows: unknown[][]): BedcaRow[] {
  const headers = rows[0]?.map((header) => String(header ?? "").trim()) ?? [];

  return rows.slice(1).map((row) =>
    headers.reduce<BedcaRow>((acc, header, index) => {
      if (header) {
        acc[header] = row[index] ?? null;
      }

      return acc;
    }, {})
  );
}

export function normalizeBedcaWorkbookRows(workbookRows: unknown): unknown[][] {
  if (!Array.isArray(workbookRows)) {
    throw new Error("BEDCA workbook result is not an array.");
  }

  const first = workbookRows[0];

  if (isBedcaWorkbookSheet(first)) {
    return first.data;
  }

  if (isWorksheetRows(workbookRows)) {
    return workbookRows;
  }

  throw new Error("BEDCA workbook shape is not supported.");
}

function isBedcaWorkbookSheet(value: unknown): value is BedcaWorkbookSheet {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  );
}

function isWorksheetRows(value: unknown[]): value is unknown[][] {
  return value.every((row) => Array.isArray(row));
}

export function summarizeBedcaImport(rows: BedcaRow[]) {
  const foods = rows
    .map((row, index) => mapBedcaRow(row, index + 2))
    .filter((food) => food !== null);
  const problems = foods.flatMap((food) => food.problems);
  const skipped = rows.length - foods.length;

  return {
    rowsRead: rows.length,
    validFoods: foods.length,
    skipped,
    problems,
    problemFields: problems.reduce<Record<string, number>>((acc, problem) => {
      const key = `${problem.column}:${problem.reason}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  };
}
