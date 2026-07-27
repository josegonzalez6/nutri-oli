import Link from "next/link";
import {
  Apple,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  Scale,
  Search,
  Stethoscope,
  UserPlus,
  Users
} from "lucide-react";
import type { ReactNode } from "react";

import { signOutAction } from "@/features/auth/actions";
import type { Locale } from "@/i18n/routing";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function AppShell({
  children,
  locale,
  section
}: {
  children: ReactNode;
  locale: Locale;
  section: "professional" | "client";
}) {
  const basePath = section === "professional" ? "profesional" : "portal";
  const navItems: NavItem[] = [
    { href: `/${locale}/${basePath}`, label: "Inicio", icon: <Home aria-hidden="true" /> },
    {
      href:
        section === "professional"
          ? `/${locale}/profesional/agenda`
          : `/${locale}/${basePath}#agenda`,
      label: "Agenda",
      icon: <CalendarDays aria-hidden="true" />
    },
    {
      href:
        section === "professional"
          ? `/${locale}/profesional/clientes`
          : `/${locale}/${basePath}#clientes`,
      label: "Clientes",
      icon: <Users aria-hidden="true" />
    },
    {
      href: section === "professional" ? `/${locale}/profesional/clientes` : `/${locale}/portal`,
      label: "Consultas",
      icon: <ClipboardList aria-hidden="true" />
    },
    {
      href:
        section === "professional"
          ? `/${locale}/profesional/alimentos`
          : `/${locale}/${basePath}#plan`,
      label: "Alimentos",
      icon: <Apple aria-hidden="true" />
    },
    {
      href:
        section === "professional"
          ? `/${locale}/profesional/equivalencias`
          : `/${locale}/${basePath}#equivalencias`,
      label: "Equivalencias",
      icon: <Scale aria-hidden="true" />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[17.5rem_1fr]">
      <aside
        aria-label="Navegacion lateral"
        className="border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r"
      >
        <Link
          className="flex items-center gap-3 text-lg font-semibold"
          href={`/${locale}/${basePath}`}
        >
          <span className="grid size-10 place-items-center rounded-md bg-[var(--olive-dark)] text-sm text-white">
            NO
          </span>
          <span>
            Nutri-Oli
            <span className="block text-xs font-medium text-[var(--muted)]">
              Clinica nutricional
            </span>
          </span>
        </Link>
        <nav
          aria-label="Navegacion principal"
          className="mt-6 flex gap-2 overflow-x-auto lg:flex-col"
        >
          {navItems.map((item) => (
            <Link
              className="flex min-h-11 min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
              href={item.href}
              key={item.href}
            >
              <span className="size-5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        {section === "professional" ? (
          <div className="mt-6 hidden rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm lg:block">
            <p className="font-semibold">Flujo principal</p>
            <p className="mt-1 text-[var(--muted)]">
              Cliente, consulta, anamnesis y antropometria en una ficha persistente.
            </p>
          </div>
        ) : null}
      </aside>
      <div className="min-w-0">
        <header className="z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,white)] px-4 py-3 backdrop-blur sm:px-6 lg:sticky lg:top-0 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div
              aria-label="Miga de pan"
              className="flex items-center gap-2 text-sm text-[var(--muted)]"
            >
              <Link
                className="font-medium text-[var(--foreground)]"
                href={`/${locale}/${basePath}`}
              >
                Nutri-Oli
              </Link>
              <ChevronRight aria-hidden="true" className="size-4" />
              <span>{section === "professional" ? "Area profesional" : "Portal cliente"}</span>
            </div>
            {section === "professional" ? (
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="relative block" htmlFor="global-search">
                  <span className="sr-only">Buscar cliente o alimento</span>
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <input
                    className="min-h-10 w-full rounded-md border border-[var(--border)] bg-white pl-9 pr-3 text-sm md:w-72"
                    id="global-search"
                    placeholder="Buscar cliente, cita o alimento"
                    type="search"
                  />
                </label>
                <div className="flex gap-2">
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold"
                    href={`/${locale}/profesional/clientes`}
                  >
                    <UserPlus aria-hidden="true" className="size-4" />
                    Nuevo cliente
                  </Link>
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--olive-dark)] px-3 text-sm font-semibold !text-white"
                    href={`/${locale}/profesional/agenda`}
                  >
                    <CalendarDays aria-hidden="true" className="size-4" />
                    Nueva cita
                  </Link>
                  <Link
                    className="hidden min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold xl:inline-flex"
                    href={`/${locale}/profesional/clientes`}
                  >
                    <Stethoscope aria-hidden="true" className="size-4" />
                    Nueva consulta
                  </Link>
                </div>
                <form action={signOutAction}>
                  <input name="locale" type="hidden" value={locale} />
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold"
                    type="submit"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Salir
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
