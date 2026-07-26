import { UserPlus, Users } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell";
import { StatePanel } from "@/components/state-panel";
import { ActionForm } from "@/features/clients-agenda/action-form";
import { createClientAction, updateClientStatusAction } from "@/features/clients-agenda/actions";
import { clientStatusLabel } from "@/features/clients-agenda/labels";
import { loadWorkspaceOverview } from "@/features/clients-agenda/repository";
import { formatDateTime } from "@/features/clients-agenda/time";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const inputClass =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export default async function ClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = routing.locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : routing.defaultLocale;
  setRequestLocale(locale);
  const overview = await loadWorkspaceOverview();

  return (
    <AppShell locale={locale} section="professional">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="text-sm font-semibold uppercase text-[var(--olive)]">Clientes</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            Clientes persistentes
          </h1>
          <p className="mt-2 max-w-3xl text-base text-[var(--muted)]">
            Alta, seguimiento y estado operativo de clientes guardados en Supabase.
          </p>
        </header>

        {overview.status === "not_configured" ? (
          <div className="mt-6">
            <StatePanel
              description={`Configura ${overview.missing.join(", ")} para activar CRUD real de clientes.`}
              icon={<Users aria-hidden="true" className="size-6" />}
              title="Supabase no configurado"
              tone="warning"
            />
          </div>
        ) : null}

        {overview.status === "error" ? (
          <div className="mt-6">
            <StatePanel
              description="La pantalla no usa datos hardcodeados cuando falla la lectura persistente."
              icon={<Users aria-hidden="true" className="size-6" />}
              title="No se pudieron cargar clientes"
              tone="danger"
            />
          </div>
        ) : null}

        {overview.status === "ready" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <section
              aria-labelledby="new-client-title"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center gap-3">
                <UserPlus aria-hidden="true" className="size-5 text-[var(--olive-dark)]" />
                <h2 className="text-xl font-semibold" id="new-client-title">
                  Nuevo cliente
                </h2>
              </div>
              <div className="mt-4">
                <ActionForm action={createClientAction} submitLabel="Crear cliente">
                  <label className="grid gap-2 text-sm font-medium">
                    Codigo interno
                    <input className={inputClass} name="internalCode" required />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Nombre visible
                    <input className={inputClass} name="displayName" required />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Estado
                    <select className={inputClass} defaultValue="active" name="status">
                      <option value="lead">Lead</option>
                      <option value="active">Activo</option>
                      <option value="paused">Pausado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Email
                    <input className={inputClass} name="email" type="email" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Telefono
                    <input className={inputClass} name="phone" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Fecha de nacimiento
                    <input className={inputClass} name="dateOfBirth" type="date" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Objetivo
                    <textarea className={inputClass} name="objectiveSummary" rows={3} />
                  </label>
                </ActionForm>
              </div>
            </section>

            <section
              aria-labelledby="clients-title"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold" id="clients-title">
                    Clientes
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {overview.data.clients.length} registros leidos desde Supabase.
                  </p>
                </div>
              </div>

              {overview.data.clients.length === 0 ? (
                <StatePanel
                  description="Crea el primer cliente para activar seguimiento y agenda."
                  title="No hay clientes"
                  tone="info"
                />
              ) : (
                <div className="mt-4 space-y-3">
                  {overview.data.clients.map((client) => (
                    <article
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                      key={client.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{client.displayName}</h3>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {client.internalCode} · {client.email ?? "Sin email"}
                          </p>
                          <p className="mt-2 text-sm">
                            {client.objectiveSummary ?? "Sin objetivo registrado"}
                          </p>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {client.nextAppointmentAt
                              ? `Proxima cita: ${formatDateTime(client.nextAppointmentAt)}`
                              : "Sin cita futura persistida"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="w-fit rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs text-[var(--muted)]">
                            {clientStatusLabel(client.status)}
                          </span>
                          <ActionForm action={updateClientStatusAction} submitLabel="Actualizar">
                            <input name="clientId" type="hidden" value={client.id} />
                            <label className="grid gap-2 text-sm font-medium">
                              Estado
                              <select
                                className={inputClass}
                                defaultValue={client.status}
                                name="status"
                              >
                                <option value="lead">Lead</option>
                                <option value="active">Activo</option>
                                <option value="paused">Pausado</option>
                                <option value="archived">Archivado</option>
                              </select>
                            </label>
                          </ActionForm>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
