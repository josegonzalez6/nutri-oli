import { LoaderCircle } from "lucide-react";

import { StatePanel } from "@/components/state-panel";

export default function LocaleLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <StatePanel
          description="Cargando una vista segura sin exponer datos privados en estados intermedios."
          icon={<LoaderCircle aria-hidden="true" className="size-6 animate-spin" />}
          title="Cargando"
          tone="info"
        />
      </div>
    </main>
  );
}
