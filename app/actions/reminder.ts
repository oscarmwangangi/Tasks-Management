"use server";

import prisma from "@/lib/prisma";
import { auth } from "../middlware/auth";
import nodemailer from "nodemailer";


export async function toggleRemindersAction(currentStatus: boolean){
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Missing createdByUserId");

    try {
        const reminder = await prisma.user.update({
            where: {id: userId},
            data:{ reminderEnable: !currentStatus}
        });
        return {success: true, newStatus: !currentStatus};
    } catch (error) {
        throw new Error("Failed to update reminder status" + error);
    }
}
