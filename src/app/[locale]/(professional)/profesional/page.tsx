import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import {
  appointmentStatusLabel,
  formatMadridTime,
  getDashboardSnapshot,
  getDashboardStats,
  visibilityLabel
} from "@/features/dashboard/operational-data";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export default async function ProfessionalDashboard({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations("professional");
  const snapshot = getDashboardSnapshot();
  const stats = getDashboardStats(snapshot);

  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--olive)]">Nutri-Oli</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">{t("subtitle")}</p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
            Europe/Madrid · dd/MM/yyyy
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores">
          <StatCard
            label={t("nextAppointment")}
            value={stats.nextAppointmentTime}
            detail="Siguiente cita demo, sin datos reales de pacientes."
            icon={<CalendarClock aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("pendingPlans")}
            value={String(stats.pendingPlans)}
            detail="Borradores pendientes de publicacion profesional."
            icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("unreadMessages")}
            value={String(stats.unreadMessages)}
            detail="Notificaciones sin contenido clinico en email."
            icon={<MessageSquare aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("consents")}
            value={String(stats.consents)}
            detail="Plantillas pendientes de revision juridica."
            icon={<AlertTriangle aria-hidden="true" className="size-5" />}
          />
        </section>

        <section id="agenda" className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t("today")}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {stats.todayAppointments} citas demo en zona {snapshot.timezone}.
                </p>
              </div>
              <span className="text-sm text-[var(--muted)]">Sin PII en URLs ni emails.</span>
            </div>
            <div
              aria-label="Agenda desplazable del dia"
              className="mt-4 overflow-x-auto"
              role="region"
              // Required by axe for keyboard access to the horizontally scrollable table region.
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <caption className="sr-only">Agenda profesional de hoy con datos demo</caption>
                <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                  <tr>
                    <th className="py-3 pr-4 font-medium" scope="col">
                      Hora
                    </th>
                    <th className="py-3 pr-4 font-medium" scope="col">
                      Tipo
                    </th>
                    <th className="py-3 pr-4 font-medium" scope="col">
                      Estado
                    </th>
                    <th className="py-3 pr-4 font-medium" scope="col">
                      Seguridad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.appointments.map((appointment) => (
                    <tr
                      className="border-b border-[var(--border)] last:border-0"
                      key={appointment.id}
                    >
                      <td className="py-3 pr-4 font-medium">
                        {formatMadridTime(appointment.startsAt)}
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                          {appointment.durationMinutes} min ·{" "}
                          {appointment.modality === "online" ? "Online" : "Presencial"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {appointment.service}
                        <span className="mt-1 block text-xs text-[var(--muted)]">
                          {appointment.clientLabel}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{appointmentStatusLabel(appointment.status)}</td>
                      <td className="py-3 pr-4 text-[var(--muted)]">{appointment.safetyNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-xl font-semibold">Atencion requerida</h2>
            <ul className="mt-4 space-y-3">
              {snapshot.attention.map((item) => (
                <li
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.label}</p>
                    <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted)]">
                      {item.due}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section id="clientes" className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-3">
              <UserRoundCheck aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
              <h2 className="text-xl font-semibold">Clientes en seguimiento</h2>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.clients.map((client) => (
                <article
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  key={client.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{client.label}</h3>
                      <p className="text-sm text-[var(--muted)]">
                        {client.code} · {client.objective}
                      </p>
                    </div>
                    <span className="w-fit rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted)]">
                      {visibilityLabel(client.visibility)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">{client.nextStep}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-3">
              <Stethoscope aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
              <h2 className="text-xl font-semibold">Consulta guiada</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: <FileCheck2 aria-hidden="true" className="size-5" />,
                  title: "Revisar",
                  text: "Resumen, consentimientos, alertas, historia y objetivos antes de iniciar."
                },
                {
                  icon: <Stethoscope aria-hidden="true" className="size-5" />,
                  title: "Registrar control",
                  text: "Evolucion, adherencia, barreras, medidas y notas privadas separadas."
                },
                {
                  icon: <ClipboardCheck aria-hidden="true" className="size-5" />,
                  title: "Actualizar plan",
                  text: "Borrador editable, cambios justificados y publicacion versionada."
                },
                {
                  icon: <ShieldCheck aria-hidden="true" className="size-5" />,
                  title: "Compartir",
                  text: "Solo resumen, plan, tareas y documentos explicitamente publicados."
                }
              ].map((step) => (
                <article
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  key={step.title}
                >
                  <div className="grid size-10 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--olive-dark)]">
                    {step.icon}
                  </div>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
