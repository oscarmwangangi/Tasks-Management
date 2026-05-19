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
const session = await auth()
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "";
  const priority = (formData.get("priority") as string | null)?.trim() ?? "";
  const start_date = (formData.get("start_date") as string | null)?.trim() ?? "";
  const end_date = (formData.get("end_date") as string | null)?.trim() ?? "";
  const is_favorite = formData.get("is_favorite") === "on"; // Checkboxes send "on" if checked
  const team_id = (formData.get("team_id") as string | null)?.trim() ?? null;

  const userId = session?.user?.id;

  console.log("user is ",userId)
  // 2. Validate required fields
  if (!title || !status || !priority) {
    return {
      success: false,
      message: "Please fill out all required fields (Title, Status, Priority)."
    };
  }

  // 3. Database Attempt
  try {
    await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status as any, 
        priority: priority as any,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        is_favorite,
        created_by: userId || null,
        team_id: team_id || null
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