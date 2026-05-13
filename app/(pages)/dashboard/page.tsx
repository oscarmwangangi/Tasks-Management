"use client";

import { useDashboardHooks } from "../../hooks/dashboardHooks";
import  DashboardSkeleton  from "@/app/features/dashboardSkeleton"
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuth } from "../../hooks/localStorage";
import { BiBell } from "react-icons/bi";
import { SidebarTrigger } from "@/app/shared/ui/sidebar";
import Image from "next/image";
import OscarCartoon2 from "@/app/assets/OscarCartoon.png";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
);

import { PolarArea, Doughnut } from "react-chartjs-2";
import { ChartCard } from "@/app/shared/ui/cardChart"
import { PriorityBadge } from "@/app/shared/ui/priorityBadge";
import { StatusBadge } from "@/app/shared/ui/statusBadge";
import { formatDateRange } from "@/app/actions/formatDateRange";
import { StatsCard } from "@/app/shared/ui/statsCard";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  useAuthGuard();

  const {user} = useAuth();
  const { 
    stats, loading, table, polarData, doughnutOptions,
    doughnutChartData, chartOptions, setPage 
  } = useDashboardHooks(5);

  if (loading && !stats) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">

<header className="mt-8">
  <div className="relative flex flex-col gap-6 mb-8 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
    
    {/* Glow Effect */}
    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-r from-emerald-500/5 via-transparent to-cyan-500/5" />

    {/* Left Side */}
    <div className="relative z-10 flex flex-col">
      <div className="flex items-center gap-4">
        
        {/* Sidebar Trigger */}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a]/70 hover:bg-[#1e293b] transition-all">
          <SidebarTrigger />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Welcome back,{" "}
            <span className="font-medium text-emerald-400">
              {user?.email}
            </span>
          </p>
        </div>
      </div>
    </div>

    {/* Search */}
    <div className="relative z-10 flex-1 max-w-xl w-1/3 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
      <div className="group relative">
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-slate-500 transition-colors group-focus-within:text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="search"
          placeholder="Search tasks, teams, files..."
          className="w-full rounded-2xl border border-white/10 bg-[#0f172a]/70 py-3 pl-11 pr-16 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-emerald-500/40 focus:bg-[#111827] focus:shadow-lg focus:shadow-emerald-500/10"
        />

        {/* Shortcut */}
        <div className="absolute inset-y-0 right-4 hidden items-center md:flex">
          <kbd className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1 text-[10px] font-medium text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>

    {/* Right Side */}
    <div className="relative z-10 flex items-center gap-3">
      
      {/* Add Task Button */}
      <button className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] hover:bg-emerald-400 active:scale-95">
        + Add Task
      </button>

      {/* Notification */}
      <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a]/70 text-slate-300 transition-all hover:border-emerald-500/30 hover:bg-[#111827] hover:text-emerald-400">
        <BiBell className="text-2xl" />

        {/* Notification Dot */}
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#020617]" />
      </button>

      {/* Profile */}
      <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]/70 shadow-md">
        <Image
          src={OscarCartoon2}
          alt="profile image"
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </div>
</header>
      {/* Glow Background */}
      <div className="fixed top-0 right-0 w-125 h-125 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />



      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
        />

        <StatsCard
          title="Backlog"
          value={stats.backlogTasks}
        />

        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
        />

        <StatsCard
          title="Completed"
          value={stats.doneTasks}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <ChartCard title="Task Status">
          <PolarArea data={polarData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Task Priority">
           <Doughnut
              data={doughnutChartData}
              options={doughnutOptions}
        />
        </ChartCard>
      </div>

      {/* Table */}
      <div className="mt-8 group rounded-3xl border border-white/5 bg-white/3 p-5 transition-all hover:border-emerald-500/20 hover:bg-white/5 hover:shadow-xl hover:shadow-black/20 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Recent Tasks
          </h2>

          <span className="text-slate-400 text-sm">
            {table?.pagination.totalItems} tasks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead className="bg-white/5">
              <tr className="text-left text-slate-400 text-sm">
                <th className="p-5">Task</th>
                <th className="p-5">Priority</th>
                <th className="p-5">Status</th>
                <th className="p-5">Description</th>
                <th className="p-5">Timeline</th>
              </tr>
            </thead>

            <tbody>
              {table?.tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-5 font-medium">
                    {task.title}
                  </td>

                  <td className="p-5">
                    <PriorityBadge value={task.priority} />
                  </td>

                  <td className="p-5">
                    <StatusBadge value={task.status} />
                  </td>

                  <td className="p-5 text-slate-300 max-w-75 truncate">
                    {task.description}
                  </td>

                 <td className="p-5 text-slate-400 text-sm">
                    {task.start_date && task.due_date ? (
                        formatDateRange(task.start_date, task.due_date)
                    ) : (
                        <span className="text-slate-600 italic">No date set</span>
                    )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {table?.pagination.currentPage} of{" "}
            {table?.pagination.totalPages}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() =>
                setPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={!table?.pagination.hasPrevPage}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!table?.pagination.hasNextPage}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

