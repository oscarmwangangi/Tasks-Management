"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CirclePlus,
  Search,
  Settings,
  Star,
  Users,
  Shield,
  LayoutGrid,
  Trash2,
  Plus,
  UserMinus,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

import { createTeam, deleteTeam, fetchTeams, addMemberToTeam, removeMemberFromTeam } from "@/app/actions/teamActions"
import { useAuth } from "@/app/hooks/localStorage";
import { TeamHooks } from "@/app/hooks/teamsHook";


export default function TeamsPage() {

  const { 
 teams,
    selectedTeamId,
    selectedTeam,
    filteredTeams,
    analytics,
    search,
    isCreateOpen,
    isDrawerOpen,
    createName,
    createMemberEmail,
    createMemberRole,
    createError,
    createLoading,
    memberSearch,
    memberAddEmail,
    memberAddRole,
    memberError,
    userId,
    user,

    
    setSearch,
    setIsCreateOpen,
    setIsDrawerOpen,
    setSelectedTeamId,
    setCreateName,
    setCreateMemberEmail,
    setCreateMemberRole,
    setMemberSearch,
    setMemberAddEmail,
    setMemberAddRole,

    // Actions
    handleCreateTeam,
    handleDeleteTeam,
    handleAddMember,
    handleRemoveMember,
    
    // Utils
    initialsFromName
 }=TeamHooks();


  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-20 -mx-4 px-4 md:-mx-6 md:px-6 bg-[#020617]/70 backdrop-blur border-b border-white/5 pb-4 mb-6"
      >
        <div className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Teams</h1>
              <p className="text-slate-400 text-sm mt-1">Manage teams, members, and tasks in one place.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-[360px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teams..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500/40"
                  aria-label="Search teams"
                />
              </div>

              <button className="rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-all" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </button>

              <div className="hidden sm:flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all"
              >
                <CirclePlus className="inline-block mr-2 h-4 w-4" />
                Create Team
              </button>
            </div>
          </div>

          {/* Analytics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Total Teams</span>
                <LayoutGrid className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="mt-2 text-2xl font-bold">{analytics.totalTeams}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Active Members</span>
                <Users className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="mt-2 text-2xl font-bold">{analytics.activeMembers}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Total Tasks</span>
                <Settings className="h-4 w-4 text-indigo-300" />
              </div>
              <div className="mt-2 text-2xl font-bold">{analytics.totalTasks}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Completed</span>
                <Star className="h-4 w-4 text-amber-300" />
              </div>
              <div className="mt-2 text-2xl font-bold">{analytics.completedTasks}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Pending</span>
                <Star className="h-4 w-4 text-rose-300" />
              </div>
              <div className="mt-2 text-2xl font-bold">{analytics.pendingTasks}</div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-6">
        {/* Teams Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-200">Your Teams</h2>
            <span className="text-xs text-slate-400">{filteredTeams.length} shown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams === null ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">Loading teams...</div>
            ) : filteredTeams.length === 0 ? (
              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                No teams found.
              </div>
            ) : (
              filteredTeams.map((team) => (
                <motion.button
                  key={team.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTeamId(team.id);
                    setIsDrawerOpen(true);
                  }}
                  className={`text-left rounded-3xl border p-5 transition-all ${
                    selectedTeamId === team.id ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:border-emerald-500/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <span className="font-bold text-sm text-emerald-300">{initialsFromName(team.name)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{team.name}</div>
                        <div className="text-xs text-slate-400">Created {new Date(team.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      aria-label="Favorite team"
                      className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-all"
                    >
                      <Star className="h-4 w-4 text-amber-300" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                      <div className="text-xs text-slate-400">Members</div>
                      <div className="text-lg font-bold">{team.members?.length ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                      <div className="text-xs text-slate-400">Tasks</div>
                      <div className="text-lg font-bold">{team.tasksCount ?? 0}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>
                        {team.completedTasksCount ?? 0}/{team.tasksCount ?? 0}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{
                          width:
                            team.tasksCount > 0
                              ? `${Math.round(((team.completedTasksCount ?? 0) / (team.tasksCount ?? 1)) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden" aria-label="Team members avatars">
                      {(team.members ?? []).slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          className="h-7 w-7 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"
                          title={m.name}
                        >
                          <span className="text-[10px] font-bold text-slate-200">{initialsFromName(m.name)}</span>
                        </div>
                      ))}
                      {(team.members?.length ?? 0) > 5 && (
                        <div className="h-7 w-7 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-slate-400">+{(team.members?.length ?? 0) - 5}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id);
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                        aria-label="Delete team"
                      >
                        <Trash2 className="h-4 w-4 text-rose-300" />
                      </button>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </section>

        {/* Team Drawer */}
        <AnimatePresence>
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
                  onClick={() => setIsDrawerOpen(false)}
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
                      aria-label="Add member by email"
                    />
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
                        selectedTeam.members.map((m) => (
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
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-wide text-slate-200">Team Tasks</h4>
                  <span className="text-xs text-slate-400">(Coming soon)</span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                  This page includes the Teams UI shell + members management. Tasks management (filters, drag-and-drop, assign) can be added next on top of the same backend pattern.
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
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
                    disabled={createLoading}
                  />
                </label>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold">Initial members (optional)</div>
                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      value={createMemberEmail}
                      onChange={(e) => setCreateMemberEmail(e.target.value)}
                      placeholder="Member email"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
                      disabled={createLoading}
                    />
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
      </AnimatePresence>
    </div>
  );
}
