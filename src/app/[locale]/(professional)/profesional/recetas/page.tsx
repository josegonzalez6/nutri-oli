import { BookOpen, ChefHat } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatePanel } from "@/components/state-panel";
import { ActionForm } from "@/features/clients-agenda/action-form";
import { createRecipeAction, createRecipeIngredientAction } from "@/features/planning/actions";
import type { RecipeRecord } from "@/features/planning/repository";
import { loadPlanningWorkspace } from "@/features/planning/repository";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export default async function RecipesPage({ params }: { params: Promise<{ locale: string }> }) {
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
          <p className="text-sm font-semibold uppercase text-[var(--olive)]">Biblioteca</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Recetas persistentes</h1>
          <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">
            Crea recetas versionables, registra ingredientes y revisa sus valores nutricionales sin
            convertir datos desconocidos en cero.
          </p>
        </header>

        {workspace.status !== "ready" ? (
          <div className="mt-6">
            <StatePanel
              description={
                workspace.status === "not_configured"
                  ? `Configura ${workspace.missing.join(", ")} para activar recetas.`
                  : workspace.message
              }
              icon={<BookOpen aria-hidden="true" className="size-6" />}
              title={
                workspace.status === "not_configured"
                  ? "Supabase no configurado"
                  : "No se pudieron cargar recetas"
              }
              tone={workspace.status === "not_configured" ? "warning" : "danger"}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-6">
              <section
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
                aria-labelledby="new-recipe-title"
              >
                <div className="flex items-center gap-3">
                  <ChefHat aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                  <h2 className="text-xl font-semibold" id="new-recipe-title">
                    Nueva receta
                  </h2>
                </div>
                <div className="mt-4">
                  <ActionForm action={createRecipeAction} submitLabel="Crear receta">
                    <label className="grid gap-2 text-sm font-medium">
                      Nombre
                      <input className={inputClass} name="name" required />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium">
                        Raciones
                        <input
                          className={inputClass}
                          defaultValue="1"
                          min="0.01"
                          name="servings"
                          required
                          step="0.01"
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Rendimiento (g)
                        <input
                          className={inputClass}
                          min="0.01"
                          name="yieldGrams"
                          step="0.01"
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Tiempo (min)
                        <input
                          className={inputClass}
                          min="0"
                          name="prepTimeMinutes"
                          step="1"
                          type="number"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Patron alimentario
                        <input
                          className={inputClass}
                          name="dietaryPattern"
                          placeholder="Mediterraneo"
                        />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-medium">
                      Resumen
                      <textarea className={`${inputClass} min-h-20`} name="summary" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Ingredientes o alergenos relevantes
                      <input
                        className={inputClass}
                        name="allergens"
                        placeholder="Separados por comas"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Etiquetas
                      <input
                        className={inputClass}
                        name="tags"
                        placeholder="rapida, batch cooking"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Instrucciones
                      <textarea className={`${inputClass} min-h-28`} name="instructions" />
                    </label>
                  </ActionForm>
                </div>
              </section>

              {workspace.data.recipes.length > 0 ? (
                <section
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
                  aria-labelledby="new-ingredient-title"
                >
                  <h2 className="text-xl font-semibold" id="new-ingredient-title">
                    Añadir ingrediente
                  </h2>
                  <div className="mt-4">
                    <ActionForm
                      action={createRecipeIngredientAction}
                      submitLabel="Añadir ingrediente"
                    >
                      <label className="grid gap-2 text-sm font-medium">
                        Receta
                        <select className={inputClass} name="recipeId" required>
                          {workspace.data.recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Alimento
                          <input className={inputClass} name="foodName" required />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Gramos
                          <input
                            className={inputClass}
                            min="0.01"
                            name="grams"
                            required
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
                        Nota
                        <textarea className={`${inputClass} min-h-20`} name="notes" />
                      </label>
                    </ActionForm>
                  </div>
                </section>
              ) : null}
            </div>

            <section aria-labelledby="recipe-list-title">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold" id="recipe-list-title">
                  Biblioteca de recetas
                </h2>
                <span className="text-sm text-[var(--muted)]">
                  {workspace.data.recipes.length} recetas
                </span>
              </div>
              {workspace.data.recipes.length === 0 ? (
                <div className="mt-4">
                  <StatePanel
                    description="Crea la primera receta profesional para reutilizarla en planes."
                    title="Biblioteca vacia"
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {workspace.data.recipes.map((recipe) => (
                    <RecipeArticle key={recipe.id} recipe={recipe} />
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

function RecipeArticle({ recipe }: { recipe: RecipeRecord }) {
  return (
    <article className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{recipe.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Borrador · version {recipe.version} · {recipe.servings} raciones
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-strong)] px-2 py-1 text-xs font-semibold">
          {recipe.total.completenessPercent}% datos
        </span>
      </div>
      {recipe.summary ? <p className="mt-3 text-sm">{recipe.summary}</p> : null}
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <NutritionValue label="Total" total={recipe.total} />
        <NutritionValue label="Por racion" total={recipe.perServing} />
      </div>
      {recipe.ingredients.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Sin ingredientes registrados.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Ingredientes de {recipe.name}</caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-3">Alimento</th>
                <th className="py-2 pr-3">Cantidad</th>
                <th className="py-2 pr-3">kcal</th>
                <th className="py-2 pr-3">Macros</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ingredient) => (
                <tr className="border-b border-[var(--border)] last:border-0" key={ingredient.id}>
                  <td className="py-2 pr-3 font-medium">{ingredient.foodName}</td>
                  <td className="py-2 pr-3">
                    {ingredient.grams} g
                    {ingredient.householdMeasure ? ` · ${ingredient.householdMeasure}` : ""}
                  </td>
                  <td className="py-2 pr-3">{displayValue(ingredient.energyKcal)}</td>
                  <td className="py-2 pr-3">
                    P {displayValue(ingredient.proteinG)} · HC{" "}
                    {displayValue(ingredient.carbohydrateG)} · G {displayValue(ingredient.fatG)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function NutritionValue({ label, total }: { label: string; total: RecipeRecord["total"] }) {
  return (
    <p>
      <span className="font-semibold">{label}:</span> {displayValue(total.energyKcal)} kcal · P{" "}
      {displayValue(total.proteinG)} g · HC {displayValue(total.carbohydrateG)} g · G{" "}
      {displayValue(total.fatG)} g · Fibra {displayValue(total.fiberG)} g
    </p>
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
function displayValue(value: number | null) {
  return value === null ? "No calculable" : String(value);
}
