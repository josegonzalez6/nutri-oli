import "server-only";

import type { PoolClient } from "pg";

import type { RepositoryResult } from "@/features/clients-agenda/repository";
import type {
  CreateDietPlanInput,
  CreateDietPlanItemInput,
  CreateDietPlanMealInput,
  CreateRecipeIngredientInput,
  CreateRecipeInput
} from "@/features/planning/schemas";
import {
  calculatePlanningTotals,
  scalePlanningTotals,
  type NutritionTotals
} from "@/features/planning/planning-engine";
import { withProfessionalTransaction } from "@/server/professional-context";
import type { ProfessionalContext } from "@/server/professional-context";

type ReadyProfessionalContext = Extract<ProfessionalContext, { status: "ready" }>;

export type { NutritionTotals } from "@/features/planning/planning-engine";

export type ClientOption = {
  id: string;
  displayName: string;
  internalCode: string;
};

export type RecipeIngredientRecord = {
  id: string;
  recipeId: string;
  foodName: string;
  grams: number;
  householdMeasure: string | null;
  energyKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  notes: string | null;
};

export type RecipeRecord = {
  id: string;
  name: string;
  summary: string | null;
  servings: number;
  yieldGrams: number | null;
  prepTimeMinutes: number | null;
  instructions: string | null;
  tags: string[];
  allergens: string[];
  dietaryPattern: string | null;
  status: string;
  version: number;
  ingredients: RecipeIngredientRecord[];
  total: NutritionTotals;
  perServing: NutritionTotals;
};

export type DietPlanItemRecord = {
  id: string;
  mealId: string;
  recipeId: string | null;
  itemType: "food" | "recipe" | "free_text";
  foodName: string;
  grams: number | null;
  householdMeasure: string | null;
  energyKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  notes: string | null;
};

export type DietPlanMealRecord = {
  id: string;
  planId: string;
  dayIndex: number;
  mealLabel: string;
  scheduledTime: string | null;
  notes: string | null;
  items: DietPlanItemRecord[];
  total: NutritionTotals;
};

export type DietPlanRecord = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  name: string;
  kind: string;
  status: string;
  version: number;
  startsOn: string | null;
  endsOn: string | null;
  notes: string | null;
  meals: DietPlanMealRecord[];
  total: NutritionTotals;
};

export type PlanningWorkspace = {
  clients: ClientOption[];
  recipes: RecipeRecord[];
  plans: DietPlanRecord[];
};

type ClientRow = {
  id: string;
  display_name: string;
  internal_code: string;
};

type RecipeRow = {
  id: string;
  name: string;
  summary: string | null;
  servings: string | number;
  yield_grams: string | number | null;
  prep_time_minutes: number | null;
  instructions: string | null;
  tags: string[];
  allergens: string[];
  dietary_pattern: string | null;
  status: string;
  version: number;
};

type RecipeIngredientRow = {
  id: string;
  recipe_id: string;
  food_name: string;
  grams: string | number;
  household_measure: string | null;
  energy_kcal: string | number | null;
  protein_g: string | number | null;
  carbohydrate_g: string | number | null;
  fat_g: string | number | null;
  fiber_g: string | number | null;
  notes: string | null;
};

type DietPlanRow = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  name: string;
  kind: string;
  status: string;
  version: number;
  starts_on: Date | string | null;
  ends_on: Date | string | null;
  notes: string | null;
};

type DietPlanMealRow = {
  id: string;
  plan_id: string;
  day_index: number;
  meal_label: string;
  scheduled_time: string | null;
  notes: string | null;
};

type DietPlanItemRow = {
  id: string;
  meal_id: string;
  recipe_id: string | null;
  item_type: DietPlanItemRecord["itemType"];
  food_name: string;
  grams: string | number | null;
  household_measure: string | null;
  energy_kcal: string | number | null;
  protein_g: string | number | null;
  carbohydrate_g: string | number | null;
  fat_g: string | number | null;
  fiber_g: string | number | null;
  notes: string | null;
};

export async function loadPlanningWorkspace(): Promise<RepositoryResult<PlanningWorkspace>> {
  try {
    const result = await withProfessionalTransaction(async (client, context) => {
      const clients = await client.query<ClientRow>(
        `select id, display_name, internal_code
        from public.clients
        where organization_id = $1
        order by display_name asc
        limit 100`,
        [context.organizationId]
      );
      const recipes = await client.query<RecipeRow>(
        `select
          id,
          name,
          summary,
          servings,
          yield_grams,
          prep_time_minutes,
          instructions,
          tags,
          allergens,
          dietary_pattern,
          status,
          version
        from public.recipes
        where organization_id = $1
        order by updated_at desc
        limit 50`,
        [context.organizationId]
      );
      const recipeIds = recipes.rows.map((recipe) => recipe.id);
      const recipeIngredients =
        recipeIds.length > 0
          ? await client.query<RecipeIngredientRow>(
              `select
                id,
                recipe_id,
                food_name,
                grams,
                household_measure,
                energy_kcal,
                protein_g,
                carbohydrate_g,
                fat_g,
                fiber_g,
                notes
              from public.recipe_ingredients
              where organization_id = $1
                and recipe_id = any($2::uuid[])
              order by sort_order asc, created_at asc`,
              [context.organizationId, recipeIds]
            )
          : { rows: [] };
      const plans = await client.query<DietPlanRow>(
        `select
          p.id,
          p.client_id,
          c.display_name as client_name,
          p.name,
          p.kind,
          p.status,
          p.version,
          p.starts_on,
          p.ends_on,
          p.notes
        from public.diet_plans p
        left join public.clients c
          on c.organization_id = p.organization_id
          and c.id = p.client_id
        where p.organization_id = $1
        order by p.updated_at desc
        limit 50`,
        [context.organizationId]
      );
      const planIds = plans.rows.map((plan) => plan.id);
      const meals =
        planIds.length > 0
          ? await client.query<DietPlanMealRow>(
              `select id, plan_id, day_index, meal_label, scheduled_time::text, notes
              from public.diet_plan_meals
              where organization_id = $1
                and plan_id = any($2::uuid[])
              order by day_index asc, sort_order asc, created_at asc`,
              [context.organizationId, planIds]
            )
          : { rows: [] };
      const mealIds = meals.rows.map((meal) => meal.id);
      const items =
        mealIds.length > 0
          ? await client.query<DietPlanItemRow>(
              `select
                id,
                meal_id,
                recipe_id,
                item_type,
                food_name,
                grams,
                household_measure,
                energy_kcal,
                protein_g,
                carbohydrate_g,
                fat_g,
                fiber_g,
                notes
              from public.diet_plan_items
              where organization_id = $1
                and meal_id = any($2::uuid[])
              order by sort_order asc, created_at asc`,
              [context.organizationId, mealIds]
            )
          : { rows: [] };

      const normalizedIngredients = recipeIngredients.rows.map(toRecipeIngredient);
      const normalizedItems = items.rows.map(toDietPlanItem);
      const normalizedMeals = meals.rows.map((meal) =>
        toDietPlanMeal(
          meal,
          normalizedItems.filter((item) => item.mealId === meal.id)
        )
      );

      return {
        status: "ready" as const,
        data: {
          clients: clients.rows.map((row) => ({
            id: row.id,
            displayName: row.display_name,
            internalCode: row.internal_code
          })),
          recipes: recipes.rows.map((recipe) =>
            toRecipe(
              recipe,
              normalizedIngredients.filter((ingredient) => ingredient.recipeId === recipe.id)
            )
          ),
          plans: plans.rows.map((plan) =>
            toDietPlan(
              plan,
              normalizedMeals.filter((meal) => meal.planId === plan.id)
            )
          )
        }
      };
    });

    return result.status === "ready" ? result : toRepositoryResult(result);
  } catch (error) {
    console.error(
      "[planning] failed to load planning workspace",
      error instanceof Error ? error.message : error
    );
    return { status: "error", message: "No se pudo cargar planificacion." };
  }
}

export async function createRecipe(input: CreateRecipeInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.recipes (
        organization_id,
        name,
        summary,
        servings,
        yield_grams,
        prep_time_minutes,
        instructions,
        tags,
        allergens,
        dietary_pattern,
        created_by
      )
      values ($1, $2, nullif($3, ''), $4, $5, $6, nullif($7, ''), $8, $9, nullif($10, ''), $11)
      returning id`,
      [
        context.organizationId,
        input.name,
        input.summary ?? "",
        input.servings,
        toNullableNumber(input.yieldGrams),
        toNullableNumber(input.prepTimeMinutes),
        input.instructions ?? "",
        parseList(input.tags),
        parseList(input.allergens),
        input.dietaryPattern ?? "",
        context.profileId
      ]
    );

    await recordPlanningAudit(client, context, "recipes", result.rows[0]?.id ?? null, {
      action: "created",
      name: input.name
    });
  });

  assertReadyOutcome(outcome);
}

export async function createRecipeIngredient(input: CreateRecipeIngredientInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.recipe_ingredients (
        organization_id,
        recipe_id,
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
      values ($1, $2, $3, $4, nullif($5, ''), $6, $7, $8, $9, $10, nullif($11, ''), $12)
      returning id`,
      [
        context.organizationId,
        input.recipeId,
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

    await recordPlanningAudit(client, context, "recipe_ingredients", result.rows[0]?.id ?? null, {
      action: "created",
      recipeId: input.recipeId,
      foodName: input.foodName
    });
  });

  assertReadyOutcome(outcome);
}

export async function createDietPlan(input: CreateDietPlanInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.diet_plans (
        organization_id,
        client_id,
        name,
        kind,
        starts_on,
        ends_on,
        notes,
        created_by
      )
      values ($1, $2, $3, $4, nullif($5, '')::date, nullif($6, '')::date, nullif($7, ''), $8)
      returning id`,
      [
        context.organizationId,
        toNullableUuid(input.clientId),
        input.name,
        input.kind,
        input.startsOn ?? "",
        input.endsOn ?? "",
        input.notes ?? "",
        context.profileId
      ]
    );

    await recordPlanningAudit(client, context, "diet_plans", result.rows[0]?.id ?? null, {
      action: "created",
      kind: input.kind,
      clientId: toNullableUuid(input.clientId)
    });
  });

  assertReadyOutcome(outcome);
}

export async function createDietPlanMeal(input: CreateDietPlanMealInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.diet_plan_meals (
        organization_id,
        plan_id,
        day_index,
        meal_label,
        scheduled_time,
        notes,
        created_by
      )
      values ($1, $2, $3, $4, nullif($5, '')::time, nullif($6, ''), $7)
      returning id`,
      [
        context.organizationId,
        input.planId,
        input.dayIndex,
        input.mealLabel,
        input.scheduledTime ?? "",
        input.notes ?? "",
        context.profileId
      ]
    );

    await recordPlanningAudit(client, context, "diet_plan_meals", result.rows[0]?.id ?? null, {
      action: "created",
      planId: input.planId,
      mealLabel: input.mealLabel
    });
  });

  assertReadyOutcome(outcome);
}

export async function createDietPlanItem(input: CreateDietPlanItemInput) {
  const outcome = await withProfessionalTransaction(async (client, context) => {
    const result = await client.query<{ id: string }>(
      `insert into public.diet_plan_items (
        organization_id,
        meal_id,
        recipe_id,
        item_type,
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
      values ($1, $2, $3, $4, $5, $6, nullif($7, ''), $8, $9, $10, $11, $12, nullif($13, ''), $14)
      returning id`,
      [
        context.organizationId,
        input.mealId,
        toNullableUuid(input.recipeId),
        input.itemType,
        input.foodName,
        toNullableNumber(input.grams),
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

    await recordPlanningAudit(client, context, "diet_plan_items", result.rows[0]?.id ?? null, {
      action: "created",
      mealId: input.mealId,
      itemType: input.itemType
    });
  });

  assertReadyOutcome(outcome);
}

function toRecipe(row: RecipeRow, ingredients: RecipeIngredientRecord[]): RecipeRecord {
  const total = calculatePlanningTotals(ingredients);
  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    servings: Number(row.servings),
    yieldGrams: toNumber(row.yield_grams),
    prepTimeMinutes: row.prep_time_minutes,
    instructions: row.instructions,
    tags: row.tags,
    allergens: row.allergens,
    dietaryPattern: row.dietary_pattern,
    status: row.status,
    version: row.version,
    ingredients,
    total,
    perServing: scalePlanningTotals(total, Number(row.servings))
  };
}

function toRecipeIngredient(row: RecipeIngredientRow): RecipeIngredientRecord {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    foodName: row.food_name,
    grams: Number(row.grams),
    householdMeasure: row.household_measure,
    energyKcal: toNumber(row.energy_kcal),
    proteinG: toNumber(row.protein_g),
    carbohydrateG: toNumber(row.carbohydrate_g),
    fatG: toNumber(row.fat_g),
    fiberG: toNumber(row.fiber_g),
    notes: row.notes
  };
}

function toDietPlan(row: DietPlanRow, meals: DietPlanMealRecord[]): DietPlanRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    name: row.name,
    kind: row.kind,
    status: row.status,
    version: row.version,
    startsOn: row.starts_on ? formatDate(row.starts_on) : null,
    endsOn: row.ends_on ? formatDate(row.ends_on) : null,
    notes: row.notes,
    meals,
    total: calculatePlanningTotals(meals.flatMap((meal) => meal.items))
  };
}

function toDietPlanMeal(row: DietPlanMealRow, items: DietPlanItemRecord[]): DietPlanMealRecord {
  return {
    id: row.id,
    planId: row.plan_id,
    dayIndex: row.day_index,
    mealLabel: row.meal_label,
    scheduledTime: row.scheduled_time,
    notes: row.notes,
    items,
    total: calculatePlanningTotals(items)
  };
}

function toDietPlanItem(row: DietPlanItemRow): DietPlanItemRecord {
  return {
    id: row.id,
    mealId: row.meal_id,
    recipeId: row.recipe_id,
    itemType: row.item_type,
    foodName: row.food_name,
    grams: toNumber(row.grams),
    householdMeasure: row.household_measure,
    energyKcal: toNumber(row.energy_kcal),
    proteinG: toNumber(row.protein_g),
    carbohydrateG: toNumber(row.carbohydrate_g),
    fatG: toNumber(row.fat_g),
    fiberG: toNumber(row.fiber_g),
    notes: row.notes
  };
}

function toNullableNumber(value: number | string | undefined) {
  if (value === undefined || value === "") {
    return null;
  }

  return Number(value);
}

function toNullableUuid(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toNumber(value: string | number | null): number | null {
  return value === null ? null : Number(value);
}

function parseList(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function formatDate(value: Date | string) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
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

async function recordPlanningAudit(
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
