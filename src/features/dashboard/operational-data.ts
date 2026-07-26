export type AppointmentStatus = "confirmed" | "requested" | "completed" | "cancelled" | "no_show";

export type AttentionKind =
  "clinical_review" | "consent" | "message" | "draft_plan" | "measurement_quality";

export type DashboardAppointment = {
  id: string;
  startsAt: string;
  durationMinutes: number;
  clientLabel: string;
  service: string;
  status: AppointmentStatus;
  modality: "in_person" | "online";
  safetyNote: string;
};

export type DashboardClient = {
  id: string;
  code: string;
  label: string;
  objective: string;
  nextStep: string;
  visibility: "professional_only" | "shared" | "published";
};

export type AttentionItem = {
  id: string;
  kind: AttentionKind;
  label: string;
  detail: string;
  due: string;
};

export type DashboardSnapshot = {
  generatedAt: string;
  timezone: "Europe/Madrid";
  appointments: DashboardAppointment[];
  clients: DashboardClient[];
  attention: AttentionItem[];
};

export const demoDashboardSnapshot: DashboardSnapshot = {
  generatedAt: "2026-07-26T08:00:00+02:00",
  timezone: "Europe/Madrid",
  appointments: [
    {
      id: "apt-demo-001",
      startsAt: "2026-07-26T10:30:00+02:00",
      durationMinutes: 60,
      clientLabel: "Cliente demo A",
      service: "Primera visita",
      status: "confirmed",
      modality: "in_person",
      safetyNote: "Consentimientos de asistencia y privacidad pendientes de revisar."
    },
    {
      id: "apt-demo-002",
      startsAt: "2026-07-26T12:00:00+02:00",
      durationMinutes: 45,
      clientLabel: "Cliente demo B",
      service: "Seguimiento",
      status: "requested",
      modality: "online",
      safetyNote: "No incluir datos clinicos en recordatorio por email."
    },
    {
      id: "apt-demo-003",
      startsAt: "2026-07-26T17:30:00+02:00",
      durationMinutes: 45,
      clientLabel: "Cliente demo C",
      service: "Antropometria",
      status: "confirmed",
      modality: "in_person",
      safetyNote: "Medicion con consentimiento especifico y equipo calibrado."
    }
  ],
  clients: [
    {
      id: "client-demo-001",
      code: "CLI-001",
      label: "Cliente demo A",
      objective: "Primera evaluacion nutricional",
      nextStep: "Completar anamnesis y consentimientos",
      visibility: "professional_only"
    },
    {
      id: "client-demo-002",
      code: "CLI-002",
      label: "Cliente demo B",
      objective: "Seguimiento de adherencia",
      nextStep: "Revisar diario y ajustar objetivos SMART",
      visibility: "shared"
    },
    {
      id: "client-demo-003",
      code: "CLI-003",
      label: "Cliente demo C",
      objective: "Control antropometrico",
      nextStep: "Registrar repeticiones y discrepancias",
      visibility: "professional_only"
    }
  ],
  attention: [
    {
      id: "attention-demo-001",
      kind: "consent",
      label: "Consentimiento pendiente",
      detail: "Plantillas legales marcadas como pendientes de revision juridica.",
      due: "Hoy"
    },
    {
      id: "attention-demo-002",
      kind: "draft_plan",
      label: "Plan en borrador",
      detail: "No visible para cliente hasta publicacion profesional versionada.",
      due: "48 h"
    },
    {
      id: "attention-demo-003",
      kind: "measurement_quality",
      label: "Calidad antropometrica",
      detail: "Requiere valores brutos, equipo, calibracion y protocolo validado.",
      due: "Proxima cita"
    },
    {
      id: "attention-demo-004",
      kind: "message",
      label: "Mensaje no leido",
      detail: "Responder desde canal seguro; email solo como notificacion sin clinica.",
      due: "Hoy"
    }
  ]
};

export function getDashboardSnapshot(): DashboardSnapshot {
  return demoDashboardSnapshot;
}

export function getNextAppointment(snapshot: DashboardSnapshot): DashboardAppointment | null {
  return (
    [...snapshot.appointments]
      .filter((appointment) => appointment.status !== "cancelled")
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null
  );
}

export function getDashboardStats(snapshot: DashboardSnapshot) {
  return {
    nextAppointmentTime: formatMadridTime(getNextAppointment(snapshot)?.startsAt ?? null),
    pendingPlans: snapshot.attention.filter((item) => item.kind === "draft_plan").length,
    unreadMessages: snapshot.attention.filter((item) => item.kind === "message").length,
    consents: snapshot.attention.filter((item) => item.kind === "consent").length,
    todayAppointments: snapshot.appointments.length,
    attentionItems: snapshot.attention.length
  };
}

export function appointmentStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    confirmed: "Confirmada",
    requested: "Solicitada",
    completed: "Realizada",
    cancelled: "Cancelada",
    no_show: "No presentada"
  };

  return labels[status];
}

export function visibilityLabel(visibility: DashboardClient["visibility"]): string {
  const labels: Record<DashboardClient["visibility"], string> = {
    professional_only: "Privado profesional",
    shared: "Compartido",
    published: "Publicado"
  };

  return labels[visibility];
}

export function formatMadridTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid"
  }).format(new Date(value));
}
