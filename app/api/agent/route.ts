
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";


export async function GET(request: Request) {
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

  // 1. Guard the route using the cron secret
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // 2. Query Prisma for upcoming, unfinished tasks with active reminders
    const upcomingRiskyTasks = await prisma.task.findMany({
      where: {
        status: {
          notIn: ["done"],
        },
        end_date: {
          gte: new Date(),
          lte: threeDaysFromNow,
        },
assignedMembers: {
      some: {
        teamMember: {
          user: {
            reminderEnable: true,
          }
        }
      }
    }
  },
  include: {
    // Dig deep into the relation tree: Task -> TaskAssignment -> TeamMember -> User
    assignedMembers: {
      include: {
        teamMember: {
          include: {
            user: {
              select: {
                firstName: true,
                email: true,
                reminderEnable: true,
              }
            }
          }
        }
      }
    }
  },

  });
    // 3. If everything is running smoothly, terminate early
    if (upcomingRiskyTasks.length === 0) {
      return NextResponse.json({ message: "No high-risk deadlines found today." });
    }

    // 4. Group the tasks by the assignee's email address
    const tasksByUser: Record<
      string,
      { firstName: string; tasks: typeof upcomingRiskyTasks }
    > = {};

for (const task of upcomingRiskyTasks) {
  // Loop through all members assigned to this specific task
  for (const assignment of task.assignedMembers) {
    const user = assignment.teamMember.user;

   // Skip if there's no user, or if they explicitly turned off reminders
    if (!user || !user.email || !user.reminderEnable) continue;

    const email = user.email;
    const firstName = user.firstName || "Developer";

      if (!tasksByUser[email]) {
        tasksByUser[email] = {
          firstName,
          tasks: [],
        };
      }
      tasksByUser[email].tasks.push(task);
    }

    // 5. Loop through each user who has risky tasks and send their custom AI report
    for (const [userEmail, data] of Object.entries(tasksByUser)) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an automated Kanban assistant. Analyze the user's upcoming tasks facing tight deadlines and write a concise, encouraging morning summary. Tell them exactly what is due and ask if they need help or if they have any blockers. Use simple clean text formatting.`,
          },
          {
            role: "user",
            content: `Hi ${data.firstName}, here are your high-risk tasks:\n${JSON.stringify(data.tasks, null, 2)}`,
          },
        ],
        temperature: 0.5,
      });

      const aiReportMarkdown = response.choices[0].message.content;

      // Send the email to the specific user dynamic email picked from the database
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: ` TaskFlow Reminder: You have ${data.tasks.length} tasks due soon`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-top: 0;">Morning Task Briefing</h2>
            <p style="color: #4b5563;">Hello ${data.firstName}, here is your automated daily update regarding your upcoming project deadlines:</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <div style="white-space: pre-wrap; color: #1f2937; background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              ${aiReportMarkdown}
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
              Automated Kanban TaskFlow Assistant
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      tasksAnalyzed: upcomingRiskyTasks.length,
    });
  }} catch (error) {
    console.error("AI Agent Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
