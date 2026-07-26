"use server";

import { revalidatePath } from "next/cache";

import {
  createAppointment,
  createAvailability,
  createClient,
  createService,
  updateAppointmentStatus,
  updateClientStatus
} from "./repository";
import {
  createAppointmentSchema,
  createAvailabilitySchema,
  createClientSchema,
  createServiceSchema,
  updateAppointmentStatusSchema,
  updateClientStatusSchema
} from "./schemas";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const successState = (message: string): FormState => ({ status: "success", message });
const errorState = (message: string): FormState => ({ status: "error", message });

export async function createClientAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = createClientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa los campos del cliente.");
  }

  try {
    await createClient(parsed.data);
    revalidateProfessionalRoutes();
    return successState("Cliente creado.");
  } catch (error) {
    return errorState(readError(error));
  }
}

export async function updateClientStatusAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = updateClientStatusSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Estado de cliente no valido.");
  }

  try {
    await updateClientStatus(parsed.data.clientId, parsed.data.status);
    revalidateProfessionalRoutes();
    return successState("Estado actualizado.");
  } catch (error) {
    return errorState(readError(error));
  }
}

export async function createServiceAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = createServiceSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa los campos del servicio.");
  }

  try {
    await createService(parsed.data);
    revalidateProfessionalRoutes();
    return successState("Servicio creado.");
  } catch (error) {
    return errorState(readError(error));
  }
}

export async function createAvailabilityAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createAvailabilitySchema.safeParse({
    ...Object.fromEntries(formData),
    online: formData.get("online") === "on"
  });

  if (!parsed.success) {
    return errorState("Revisa la disponibilidad.");
  }

  try {
    await createAvailability(parsed.data);
    revalidateProfessionalRoutes();
    return successState("Disponibilidad creada.");
  } catch (error) {
    return errorState(readError(error));
  }
}

export async function createAppointmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = createAppointmentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Revisa los campos de la cita.");
  }

  try {
    await createAppointment(parsed.data);
    revalidateProfessionalRoutes();
    return successState("Cita creada.");
  } catch (error) {
    return errorState(readError(error));
  }
}

export async function updateAppointmentStatusAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = updateAppointmentStatusSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return errorState("Estado de cita no valido.");
  }

  try {
    await updateAppointmentStatus(parsed.data.appointmentId, parsed.data.status);
    revalidateProfessionalRoutes();
    return successState("Estado de cita actualizado.");
  } catch (error) {
    return errorState(readError(error));
  }
}

function revalidateProfessionalRoutes() {
  revalidatePath("/es/profesional");
  revalidatePath("/es/profesional/clientes");
  revalidatePath("/es/profesional/agenda");
}

function readError(error: unknown): string {
  if (error instanceof Error && error.message.includes("appointments_no_professional_overlap")) {
    return "La cita se solapa con otra cita activa.";
  }

  if (error instanceof Error && error.message.includes("Database is not configured")) {
    return "Base de datos no configurada en servidor.";
  }

  return "No se pudo completar la operacion.";
}
