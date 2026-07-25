import { AlertTriangle, CalendarClock, ClipboardCheck, MessageSquare } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
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
            value="10:30"
            detail="Primera visita demo, sin datos reales."
            icon={<CalendarClock aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("pendingPlans")}
            value="2"
            detail="Borradores pendientes de publicacion profesional."
            icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("unreadMessages")}
            value="4"
            detail="Notificaciones sin contenido clinico en email."
            icon={<MessageSquare aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("consents")}
            value="1"
            detail="Plantillas pendientes de revision juridica."
            icon={<AlertTriangle aria-hidden="true" className="size-5" />}
          />
        </section>

        <section id="agenda" className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-xl font-semibold">{t("today")}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
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
                  {[
                    ["10:30", "Primera visita", "Confirmada", "RLS profesional"],
                    ["12:00", "Seguimiento", "Solicitada", "Sin PII en URL"],
                    ["17:30", "Antropometria", "Borrador", "Consentimiento requerido"]
                  ].map((row) => (
                    <tr
                      className="border-b border-[var(--border)] last:border-0"
                      key={row.join("-")}
                    >
                      {row.map((cell) => (
                        <td className="py-3 pr-4" key={cell}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-xl font-semibold">{t("risk")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li>Contenido clinico y ecuaciones: pendientes de validacion profesional.</li>
              <li>Plantillas legales: pendientes de revision juridica.</li>
              <li>GitHub CLI: autenticacion local invalida, PR bloqueada hasta reautenticacion.</li>
            </ul>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
