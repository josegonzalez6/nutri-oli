"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/features/clients-agenda/actions";

import {
  createExchangeGroup,
  createExchangeItem,
  createMacroPortionSystem,
  createMealMacroTarget
} from "./repository";
import {
  createExchangeGroupSchema,
  createExchangeItemSchema,
  createMacroPortionSystemSchema,
  createMealMacroTargetSchema
} from "./schemas";

const successState = (message: string): FormState => ({ status: "success", message });
const errorState = (message: string): FormState => ({ status: "error", message });

export async function createMacroPortionSystemAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createMacroPortionSystemSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa la definicion de raciones.");
  }

  try {
    await createMacroPortionSystem(parsed.data);
    revalidateEquivalences();
    return successState("Sistema de raciones creado.");
  } catch (error) {
    return errorState(readNutritionError(error));
  }
}

export async function createExchangeGroupAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const nutrientBasis = String(formData.get("nutrientBasis") ?? "");
  const parsed = createExchangeGroupSchema.safeParse({
    ...Object.fromEntries(formData),
    targetUnit: nutrientBasis === "energy_kcal" ? "kcal" : "g"
  });

  if (!parsed.success) {
    return errorState("Revisa el grupo de equivalencias.");
  }

  try {
    await createExchangeGroup(parsed.data);
    revalidateEquivalences();
    return successState("Grupo de equivalencias creado.");
  } catch (error) {
    return errorState(readNutritionError(error));
  }
}

export async function createExchangeItemAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createExchangeItemSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa el alimento equivalente.");
  }

  try {
    await createExchangeItem(parsed.data);
    revalidateEquivalences();
    return successState("Alimento equivalente creado.");
  } catch (error) {
    return errorState(readNutritionError(error));
  }
}

export async function createMealMacroTargetAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createMealMacroTargetSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa el objetivo por comida.");
  }

  try {
    await createMealMacroTarget(parsed.data);
    revalidateEquivalences();
    return successState("Objetivo por comida creado.");
  } catch (error) {
    return errorState(readNutritionError(error));
  }
}

function revalidateEquivalences() {
  revalidatePath("/es/profesional/equivalencias");
  revalidatePath("/ca/profesional/equivalencias");
}

function readNutritionError(error: unknown): string {
  if (error instanceof Error && error.message.includes("Database is not configured")) {
    return "Base de datos no configurada en servidor.";
  }

  if (error instanceof Error && error.message.includes("Permission denied")) {
    return "No tienes permisos para modificar equivalencias.";
  }

  if (error instanceof Error && error.message.includes("duplicate key")) {
    return "Ya existe una version con ese nombre.";
  }

  return "No se pudo guardar la configuracion nutricional.";
}
