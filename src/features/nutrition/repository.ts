import "server-only";

import type { PoolClient } from "pg";

import { calculateExchangeFit, calculateMacroPortions } from "@/features/nutrition/macro-engine";
import type { MacroValues } from "@/features/nutrition/macro-engine";
import type {
  CreateExchangeGroupInput,
  CreateExchangeItemInput,
  CreateMacroPortionSystemInput,
  CreateMealMacroTargetInput
} from "@/features/nutrition/schemas";
import type { RepositoryResult } from "@/features/clients-agenda/repository";
import { withProfessionalTransaction } from "@/server/professional-context";
import type { ProfessionalContext } from "@/server/professional-context";

type ReadyProfessionalContext = Extract<ProfessionalContext, { status: "ready" }>;

export type MacroPortionSystemRecord = {
  id: string;
  name: string;
  carbohydrateGrams: number;
  proteinGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
  status: string;
  source: string;
};

export type MealMacroTargetRecord = {
  id: string;
  macroPortionSystemId: string;
  name: string;
  mealLabel: string;
  carbohydratePortions: number;
  proteinPortions: number;
  fatPortions: number;
  tolerancePercent: number;
};

export type ExchangeGroupRecord = {
  id: string;
  name: string;
  slug: string;
  nutrientBasis: "energy_kcal" | "carbohydrate" | "protein" | "fat" | "fiber";
  targetAmount: number;
  targetUnit: "kcal" | "g";
  tolerancePercent: number;
  status: string;
  source: string;
  items: ExchangeItemRecord[];
};

export type ExchangeItemRecord = {
  id: string;
  groupId: string;
  foodName: string;
  grams: number;
  householdMeasure: string | null;
  energyKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  calculationBasis: string;
  notes: string | null;
  fitStatus: string;
  fitDifference: number | null;
  fitDifferencePercent: number | null;
  carbohydratePortions: number | null;
  proteinPortions: number | null;
  fatPortions: number | null;
  fiberPortions: number | null;
  completenessPercent: number;
};

export type MacroExchangesWorkspace = {
  systems: MacroPortionSystemRecord[];
  mealTargets: MealMacroTargetRecord[];
  groups: ExchangeGroupRecord[];
};

type SystemRow = {
  id: string;
  name: string;
  carbohydrate_grams: string | number;
  protein_grams: string | number;
  fat_grams: string | number;
  fiber_grams: string | number | null;
  status: string;
  source: string;
};

type MealTargetRow = {
  id: string;
  macro_portion_system_id: string;
  name: string;
  meal_label: string;
  carbohydrate_portions: string | number;
  protein_portions: string | number;
  fat_portions: string | number;
  tolerance_percent: string | number;
};

type ExchangeGroupRow = {
  id: string;
  name: string;
  slug: string;
  nutrient_basis: ExchangeGroupRecord["nutrientBasis"];
  target_amount: string | number;
  target_unit: "kcal" | "g";
  tolerance_percent: string | number;
  status: string;
  source: string;
};

type ExchangeItemRow = {
  id: string;
  group_id: string;
  food_name: string;
  grams: string | number;
  household_measure: string | null;
  energy_kcal: string | number | null;
  protein_g: string | number | null;
  carbohydrate_g: string | number | null;
  fat_g: string | number | null;
  fiber_g: string | number | null;
  calculation_basis: string;
  notes: string | null;
};

export async function loadMacroExchangesWorkspace(): Promise<
  RepositoryResult<MacroExchangesWorkspace>
> {
  try {
    const result = await withProfessionalTransaction(async (client, context) => {
      const systems = await client.query<SystemRow>(
        `select id, name, carbohydrate_grams, protein_grams, fat_grams, fiber_grams, status, source
        from public.macro_portion_systems
        where organization_id = $1
        order by updated_at desc
        limit 50`,
        [context.organizationId]
      );
      const mealTargets = await client.query<MealTargetRow>(
        `select
          id,
          macro_portion_system_id,
          name,
          meal_label,
          carbohydrate_portions,
          protein_portions,
          fat_portions,
          tolerance_percent
        from public.meal_macro_targets
        where organization_id = $1
        order by created_at desc
        limit 100`,
        [context.organizationId]
      );
      const groups = await client.query<ExchangeGroupRow>(
        `select id, name, slug, nutrient_basis, target_amount, target_unit, tolerance_percent, status, source
        from public.exchange_groups
        where organization_id = $1
        order by updated_at desc
        limit 50`,
        [context.organizationId]
      );
      const groupIds = groups.rows.map((group) => group.id);
      const items =
        groupIds.length > 0
          ? await client.query<ExchangeItemRow>(
              `select
                id,
                group_id,
                food_name,
                grams,
                household_measure,
                energy_kcal,
                protein_g,
                carbohydrate_g,
                fat_g,
                fiber_g,
                calculation_basis,
                notes
              from public.exchange_items
              where organization_id = $1
                and group_id = any($2::uuid[])
                and excluded = false
              order by created_at desc`,
              [context.organizationId, groupIds]
            )
          : { rows: [] };
      const primarySystem = systems.rows[0] ? toSystem(systems.rows[0]) : null;
      const normalizedItems = items.rows.map((row) =>
        toExchangeItem(
          row,
          groups.rows.find((group) => group.id === row.group_id),
          primarySystem
        )
      );

      return {
        status: "ready" as const,
        data: {
          systems: systems.rows.map(toSystem),
          mealTargets: mealTargets.rows.map(toMealTarget),
          groups: groups.rows.map((group) => ({
            ...toExchangeGroup(group),
            items: normalizedItems.filter((item) => item.groupId === group.id)
          }))
        }
      };
    });

    return result.status === "ready" ? result : toRepositoryResult(result);
  } catch (error) {
    console.error(
      "[nutrition] failed to load macro exchanges",
      error instanceof Error ? error.message : error
    );
    return { status: "error", message: "No se pudieron cargar equivalencias." };
  }
}

export async function createMacroPortionSystem(input: CreateMacroPortionSystemInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.macro_portion_systems (
        organization_id,
        name,
        carbohydrate_grams,
        protein_grams,
        fat_grams,
        fiber_grams,
        source,
        created_by
      )
      values ($1, $2, $3, $4, $5, $6, coalesce(nullif($7, ''), 'Definicion profesional interna'), $8)
      returning id`,
      [
        context.organizationId,
        input.name,
        input.carbohydrateGrams,
        input.proteinGrams,
        input.fatGrams,
        toNullableNumber(input.fiberGrams),
        input.source ?? "",
        context.profileId
      ]
    );

    await recordNutritionAudit(
      client,
      context,
      "macro_portion_systems",
      result.rows[0]?.id ?? null,
      {
        action: "created",
        carbohydrateGrams: input.carbohydrateGrams,
        proteinGrams: input.proteinGrams,
        fatGrams: input.fatGrams
      }
    );
  });

  assertReadyOutcome(outcome);
}

export async function createExchangeGroup(input: CreateExchangeGroupInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.exchange_groups (
        organization_id,
        name,
        slug,
        nutrient_basis,
        target_amount,
        target_unit,
        tolerance_percent,
        source,
        created_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, coalesce(nullif($8, ''), 'Criterio profesional interno'), $9)
      returning id`,
      [
        context.organizationId,
        input.name,
        slugify(input.name),
        input.nutrientBasis,
        input.targetAmount,
        input.targetUnit,
        input.tolerancePercent,
        input.source ?? "",
        context.profileId
      ]
    );

    await recordNutritionAudit(client, context, "exchange_groups", result.rows[0]?.id ?? null, {
      action: "created",
      nutrientBasis: input.nutrientBasis,
      targetAmount: input.targetAmount
    });
  });

  assertReadyOutcome(outcome);
}

export async function createExchangeItem(input: CreateExchangeItemInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.exchange_items (
        organization_id,
        group_id,
        food_name,
        grams,
        household_measure,
        energy_kcal,
        protein_g,
        carbohydrate_g,
        fat_g,
        fiber_g,
        notes,
        created_by
      )
      values (
        $1, $2, $3, $4, nullif($5, ''), $6, $7, $8, $9, $10, nullif($11, ''), $12
      )
      returning id`,
      [
        context.organizationId,
        input.groupId,
        input.foodName,
        input.grams,
        input.householdMeasure ?? "",
        toNullableNumber(input.energyKcal),
        toNullableNumber(input.proteinG),
        toNullableNumber(input.carbohydrateG),
        toNullableNumber(input.fatG),
        toNullableNumber(input.fiberG),
        input.notes ?? "",
        context.profileId
      ]
    );

    await recordNutritionAudit(client, context, "exchange_items", result.rows[0]?.id ?? null, {
      action: "created",
      groupId: input.groupId,
      foodName: input.foodName
    });
  });

  assertReadyOutcome(outcome);
}

export async function createMealMacroTarget(input: CreateMealMacroTargetInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.meal_macro_targets (
        organization_id,
        macro_portion_system_id,
        name,
        meal_label,
        carbohydrate_portions,
        protein_portions,
        fat_portions,
        tolerance_percent,
        created_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      returning id`,
      [
        context.organizationId,
        input.macroPortionSystemId,
        input.name,
        input.mealLabel,
        input.carbohydratePortions,
        input.proteinPortions,
        input.fatPortions,
        input.tolerancePercent,
        context.profileId
      ]
    );

    await recordNutritionAudit(client, context, "meal_macro_targets", result.rows[0]?.id ?? null, {
      action: "created",
      mealLabel: input.mealLabel
    });
  });

  assertReadyOutcome(outcome);
}

function toSystem(row: SystemRow): MacroPortionSystemRecord {
  return {
    id: row.id,
    name: row.name,
    carbohydrateGrams: Number(row.carbohydrate_grams),
    proteinGrams: Number(row.protein_grams),
    fatGrams: Number(row.fat_grams),
    fiberGrams: toNumber(row.fiber_grams),
    status: row.status,
    source: row.source
  };
}

function toMealTarget(row: MealTargetRow): MealMacroTargetRecord {
  return {
    id: row.id,
    macroPortionSystemId: row.macro_portion_system_id,
    name: row.name,
    mealLabel: row.meal_label,
    carbohydratePortions: Number(row.carbohydrate_portions),
    proteinPortions: Number(row.protein_portions),
    fatPortions: Number(row.fat_portions),
    tolerancePercent: Number(row.tolerance_percent)
  };
}

function toExchangeGroup(row: ExchangeGroupRow): Omit<ExchangeGroupRecord, "items"> {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    nutrientBasis: row.nutrient_basis,
    targetAmount: Number(row.target_amount),
    targetUnit: row.target_unit,
    tolerancePercent: Number(row.tolerance_percent),
    status: row.status,
    source: row.source
  };
}

function toExchangeItem(
  row: ExchangeItemRow,
  group: ExchangeGroupRow | undefined,
  system: MacroPortionSystemRecord | null
): ExchangeItemRecord {
  const values = {
    energyKcal: toNumber(row.energy_kcal),
    proteinG: toNumber(row.protein_g),
    carbohydrateG: toNumber(row.carbohydrate_g),
    fatG: toNumber(row.fat_g),
    fiberG: toNumber(row.fiber_g)
  };
  const portions = system
    ? calculateMacroPortions(values, {
        carbohydrateGrams: system.carbohydrateGrams,
        proteinGrams: system.proteinGrams,
        fatGrams: system.fatGrams,
        fiberGrams: system.fiberGrams
      })
    : {
        carbohydratePortions: null,
        proteinPortions: null,
        fatPortions: null,
        fiberPortions: null,
        completenessPercent: Object.values(values).filter((value) => value !== null).length * 20
      };
  const basisValue = group ? readBasisValue(values, group.nutrient_basis) : null;
  const fit = group
    ? calculateExchangeFit({
        actualAmount: basisValue,
        targetAmount: Number(group.target_amount),
        tolerancePercent: Number(group.tolerance_percent)
      })
    : {
        status: "not_calculable" as const,
        difference: null,
        differencePercent: null,
        reason: "Grupo no encontrado."
      };

  return {
    id: row.id,
    groupId: row.group_id,
    foodName: row.food_name,
    grams: Number(row.grams),
    householdMeasure: row.household_measure,
    energyKcal: values.energyKcal,
    proteinG: values.proteinG,
    carbohydrateG: values.carbohydrateG,
    fatG: values.fatG,
    fiberG: values.fiberG,
    calculationBasis: row.calculation_basis,
    notes: row.notes,
    fitStatus: fit.status,
    fitDifference: fit.difference,
    fitDifferencePercent: fit.differencePercent,
    carbohydratePortions: portions.carbohydratePortions,
    proteinPortions: portions.proteinPortions,
    fatPortions: portions.fatPortions,
    fiberPortions: portions.fiberPortions,
    completenessPercent: portions.completenessPercent
  };
}

function readBasisValue(values: MacroValues, basis: ExchangeGroupRecord["nutrientBasis"]) {
  if (basis === "energy_kcal") return values.energyKcal;
  if (basis === "carbohydrate") return values.carbohydrateG;
  if (basis === "protein") return values.proteinG;
  if (basis === "fat") return values.fatG;
  return values.fiberG;
}

function toRepositoryResult<T>(
  result: Exclude<ProfessionalContext, { status: "ready" }>
): RepositoryResult<T> {
  if (result.status === "not_configured") {
    return result;
  }

  if (result.status === "auth_required") {
    return { status: "error", message: "Authentication required." };
  }

  return { status: "error", message: "Permission denied." };
}

function assertReadyOutcome(outcome: unknown) {
  const blockedOutcome =
    typeof outcome === "object" &&
    outcome !== null &&
    "status" in outcome &&
    outcome.status !== "ready"
      ? (outcome as Exclude<ProfessionalContext, { status: "ready" }>)
      : null;

  if (blockedOutcome) {
    if (blockedOutcome.status === "not_configured") {
      throw new Error(`Database is not configured: ${blockedOutcome.missing.join(", ")}`);
    }

    if (blockedOutcome.status === "auth_required") {
      throw new Error("Authentication required.");
    }

    throw new Error("Permission denied.");
  }
}

async function recordNutritionAudit(
  client: PoolClient,
  context: ReadyProfessionalContext,
  targetTable: string,
  targetId: string | null,
  metadata: Record<string, unknown>
) {
  await client.query(
    `insert into public.audit_events (
      organization_id,
      actor_profile_id,
      event_type,
      target_table,
      target_id,
      metadata
    )
    values ($1, $2, 'organization_changed', $3, $4, $5::jsonb)`,
    [context.organizationId, context.profileId, targetTable, targetId, JSON.stringify(metadata)]
  );
}

function toNullableNumber(value: number | string | undefined) {
  if (value === undefined || value === "") {
    return null;
  }

  return Number(value);
}

function toNumber(value: string | number | null): number | null {
  return value === null ? null : Number(value);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
