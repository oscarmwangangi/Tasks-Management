"use client"

import { useState, useActionState , useEffect} from "react";
import { useAuth } from "@/app/hooks/localStorage";
import { createTask, ActionResult } from "./taskAction"; 
import { TeamHooks } from "@/app/hooks/teamsHook";


const initialTaskState ={
  title: "",
  description: "",
  status: "todo",
  priority: "low",
  start_date: "",
  end_date: "",
  is_favorite: false,
  team_id: "",
}
export default function AddTask() {
  
  
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createTask, 
    null
  );

  const [task, setTask] = useState(initialTaskState);

  const {  filteredTeams }=TeamHooks()
  useEffect(() => {

      if (state && 'success' in state && state.success) {
        
        setTask(initialTaskState); 
        
      }
    }, [state]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTask((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 relative flex flex-col items-center">
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl z-10 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Create New Task</h1>

        {/* 2. UI Banner displaying Action Messages */}
        {state?.message && (
          <div className={`p-4 rounded-xl mb-6 border text-sm font-medium ${
            state.success 
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-950/40 border-rose-500/30 text-rose-400"
          }`}>
            {state.message}
          </div>
        )}

        {/* 3. Link form action directly to useActionState hook handler */}
        <form action={formAction} className="space-y-6">


          {/* TITLE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">Task Title</label>
            <input 
              type="text" 
              name="title"
              required
              value={task.title}
              onChange={handleChange}
              placeholder="e.g., Fix Sidebar Layout Bug" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">Description</label>
            <textarea 
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder="Provide details..." 
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* STATUS & PRIORITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">Status</label>
              <select 
                name="status"
                value={task.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">Priority</label>
              <select 
                name="priority"
                value={task.priority}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* START & END DATES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">Start Date</label>
              <input 
                type="date" 
                name="start_date"
                value={task.start_date}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">End Date</label>
              <input 
                type="date" 
                name="end_date"
                value={task.end_date}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* TEAM SELECT */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-400">Select Team</label>
            <div className="relative w-full">
              <select 
                name="team_id"
                value={task.team_id}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" className="text-slate-600 bg-slate-950">Choose a team...</option>
                {filteredTeams.map((team) => (
                  <option key={team.id} value={team.id} className="bg-slate-950 text-white">
                    {team.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* FAVORITE */}
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="is_favorite"
              name="is_favorite"
              checked={task.is_favorite}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-emerald-500 accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="is_favorite" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
              Mark as Favorite Task
            </label>
          </div>

          {/* SUBMIT */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              {isPending ? "Saving Task..." : "Save Task"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}