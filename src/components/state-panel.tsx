import type { ReactNode } from "react";

type StatePanelTone = "neutral" | "info" | "warning" | "danger";

export function StatePanel({
  title,
  description,
  icon,
  children,
  tone = "neutral"
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
  tone?: StatePanelTone;
}) {
  const toneClass: Record<StatePanelTone, string> = {
    neutral: "text-[var(--muted)]",
    info: "text-[var(--info)]",
    warning: "text-[var(--amber)]",
    danger: "text-[var(--danger)]"
  };

  return (
    <section
      aria-label={title}
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      {icon ? <div className={`mb-3 ${toneClass[tone]}`}>{icon}</div> : null}
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      {children}
    </section>
  );
}
