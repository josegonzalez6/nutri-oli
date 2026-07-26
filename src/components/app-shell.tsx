import Link from "next/link";
import {
  Apple,
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  MessageSquare,
  Users
} from "lucide-react";
import type { ReactNode } from "react";

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
      href: `/${locale}/${basePath}#planes`,
      label: "Planes",
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
      href: `/${locale}/${basePath}#mensajes`,
      label: "Mensajes",
      icon: <MessageSquare aria-hidden="true" />
    },
    {
      href: `/${locale}/${basePath}#documentos`,
      label: "Documentos",
      icon: <FileText aria-hidden="true" />
    }
  ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside
        aria-label="Navegacion lateral"
        className="border-b border-[var(--border)] bg-[var(--surface)] p-4 lg:min-h-screen lg:border-b-0 lg:border-r"
      >
        <Link
          className="flex items-center gap-3 text-lg font-semibold"
          href={`/${locale}/${basePath}`}
        >
          <span className="grid size-10 place-items-center rounded-md bg-[var(--olive-dark)] text-white">
            NO
          </span>
          <span>Nutri-Oli</span>
        </Link>
        <nav
          aria-label="Navegacion principal"
          className="mt-6 flex gap-2 overflow-x-auto lg:flex-col"
        >
          {navItems.map((item) => (
            <Link
              className="flex min-h-11 min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
              href={item.href}
              key={item.href}
            >
              <span className="size-5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
