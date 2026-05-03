"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendOtpToEmail } from "./otp_utils";
import jwt from "jsonwebtoken";

export type ActionResult = {
  success: boolean;
  message: string;
  redirect?: string;
};


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET = process.env.JWT_SECRET!;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}


export async function registerUser(
  _state: ActionResult,
  formData: FormData,

): Promise<ActionResult> {
  const firstName  = (formData.get("firstName")  as string | null)?.trim() ?? "";
  const secondName = (formData.get("secondName") as string | null)?.trim() ?? "";
  const email      = (formData.get("email")      as string | null)?.trim().toLowerCase() ?? "";
  const password   = (formData.get("password")   as string | null) ?? "";

  // ── Field presence ──
  if (!firstName || !secondName || !email || !password) {
    return { success: false, message: "Please fill in all fields." };
  }

  // ── Email format ──
  if (!validateEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  // ── Password strength ──
  if (!validatePassword(password)) {
    return { success: false, message: "Password must be at least 8 characters." };
  }

  // ── Duplicate check ──
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, message: "An account with this email already exists." };
  }

  // ── Persist user ──
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp        = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

        // Send OTP after the user is safely stored
    await sendOtpToEmail(email);

    
    const token = jwt.sign(
        {
        firstName,
        secondName,
        email,
        password: hashedPassword,
        otp,
        },
        JWT_SECRET,
        {
        expiresIn: "10m",
        }
    );
    return {
        success: true,
        message: "Otp sent to email"
    }

  } catch (error) {
    console.error("[registerUser] Error creating user:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function verifyOtp(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {

  const otp = formData.get("otp")?.toString().trim() || "";

  const token = formData.get("token")?.toString() || "";

  if (!token) {
    return {
      success: false,
      message: "Session expired",
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      firstName: string;
      secondName: string;
      email: string;
      password: string;
      otp: string;
    };

    if (decoded.otp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    await prisma.user.create({
      data: {
        firstName: decoded.firstName,
        secondName: decoded.secondName,
        email: decoded.email,
        password: decoded.password,
      },
    });

    return {
      success: true,
      message: "Account created successfully",
      redirect: "/auth/login",
    };

  } catch (error) {
    return {
      success: false,
      message: "OTP expired",
    };
  }
}

export async function loginUser(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email    = (formData.get("email")    as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { success: false, message: "Please fill in all fields." };
  }

  if (!validateEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });


    const DUMMY_HASH = "$2b$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    const hashToCompare = user?.password ?? DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      return { success: false, message: "Invalid email or password." };
    }

    return {
      success: true,
      message: "Logged in successfully.",
      redirect: "/",
    };
  } catch (error) {
    console.error("[loginUser] Error logging in user:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}