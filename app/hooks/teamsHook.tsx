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


type TeamMemberDTO = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string | Date;
};

type TeamDTO = {
  id: string;
  name: string;
  created_at: string | Date;
  creator?: { id: string; name: string; email: string } | null;
  members: TeamMemberDTO[];
  tasksCount: number;
  completedTasksCount: number;
};

const CreateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  initialMembers: z
    .array(z.object({
      email: z.string().email("Invalid email"),
      role: z.string().min(1),
    }))
    .default([]),
});

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}


export function TeamHooks() {
  const [teams, setTeams] = useState<TeamDTO[] | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);


  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createMemberEmail, setCreateMemberEmail] = useState("");
  const [createMemberRole, setCreateMemberRole] = useState("member");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberAddEmail, setMemberAddEmail] = useState("");
  const [memberAddRole, setMemberAddRole] = useState("member");
  const [memberError, setMemberError] = useState<string | null>(null);

const { userId, user } = useAuth()
  const selectedTeam = useMemo(
    () => teams?.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId]
  );

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(q));
  }, [teams, search]);

  const analytics = useMemo(() => {
    const totalTeams = teams?.length ?? 0;
    const activeMembers = teams?.reduce((acc, t) => acc + (t.members?.length ?? 0), 0) ?? 0;
    const totalTasks = teams?.reduce((acc, t) => acc + (t.tasksCount ?? 0), 0) ?? 0;
    const completedTasks = teams?.reduce((acc, t) => acc + (t.completedTasksCount ?? 0), 0) ?? 0;
    const pendingTasks = Math.max(totalTasks - completedTasks, 0);
    return { totalTeams, activeMembers, totalTasks, completedTasks, pendingTasks };
  }, [teams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchTeams();
      if (cancelled) return;
      setTeams(data);
      if (!selectedTeamId && data.length) {
        setSelectedTeamId(data[0].id);
        setIsDrawerOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateTeam() {
    setCreateError(null);
    const parsed = CreateTeamSchema.safeParse({
      name: createName,
      initialMembers:
        createMemberEmail.trim() ? [{ email: createMemberEmail.trim(), role: createMemberRole }] : [],
    });

    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setCreateLoading(true);
    try {
      const created = await createTeam({
        name: parsed.data.name,
        initialMembers: parsed.data.initialMembers,
          createdByUserId: userId ?? undefined
      });

      const data = await fetchTeams();
      setTeams(data);
      setSelectedTeamId(created.teamId);
      setIsDrawerOpen(true);
      setIsCreateOpen(false);
      setCreateName("");
      setCreateMemberEmail("");
      setCreateMemberRole("member");
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create team");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDeleteTeam(teamId: string) {
    // Optimistic UI
    setTeams((prev) => prev?.filter((t) => t.id !== teamId) ?? prev);
    if (selectedTeamId === teamId) {
      setSelectedTeamId(null);
      setIsDrawerOpen(false);
    }

    try {
      await deleteTeam({ teamId });
      const data = await fetchTeams();
      setTeams(data);
      if (data.length) {
        setSelectedTeamId(data[0].id);
        setIsDrawerOpen(true);
      }
    } catch (e) {
      // revert
      const data = await fetchTeams();
      setTeams(data);
      setCreateError(e instanceof Error ? e.message : "Failed to delete team");
    }
  }

  async function handleAddMember() {
    if (!selectedTeamId) return;
    setMemberError(null);
    try {
      await addMemberToTeam({
        teamId: selectedTeamId,
        email: memberAddEmail.trim(),
        role: memberAddRole,
        createdByUserId: userId ?? undefined
      });
      const data = await fetchTeams();
      setTeams(data);
      setMemberAddEmail("");
      setMemberAddRole("member");
      
    } catch (e) {
      setMemberError(e instanceof Error ? e.message : "Failed to add member");
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!selectedTeamId) return;
    try {
      await removeMemberFromTeam({ teamId: selectedTeamId, userId });
      const data = await fetchTeams();
      setTeams(data);
    } catch (e) {
      setMemberError(e instanceof Error ? e.message : "Failed to remove member");
    }
  }
 return {
    // State
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
    initialsFromName,
  };

}