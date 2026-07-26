import { ShieldCheck } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { StatePanel } from "@/components/state-panel";
import { LoginForm } from "@/features/auth/login-form";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <StatePanel
          description="Acceso profesional protegido por Supabase Auth. El registro libre de clientes permanece desactivado."
          icon={<ShieldCheck aria-hidden="true" className="size-6" />}
          title="Acceso profesional"
          tone="info"
        >
          <LoginForm locale={locale} />
        </StatePanel>
      </div>
    </main>
  );
}
