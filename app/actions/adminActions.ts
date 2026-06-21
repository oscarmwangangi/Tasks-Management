"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/app/middlware/auth";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { z } from "zod";

// Email transporter setup (update with your email service)
  const emailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  secondName: z.string().min(1, "Second name required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["user", "admin"]).default("user"),
});

const GeneratePasswordSchema = z.object({
  length: z.number().min(8).max(32).default(16),
});

function generateSecurePassword(length: number = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createUserByAdmin(params: {
  firstName: string;
  secondName: string;
  email: string;
  role?: "user" | "admin";
  targetSectionId?: string; 
}) {
  const session = await auth();

  // Verify admin or super_admin access
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return { success: false, message: "Only administrators can create users" };
  }

 

  // Validate input
  const parsed = CreateUserSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return { success: false, message: "Email already in use" };
    }

    // Generate secure password
    const generatedPassword = generateSecurePassword(16);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const targetRole = parsed.data.role === "admin" ? "admin" : "user";

    let assignedSectionId: string | null = null;

    // 3. AUTOMATED SECTION MANAGEMENT LOGIC 🧠
    if (targetRole === "admin") {
      // If we are spinning up a brand new admin, instantly create a unique workspace section for them using their email address
      const newSection = await prisma.section.create({
        data: {
          name: `Section - ${parsed.data.email}`,
        },
      });
      assignedSectionId = newSection.id;
    } else {
      // If a regular user is being created, inherit the logged-in admin's section_id
      assignedSectionId = session.user.section_id ?? null;
      if (!assignedSectionId && session.user.role !== "super_admin") {
        return { success: false, message: "Action Blocked: Your admin profile is missing a section attachment." };
      }
    }
    // Create user mapping
    const newUser = await prisma.user.create({
      data: {
        firstName: parsed.data.firstName,
        secondName: parsed.data.secondName,
        name: `${parsed.data.firstName} ${parsed.data.secondName}`,
        email: parsed.data.email,
        password: hashedPassword,
        role: parsed.data.role === "admin" ? "admin" : "user",
        section_id: assignedSectionId, // Handles regular admin section inheritance or super_admin assignment
        emailVerified: new Date(),
      },
    });

    // Send email with credentials
    try {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: newUser.email,
        subject: "Your Account Has Been Created",
        html: `
          <p>Hello ${newUser.firstName},</p>
          <p>Your account has been created by an administrator.</p>
          <p><strong>Email:</strong> ${newUser.email}</p>
          <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
          <p>Please log in and change your password immediately.</p>
          <p><a href="${process.env.APP_URL}/auth/login">Login to your account</a></p>
        `,
      });
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
    }

    return {
      success: true,
      message: "User created successfully",
      data: {
        userId: newUser.id,
        email: newUser.email,
        generatedPassword, // Returned safely to display in the frontend modal view
      },
    };
  } catch (error) {
    console.error("Create User Error:", error);
    return { success: false, message: "Failed to create user" };
  }
}
export async function generateInviteLink(
  targetSectionId?: string,
  params?: { role?: "user" | "admin" }
) {
  const session = await auth();

  // Verify admin access
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return { success: false, message: "Only admins can generate invite links" };
  }


let querySectionId: string;

if (session.user.role === "super_admin") {
  if (!targetSectionId) {
    return { success: false, message: "Super admin must specify a target section ID." };
  }
  querySectionId = targetSectionId;
} else {
  if (!session.user.section_id) {
    return { success: false, message: "Admin must belong to a section." };
  }
  querySectionId = session.user.section_id;
}

try {
  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const inviteToken = await prisma.inviteToken.create({
    data: {
      token,
      section_id: querySectionId, 
      role: params?.role === "admin" ? "admin" : "user",
      expires_at: expiresAt,
    },
  });


    const inviteUrl = `${process.env.APP_URL}/auth/register?invite=${token}`;

    return {
      success: true,
      message: "Invite link generated",
      data: {
        token: inviteToken.id,
        inviteUrl,
        expiresAt,
      },
    };
  } catch (error) {
    console.error("Generate Invite Error:", error);
    return { success: false, message: "Failed to generate invite link" };
  }
}
export async function listSectionUsers(page: number = 1, pageSize: number = 10,targetSectionId?: string ) {
  const session = await auth();

  // Verify admin access
  if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
    return { success: false, message: "Only admins can view section users" };
  }


  let querySectionId: string | null = null;

  if (session.user.role === "super_admin") {
    // If super_admin provides a target, filter by it; otherwise, leave it null to fetch a global count
    querySectionId = targetSectionId || null;
  } else {
    // Regular admins are locked to their own section
    querySectionId = session.user.section_id ?? null;
    if (!querySectionId) {
      return { success: false, message: "Admin must belong to a section" };
    }
  }

  try {
    const skip = (page - 1) * pageSize;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: querySectionId ? { section_id: querySectionId } : {},
        select: {
          id: true,
          firstName: true,
          secondName: true,
          email: true,
          role: true,
          created_at: true,
        },
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where: querySectionId ? { section_id: querySectionId } : {} }),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
          hasNextPage: skip + users.length < totalCount,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("List Users Error:", error);
    return { success: false, message: "Failed to fetch section users" };
  }
}

export async function listSectionTeams(targetSectionId?: string) {
  const session = await auth();

  // Verify admin access
if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return { success: false, message: "Only admins can view section stats" };
  }

  // Determine which section scope to query
  let querySectionId: string | null = null;

  if (session.user.role === "super_admin") {
    // If super_admin provides a target, filter by it; otherwise, leave it null to fetch a global count
    querySectionId = targetSectionId || null;
  } else {
    // Regular admins are locked to their own section
    querySectionId = session.user.section_id ?? null;
    if (!querySectionId) {
      return { success: false, message: "Admin must belong to a section" };
    }
  }
  try {
    const count = await prisma.team.count({
      where: querySectionId ? { section_id: querySectionId } : undefined,
    });

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error("List Teams Error:", error);
    return { success: false, message: "Failed to fetch section teams" };
  }
}

export async function listSectionTasks(targetSectionId?: string) {
  const session = await auth();

  // Verify admin access
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return { success: false, message: "Only admins can view section stats" };
  }

  let querySectionId: string | null = null;

  if (session.user.role === "super_admin") {
    // If super_admin provides a target, filter by it; otherwise, leave it null to fetch a global count
    querySectionId = targetSectionId || null;
  } else {
    // Regular admins are locked to their own section
    querySectionId = session.user.section_id ?? null;
    if (!querySectionId) {
      return { success: false, message: "Admin must belong to a section" };
    }
  }

  try {
    const count = await prisma.task.count({
      where: querySectionId
        ? { section_id: querySectionId, status: { notIn: ["done"] } }
        : { status: { notIn: ["done"] } },
    });

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error("List Tasks Error:", error);
    return { success: false, message: "Failed to fetch section tasks" };
  }
}

export async function deleteUserByAdmin(userId: string, targetSectionId?: string) {
  const session = await auth();

  // Verify admin access
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return { success: false, message: "Only admins can delete users" };
  }

   let querySectionId: string | null = null;

  if (session.user.role === "super_admin") {
    // If super_admin provides a target, filter by it; otherwise, leave it null to fetch a global count
    querySectionId = targetSectionId || null;
  } else {
    // Regular admins are locked to their own section
    querySectionId = session.user.section_id ?? null;
    if (!querySectionId) {
      return { success: false, message: "Admin must belong to a section" };
    }
  }

  try {
    // Verify user belongs to admin's section
const user = await prisma.user.findUnique({
  where: { id: userId },
});

if (
  !user ||
  (
    session.user.role === "admin" &&
    user.section_id !== querySectionId
  )
) {
  return { success: false, message: "User not found or unauthorized" };
}

    // Prevent self-deletion
    if (user.id === session.user.id) {
      return { success: false, message: "Cannot delete your own account" };
    }

    
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete User Error:", error);
    return { success: false, message: "Failed to delete user" };
  }
}