"use server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { ActionResult } from "./actions";
import jwt from "jsonwebtoken";

export async function sendOtpToEmail(email: string) {

    const formData = new FormData();
    formData.append('email', email);



    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const hashOtp = bcrypt.hashSync(otp, 10); // Hash the OTP for secure storage
    
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    
    try {
        const saveOtp = await prisma.otp.upsert({
            where: { email },
            update: {
                otp: hashOtp,
                expiresAt
            },
            create: {
                email,
                otp: hashOtp,
                expiresAt
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        });

        return {
            success: true,
            message: "OTP sent to email"
        }
            
    }catch (error) {
        console.error("Error sending OTP email:", error);
    }

}

