import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    console.log("🚀 Provisioning Super Admin via Next.js Runtime...");

    const email = "desparteroscar@gmail.com";
    const rawPassword = "SuperSecureMasterPassword2026!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const superAdmin = await prisma.user.upsert({
      where: { email: email },
      update: {
        role: "admin",
      },
      create: {
        firstName: "System",
        secondName: "SuperAdmin",
        email: email,
        password: hashedPassword,
        role: "super_admin",
        section_id: null, // Super Admin bypasses section boundaries
      },
    });

    return NextResponse.json({
      success: true,
      message: "Super Admin created successfully!",
      email: superAdmin.email,
    });
  } catch (error: any) {
    console.error("❌ Bootstrap Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}