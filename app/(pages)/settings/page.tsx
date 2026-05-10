"use client";

import { useAuth } from "../../hooks/localStorage";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
export default function SettingsPage() {
    useAuthGuard();
    const user = useAuth();
    const router = useRouter();
     

    const handleLogout = async () => {
        localStorage.removeItem("user");
        router.replace("/auth/login");
    };
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
            <h1 className="text-4xl font-bold mb-8 font-(family-name:--font-geist-sans text-[#333333]">
                Settings
            </h1>
            <p className="text-lg text-gray-700">
                {/* Welcome, {user?.email}! */}
            </p>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    );
}