"use client";
import { loginUser }  from "../register/actions";
import { useActionState } from "react";

const initialState = {
    success: false,
    message: ""
};

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(loginUser, initialState);
     
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
            <h1 className="text-4xl font-bold mb-8 font-(family-name:--font-geist-sans text-[#333333]">
                Login
            </h1>
            <form action={formAction} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                {state.message && (
                    <div className={`mb-4 text-sm ${state.success ? "text-green-500" : "text-red-500"}`}>
                        {state.message}
                        </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="email"
                        name="email"
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
                        type="password"
                        name="password"
                        placeholder="your password"
                        required
                        />
                        </div>
                        <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit"
                        disabled={pending}
                        
                        >
                            {pending ? "Logging in..." : "Login"}
                        </button>
                        </form>
                        <span className="text-sm text-gray-600 mt-4">
                            Don't have an account? <a href="/auth/register" className="text-blue-500 hover:text-blue-700">Register here</a>
                        </span>
                        </div>
                        )
             }