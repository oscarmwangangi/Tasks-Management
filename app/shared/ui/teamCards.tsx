"use client";
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
import { TeamHooks } from "@/app/hooks/teamsHook";
import { motion, AnimatePresence } from "framer-motion";

 export function TeamCards() {

    const{analytics} = TeamHooks()

    return <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
    </div>;
  }
