"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "../middlware/auth";
import { getScopedFilter } from "@/lib/api-security";

export async function fetchTeams() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized: No session");

  const scopedWhere = getScopedFilter(session.user as any, {});

  const teams = await prisma.team.findMany({
    where: scopedWhere,
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
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
      },
    },
  });

  return teams.map((t: any) => ({
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
    members: t.members.map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      name: `${m.user.firstName} ${m.user.secondName}`.trim(),
      email: m.user.email,
      role: m.role,
      created_at: new Date().toISOString(),
    })),
    tasksCount: t._count.tasks,
    completedTasksCount: t.tasks.filter((task: any) => task.status === "done").length,
    tasks: t.tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority ?? "medium",
    })),
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

export async function createTeam(params: z.infer<typeof CreateTeamSchema> & {}) {
  const session = await auth();

  const userId = session?.user?.id;
  const sectionId = session?.user?.section_id;

  if (!userId) throw new Error("Missing createdByUserId");
  if (!sectionId) throw new Error("Unauthorized: No section access");

  const parsed = CreateTeamSchema.safeParse(params);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  // Prevent duplicate team names within section
  const existing = await prisma.team.findFirst({
    where: { name: parsed.data.name, section_id: sectionId },
  });
  if (existing) throw new Error("A team with this name already exists in your section");

  return prisma.$transaction(async (tx: any) => {
    const team = await tx.team.create({
      data: {
        name: parsed.data.name,
        created_by: userId,
        section_id: sectionId,
      },
      select: { id: true },
    });

    const emails = parsed.data.initialMembers.map((m) => m.email.trim().toLowerCase());
    const users = emails.length
      ? await tx.user.findMany({
          where: { email: { in: emails }, section_id: sectionId },
          select: { id: true, email: true },
        })
      : [];

    const userIds = users.map((u: any) => u.id);

    if (userIds.length) {
      const roleByEmail = new Map(parsed.data.initialMembers.map((m) => [m.email.trim().toLowerCase(), m.role]));

      await tx.teamMember.createMany({
        data: userIds.map((id: any) => {
          const user = users.find((u: any) => u.id === id)!;
          return {
            team_id: team.id,
            user_id: id,
            role: roleByEmail.get(user.email.toLowerCase()) ?? "member",
          };
        }),
        skipDuplicates: true,
      });
    }

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

export async function deleteTeam(params: { teamId: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  const sectionId = session?.user?.section_id;

  if (!userId) throw new Error("Missing createdByUserId");
  if (!sectionId) throw new Error("Unauthorized: No section access");

  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    select: { created_by: true, section_id: true },
  });

  if (!team) throw new Error("Team not found");
  if (team.section_id !== sectionId) throw new Error("Unauthorized: Team not in your section");
  if (team.created_by !== userId) throw new Error("Only the creator can delete this team");

  await prisma.team.delete({ where: { id: params.teamId } });
}

export async function addMemberToTeam(params: { teamId: string; email: string; role: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  const sectionId = session?.user?.section_id;

  if (!userId) throw new Error("Missing createdByUserId");
  if (!sectionId) throw new Error("Unauthorized: No section access");

  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    select: { created_by: true, section_id: true },
  });

  if (!team) throw new Error("Team not found");
  if (team.section_id !== sectionId) throw new Error("Unauthorized: Team not in your section");
  if (team.created_by !== userId) throw new Error("Only the creator can add members");

  const email = params.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, section_id: true },
  });

  if (!user) throw new Error("User not found");
  if (user.section_id !== sectionId) throw new Error("User must be in the same section");

  await prisma.teamMember.create({
    data: {
      team_id: params.teamId,
      user_id: user.id,
      role: params.role,
    },
  } as any);
}

export async function removeMemberFromTeam(params: { teamId: string; userId: string }) {
  const session = await auth();
  const me = session?.user?.id;
  const sectionId = session?.user?.section_id;

  if (!me) throw new Error("Missing createdByUserId");
  if (!sectionId) throw new Error("Unauthorized: No section access");

  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    select: { created_by: true, section_id: true },
  });

  if (!team) throw new Error("Team not found");
  if (team.section_id !== sectionId) throw new Error("Unauthorized: Team not in your section");
  if (team.created_by !== me) throw new Error("Only the creator can remove members");

  await prisma.teamMember.deleteMany({
    where: { team_id: params.teamId, user_id: params.userId },
  });
}

export async function fetchTeamMembers(teamId?: string) {
  if (!teamId) return [];

  const session = await auth();
  if (!session?.user?.section_id) throw new Error("Unauthorized: No session");

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { section_id: true },
  });

  if (!team || team.section_id !== session.user.section_id) {
    throw new Error("Unauthorized: Team not in your section");
  }

  const members = await prisma.teamMember.findMany({
    where: {
      team_id: teamId,
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          secondName: true,
        },
      },
    },
  });

  return members.map((member: any) => {
    const { user, ...memberDetails } = member;
    return {
      ...memberDetails,
      userId: user.id,
      firstName: user.firstName,
      secondName: user.secondName,
    };
  });
}  






