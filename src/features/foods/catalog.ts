import fs from "node:fs/promises";
import path from "node:path";

export type CatalogFood = {
  bedcaId: string;
  name: string;
  category: string | null;
  energyKcalPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  source: string;
};

type GeneratedCatalog = {
  generatedAt: string;
  source: string;
  foods: CatalogFood[];
};

const generatedCatalogPath = path.resolve("data/generated/bedca-foods.json");

export async function loadFoodCatalog(): Promise<{
  foods: CatalogFood[];
  generatedAt: string | null;
  source: string;
}> {
  try {
    const file = await fs.readFile(generatedCatalogPath, "utf8");
    const parsed = JSON.parse(file) as GeneratedCatalog;

    return {
      foods: parsed.foods,
      generatedAt: parsed.generatedAt,
      source: parsed.source
    };
  } catch {
    return {
      foods: fallbackFoods,
      generatedAt: null,
      source: "demo"
    };
  }
}

const fallbackFoods: CatalogFood[] = [
  {
    bedcaId: "DEMO-OLI-1",
    name: "Aceite de oliva virgen extra",
    category: "Grasas y aceites",
    energyKcalPer100g: 888,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 100,
    fiberPer100g: 0,
    source: "demo"
  },
  {
    bedcaId: "DEMO-LEG-1",
    name: "Lenteja cocida",
    category: "Legumbres",
    energyKcalPer100g: 116,
    proteinPer100g: 9,
    carbsPer100g: 20,
    fatPer100g: 0.4,
    fiberPer100g: 7.9,
    source: "demo"
  },
  {
    bedcaId: "DEMO-FRU-1",
    name: "Manzana",
    category: "Frutas y derivados",
    energyKcalPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 14,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
    source: "demo"
  }
];
