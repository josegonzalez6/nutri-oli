import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <form className="w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("notice")}</p>
        <label className="mt-6 block text-sm font-medium" htmlFor="email">
          {t("email")}
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3"
          id="email"
          name="email"
          required
          type="email"
        />
        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          {t("password")}
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] px-3"
          id="password"
          name="password"
          required
          type="password"
        />
        <button
          className="mt-6 min-h-11 w-full rounded-md bg-[var(--olive-dark)] px-4 py-2 font-semibold text-white"
          type="submit"
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
