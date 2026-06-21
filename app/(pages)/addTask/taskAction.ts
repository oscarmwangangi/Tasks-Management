"use server"

import prisma from "@/lib/prisma";
import { auth } from "@/app/middlware/auth";

export type ActionResult = {
  success: boolean;
  message: string;
};

export async function createTask(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.section_id) {
    return { success: false, message: "Unauthorized: No section access" };
  }

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "";
  const priority = (formData.get("priority") as string | null)?.trim() ?? "";
  const start_date = (formData.get("start_date") as string | null)?.trim() ?? "";
  const end_date = (formData.get("end_date") as string | null)?.trim() ?? "";
  const is_favorite = formData.get("is_favorite") === "on";
  const team_id = (formData.get("team_id") as string | null)?.trim() ?? null;
  const teamMemberIds = formData.getAll("team_member_ids") as string[];

  const userId = session?.user?.id;
  const sectionId = session.user.section_id;

  if (!title || !status || !priority) {
    return {
      success: false,
      message: "Please fill out all required fields (Title, Status, Priority)."
    };
  }

  try {
    // If team_id provided, verify it belongs to user's section
    if (team_id) {
      const team = await prisma.team.findUnique({
        where: { id: team_id }
      });

      if (!team || team.section_id !== sectionId) {
        return { success: false, message: "Team not found or unauthorized" };
      }
    }

    // Force stamp section_id from session (never trust client)
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status as any,
        priority: priority as any,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        is_favorite,
        created_by: userId || null,
        team_id: team_id || null,
        section_id: sectionId,
        assignedMembers: {
          create: teamMemberIds.map((memberId) => ({
            team_member_id: memberId,
          })),
        },
      }
    });

    return {
      success: true,
      message: "Task created successfully!"
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "An error occurred while saving the task to the database."
    };
  }
}