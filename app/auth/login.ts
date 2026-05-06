"use server"
import { ActionResult } from "./actions";
import {validatePassword, validateEmail} from "./actions";
import { sendOtpToEmail } from "./otp_utils";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET!;
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

  // Validation
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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Create temporary login token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "5m",
      }
    );

    // Send OTP
    await sendOtpToEmail(email);

    return {
      success: true,
      message: "OTP sent to email.",
      token,
    };

  } catch (error) {

    console.error("[loginUser] Error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function verifyLoginOtp(
  _state: ActionResult,
  formData: FormData
): Promise<ActionResult> {

  const otp =
    formData.get("otp")?.toString().trim() || "";

  const token =
    formData.get("token")?.toString() || "";

  if (!otp || !token) {
    return {
      success: false,
      message: "Missing OTP or session token.",
    };
  }

  try {

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      userId: string;
      email: string;
    };

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

    if (otpRecord.expiresAt < new Date()) {

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

    // Delete OTP after success
    await prisma.otp.delete({
      where: {
        email: decoded.email,
      },
    });

    return {
      success: true,
      message: "Login successful.",
      redirect: "/",
    user: {
        userId: decoded.userId,
        email: decoded.email,
  },
    };

  } catch (error) {

    console.error("[verifyLoginOtp] Error:", error);

    return {
      success: false,
      message: "Session expired.",
    };
  }
}