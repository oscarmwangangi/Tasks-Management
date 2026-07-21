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

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch all uncompleted tasks
    const activeTasks = await prisma.task.findMany({
      where: {
        status: { notIn: ["done"] },
        assignedMembers: {
          some: {
            teamMember: {
              user: { reminderEnable: true }
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
      return NextResponse.json({ message: "No active tasks found." });
    }

    // 2. Group tasks by user
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
          tasksByUser[email] = { firstName, tasks: [] };
        }
        tasksByUser[email].tasks.push(task);
      }
    }

    // Determine day type for prompt context
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6; // 0 = Sun, 6 = Sat
    const scheduleContext = isWeekend
      ? "WEEKEND: The user is available ALL DAY. Plan deep-work sessions, multi-tasking progress, and heavy feature work."
      : "WEEKDAY: The user is ONLY available from 8:00 PM to 11:00 PM (3 hours max). Pick 1-2 focused, manageable chunks so they hit deadlines without burning out.";

    // 3. Generate structured AI advice & email to each user
    for (const [userEmail, data] of Object.entries(tasksByUser)) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a personalized AI task manager. 
            
            Schedule Context: ${scheduleContext}

            Analyze the user's active tasks and generate a structured JSON object with the following fields:
            {
              "primaryFocus": "The single most critical task to open first today.",
              "primaryAction": "A specific 1-sentence action step to take on this primary task.",
              "timeAllocation": "How to split their available time (3 hrs for weekday, full day for weekend).",
              "secondaryTasks": ["Task title + quick goal 1", "Task title + quick goal 2"],
              "proTip": "A short 1-sentence productivity tip relative to their timeframe today."
            }

            Respond ONLY with valid JSON.`,
          },
          {
            role: "user",
            content: `Tasks:\n${JSON.stringify(data.tasks, null, 2)}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const plan = JSON.parse(response.choices[0].message.content || "{}");

      // Render custom designed HTML email
      const emailHtml = generateEmailTemplate(data.firstName, isWeekend, plan, data.tasks.length);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `🎯 ${isWeekend ? "Weekend Sprint" : "Evening Focus"} Plan: ${data.tasks.length} active tasks`,
        html: emailHtml,
      });
    }

    return NextResponse.json({ success: true, count: Object.keys(tasksByUser).length });
  } catch (error) {
    console.error("AI Agent Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 4. Modern HTML Email Builder Function
function generateEmailTemplate(
  firstName: string, 
  isWeekend: boolean, 
  plan: any, 
  taskCount: number
) {
  const secondaryListHtml = (plan.secondaryTasks || [])
    .map((item: string) => `<li style="margin-bottom: 8px; color: #374151;">${item}</li>`)
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; color: #ffffff;">
        <span style="background-color: rgba(255,255,255,0.2); text-transform: uppercase; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px;">
          ${isWeekend ? "🚀 Weekend Full-Day Session" : "🌙 Weekday Evening Session (8-11 PM)"}
        </span>
        <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 700;">Daily Task Strategy</h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Hey ${firstName}, you have ${taskCount} active tasks in your queue.</p>
      </div>

      <div style="padding: 24px;">
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 5px solid #2563eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px;">
            ⚡ Start Here First
          </div>
          <div style="font-size: 16px; font-weight: 700; color: #1e3a8a; margin-bottom: 6px;">
            ${plan.primaryFocus || "Focus Task"}
          </div>
          <div style="font-size: 14px; color: #1e40af;">
            ${plan.primaryAction || "Take initial action."}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 8px;">
            ⏱️ Recommended Schedule
          </h3>
          <p style="margin: 0; font-size: 14px; color: #374151; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
            ${plan.timeAllocation || "Allocate time according to priority."}
          </p>
        </div>

        ${plan.secondaryTasks && plan.secondaryTasks.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 8px;">
            🔄 Secondary Progress (Parallel Work)
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            ${secondaryListHtml}
          </ul>
        </div>
        ` : ""}

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #166534;">
          <strong>💡 Strategy Tip:</strong> ${plan.proTip || "Focus on one item at a time to maintain high efficiency."}
        </div>

      </div>

      <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        Generated automatically by your AI Task Flow Assistant
      </div>

    </div>
  </body>
  </html>
  `;
}