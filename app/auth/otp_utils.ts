"use server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { ActionResult } from "./actions";
import jwt from "jsonwebtoken";

export type SendOtpResult = { success: true; message: string } | { success: false; message: string };

export async function sendOtpToEmail(email: string): Promise<SendOtpResult> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const hashOtp = await bcrypt.hash(otp, 10); // Hash the OTP for secure storage (async)

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        return { success: false, message: "Email service is not configured." };
    }

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    try {
        await prisma.otp.upsert({
            where: { email },
            update: {
                otp: hashOtp,
                expiresAt,
            },
            create: {
                email,
                otp: hashOtp,
                expiresAt,
            },
        });

        await transporter.sendMail({
            from: emailUser,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        });

        return { success: true, message: "OTP sent to email" };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return { success: false, message: "Failed to send OTP. Please try again." };
    }
}
