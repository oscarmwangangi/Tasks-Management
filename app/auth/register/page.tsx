"use client"
import prisma from "@/lib/prisma";
import {registerUser} from "./actions";
import { useActionState } from "react";


 const initialState = {
    success: false,
    message: ""
 }

export default function RegisterPage() {
 const [state, formAction, pending] = useActionState(registerUser, initialState);



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
            <h1 className="text-4xl font-bold mb-8 font-(family-name:--font-geist-sans text-[#333333]">
                Register
            </h1>
            <form action={formAction} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        First Name
                        </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="Your name"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Second Name
                        </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="secondName"
                        name="secondName"
                        type="text"
                        placeholder="Your second name"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Your password"
                        required
                    />
                </div>
                {state.message && (
                   <p className={
                    state.success ? "text-green-400" : "text-red-500"}
                   >
                    {state.message}
                   </p>
                )}
                <div className="flex items-center justify-between">

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={pending}
                    >
                       {pending ? "Loading..." : "Register"}
                    </button>
                </div>
            </form>
            <span className="text-sm text-gray-600 mt-4">
                Already have an account? <a href="/auth/login" className="text-blue-500 hover:text-blue-700">Login here</a>
            </span>
        </div>
    );
}