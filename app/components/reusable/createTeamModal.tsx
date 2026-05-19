 "use client";
import { TeamHooks } from "@/app/hooks/teamsHook";

import { motion, AnimatePresence } from "framer-motion";


 
export  function CreateTeamModal() {

  const { 

    isCreateOpen,
    createName,
    createMemberEmail,
    createMemberRole,
    createError,
    createLoading,

    setIsCreateOpen,
    setCreateName,
    setCreateMemberEmail,
    setCreateMemberRole,
    // Actions
    handleCreateTeam,

 }=TeamHooks()
    
    return <AnimatePresence>
      {isCreateOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsCreateOpen(false)} />

          <motion.div
            initial={{ scale: 0.98, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-[92vw] max-w-lg rounded-3xl border border-white/10 bg-[#0b1220] p-5 text-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Create team"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Create team</h2>
                <p className="text-sm text-slate-400 mt-1">Team name is required. Optionally add initial members.</p>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                onClick={() => setIsCreateOpen(false)}
                type="button"
                aria-label="Close create team modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm text-slate-300">Team name</span>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
                  placeholder="e.g. Product Engineering"
                  disabled={createLoading} />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Initial members (optional)</div>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    value={createMemberEmail}
                    onChange={(e) => setCreateMemberEmail(e.target.value)}
                    placeholder="Member email"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
                    disabled={createLoading} />
                  <select
                    value={createMemberRole}
                    onChange={(e) => setCreateMemberRole(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-emerald-500/40"
                    disabled={createLoading}
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{createError}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
                  disabled={createLoading}
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-60"
                  disabled={createLoading}
                  onClick={handleCreateTeam}
                >
                  {createLoading ? "Creating..." : "Create team"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>;
  }