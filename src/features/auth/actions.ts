"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  status: "idle" | "error";
  message: string;
};

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const login = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "es");

  if (!login || !password) {
    return { status: "error", message: "Introduce email y contrasena." };
  }

  const email = login.toLowerCase() === "jose" ? "jose@nutri-oli.test" : login;

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
