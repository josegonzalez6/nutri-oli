import { ClipboardList, Plus } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatePanel } from "@/components/state-panel";
import { ActionForm } from "@/features/clients-agenda/action-form";
import {
  createDietPlanAction,
  createDietPlanItemAction,
  createDietPlanMealAction
} from "@/features/planning/actions";
import type { DietPlanRecord } from "@/features/planning/repository";
import { loadPlanningWorkspace } from "@/features/planning/repository";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";
const inputClass =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const workspace = await loadPlanningWorkspace();
  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="text-sm font-semibold uppercase text-[var(--olive)]">Intervencion</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            Planes dieteticos persistentes
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">
            Construye un borrador por dias y comidas. Los nutrientes se calculan con el mismo motor
            y los datos ausentes permanecen como no calculables.
          </p>
        </header>
        {workspace.status !== "ready" ? (
          <div className="mt-6">
            <StatePanel
              description={
                workspace.status === "not_configured"
                  ? `Configura ${workspace.missing.join(", ")} para activar planes.`
                  : workspace.message
              }
              icon={<ClipboardList aria-hidden="true" className="size-6" />}
              title={
                workspace.status === "not_configured"
                  ? "Supabase no configurado"
                  : "No se pudieron cargar planes"
              }
              tone={workspace.status === "not_configured" ? "warning" : "danger"}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-6">
              <FormSection title="Nuevo plan">
                <ActionForm action={createDietPlanAction} submitLabel="Crear plan">
                  <label className="grid gap-2 text-sm font-medium">
                    Cliente
                    <select className={inputClass} name="clientId">
                      <option value="">Sin cliente asignado</option>
                      {workspace.data.clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.displayName} · {client.internalCode}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Nombre
                    <input className={inputClass} name="name" required />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Tipo
                    <select className={inputClass} defaultValue="weekly_menu" name="kind">
                      <option value="weekly_menu">Menu semanal</option>
                      <option value="typical_day">Dia tipo</option>
                      <option value="macro_portions">Raciones macro</option>
                      <option value="exchanges">Equivalencias</option>
                      <option value="open_guidance">Pauta abierta</option>
                      <option value="plate_method">Metodo del plato</option>
                      <option value="mixed">Mixto</option>
                    </select>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Inicio
                      <input className={inputClass} name="startsOn" type="date" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Fin
                      <input className={inputClass} name="endsOn" type="date" />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium">
                    Notas
                    <textarea className={`${inputClass} min-h-24`} name="notes" />
                  </label>
                </ActionForm>
              </FormSection>
              {workspace.data.plans.length > 0 ? (
                <FormSection title="Añadir comida">
                  <ActionForm action={createDietPlanMealAction} submitLabel="Añadir comida">
                    <SelectPlan plans={workspace.data.plans} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium">
                        Dia
                        <input
                          className={inputClass}
                          defaultValue="1"
                          max="14"
                          min="1"
                          name="dayIndex"
                          required
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Hora
                        <input className={inputClass} name="scheduledTime" type="time" />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-medium">
                      Nombre de comida
                      <input
                        className={inputClass}
                        name="mealLabel"
                        placeholder="Comida"
                        required
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Notas
                      <textarea className={`${inputClass} min-h-20`} name="notes" />
                    </label>
                  </ActionForm>
                </FormSection>
              ) : null}
              {workspace.data.plans.some((plan) => plan.meals.length > 0) ? (
                <FormSection title="Añadir alimento">
                  <ActionForm action={createDietPlanItemAction} submitLabel="Añadir alimento">
                    <SelectMeal plans={workspace.data.plans} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium">
                        Tipo
                        <select className={inputClass} name="itemType">
                          <option value="food">Alimento</option>
                          <option value="recipe">Receta</option>
                          <option value="free_text">Texto libre</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Receta opcional
                        <select className={inputClass} name="recipeId">
                          <option value="">Ninguna</option>
                          {workspace.data.recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Alimento o descripcion
                        <input className={inputClass} name="foodName" required />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Gramos
                        <input
                          className={inputClass}
                          min="0.01"
                          name="grams"
                          step="0.01"
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Medida casera
                        <input className={inputClass} name="householdMeasure" />
                      </label>
                      <NutrientField name="energyKcal" label="Energia (kcal)" />
                      <NutrientField name="proteinG" label="Proteina (g)" />
                      <NutrientField name="carbohydrateG" label="Hidratos (g)" />
                      <NutrientField name="fatG" label="Grasa (g)" />
                      <NutrientField name="fiberG" label="Fibra (g)" />
                    </div>
                    <label className="grid gap-2 text-sm font-medium">
                      Notas
                      <textarea className={`${inputClass} min-h-20`} name="notes" />
                    </label>
                  </ActionForm>
                </FormSection>
              ) : null}
            </div>
            <section aria-labelledby="plans-list-title">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold" id="plans-list-title">
                  Borradores y versiones
                </h2>
                <span className="text-sm text-[var(--muted)]">
                  {workspace.data.plans.length} planes
                </span>
              </div>
              {workspace.data.plans.length === 0 ? (
                <div className="mt-4">
                  <StatePanel
                    description="Crea un plan para comenzar a organizar comidas y nutrientes."
                    title="No hay planes"
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {workspace.data.plans.map((plan) => (
                    <PlanArticle key={plan.id} plan={plan} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2">
        <Plus aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function SelectPlan({ plans }: { plans: DietPlanRecord[] }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Plan
      <select className={inputClass} name="planId" required>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} · v{plan.version}
          </option>
        ))}
      </select>
    </label>
  );
}
function SelectMeal({ plans }: { plans: DietPlanRecord[] }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Comida
      <select className={inputClass} name="mealId" required>
        {plans.flatMap((plan) =>
          plan.meals.map((meal) => (
            <option key={meal.id} value={meal.id}>
              {plan.name} · Dia {meal.dayIndex} · {meal.mealLabel}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
function NutrientField({ name, label }: { name: string; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className={inputClass} min="0" name={name} step="0.01" type="number" />
    </label>
  );
}
function PlanArticle({ plan }: { plan: DietPlanRecord }) {
  return (
    <article className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {plan.clientName ?? "Sin cliente"} · Borrador · version {plan.version}
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-strong)] px-2 py-1 text-xs font-semibold">
          {plan.total.completenessPercent}% datos
        </span>
      </div>
      <p className="mt-3 text-sm">
        {displayValue(plan.total.energyKcal)} kcal · P {displayValue(plan.total.proteinG)} g · HC{" "}
        {displayValue(plan.total.carbohydrateG)} g · G {displayValue(plan.total.fatG)} g
      </p>
      {plan.meals.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Sin comidas registradas.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {plan.meals.map((meal) => (
            <div className="border-l-2 border-[var(--olive)] pl-3" key={meal.id}>
              <h4 className="font-semibold">
                Dia {meal.dayIndex} · {meal.mealLabel}
              </h4>
              <p className="mt-1 text-sm">
                {displayValue(meal.total.energyKcal)} kcal · P {displayValue(meal.total.proteinG)} g
                · HC {displayValue(meal.total.carbohydrateG)} g · G {displayValue(meal.total.fatG)}{" "}
                g
              </p>
              {meal.items.length === 0 ? (
                <p className="mt-1 text-sm text-[var(--muted)]">Sin alimentos.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {meal.items.map((item) => (
                    <li key={item.id}>
                      {item.foodName}
                      {item.grams ? ` · ${item.grams} g` : ""} · {displayValue(item.energyKcal)}{" "}
                      kcal
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
function displayValue(value: number | null) {
  return value === null ? "No calculable" : String(value);
}
