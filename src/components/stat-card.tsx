import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--olive-dark)]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{detail}</p>
    </section>
  );
}
