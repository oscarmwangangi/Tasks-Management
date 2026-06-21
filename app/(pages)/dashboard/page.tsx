import { auth } from "@/app/middlware/auth";
import DashboardClient from "./dashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return <DashboardClient session={session} />;
}