"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  status: "idle" | "error";
  message: string;
};

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "es");

  if (!email || !password) {
    return { status: "error", message: "Introduce email y contrasena." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "No se pudo iniciar sesion con esas credenciales." };
  }

  redirect(`/${locale}/profesional`);
}

export async function signOutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "es");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}
