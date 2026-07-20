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
    // 2. Query Prisma for ALL uncompleted tasks for users with reminders enabled
    // Removing the 3-day window lets the AI see the entire active pipeline
    const activeTasks = await prisma.task.findMany({
      where: {
        status: {
          notIn: ["done"],
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

    if (activeTasks.length === 0) {
      return NextResponse.json({ message: "No active tasks found today." });
    }

    // 3. Group the tasks by the assignee's email address
    const tasksByUser: Record<
      string,
      { firstName: string; tasks: typeof activeTasks }
    > = {};

    for (const task of activeTasks) {
      for (const assignment of task.assignedMembers) {
        const user = assignment.teamMember.user;
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
    }

    // 4. Loop through each user and generate a daily balanced action plan
    for (const [userEmail, data] of Object.entries(tasksByUser)) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert productivity strategist. The user wants to work on multiple tasks simultaneously today without feeling overwhelmed or missing final deadlines. 
            
            Analyze their active tasks and write a morning strategic brief containing:
            1. **Today's Multi-Task Blueprint**: Give them a curated list of which tasks to chip away at TODAY, balancing high-urgency deadlines with smaller incremental steps on secondary tasks.
            2. **The "Start Here" Push**: Give them exactly 1 clear task to initiate the day with to build momentum.
            3. **Time-Splitting Suggestion**: Suggest how to distribute their working hours across these selected tasks (e.g., using time-blocking or Pomodoro allocations).
            
            Keep the tone clear, empowering, and organized with simple clean text formatting.`,
          },
          {
            role: "user",
            content: `Hi ${data.firstName}, here are all your currently active tasks with their details and deadlines:\n${JSON.stringify(data.tasks, null, 2)}`,
          },
        ],
        temperature: 0.6,
      });

      const aiReportMarkdown = response.choices[0].message.content;

      // 5. Send the strategic morning schedule email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `🎯 Your Daily Focus Strategy: How to handle your ${data.tasks.length} active tasks`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-top: 0;">Today's Focus & Multi-Task Strategy</h2>
            <p style="color: #4b5563;">Hello ${data.firstName}, here is your AI-optimized strategy to make balanced progress across your pipeline today:</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <div style="white-space: pre-wrap; color: #1f2937; background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
              ${aiReportMarkdown}
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
              Automated Kanban TaskFlow Strategy Assistant
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      usersNotified: Object.keys(tasksByUser).length,
    });
  } catch (error) {
    console.error("AI Agent Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}