"use server";

import { z } from "zod";
import { auth } from "../middlware/auth";
import prisma from "@/lib/prisma";
import bycrypt from "bcrypt";

const SecurityOptionsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(1, "New password is required"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function changePassword(data: z.infer<typeof SecurityOptionsSchema>) {

    const session = await auth()
      
    const userId = session?.user?.id;
      if (!userId) throw new Error("Missing createdByUserId");

        const parsed = SecurityOptionsSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(parsed.error.message);
        }

        const user = await prisma.user.findUnique({where: {id:userId}})
        if (!user) {
            throw new Error("User not found");
        }

        // Verify current password

        const isCurrentPasswordValid = await bycrypt.compare(parsed.data.currentPassword,user.password);
        if (!isCurrentPasswordValid) {
            throw new Error("Current password is incorrect");
           
        }
        if (parsed.data.newPassword === parsed.data.currentPassword) {
            throw new Error("New password cannot be the same as current password");
        }
        if (parsed.data.newPassword.length < 8) {
            throw new Error("New password must be at least 8 characters long");
        }

        const hashedNewPassword = await bycrypt.hash(parsed.data.newPassword, 10);
        try
        {
            await prisma.user.update({
            where: {id: userId},
            data: {password: hashedNewPassword}
            });
            return {success:true, message:"Password changed successfully"} ;
        } catch (e: unknown) {
            throw new Error("Failed to change password");

        }


    }