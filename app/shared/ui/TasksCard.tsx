
import {
  CalendarDays,
  MessageSquare,
  Paperclip,
  Star,
} from "lucide-react";

import { $Enums } from "@prisma/client";


export function TasksCard(tasks: { id: string; title?: string; description?: string | null; status?: $Enums.TaskStatus; priority?: $Enums.TaskPriority; due_date?: Date | null; start_date?: Date | null; end_date?: Date | null; is_favorite?: boolean; created_at?: Date; updated_at: Date; created_by?: string | null; assigned_to?: string | null; team_id?: string | null; }[]) {
    return <div className="flex flex-col gap-4">
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
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${task.priority === "high"
                  ? "bg-red-500/10 text-red-400"
                  : task.priority === "medium"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-emerald-500/10 text-emerald-400"}`}
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
              {task.due_date instanceof Date ? task.due_date.toDateString() : <span></span>}
            </div>
          </div>
        </div>
      ))}
      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-6 text-center text-sm text-slate-500">
          No tasks available
        </div>
      )}
    </div>;
  }



