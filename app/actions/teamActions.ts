"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { useAuth } from "../hooks/localStorage";



export async function fetchTeams() {
  const teams = await prisma.team.findMany({
    orderBy: { created_at: "desc" },
    include: {
      creator: { select: { id: true, firstName: true, secondName: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, firstName: true, secondName: true, email: true } },
        },
      },
      _count: { select: { tasks: true } },
      tasks: {
        where: { status: "done" },
        select: { id: true },
      },
    },
  });

  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    created_at: t.created_at,
    creator: t.creator
      ? {
          id: t.creator.id,
          name: `${t.creator.firstName} ${t.creator.secondName}`.trim(),
          email: t.creator.email,
        }
      : null,
    members: t.members.map((m) => ({
      id: m.id,
      user_id: m.user_id,
      name: `${m.user.firstName} ${m.user.secondName}`.trim(),
      email: m.user.email,
      role: m.role,
      created_at: new Date().toISOString(),
    })),
    tasksCount: t._count.tasks,
    completedTasksCount: t.tasks.length,
  }));
}

const CreateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  initialMembers: z
    .array(
      z.object({
        email: z.string().email("Invalid email"),
        role: z.string().min(1),
      })
    )
    .default([]),
});

export async function createTeam(params: z.infer<typeof CreateTeamSchema> & { createdByUserId?: string }) {
  // The current codebase doesn’t provide server-side auth context.
  // We accept createdByUserId from client by reading it from passed params.
  
const userId = params.createdByUserId;
  if (!userId) throw new Error("Missing createdByUserId");

  const parsed = CreateTeamSchema.safeParse(params);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  // Prevent duplicate team names
  const existing = await prisma.team.findFirst({ where: { name: parsed.data.name } });
  if (existing) throw new Error("A team with this name already exists");

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: parsed.data.name,
        created_by: userId,
      },
      select: { id: true },
    });

    const emails = parsed.data.initialMembers.map((m) => m.email.trim().toLowerCase());
    const users = emails.length
      ? await tx.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } })
      : [];

    const userIds = users.map((u) => u.id);

    if (userIds.length) {
      // Add initial members with provided role (best effort)
      // Role mapping by email
      const roleByEmail = new Map(parsed.data.initialMembers.map((m) => [m.email.trim().toLowerCase(), m.role]));

      await tx.teamMember.createMany({
        data: userIds.map((id) => {
          const user = users.find((u) => u.id === id)!;
          return {
            team_id: team.id,
            user_id: id,
            role: roleByEmail.get(user.email.toLowerCase()) ?? "member",
          };
        }),
        skipDuplicates: true,
      });
    }

    // Add creator as admin
    await tx.teamMember.create({
      data: {
        team_id: team.id,
        user_id: userId,
        role: "admin",
      },
    });

    return { teamId: team.id };
  });
}

export async function deleteTeam(params: { teamId: string; createdByUserId?: string }) {
  const userId = params.createdByUserId;
  if (!userId) throw new Error("Missing createdByUserId");

  const team = await prisma.team.findUnique({ where: { id: params.teamId }, select: { created_by: true } });
  if (!team) throw new Error("Team not found");
  if (team.created_by !== userId) throw new Error("Only the creator can delete this team");

  await prisma.team.delete({ where: { id: params.teamId } });
}

export async function addMemberToTeam(params: { teamId: string; email: string; role: string; createdByUserId?: string }) {
  const userId = params.createdByUserId;
  if (!userId) throw new Error("Missing createdByUserId");

  const team = await prisma.team.findUnique({ where: { id: params.teamId }, select: { created_by: true } });
  if (!team) throw new Error("Team not found");
  if (team.created_by !== userId) throw new Error("Only the creator can add members");

  const email = params.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new Error("User not found");

  await prisma.teamMember.create({
    data: {
      team_id: params.teamId,
      user_id: user.id,
      role: params.role,
    },
    // skipDuplicates: true,
  } as any);
}

export async function removeMemberFromTeam(params: { teamId: string; userId: string; createdByUserId?: string }) {
  const me = params.createdByUserId;
  if (!me) throw new Error("Missing createdByUserId");

  const team = await prisma.team.findUnique({ where: { id: params.teamId }, select: { created_by: true } });
  if (!team) throw new Error("Team not found");
  if (team.created_by !== me) throw new Error("Only the creator can remove members");

  await prisma.teamMember.deleteMany({ where: { team_id: params.teamId, user_id: params.userId } });
}

