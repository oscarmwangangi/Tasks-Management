"use client";

import { useDashboardHooks } from "../../hooks/dashboardHooks";
import  DashboardSkeleton  from "@/app/features/dashboardSkeleton"
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuth } from "../../hooks/localStorage";

import { SidebarTrigger } from "@/app/shared/ui/sidebar";
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

  const user = useAuth();
  const { 
    stats, loading, table, polarData, doughnutOptions,
    doughnutChartData, chartOptions, setPage 
  } = useDashboardHooks();

  if (loading && !stats) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
        <header className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">          
        </div>
      </header>
      {/* Glow Background */}
      <div className="fixed top-0 right-0 w-125 h-125 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 relative">
    {/* Left Side: Title & Welcome */}
    <div className="flex flex-col">
        <div className="flex items-center gap-4">
        <SidebarTrigger /> 
        <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard
        </h1>
        </div>
        <p className="text-slate-400 mt-2 ml-14 md:ml-12">
        Welcome back, <span className="text-emerald-400/80">{user?.email}</span>
        </p>
    </div>


  <div className="flex-1 max-w-md w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:top-0">
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="search"
        placeholder="Search Everything"
        className="w-full bg-[#161b22]/40 border border-white/5 focus:border-emerald-500/30 focus:bg-[#161b22]/80 text-slate-200 text-sm rounded-full py-2.5 pl-11 pr-4 outline-none transition-all backdrop-blur-md"
      />
      <div className="absolute inset-y-0 right-4 flex items-center">
         <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-800/50 rounded border border-slate-700">
           ⌘K
         </kbd>
      </div>
    </div>
  </div>

  {/* Right Side: Action Button */}
  <div className="flex items-center gap-3">
     <button className="bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-900/20 active:scale-95">
      + Add Task
    </button>
  </div>
</div>

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
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
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

