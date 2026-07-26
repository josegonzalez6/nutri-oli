"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { normalizeFoodText } from "./bedca";
import type { CatalogFood } from "./catalog";

export function FoodSearch({ foods }: { foods: CatalogFood[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(foods.map((food) => food.category).filter((value) => value !== null))
      ).sort((a, b) => a.localeCompare(b, "es")),
    [foods]
  );

  const visibleFoods = useMemo(() => {
    const normalizedQuery = normalizeFoodText(query);

    return foods
      .filter((food) => category === "all" || food.category === category)
      .filter(
        (food) =>
          !normalizedQuery ||
          normalizeFoodText(`${food.name} ${food.category ?? ""}`).includes(normalizedQuery)
      )
      .slice(0, 80);
  }, [category, foods, query]);

  return (
    <section className="mt-6" aria-label="Buscador de alimentos">
      <div className="grid gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[1fr_18rem]">
        <label className="block" htmlFor="food-query">
          <span className="text-sm font-medium">Buscar alimento</span>
          <span className="relative mt-2 block">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              className="min-h-11 w-full rounded-md border border-[var(--border)] pl-10 pr-3"
              id="food-query"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="aceite, yogur, lenteja..."
              type="search"
              value={query}
            />
          </span>
        </label>
        <label className="block" htmlFor="food-category">
          <span className="text-sm font-medium">Categoria</span>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3"
            id="food-category"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="all">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        aria-label="Tabla desplazable de alimentos"
        className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)]"
        role="region"
        // Required by axe for keyboard access to the horizontally scrollable table region.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <caption className="sr-only">Alimentos por 100 gramos o mililitros segun fuente</caption>
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Alimento
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Categoria
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                kcal
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Proteina
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                HC
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Grasas
              </th>
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Fibra
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleFoods.map((food) => (
              <tr className="border-b border-[var(--border)] last:border-0" key={food.bedcaId}>
                <th className="px-4 py-3 font-medium" scope="row">
                  {food.name}
                  <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                    {food.bedcaId}
                  </span>
                </th>
                <td className="px-4 py-3 text-[var(--muted)]">{food.category ?? "-"}</td>
                <td className="px-4 py-3 text-right">{formatAmount(food.energyKcalPer100g, 0)}</td>
                <td className="px-4 py-3 text-right">{formatAmount(food.proteinPer100g, 1)} g</td>
                <td className="px-4 py-3 text-right">{formatAmount(food.carbsPer100g, 1)} g</td>
                <td className="px-4 py-3 text-right">{formatAmount(food.fatPer100g, 1)} g</td>
                <td className="px-4 py-3 text-right">{formatAmount(food.fiberPer100g, 1)} g</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleFoods.length === 0 ? (
          <p className="p-6 text-sm text-[var(--muted)]">
            No hay alimentos que coincidan con la busqueda.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function formatAmount(value: number | null, maximumFractionDigits: number): string {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("es-ES", { maximumFractionDigits }).format(value);
}
