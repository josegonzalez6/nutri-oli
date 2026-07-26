"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";

import type { FormState } from "./actions";

const initialState: FormState = { status: "idle", message: "" };

export function ActionForm({
  action,
  children,
  submitLabel
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          const nextState = await action(state, formData);
          setState(nextState);

          if (nextState.status === "success") {
            formRef.current?.reset();
            router.refresh();
          }
        });
      }}
      ref={formRef}
    >
      {children}
      {state.message ? (
        <p
          className={`text-sm ${state.status === "error" ? "text-[var(--danger)]" : "text-[var(--olive-dark)]"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="relative z-10 min-h-11 w-full rounded-md bg-[var(--olive-dark)] px-4 py-2 font-semibold text-white disabled:opacity-60 sm:w-fit"
        disabled={pending}
        type="submit"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
