"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/dist/server/api-utils";

export async function registerUser(state: any, formData: FormData){

    const firstName = formData.get("firstName") as string;
    const secondName = formData.get("secondName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!firstName || !secondName || !email || !password) {
        // throw new Error("Please fill in all fields");
        return {
            success: false,
            message: "Please fill in all fields"
        }
    }
    const hashPassword = await bcrypt.hash(password, 10);
    try{
        const newUser = await prisma.user.create({
            data: {
            firstName,
            secondName,
            email,
            password:hashPassword
            }

        });
        // console.log("User registered successfully");

        return {
            success: true,
            message: "User registered successfully"
        }

    }catch(error){

        console.error("Error creating user:", error);
        return {
            success: false,
            message: "Error creating user"
        }
    }
}

export async function loginUser(state: any, formData: FormData){
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password){
        return {
            success: false,
            message: "Please fill in all fields"
        }
    }

    try{
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return {
                success: false,
                message: "Invalid email or password"
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password"
            };
        }
        return{
            success: true,
            message: "User logged in successfully",
            redirect:"./auth/login"
        }

    }catch(error){
        console.error("Error logging in user:", error);
        return {
            success: false,
            message: "Error logging in user"
        };
    }

}

