import { describe, expect, it } from "vitest";

import {
  hasSpreadsheetFormulaPrefix,
  mapBedcaRow,
  normalizeBedcaWorkbookRows,
  normalizeFoodText,
  parseBedcaAmount,
  rowsToObjects,
  safeSpreadsheetText,
  summarizeBedcaImport,
  traceAmount
} from "./bedca";

describe("BEDCA parser", () => {
  it("normalizes food text for accent-insensitive search", () => {
    expect(normalizeFoodText("Aceite de oliva virgen extra")).toBe("aceite de oliva virgen extra");
    expect(normalizeFoodText("Arròs BLANC, cuit")).toBe("arros blanc cuit");
  });

  it("parses decimal commas, traces and spreadsheet errors", () => {
    expect(parseBedcaAmount("12,5").amount).toBe(12.5);
    expect(parseBedcaAmount("traza").amount).toBe(traceAmount);
    expect(parseBedcaAmount("traza").trace).toBe(true);
    expect(parseBedcaAmount("").amount).toBeNull();
    expect(parseBedcaAmount("#DIV/0!").problem?.reason).toBe("spreadsheet-error");
  });

  it("maps a BEDCA row into a food with nutrient values", () => {
    const food = mapBedcaRow(
      {
        ID: "2544",
        Categoría: "Grasas y aceites",
        Alimento: "Aceite de oliva virgen extra",
        "Energía (kcal)": "888",
        "Proteina (g)": "traza"
      },
      2
    );

    expect(food?.normalizedName).toBe("aceite de oliva virgen extra");
    expect(food?.nutrients.find((nutrient) => nutrient.code === "energy_kcal")?.amountPer100g).toBe(
      888
    );
    expect(food?.nutrients.find((nutrient) => nutrient.code === "protein")?.trace).toBe(true);
  });

  it("rejects required-field failures and flags spreadsheet formula prefixes", () => {
    expect(mapBedcaRow({ ID: "", Alimento: "" }, 2)).toBeNull();
    const unsafe = mapBedcaRow({ ID: "1", Alimento: "=cmd", Categoría: "Test" }, 2);
    expect(unsafe?.problems[0]?.reason).toBe("unsafe-spreadsheet-text");
    expect(hasSpreadsheetFormulaPrefix("@bad")).toBe(true);
    expect(safeSpreadsheetText("+bad")).toBe("'+bad");
  });

  it("converts worksheet rows to objects and summarizes imports", () => {
    const rows = rowsToObjects([
      ["ID", "Alimento", "Energía (kcal)"],
      ["1", "Poma", "52"],
      ["", "", ""]
    ]);

    const summary = summarizeBedcaImport(rows);
    expect(summary.rowsRead).toBe(2);
    expect(summary.validFoods).toBe(1);
    expect(summary.skipped).toBe(1);
  });

  it("normalizes worksheet and workbook-shaped rows", () => {
    const worksheet = [["ID", "Alimento"]];
    const workbook = [{ sheet: "Hoja1", data: worksheet }];

    expect(normalizeBedcaWorkbookRows(worksheet)).toEqual(worksheet);
    expect(normalizeBedcaWorkbookRows(workbook)).toEqual(worksheet);
  });
});
