"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/features/clients-agenda/actions";

import {
  createDietPlan,
  createDietPlanItem,
  createDietPlanMeal,
  createRecipe,
  createRecipeIngredient
} from "./repository";
import {
  createDietPlanItemSchema,
  createDietPlanMealSchema,
  createDietPlanSchema,
  createRecipeIngredientSchema,
  createRecipeSchema
} from "./schemas";

const successState = (message: string): FormState => ({ status: "success", message });
const errorState = (message: string): FormState => ({ status: "error", message });

export async function createRecipeAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = createRecipeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa la receta.");
  }

  try {
    await createRecipe(parsed.data);
    revalidatePlanning();
    return successState("Receta creada.");
  } catch (error) {
    return errorState(readPlanningError(error));
  }
}

export async function createRecipeIngredientAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createRecipeIngredientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa el ingrediente.");
  }

  try {
    await createRecipeIngredient(parsed.data);
    revalidatePlanning();
    return successState("Ingrediente anadido.");
  } catch (error) {
    return errorState(readPlanningError(error));
  }
}

export async function createDietPlanAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = createDietPlanSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa el plan.");
  }

  try {
    await createDietPlan(parsed.data);
    revalidatePlanning();
    return successState("Plan creado como borrador.");
  } catch (error) {
    return errorState(readPlanningError(error));
  }
}

export async function createDietPlanMealAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createDietPlanMealSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa la comida.");
  }

  try {
    await createDietPlanMeal(parsed.data);
    revalidatePlanning();
    return successState("Comida anadida.");
  } catch (error) {
    return errorState(readPlanningError(error));
  }
}

export async function createDietPlanItemAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createDietPlanItemSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa el alimento del plan.");
  }

  try {
    await createDietPlanItem(parsed.data);
    revalidatePlanning();
    return successState("Alimento anadido al plan.");
  } catch (error) {
    return errorState(readPlanningError(error));
  }
}

function revalidatePlanning() {
  revalidatePath("/es/profesional/recetas");
  revalidatePath("/ca/profesional/recetas");
  revalidatePath("/es/profesional/planes");
  revalidatePath("/ca/profesional/planes");
}

function readPlanningError(error: unknown): string {
  if (error instanceof Error && error.message.includes("Database is not configured")) {
    return "Base de datos no configurada en servidor.";
  }

  if (error instanceof Error && error.message.includes("Permission denied")) {
    return "No tienes permisos para modificar planificacion.";
  }

  if (error instanceof Error && error.message.includes("duplicate key")) {
    return "Ya existe una version con ese nombre.";
  }

  return "No se pudo guardar la planificacion.";
}
