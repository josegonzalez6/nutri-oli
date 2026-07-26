export function clientStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    lead: "Lead",
    active: "Activo",
    paused: "Pausado",
    archived: "Archivado"
  };

  return labels[status] ?? status;
}

export function appointmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    requested: "Solicitada",
    confirmed: "Confirmada",
    completed: "Realizada",
    cancelled: "Cancelada",
    no_show: "No presentada"
  };

  return labels[status] ?? status;
}

export function appointmentModalityLabel(modality: string): string {
  const labels: Record<string, string> = {
    in_person: "Presencial",
    online: "Online"
  };

  return labels[modality] ?? modality;
}
