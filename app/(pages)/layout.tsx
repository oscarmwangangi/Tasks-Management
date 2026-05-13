"use client"

import { useAuth } from "../hooks/localStorage"
import { useAuthGuard } from "../hooks/useAuthGuard"

import {
  SidebarProvider,
} from "../shared/ui/sidebar"

import { AppSidebar } from "@/app/components/reusable/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthGuard()

  const {user} = useAuth()

 if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 px-10 py-12 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
            🔒
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-white text-xl font-semibold">Not Authorized</h2>
            <p className="text-zinc-500 text-sm">You don't have permission to view this page.</p>
          </div>
          <a
            href="auth/login"
            className="mt-1 px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full m-0 p-0">
        <AppSidebar />

        <main className="flex-1 ">
          

          <div className=" ">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}