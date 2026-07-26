"use client";

import { AlertTriangle } from "lucide-react";

import { StatePanel } from "@/components/state-panel";

export default function LocaleError() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <StatePanel
          description="No se muestra detalle tecnico ni informacion clinica. Reintenta o contacta con soporte interno."
          icon={<AlertTriangle aria-hidden="true" className="size-6" />}
          title="No se pudo cargar la vista"
          tone="danger"
        />
      </div>
    </main>
  );
}
