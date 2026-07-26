import { CalendarPlus, Clock, Settings2 } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatePanel } from "@/components/state-panel";
import { ActionForm } from "@/features/clients-agenda/action-form";
import {
  createAppointmentAction,
  createAvailabilityAction,
  createServiceAction,
  updateAppointmentStatusAction
} from "@/features/clients-agenda/actions";
import { appointmentModalityLabel, appointmentStatusLabel } from "@/features/clients-agenda/labels";
import { loadWorkspaceOverview } from "@/features/clients-agenda/repository";
import { formatDateTime, formatTime, weekdayLabel } from "@/features/clients-agenda/time";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export default async function AgendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const overview = await loadWorkspaceOverview();

  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="text-sm font-semibold uppercase text-[var(--olive)]">Agenda</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            Agenda persistente
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">
            Citas, servicios y disponibilidad profesional guardados en Supabase.
          </p>
        </header>

        {overview.status === "not_configured" ? (
          <div className="mt-6">
            <StatePanel
              description={`Configura ${overview.missing.join(", ")} para activar la agenda real.`}
              icon={<CalendarPlus aria-hidden="true" className="size-6" />}
              title="Supabase no configurado"
              tone="warning"
            />
          </div>
        ) : null}

        {overview.status === "error" ? (
          <div className="mt-6">
            <StatePanel
              description="La pantalla no usa fixtures si falla la base de datos."
              icon={<CalendarPlus aria-hidden="true" className="size-6" />}
              title="No se pudo cargar la agenda"
              tone="danger"
            />
          </div>
        ) : null}

        {overview.status === "ready" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section
              aria-labelledby="appointments-title"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold" id="appointments-title">
                    Citas
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {overview.data.appointments.length} citas persistidas.
                  </p>
                </div>
              </div>

              {overview.data.appointments.length === 0 ? (
                <div className="mt-4">
                  <StatePanel
                    description="Crea una cita cuando existan clientes, servicios y disponibilidad."
                    title="No hay citas"
                    tone="info"
                  />
                </div>
              ) : (
                <div
                  aria-label="Tabla desplazable de citas"
                  className="mt-4 overflow-x-auto"
                  role="region"
                  // Required by axe for keyboard access to the horizontally scrollable table region.
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                >
                  <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                    <caption className="sr-only">Citas guardadas en Supabase</caption>
                    <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                      <tr>
                        <th className="py-3 pr-4 font-medium" scope="col">
                          Fecha
                        </th>
                        <th className="py-3 pr-4 font-medium" scope="col">
                          Cliente
                        </th>
                        <th className="py-3 pr-4 font-medium" scope="col">
                          Servicio
                        </th>
                        <th className="py-3 pr-4 font-medium" scope="col">
                          Estado
                        </th>
                        <th className="py-3 pr-4 font-medium" scope="col">
                          Accion
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.data.appointments.map((appointment) => (
                        <tr
                          className="border-b border-[var(--border)] last:border-0"
                          key={appointment.id}
                        >
                          <td className="py-3 pr-4">
                            <span className="font-medium">
                              {formatDateTime(appointment.startsAt)}
                            </span>
                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {formatTime(appointment.startsAt)}-{formatTime(appointment.endsAt)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">{appointment.clientName}</td>
                          <td className="py-3 pr-4">
                            {appointment.serviceName ?? "Servicio sin nombre"}
                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {appointmentModalityLabel(appointment.modality)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            {appointmentStatusLabel(appointment.status)}
                          </td>
                          <td className="py-3 pr-4">
                            <ActionForm
                              action={updateAppointmentStatusAction}
                              submitLabel="Actualizar"
                            >
                              <input name="appointmentId" type="hidden" value={appointment.id} />
                              <label className="grid gap-2 text-sm font-medium">
                                Estado
                                <select
                                  className={inputClass}
                                  defaultValue={appointment.status}
                                  name="status"
                                >
                                  <option value="requested">Solicitada</option>
                                  <option value="confirmed">Confirmada</option>
                                  <option value="completed">Realizada</option>
                                  <option value="cancelled">Cancelada</option>
                                  <option value="no_show">No presentada</option>
                                </select>
                              </label>
                            </ActionForm>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <div className="flex items-center gap-3">
                  <CalendarPlus aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                  <h2 className="text-xl font-semibold">Nueva cita</h2>
                </div>
                {overview.data.clients.length === 0 || overview.data.services.length === 0 ? (
                  <div className="mt-4">
                    <StatePanel
                      description="Necesitas al menos un cliente y un servicio persistidos para crear citas."
                      title="Faltan datos base"
                      tone="warning"
                    />
                  </div>
                ) : (
                  <div className="mt-4">
                    <ActionForm action={createAppointmentAction} submitLabel="Crear cita">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Cliente
                          <select className={inputClass} name="clientId" required>
                            {overview.data.clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.displayName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Servicio
                          <select className={inputClass} name="serviceId" required>
                            {overview.data.services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} · {service.durationMinutes} min
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Inicio con zona horaria
                          <input
                            className={inputClass}
                            name="startsAt"
                            placeholder="2026-07-27T10:30:00+02:00"
                            required
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Estado
                          <select className={inputClass} defaultValue="requested" name="status">
                            <option value="requested">Solicitada</option>
                            <option value="confirmed">Confirmada</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Modalidad
                          <select className={inputClass} defaultValue="in_person" name="modality">
                            <option value="in_person">Presencial</option>
                            <option value="online">Online</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Ubicacion
                          <input className={inputClass} name="location" />
                        </label>
                      </div>
                      <label className="grid gap-2 text-sm font-medium">
                        URL de reunion
                        <input className={inputClass} name="meetingUrl" type="url" />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Notas administrativas
                        <textarea className={inputClass} name="administrativeNotes" rows={3} />
                      </label>
                    </ActionForm>
                  </div>
                )}
              </div>
            </section>

            <aside aria-label="Configuracion de agenda" className="space-y-6">
              <section
                aria-labelledby="services-title"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-center gap-3">
                  <Settings2 aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                  <h2 className="text-xl font-semibold" id="services-title">
                    Servicios
                  </h2>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {overview.data.services.map((service) => (
                    <li
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                      key={service.id}
                    >
                      <span className="font-medium">{service.name}</span>
                      <span className="mt-1 block text-[var(--muted)]">
                        {service.durationMinutes} min
                        {service.priceCents === null
                          ? ""
                          : ` · ${(service.priceCents / 100).toFixed(2)} EUR`}
                      </span>
                    </li>
                  ))}
                </ul>
                {overview.data.services.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">No hay servicios.</p>
                ) : null}
                <div className="mt-5 border-t border-[var(--border)] pt-5">
                  <ActionForm action={createServiceAction} submitLabel="Crear servicio">
                    <label className="grid gap-2 text-sm font-medium">
                      Nombre
                      <input className={inputClass} name="name" required />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Duracion
                      <input
                        className={inputClass}
                        min={10}
                        name="durationMinutes"
                        required
                        type="number"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Precio EUR
                      <input
                        className={inputClass}
                        min={0}
                        name="priceEuros"
                        step="0.01"
                        type="number"
                      />
                    </label>
                  </ActionForm>
                </div>
              </section>

              <section
                aria-labelledby="availability-title"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-center gap-3">
                  <Clock aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                  <h2 className="text-xl font-semibold" id="availability-title">
                    Disponibilidad
                  </h2>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {overview.data.availability.map((slot) => (
                    <li
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                      key={slot.id}
                    >
                      <span className="font-medium">{weekdayLabel(slot.weekday)}</span>
                      <span className="mt-1 block text-[var(--muted)]">
                        {slot.startsAt}-{slot.endsAt} · {slot.online ? "Online" : "Presencial"}
                      </span>
                    </li>
                  ))}
                </ul>
                {overview.data.availability.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted)]">No hay disponibilidad.</p>
                ) : null}
                <div className="mt-5 border-t border-[var(--border)] pt-5">
                  <ActionForm action={createAvailabilityAction} submitLabel="Crear disponibilidad">
                    <label className="grid gap-2 text-sm font-medium">
                      Dia
                      <select className={inputClass} name="weekday">
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miercoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sabado</option>
                        <option value="7">Domingo</option>
                      </select>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium">
                        Inicio
                        <input className={inputClass} name="startsAt" required type="time" />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Fin
                        <input className={inputClass} name="endsAt" required type="time" />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-medium">
                      Ubicacion
                      <input className={inputClass} name="location" />
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input defaultChecked name="online" type="checkbox" />
                      Online
                    </label>
                  </ActionForm>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
