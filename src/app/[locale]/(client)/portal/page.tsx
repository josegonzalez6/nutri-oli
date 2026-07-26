import { CalendarDays, ChartNoAxesCombined, ClipboardList } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export default async function ClientPortal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations("client");

  return (
    <AppShell locale={locale} section="client">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="text-sm font-semibold uppercase text-[var(--olive)]">Nutri-Oli</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">{t("subtitle")}</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Resumen del cliente">
          <StatCard
            label={t("plan")}
            value="Activo"
            detail="Solo versiones publicadas por el profesional."
            icon={<ClipboardList aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label="Proxima cita"
            value="28/07"
            detail="Recordatorio sin datos clinicos sensibles."
            icon={<CalendarDays aria-hidden="true" className="size-5" />}
          />
          <StatCard
            label={t("progress")}
            value="3"
            detail="Metricas visibles segun configuracion profesional."
            icon={<ChartNoAxesCombined aria-hidden="true" className="size-5" />}
          />
        </section>

        <section className="mt-8 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-xl font-semibold">{t("tasks")}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">{t("privacy")}</p>
        </section>
      </div>
    </AppShell>
  );
}
