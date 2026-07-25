import { Database, ShieldCheck } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { loadFoodCatalog } from "@/features/foods/catalog";
import { FoodSearch } from "@/features/foods/food-search";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export default async function FoodsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const catalog = await loadFoodCatalog();

  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--olive)]">Nutri-Oli</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
              Catalogo de alimentos
            </h1>
            <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">
              Busqueda nutricional por 100 g/ml con fuente, licencia y validacion visibles para
              revision profesional.
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <Database aria-hidden="true" className="mb-2 size-5 text-[var(--olive-dark)]" />
              <span className="block font-semibold">
                {catalog.foods.length.toLocaleString("es-ES")} alimentos
              </span>
              <span className="text-[var(--muted)]">Fuente: {catalog.source}</span>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <ShieldCheck aria-hidden="true" className="mb-2 size-5 text-[var(--info)]" />
              <span className="block font-semibold">Sin datos de pacientes</span>
              <span className="text-[var(--muted)]">
                Licencia pendiente de revision antes de produccion
              </span>
            </div>
          </div>
        </header>

        <FoodSearch foods={catalog.foods} />

        {catalog.generatedAt ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Indice local generado el{" "}
            {new Intl.DateTimeFormat("es-ES").format(new Date(catalog.generatedAt))}.
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Mostrando datos demo. Ejecuta el importador BEDCA local para cargar el catalogo
            completo.
          </p>
        )}
      </div>
    </AppShell>
  );
}
