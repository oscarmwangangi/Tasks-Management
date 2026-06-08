"use server";

import prisma from "@/lib/prisma";
import { auth } from "../middlware/auth";
import nodemailer from "nodemailer";


export async function toggleRemindersAction(targetStatus: boolean) {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                // Set it directly to the exact boolean value desired
                reminderEnable: targetStatus 
            }
        });
        
        return { 
            success: true, 
            newStatus: updatedUser.reminderEnable 
        };
} catch (error) {
        console.error("Database update failed:", error);
        return { 
            success: false, 
            error: "Failed to update reminder status" 
        };
    }

}