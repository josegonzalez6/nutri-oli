import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";
import readXlsxFile from "read-excel-file/node";

import {
  mapBedcaRow,
  normalizeBedcaWorkbookRows,
  nutrientDefinitions,
  rowsToObjects,
  safeSpreadsheetText,
  summarizeBedcaImport,
  type BedcaFood
} from "../src/features/foods/bedca";

type PreviewFood = {
  bedcaId: string;
  name: string;
  category: string | null;
  energyKcalPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  source: "BEDCA";
};

const cliSourcePath = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const cliDatabaseUrl = process.argv
  .slice(2)
  .find((argument) => argument.startsWith("--database-url="))
  ?.replace("--database-url=", "");

const sourcePath =
  cliSourcePath ?? process.env.BEDCA_SOURCE_PATH ?? path.resolve("data/imports/bedca.xlsx");
const generatedPath = path.resolve("data/generated/bedca-foods.json");
const databaseUrl = cliDatabaseUrl ?? process.env.NUTRI_OLI_DATABASE_URL;

async function main() {
  const workbookRows = await readXlsxFile(path.resolve(sourcePath));
  const rows = rowsToObjects(normalizeBedcaWorkbookRows(workbookRows as unknown));
  const foods = rows
    .map((row, index) => mapBedcaRow(row, index + 2))
    .filter((food) => food !== null);
  const summary = summarizeBedcaImport(rows);

  await writePreviewIndex(foods);

  if (databaseUrl) {
    await importIntoDatabase(foods);
  }

  console.log(
    JSON.stringify(
      {
        sourcePath,
        generatedPath,
        databaseImported: Boolean(databaseUrl),
        rowsRead: summary.rowsRead,
        validFoods: summary.validFoods,
        skipped: summary.skipped,
        problemFields: summary.problemFields
      },
      null,
      2
    )
  );
}

async function writePreviewIndex(foods: BedcaFood[]) {
  await fs.mkdir(path.dirname(generatedPath), { recursive: true });
  const previewFoods = foods.map(toPreviewFood);
  await fs.writeFile(
    generatedPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "BEDCA",
        foods: previewFoods
      },
      null,
      2
    )}\n`
  );
}

async function importIntoDatabase(foods: BedcaFood[]) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("begin");

    const sourceResult = await client.query<{ id: string }>(
      `insert into public.food_sources
        (name, slug, citation, license_name, license_url, license_status, imported_at)
       values
        ($1, $2, $3, $4, $5, $6, now())
       on conflict (slug) do update set
        imported_at = excluded.imported_at,
        updated_at = now()
       returning id`,
      [
        "Base de Datos Espanola de Composicion de Alimentos",
        "bedca",
        "BEDCA local import. License status must be reviewed before production use.",
        null,
        null,
        "pending_review"
      ]
    );
    const sourceId = sourceResult.rows[0]?.id;

    if (!sourceId) {
      throw new Error("Could not upsert BEDCA food source.");
    }

    const nutrientIds = new Map<string, string>();

    for (const [displayOrder, nutrient] of nutrientDefinitions.entries()) {
      const result = await client.query<{ id: string }>(
        `insert into public.nutrients (code, name, unit, category, display_order)
         values ($1, $2, $3, $4, $5)
         on conflict (code) do update set
          name = excluded.name,
          unit = excluded.unit,
          category = excluded.category,
          display_order = excluded.display_order,
          updated_at = now()
         returning id`,
        [nutrient.code, nutrient.name, nutrient.unit, nutrient.category, displayOrder]
      );
      const nutrientId = result.rows[0]?.id;

      if (nutrientId) {
        nutrientIds.set(nutrient.code, nutrientId);
      }
    }

    for (const food of foods) {
      const foodResult = await client.query<{ id: string }>(
        `insert into public.foods
          (organization_id, source_id, external_id, name, normalized_name, category, normalized_category, verified, raw_data)
         values
          (null, $1, $2, $3, $4, $5, $6, true, $7::jsonb)
         on conflict (source_id, external_id) do update set
          name = excluded.name,
          normalized_name = excluded.normalized_name,
          category = excluded.category,
          normalized_category = excluded.normalized_category,
          verified = true,
          raw_data = excluded.raw_data,
          updated_at = now()
         returning id`,
        [
          sourceId,
          food.bedcaId,
          food.name,
          food.normalizedName,
          food.category,
          food.normalizedCategory,
          JSON.stringify(food.rawData)
        ]
      );
      const foodId = foodResult.rows[0]?.id;

      if (!foodId) {
        continue;
      }

      for (const nutrient of food.nutrients) {
        if (nutrient.amountPer100g === null && nutrient.sourceValue === null) {
          continue;
        }

        const nutrientId = nutrientIds.get(nutrient.code);

        if (!nutrientId) {
          continue;
        }

        await client.query(
          `insert into public.food_nutrients
            (food_id, nutrient_id, amount_per_100g, trace, source_value)
           values
            ($1, $2, $3, $4, $5)
           on conflict (food_id, nutrient_id) do update set
            amount_per_100g = excluded.amount_per_100g,
            trace = excluded.trace,
            source_value = excluded.source_value,
            updated_at = now()`,
          [foodId, nutrientId, nutrient.amountPer100g, nutrient.trace, nutrient.sourceValue]
        );
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

function toPreviewFood(food: BedcaFood): PreviewFood {
  const nutrient = (code: string) =>
    food.nutrients.find((item) => item.code === code)?.amountPer100g ?? null;

  return {
    bedcaId: safeSpreadsheetText(food.bedcaId),
    name: safeSpreadsheetText(food.name),
    category: food.category ? safeSpreadsheetText(food.category) : null,
    energyKcalPer100g: nutrient("energy_kcal"),
    proteinPer100g: nutrient("protein"),
    carbsPer100g: nutrient("carbohydrates"),
    fatPer100g: nutrient("fat"),
    fiberPer100g: nutrient("fiber"),
    source: "BEDCA"
  };
}

void main();
