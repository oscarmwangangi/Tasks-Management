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

  // 1. Get overdue tasks that are NOT already backlog
  const tasks = await prisma.task.findMany({
    where: {
      end_date: {
        lt: now,
      },
      status: {
        not: "backlog",
      },
    },
    include: {
      assignedMembers: {
        include: {
          teamMember: {
            include: {
              user: true,
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
    // 3. Update task status
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "backlog" },
    });

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

      usersMap[email].tasks.push(task);
    }
  }

  // 5. Send emails per user
  for (const [email, data] of Object.entries(usersMap)) {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a task assistant. Explain that tasks have been moved to BACKLOG due to deadline expiry. Keep it short and helpful.",
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
      subject: "⚠️ Tasks moved to BACKLOG",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Backlog Update</h2>
          <p>Hello ${data.firstName}, the following tasks have been moved to BACKLOG:</p>

          <div style="margin: 15px 0; padding: 12px; background: #f3f4f6; border-radius: 8px;">
            ${message}
          </div>

          <p style="font-size: 12px; color: #9ca3af;">
            Automated TaskFlow System
          </p>
        </div>
      `,
    });
  }
}