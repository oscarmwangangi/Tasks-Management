"use client";

import {
  FolderKanban,
  MoreHorizontal,
  Plus,
  Star,
} from "lucide-react";

import { useDashboardHooks } from "@/app/hooks/dashboardHooks";
import { StatsCard } from "@/app/shared/ui/statsCard";
import DashboardSkeleton from "@/app/features/dashboardSkeleton";

import { useMemo, useState } from "react";


export default function ProjectsPage() {


  const { stats, loading } = useDashboardHooks(10);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { userId?: string };
      return parsed?.userId ?? null;
    } catch {
      return null;
    }
  }, [isAddOpen]);


  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/3">
            <FolderKanban className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
            <p className="text-slate-400 text-sm">
              Overview of your project progress and pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-white/5 bg-white/3 p-3 text-slate-300 hover:bg-white/5 transition-all"
            type="button"
            onClick={() => setIsAddOpen(true)}
            aria-label="Add project"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-white/5 bg-white/3 p-3 text-slate-300 hover:bg-white/5 transition-all">
            <Star className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-white/5 bg-white/3 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition-all">
            Share
          </button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
        <StatsCard title="Backlog" value={stats?.backlogTasks ?? 0} />
        <StatsCard title="Todo" value={stats?.todoTasks ?? 0} />
        <StatsCard title="In Progress" value={stats?.inProgressTasks ?? 0} />
        <StatsCard title="Done" value={stats?.doneTasks ?? 0} />
      </div>

  

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-white/3 p-5">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-200">
              Active Projects
            </h2>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Website Redesign</p>
                <span className="text-xs rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-1 font-semibold">
                  Active
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Ship improvements and polish UI components.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Mobile App</p>
                <span className="text-xs rounded-full bg-blue-500/10 text-blue-400 px-2 py-1 font-semibold">
                  In Progress
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Implement onboarding flow and session refresh.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/3 p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">
            Project Pipeline
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Review</p>
              <p className="mt-1 text-2xl font-bold">{stats?.reviewTasks ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Active</p>
              <p className="mt-1 text-2xl font-bold">{stats?.activeTasks ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Todo</p>
              <p className="mt-1 text-2xl font-bold">{stats?.todoTasks ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-bold">{stats?.doneTasks ?? 0}</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            This page reuses your existing dashboard stats to provide a fast
            Projects overview UI.
          </p>
        </div>
      </div>
    </div>
  );
}

