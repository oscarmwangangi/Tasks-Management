"use client";

import React, { useEffect } from "react";
import { PolarArea, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import {
  BarChart3,
  CheckCircle,
  AlertCircle,
  Layers,
  ListTodo,
  Loader2,
} from "lucide-react";
import { useDashboardHooks } from "@/app/hooks/dashboardHooks";

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

interface AnalyticsDashboardProps {
  stats: any
  priority: any;
  polarData: any;
  doughnutChartData: any;
  chartOptions: any;
  doughnutOptions: any;
  loading: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subLabel,
  color = "emerald",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subLabel?: string;
  color?: string;
}) => {
  const colorClass = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  }[color] || "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

  return (
    <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
          {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl border ${colorClass} flex items-center justify-center`}>
          {Icon}
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsDashboard({
  
  priority,
  polarData,
  doughnutChartData,
  chartOptions,
  doughnutOptions,
  loading,
}: AnalyticsDashboardProps) {
  
  const {stats}=useDashboardHooks(10);
  if (loading ||  !priority) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }



  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ListTodo className="h-6 w-6" />}
          label="Total Tasks"
          value={
            (stats?.todoTasks ?? 0) +
            (stats?.inProgressTasks ?? 0) +
            (stats?.activeTasks ?? 0) +
            (stats?.reviewTasks ?? 0) +
            (stats?.doneTasks ?? 0)
          }
          subLabel="All tasks in section"
          color="emerald"
        />

        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          label="Completed Tasks"
          value={stats?.doneTasks ?? 0}
          subLabel={`${stats?.doneTasks ?? 0}% complete`}
          color="blue"
        />

        <StatCard
          icon={<AlertCircle className="h-6 w-6" />}
          label="Overdue Tasks"
          value={stats?.overdueTasks ?? 0}
          subLabel="Past due date"
          color="rose"
        />

        <StatCard
          icon={<Layers className="h-6 w-6" />}
          label="Active Teams"
          value={stats?.activeTeams ?? 0}
          subLabel="Teams in section"
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Polar Area Chart */}
        <div className="rounded-3xl border border-white/5 bg-white/3 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Task Status Distribution</h3>
          </div>
          <div className="h-80 w-full relative">
            <PolarArea data={polarData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="rounded-3xl border border-white/5 bg-white/3 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Task Priority Distribution</h3>
          </div>
          <div className="h-80 w-full relative">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="rounded-3xl border border-white/5 bg-white/3 p-6">
        <h3 className="text-lg font-semibold mb-4">Task Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Backlog", value: stats?.backlogTasks ?? 0, color: "bg-slate-500/20 text-slate-300" },
            { label: "Todo", value: stats?.todoTasks ?? 0, color: "bg-blue-500/20 text-blue-300" },
            { label: "In Progress", value: stats?.inProgressTasks ?? 0, color: "bg-amber-500/20 text-amber-300" },
            { label: "Active", value: stats?.activeTasks ?? 0, color: "bg-cyan-500/20 text-cyan-300" },
            { label: "Review", value: stats?.reviewTasks ?? 0, color: "bg-purple-500/20 text-purple-300" },
            { label: "Done", value: stats?.doneTasks ?? 0, color: "bg-green-500/20 text-green-300" },
          ].map((status) => (
            <div key={status.label} className={`rounded-2xl p-4 text-center ${status.color}`}>
              <p className="text-2xl font-bold">{status.value}</p>
              <p className="text-xs mt-1 opacity-80">{status.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="rounded-3xl border border-white/5 bg-white/3 p-6">
        <h3 className="text-lg font-semibold mb-4">Task Priority Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "High Priority",
              value: priority.highStatus,
              color: "bg-rose-500/20 text-rose-300",
              percent: (priority.highStatus / (priority.highStatus + priority.mediumStatus + priority.lowStatus)) * 100,
            },
            {
              label: "Medium Priority",
              value: priority.mediumStatus,
              color: "bg-amber-500/20 text-amber-300",
              percent: (priority.mediumStatus / (priority.highStatus + priority.mediumStatus + priority.lowStatus)) * 100,
            },
            {
              label: "Low Priority",
              value: priority.lowStatus,
              color: "bg-blue-500/20 text-blue-300",
              percent: (priority.lowStatus / (priority.highStatus + priority.mediumStatus + priority.lowStatus)) * 100,
            },
          ].map((p) => (
            <div key={p.label} className={`rounded-2xl p-4 ${p.color}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{p.label}</p>
                <span className="text-lg font-bold">{p.value}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${
                    p.label.includes("High") ? "bg-rose-400" : p.label.includes("Medium") ? "bg-amber-400" : "bg-blue-400"
                  }`}
                  style={{ width: `${isNaN(p.percent) ? 0 : p.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
