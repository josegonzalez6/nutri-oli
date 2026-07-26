"use server";

import { revalidatePath } from "next/cache";

import { saveAnthropometry, saveConsultation, saveIntake } from "./repository";
import { anthropometrySchema, consultationSchema, intakeSchema } from "./schemas";
import type { FormState } from "@/features/clients-agenda/actions";

export async function saveIntakeAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = intakeSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: "Revisa los campos de la anamnesis." };
  }

  try {
    await saveIntake(parsed.data);
    revalidateClientRoutes(parsed.data.clientId);
    return { status: "success", message: "Anamnesis guardada como borrador." };
  } catch (error) {
    return { status: "error", message: readClinicalError(error) };
  }
}

export async function saveConsultationAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = consultationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: "Revisa los campos de la consulta." };
  }

  try {
    await saveConsultation(parsed.data);
    revalidateClientRoutes(parsed.data.clientId);
    return {
      status: "success",
      message:
        parsed.data.mode === "finalize"
          ? "Consulta finalizada y bloqueada para edicion."
          : "Borrador de consulta guardado."
    };
  } catch (error) {
    return { status: "error", message: readClinicalError(error) };
  }
}

export async function saveAnthropometryAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = anthropometrySchema.safeParse({
    ...Object.fromEntries(formData),
    clientCanViewWeight: formData.get("clientCanViewWeight") === "on",
    clientCanViewBmi: formData.get("clientCanViewBmi") === "on",
    clientCanViewWaist: formData.get("clientCanViewWaist") === "on"
  });

  if (!parsed.success) {
    return { status: "error", message: "Revisa las medidas antropometricas." };
  }

  try {
    await saveAnthropometry(parsed.data);
    revalidateClientRoutes(parsed.data.clientId);
    return { status: "success", message: "Sesion antropometrica guardada." };
  } catch (error) {
    return { status: "error", message: readClinicalError(error) };
  }
}

function revalidateClientRoutes(clientId: string) {
  revalidatePath("/es/profesional");
  revalidatePath("/es/profesional/clientes");
  revalidatePath(`/es/profesional/clientes/${clientId}`);
}

function readClinicalError(error: unknown) {
  if (error instanceof Error && error.message.includes("immutable")) {
    return "La consulta finalizada es inmutable. Crea un addendum para corregirla.";
  }

  if (error instanceof Error && error.message.includes("Authentication required")) {
    return "Inicia sesion para continuar.";
  }

  if (error instanceof Error && error.message.includes("Permission denied")) {
    return "No tienes permisos para esta accion.";
  }

  return "No se pudo guardar la informacion clinica.";
}
