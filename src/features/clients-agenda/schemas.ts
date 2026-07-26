import { z } from "zod";

export const clientStatusSchema = z.enum(["lead", "active", "paused", "archived"]);

export const appointmentStatusSchema = z.enum([
  "requested",
  "confirmed",
  "completed",
  "cancelled",
  "no_show"
]);

export const appointmentModalitySchema = z.enum(["in_person", "online"]);

export const createClientSchema = z.object({
  internalCode: z.string().trim().min(2).max(40),
  displayName: z.string().trim().min(2).max(160),
  status: clientStatusSchema.default("active"),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  objectiveSummary: z.string().trim().max(240).optional().or(z.literal(""))
});

export const updateClientStatusSchema = z.object({
  clientId: z.string().uuid(),
  status: clientStatusSchema
});

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  durationMinutes: z.coerce.number().int().min(10).max(480),
  priceEuros: z.coerce.number().min(0).max(10000).optional()
});

export const createAvailabilitySchema = z.object({
  weekday: z.coerce.number().int().min(1).max(7),
  startsAt: z.string().regex(/^\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  online: z.coerce.boolean().default(true)
});

export const createAppointmentSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  status: appointmentStatusSchema.default("requested"),
  modality: appointmentModalitySchema.default("in_person"),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  meetingUrl: z.string().trim().url().optional().or(z.literal("")),
  administrativeNotes: z.string().trim().max(500).optional().or(z.literal(""))
});

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: appointmentStatusSchema
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
