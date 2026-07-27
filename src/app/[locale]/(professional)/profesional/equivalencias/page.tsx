import { Calculator, ListChecks, Plus, Scale } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatePanel } from "@/components/state-panel";
import { ActionForm } from "@/features/clients-agenda/action-form";
import {
  createExchangeGroupAction,
  createExchangeItemAction,
  createMacroPortionSystemAction,
  createMealMacroTargetAction
} from "@/features/nutrition/actions";
import type {
  ExchangeGroupRecord,
  MacroPortionSystemRecord,
  MealMacroTargetRecord
} from "@/features/nutrition/repository";
import { loadMacroExchangesWorkspace } from "@/features/nutrition/repository";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export default async function EquivalencesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const workspace = await loadMacroExchangesWorkspace();

  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="text-sm font-semibold uppercase text-[var(--olive)]">Planificacion</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            Equivalencias y raciones macro
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">
            Define sistemas propios de raciones de hidratos, proteina y grasa, grupos de
            equivalencias y objetivos por comida. Los datos ausentes se muestran como no
            calculables.
          </p>
        </header>

        {workspace.status === "not_configured" ? (
          <div className="mt-6">
            <StatePanel
              description={`Configura ${workspace.missing.join(", ")} para activar equivalencias persistentes.`}
              icon={<Scale aria-hidden="true" className="size-6" />}
              title="Supabase no configurado"
              tone="warning"
            />
          </div>
        ) : null}

        {workspace.status === "error" ? (
          <div className="mt-6">
            <StatePanel
              description="La pantalla no usa fixtures si falla la base de datos."
              icon={<Scale aria-hidden="true" className="size-6" />}
              title="No se pudieron cargar equivalencias"
              tone="danger"
            />
          </div>
        ) : null}

        {workspace.status === "ready" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-6">
              <section
                aria-labelledby="macro-system-title"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-center gap-3">
                  <Calculator aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                  <h2 className="text-xl font-semibold" id="macro-system-title">
                    Sistema de raciones
                  </h2>
                </div>
                <div className="mt-4">
                  <ActionForm action={createMacroPortionSystemAction} submitLabel="Crear sistema">
                    <label className="grid gap-2 text-sm font-medium">
                      Nombre
                      <input
                        className={inputClass}
                        name="name"
                        placeholder="Raciones consulta general"
                        required
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <NumberField label="1 racion HC (g)" name="carbohydrateGrams" value="10" />
                      <NumberField label="1 racion proteina (g)" name="proteinGrams" value="7" />
                      <NumberField label="1 racion grasa (g)" name="fatGrams" value="5" />
                      <NumberField label="1 racion fibra (g)" name="fiberGrams" />
                    </div>
                    <Textarea
                      label="Fuente o criterio"
                      name="source"
                      placeholder="Definicion profesional interna; pendiente de validacion si procede."
                    />
                  </ActionForm>
                </div>
              </section>

              <section
                aria-labelledby="exchange-group-title"
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-center gap-3">
                  <ListChecks aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                  <h2 className="text-xl font-semibold" id="exchange-group-title">
                    Grupo de equivalencias
                  </h2>
                </div>
                <div className="mt-4">
                  <ActionForm action={createExchangeGroupAction} submitLabel="Crear grupo">
                    <label className="grid gap-2 text-sm font-medium">
                      Nombre
                      <input className={inputClass} name="name" placeholder="Frutas" required />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Nutriente principal
                      <select className={inputClass} name="nutrientBasis">
                        <option value="carbohydrate">Hidratos</option>
                        <option value="protein">Proteina</option>
                        <option value="fat">Grasa</option>
                        <option value="fiber">Fibra</option>
                        <option value="energy_kcal">Energia</option>
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <NumberField label="Cantidad objetivo" name="targetAmount" value="10" />
                      <NumberField label="Tolerancia (%)" name="tolerancePercent" value="10" />
                    </div>
                    <Textarea label="Fuente o criterio" name="source" />
                  </ActionForm>
                </div>
              </section>

              {workspace.data.groups.length > 0 ? (
                <section
                  aria-labelledby="exchange-item-title"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex items-center gap-3">
                    <Plus aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                    <h2 className="text-xl font-semibold" id="exchange-item-title">
                      Alimento equivalente
                    </h2>
                  </div>
                  <div className="mt-4">
                    <ActionForm action={createExchangeItemAction} submitLabel="Anadir alimento">
                      <label className="grid gap-2 text-sm font-medium">
                        Grupo
                        <select className={inputClass} name="groupId">
                          {workspace.data.groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Alimento
                        <input className={inputClass} name="foodName" required />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <NumberField label="Gramos" name="grams" value="100" />
                        <label className="grid gap-2 text-sm font-medium">
                          Medida casera
                          <input className={inputClass} name="householdMeasure" />
                        </label>
                        <NumberField label="kcal" name="energyKcal" />
                        <NumberField label="Proteina (g)" name="proteinG" />
                        <NumberField label="HC (g)" name="carbohydrateG" />
                        <NumberField label="Grasa (g)" name="fatG" />
                        <NumberField label="Fibra (g)" name="fiberG" />
                      </div>
                      <Textarea label="Notas" name="notes" />
                    </ActionForm>
                  </div>
                </section>
              ) : null}

              {workspace.data.systems.length > 0 ? (
                <section
                  aria-labelledby="meal-target-title"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex items-center gap-3">
                    <Scale aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                    <h2 className="text-xl font-semibold" id="meal-target-title">
                      Objetivo por comida
                    </h2>
                  </div>
                  <div className="mt-4">
                    <ActionForm action={createMealMacroTargetAction} submitLabel="Crear objetivo">
                      <label className="grid gap-2 text-sm font-medium">
                        Sistema
                        <select className={inputClass} name="macroPortionSystemId">
                          {workspace.data.systems.map((system) => (
                            <option key={system.id} value={system.id}>
                              {system.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Nombre plantilla
                          <input className={inputClass} name="name" defaultValue="Dia tipo" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Comida
                          <input className={inputClass} name="mealLabel" defaultValue="Desayuno" />
                        </label>
                        <NumberField label="Raciones HC" name="carbohydratePortions" value="4" />
                        <NumberField label="Raciones proteina" name="proteinPortions" value="2" />
                        <NumberField label="Raciones grasa" name="fatPortions" value="1" />
                        <NumberField label="Tolerancia (%)" name="tolerancePercent" value="10" />
                      </div>
                    </ActionForm>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="space-y-6">
              <SystemsPanel systems={workspace.data.systems} />
              <MealTargetsPanel
                systems={workspace.data.systems}
                targets={workspace.data.mealTargets}
              />
              <ExchangeGroupsPanel groups={workspace.data.groups} />
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function SystemsPanel({ systems }: { systems: MacroPortionSystemRecord[] }) {
  return (
    <section
      aria-labelledby="systems-list-title"
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h2 className="text-xl font-semibold" id="systems-list-title">
        Sistemas activos
      </h2>
      {systems.length === 0 ? (
        <StatePanel
          description="Crea un sistema para calcular raciones de HC, proteina y grasa."
          title="Sin sistemas"
          tone="info"
        />
      ) : (
        <div className="mt-4 grid gap-3">
          {systems.map((system) => (
            <article
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
              key={system.id}
            >
              <h3 className="font-semibold">{system.name}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                HC {formatNumber(system.carbohydrateGrams)} g · Proteina{" "}
                {formatNumber(system.proteinGrams)} g · Grasa {formatNumber(system.fatGrams)} g
                {system.fiberGrams ? ` · Fibra ${formatNumber(system.fiberGrams)} g` : ""}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">Fuente: {system.source}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MealTargetsPanel({
  systems,
  targets
}: {
  systems: MacroPortionSystemRecord[];
  targets: MealMacroTargetRecord[];
}) {
  return (
    <section
      aria-labelledby="meal-targets-list-title"
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h2 className="text-xl font-semibold" id="meal-targets-list-title">
        Distribucion por comidas
      </h2>
      {targets.length === 0 ? (
        <StatePanel
          description="Define objetivos para que el editor de dietas pueda comparar raciones por comida."
          title="Sin objetivos"
          tone="info"
        />
      ) : (
        <div className="mt-4 grid gap-3">
          {targets.map((target) => {
            const system = systems.find((item) => item.id === target.macroPortionSystemId);
            return (
              <article
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                key={target.id}
              >
                <h3 className="font-semibold">
                  {target.name} · {target.mealLabel}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Objetivo: HC {formatNumber(target.carbohydratePortions)} raciones, proteina{" "}
                  {formatNumber(target.proteinPortions)}, grasa {formatNumber(target.fatPortions)}.
                </p>
                <p className="mt-1 text-sm">
                  {system
                    ? `Equivale a ${formatNumber(target.carbohydratePortions * system.carbohydrateGrams)} g HC, ${formatNumber(target.proteinPortions * system.proteinGrams)} g proteina y ${formatNumber(target.fatPortions * system.fatGrams)} g grasa.`
                    : "No calculable: falta el sistema de raciones."}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ExchangeGroupsPanel({ groups }: { groups: ExchangeGroupRecord[] }) {
  return (
    <section
      aria-labelledby="exchange-list-title"
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h2 className="text-xl font-semibold" id="exchange-list-title">
        Tablas de equivalencia
      </h2>
      {groups.length === 0 ? (
        <StatePanel
          description="Crea un grupo y anade alimentos con nutrientes trazables."
          title="Sin grupos"
          tone="info"
        />
      ) : (
        <div className="mt-4 space-y-4">
          {groups.map((group) => (
            <article
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
              key={group.id}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {basisLabel(group.nutrientBasis)} objetivo: {formatNumber(group.targetAmount)}{" "}
                    {group.targetUnit} · tolerancia {formatNumber(group.tolerancePercent)}%
                  </p>
                </div>
                <span className="w-fit rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted)]">
                  {group.status}
                </span>
              </div>
              {group.items.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">Sin alimentos en este grupo.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                    <caption className="sr-only">Alimentos equivalentes de {group.name}</caption>
                    <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                      <tr>
                        <th className="py-2 pr-3 font-medium" scope="col">
                          Alimento
                        </th>
                        <th className="px-3 py-2 text-right font-medium" scope="col">
                          Cantidad
                        </th>
                        <th className="px-3 py-2 text-right font-medium" scope="col">
                          Macros
                        </th>
                        <th className="px-3 py-2 text-right font-medium" scope="col">
                          Raciones
                        </th>
                        <th className="py-2 pl-3 text-right font-medium" scope="col">
                          Ajuste
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => (
                        <tr className="border-b border-[var(--border)] last:border-0" key={item.id}>
                          <th className="py-2 pr-3 font-medium" scope="row">
                            {item.foodName}
                            <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                              {item.householdMeasure ?? "Sin medida casera"} · cobertura{" "}
                              {item.completenessPercent}%
                            </span>
                          </th>
                          <td className="px-3 py-2 text-right">{formatNumber(item.grams)} g</td>
                          <td className="px-3 py-2 text-right">
                            kcal {formatNullable(item.energyKcal)} · P{" "}
                            {formatNullable(item.proteinG)} · HC{" "}
                            {formatNullable(item.carbohydrateG)} · G {formatNullable(item.fatG)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            HC {formatNullable(item.carbohydratePortions)} · P{" "}
                            {formatNullable(item.proteinPortions)} · G{" "}
                            {formatNullable(item.fatPortions)}
                          </td>
                          <td className="py-2 pl-3 text-right">{fitLabel(item.fitStatus)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function NumberField({ label, name, value }: { label: string; name: string; value?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className={inputClass} defaultValue={value} inputMode="decimal" name={name} />
    </label>
  );
}

function Textarea({
  label,
  name,
  placeholder
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea className={inputClass} name={name} placeholder={placeholder} rows={3} />
    </label>
  );
}

function basisLabel(value: ExchangeGroupRecord["nutrientBasis"]) {
  if (value === "energy_kcal") return "Energia";
  if (value === "carbohydrate") return "Hidratos";
  if (value === "protein") return "Proteina";
  if (value === "fat") return "Grasa";
  return "Fibra";
}

function fitLabel(status: string) {
  if (status === "within_tolerance") return "Dentro";
  if (status === "outside_tolerance") return "Fuera";
  return "No calculable";
}

function formatNullable(value: number | null) {
  return value === null ? "No calculable" : formatNumber(value);
}

function formatNumber(value: number) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}
