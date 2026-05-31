
import { auth } from "@/app/middlware/auth";
import SettingsClient from "./settingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {

  const session = await auth();


  if (!session) {
    redirect("/auth/login");
  }


  return <SettingsClient session={session} />;
}