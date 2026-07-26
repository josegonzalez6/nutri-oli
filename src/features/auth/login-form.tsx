"use client";

import { useState, useTransition } from "react";

import { signInAction } from "./actions";
import type { AuthFormState } from "./actions";

const initialState: AuthFormState = { status: "idle", message: "" };
const inputClass = "min-h-11 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm";

export function LoginForm({ locale }: { locale: string }) {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          const nextState = await signInAction(state, formData);
          setState(nextState);
        });
      }}
    >
      <input name="locale" type="hidden" value={locale} />
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input autoComplete="email" className={inputClass} name="email" required type="email" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Contrasena
        <input
          autoComplete="current-password"
          className={inputClass}
          name="password"
          required
          type="password"
        />
      </label>
      {state.message ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        className="min-h-11 w-full rounded-md bg-[var(--olive-dark)] px-4 py-2 font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Entrando..." : "Iniciar sesion"}
      </button>
      <p className="text-xs leading-5 text-[var(--muted)]">
        La recuperacion de contrasena y MFA profesional quedan pendientes de completar antes de
        produccion.
      </p>
    </form>
  );
}
