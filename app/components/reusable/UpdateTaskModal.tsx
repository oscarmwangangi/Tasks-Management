"use client";

import { useState } from "react";
import { DashboardTask, updateTask } from "@/app/services/tableData";

interface UpdateTaskModalProps {
  task: DashboardTask;
  onClose: () => void;
  refresh: () => void;
}

export function UpdateTaskModal({ task, onClose, refresh }: UpdateTaskModalProps) {
  // 1. Initialize local form state with the existing task details
  const [title, setTitle] = useState(task.title || "");
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [description, setDescription] = useState(task.description || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Handle submit
  const handleSave = async () => {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call your Prisma-backed update routine
      const res = await updateTask(task.id, {
        title,
        priority: priority as any, // Casts to your Prisma Enum type safely
        status: status as any,     // Casts to your Prisma Enum type safely
        description: description || null,
      });

      if (res.success) {
        refresh(); // Refresh the table and cards instantly
        onClose(); // Hide modal context
      } else {
        setError(res.message || "Failed to update task.");
      }
    } catch (err) {
      console.error("Update Submit Error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl"
        role="dialog" 
        aria-modal="true"
        aria-label="Edit task"
      >
        {/* Header Block */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Task</h2>
            <p className="text-xs text-slate-400 mt-1">
              Modify the details for this record. ID: <span className="font-mono text-slate-500">{task.id.slice(0, 8)}...</span>
            </p>
          </div>
          <button
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Inputs Form Content Wrapper */}
        <div className="mt-6 space-y-4">
          
          {/* Title Text Field */}
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Task Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 transition-all"
              placeholder="Task name"
              disabled={loading}
            />
          </label>

          {/* Status & Priority Dual Selection Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/40 transition-all"
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-300">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "backlog" | "todo" | "in_progress" | "active" | "review" | "done")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/40 transition-all"
                disabled={loading}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          {/* Description Textarea Field */}
          <label className="block">
            <span className="text-xs font-medium text-slate-300">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 resize-none transition-all"
              placeholder="Describe this project lifecycle milestone..."
              disabled={loading}
            />
          </label>

          {/* Error Message Flash Alert */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Interactive Modal Action Confirmations */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 disabled:opacity-60 transition-all"
              disabled={loading}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-2xl bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-60 transition-all"
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? "Saving changes..." : "Save updates"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}