"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleServerLogout() {
  const cookieStore = await cookies();

  // 1. Delete the local development cookie
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("next-auth.session-token"); // fallback for older configs

  // 2. Delete the production secure cookie
  cookieStore.delete("__Secure-authjs.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");

  // 3. Clear the callback/redirect cookies if they exist
  cookieStore.delete("authjs.callback-url");
  cookieStore.delete("authjs.csrf-token");

  // 4. Send them back to the login page
  redirect("/auth/login");
}