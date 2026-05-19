
"use client";
import {
  Plus,
  UserMinus,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { TeamHooks } from "@/app/hooks/teamsHook";


interface CreateTeamDrawerProps {
  isDrawerOpen: boolean;
  onClose: () => void;
  selectedTeam: any,
  initialsFromName:(name: string) => string;
}
interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
}

export function CreateTeamDrawer({isDrawerOpen,selectedTeam ,initialsFromName,onClose }:CreateTeamDrawerProps, ) {
      const { 
    
    
    memberAddEmail,
    memberAddRole,
    memberError,

    
    setIsDrawerOpen,
    setMemberAddEmail,
    setMemberAddRole,

    handleAddMember,
    handleRemoveMember,
    
    // Utils
    
 }=TeamHooks()
    return <AnimatePresence>
      {selectedTeam && isDrawerOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 h-fit sticky top-20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <span className="font-bold text-sm text-emerald-300">{initialsFromName(selectedTeam.name)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
                  <p className="text-xs text-slate-400">Creator: {selectedTeam.creator?.name ?? "—"}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <div className="text-[11px] text-slate-400">Members</div>
                  <div className="text-base font-bold">{selectedTeam.members?.length ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <div className="text-[11px] text-slate-400">Tasks</div>
                  <div className="text-base font-bold">{selectedTeam.tasksCount ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <div className="text-[11px] text-slate-400">Created</div>
                  <div className="text-base font-bold">{new Date(selectedTeam.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onClose()}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
              aria-label="Close team drawer"
            >
              ✕
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold tracking-wide text-slate-200">Members</h4>
              <span className="text-xs text-slate-400">Add & manage</span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  value={memberAddEmail}
                  onChange={(e) => setMemberAddEmail(e.target.value)}
                  placeholder="User email"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
                  aria-label="Add member by email" />
                <select
                  value={memberAddRole}
                  onChange={(e) => setMemberAddRole(e.target.value)}
                  className="w-36 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-emerald-500/40"
                  aria-label="Member role"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  onClick={handleAddMember}
                  className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all"
                >
                  <Plus className="inline-block h-4 w-4 mr-2" />
                  Add
                </button>
              </div>

              {memberError && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {memberError}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
                <div className="grid grid-cols-[1.4fr_1fr_0.8fr_auto] gap-3 px-4 py-3 text-xs text-slate-400 border-b border-white/10">
                  <span>Name</span>
                  <span>Role</span>
                  <span>Joined</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="max-h-64 overflow-auto">
                  {selectedTeam.members?.length ? (
                    selectedTeam.members.map((m:{ id: string; name: string; email: string; role: string; created_at: string; user_id: string }) => (
                      <div
                        key={m.id}
                        className="grid grid-cols-[1.4fr_1fr_0.8fr_auto] gap-3 px-4 py-3 border-b border-white/5 items-center hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                            <span className="text-[10px] font-bold">{initialsFromName(m.name)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{m.name}</div>
                            <div className="text-xs text-slate-400 truncate">{m.email}</div>
                          </div>
                        </div>

                        <div>
                          <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200">
                            {m.role}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400">
                          {new Date(m.created_at).toLocaleDateString()}
                        </div>

                        <div className="text-right">
                          <button
                            onClick={() => handleRemoveMember(m.user_id)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-rose-500/10 hover:border-rose-500/30"
                            aria-label={`Remove member ${m.email}`}
                          >
                            <UserMinus className="h-4 w-4 text-rose-300 inline-block" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-slate-400">No members yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks section scaffold (progressive enhancement) */}
{/* Team Tasks Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-sm font-semibold tracking-wide text-slate-200">
                Team Tasks ({selectedTeam?.tasks?.length ?? 0})
              </h4>
              <span className="text-xs text-emerald-400 font-medium">
                {selectedTeam?.completedTasksCount ?? 0}/{selectedTeam?.tasksCount ?? 0} Done
              </span>
            </div>

            <div className="mt-4 max-h-60 overflow-auto flex flex-col gap-2.5 pr-1 custom-scrollbar">
              {selectedTeam?.tasks?.length ? (
                selectedTeam.tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-3.5 transition-all hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Status Checkbox Indicator */}
                      <div 
                        className={`h-5 w-5 rounded-lg border flex items-center justify-center text-[10px] shrink-0 font-bold
                          ${task.status === 'done' 
                            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' 
                            : 'border-white/20 bg-white/5 text-transparent'
                          }`}
                      >
                        ✓
                      </div>
                      
                      {/* Task Title */}
                      <span 
                        className={`text-sm font-medium truncate ${
                          task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {/* Dynamic Status Badge */}
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold shrink-0 border
                        ${task.status === 'done' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : task.status === 'in_progress' || task.status === 'active'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-sm text-slate-500">
                  No tasks assigned to this team yet.
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>;
  }

