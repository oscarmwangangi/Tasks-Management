import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { OpenAI } from "openai";

export default async function updateStatus() {
  const now = new Date();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 1. Get overdue tasks that are NOT "Done" (Include backlog so they keep getting emailed)
  const tasks = await prisma.task.findMany({
    where: {
      end_date: {
        lt: now,
      },
      status: {
        notIn: ["done"], // Excludes Done tasks; fetches everything else (including backlog)
      },
    },
    include: {
      assignedMembers: {
        include: {
          teamMember: {
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  reminderEnable: true,
                }
              }
            },
          },
        },
      },
    },
  });

  if (tasks.length === 0) return;

  // 2. Group users for email batching
  const usersMap: Record<string, { firstName: string; tasks: any[] }> = {};

  for (const task of tasks) {
    // 3. ONLY update task status to backlog if it isn't already in backlog
    if (task.status !== "backlog") {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: "backlog" },
      });
    }

    // 4. Collect users per task
    for (const assignment of task.assignedMembers) {
      const user = assignment.teamMember.user;

      if (!user?.email || !user.reminderEnable) continue;

      const email = user.email;

      if (!usersMap[email]) {
        usersMap[email] = {
          firstName: user.firstName || "User",
          tasks: [],
        };
      }

      // Add task info for the AI prompt context
      usersMap[email].tasks.push({
        title: task.title,
        description: task.description,
        end_date: task.end_date,
        current_status: task.status // Let OpenAI know if it's newly moved or remaining there
      });
    }
  }

  // 5. Send emails per user
  for (const [email, data] of Object.entries(usersMap)) {
    // Skip sending email if this user actually has no tasks targeted
    if (data.tasks.length === 0) continue;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a task assistant. Explain politely that the following tasks are currently in the BACKLOG due to deadline expiry and require attention. Keep it short and actionable.",
        },
        {
          role: "user",
          content: `User: ${data.firstName}\nTasks:\n${JSON.stringify(
            data.tasks,
            null,
            2
          )}`,
        },
      ],
      temperature: 0.5,
    });

    const message = aiResponse.choices[0].message.content;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "⚠️ Reminder: Tasks remaining in BACKLOG",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Backlog Attention Required</h2>
          <p>Hello ${data.firstName}, the following tasks are in your BACKLOG because they passed their deadline:</p>

          <div style="margin: 15px 0; padding: 12px; background: #f3f4f6; border-radius: 8px; white-space: pre-wrap;">
            ${message}
          </div>

          <p style="font-size: 12px; color: #9ca3af;">
            Automated TaskFlow System • Emails repeat daily until tasks are updated.
          </p>
        </div>
      `,
    });
  }
}