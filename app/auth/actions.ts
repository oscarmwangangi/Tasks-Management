"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendOtpToEmail } from "./otp_utils";
import jwt from "jsonwebtoken";


export type ActionResult = {
  success: boolean;
  message: string;
  redirect?: string;
  token?: string;
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
  formData: FormData
): Promise<ActionResult> {

  const firstName =
    (formData.get("firstName") as string | null)?.trim() ?? "";

  const secondName =
    (formData.get("secondName") as string | null)?.trim() ?? "";

  const email =
    (formData.get("email") as string | null)
      ?.trim()
      .toLowerCase() ?? "";

  const password =
    (formData.get("password") as string | null) ?? "";

  // ── Field validation ──
  if (!firstName || !secondName || !email || !password) {
    return {
      success: false,
      message: "Please fill in all fields.",
    };
  }

  // ── Email validation ──
  if (!validateEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  // ── Password validation ──
  if (!validatePassword(password)) {
    return {
      success: false,
      message: "Password must be at least 8 characters.",
    };
  }

  try {

    // ── Check if user already exists ──
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    // ── Hash password ──
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create JWT token ──
    const token = jwt.sign(
      {
        firstName,
        secondName,
        email,
        password: hashedPassword,
      },
      JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    // ── Send OTP to email ──
    await sendOtpToEmail(email);

    return {
      success: true,
      message: "OTP sent to email",
      token,
    };

  } catch (error) {
    console.error("[registerUser] Error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function verifyOtp(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {

  const otp =
    formData.get("otp")?.toString().trim() || "";

  const token =
    formData.get("token")?.toString() || "";

  // ── Validate input ──
  if (!otp || !token) {
    return {
      success: false,
      message: "Missing OTP or session token.",
    };
  }

  try {

    // ── Verify JWT ──
    const decoded = jwt.verify(token, JWT_SECRET) as {
      firstName: string;
      secondName: string;
      email: string;
      password: string;
    };

    // ── Find OTP record ──
    const otpRecord = await prisma.otp.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        message: "OTP not found.",
      };
    }

    // ── Check expiry ──
    if (otpRecord.expiresAt < new Date()) {

      // delete expired OTP
      await prisma.otp.delete({
        where: {
          email: decoded.email,
        },
      });

      return {
        success: false,
        message: "OTP expired.",
      };
    }

    // ── Compare OTP ──
    const isOtpValid = await bcrypt.compare(
      otp,
      otpRecord.otp
    );

    if (!isOtpValid) {
      return {
        success: false,
        message: "Invalid OTP.",
      };
    }

    // ── Double check user doesn't exist ──
    const existingUser = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User already exists.",
      };
    }

    // ── Create user ──
    await prisma.user.create({
      data: {
        firstName: decoded.firstName,
        secondName: decoded.secondName,
        email: decoded.email,
        password: decoded.password,
      },
    });

    // ── Delete used OTP ──
    await prisma.otp.delete({
      where: {
        email: decoded.email,
      },
    });

    return {
      success: true,
      message: "Account created successfully.",
      redirect: "/auth/login",
    };

  } catch (error) {

    console.error("[verifyOtp] Error:", error);

    return {
      success: false,
      message: "Session expired. Please register again.",
    };
  }
}

export async function loginUser(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {

  const email =
    (formData.get("email") as string | null)
      ?.trim()
      .toLowerCase() ?? "";

  const password =
    (formData.get("password") as string | null) ?? "";

  // ── Validation ──
  if (!email || !password) {
    return {
      success: false,
      message: "Please fill in all fields.",
    };
  }

  if (!validateEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {

    // ── Find user ──
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ── Prevent timing attacks ──
    const DUMMY_HASH =
      "$2b$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    const hashToCompare =
      user?.password ?? DUMMY_HASH;

    const isPasswordValid =
      await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    return {
      success: true,
      message: "Logged in successfully.",
      redirect: "/",
    };

  } catch (error) {

    console.error("[loginUser] Error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}