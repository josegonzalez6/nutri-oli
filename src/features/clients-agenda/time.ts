export function addMinutes(value: string, minutes: number): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid"
  }).format(new Date(value));
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid"
  }).format(new Date(value));
}

export function weekdayLabel(value: number): string {
  const labels: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miercoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sabado",
    7: "Domingo"
  };

  return labels[value] ?? "-";
}
