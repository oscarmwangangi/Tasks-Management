"use client";

import {
  CalendarDays,
  CircleDot,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Star,
} from "lucide-react";

import { useDashboardHooks } from "@/app/hooks/dashboardHooks";
import { columns } from "@/app/data/statusColumn.data";

export default function TaskPage() {
  const { table } = useDashboardHooks(100);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      {/* Background Glow */}
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 shadow-lg shadow-emerald-900/10">
            <CircleDot className="h-4 w-4" />
            Board
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/3 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-all">
            <Star className="h-4 w-4" />
            To Do List
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-white/5 bg-white/3 p-3 text-slate-300 hover:bg-white/5 transition-all">
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

      {/* Board */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => {
          const tasks =
            table?.tasks?.filter(
              (task) => task.status === column.status
            ) || [];

          return (
            <div key={column.status} className="flex flex-col gap-4">
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                    {column.title}
                  </h2>

                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/5 px-2 text-xs font-medium text-slate-400">
                    {tasks.length}
                  </span>
                </div>

                <button className="text-slate-500 hover:text-slate-300 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Add Task */}
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/3 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/5">
                <Plus className="h-4 w-4" />
                New Task
              </button>

              {/* Tasks */}
              <div className="flex flex-col gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-3xl border border-white/5 bg-white/3 p-5 transition-all hover:border-emerald-500/20 hover:bg-white/5 hover:shadow-xl hover:shadow-black/20"
                  >
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-1 text-lg font-semibold text-white">
                          {task.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
                          {task.description || "No description available"}
                        </p>
                      </div>

                      {task.is_favorite && (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>

                    {/* Priority Badge */}
                    <div className="mb-5">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                          task.priority === "high"
                            ? "bg-red-500/10 text-red-400"
                            : task.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1 text-sm">
                          <MessageSquare className="h-4 w-4" />
                          <span>8</span>
                        </div>

                        <div className="flex items-center gap-1 text-sm">
                          <Paperclip className="h-4 w-4" />
                          <span>3</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <CalendarDays className="h-4 w-4" />
                        {task.due_date instanceof Date? task.due_date.toDateString() : <span></span>}
                      </div>
                    </div>
                  </div>
                ))
            }
                {/* Empty State */}
                {tasks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-6 text-center text-sm text-slate-500">
                    No tasks available
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}