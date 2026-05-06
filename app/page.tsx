"use client";
// import prisma from "@/lib/prisma";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "./hooks/useAuthGuard";
import { useAuth } from "./hooks/localStorage";

export default function Home() {
  useAuthGuard();
  const user = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    localStorage.removeItem("user");
    router.replace("/auth/login");
    
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-(family-name:--font-geist-sans) text-[#333333]">
        Superblog
      </h1>
      <ol className="list-decimal list-inside font-(family-name:--font-geist-sans)">
        <button onClick={handleLogout}>
logout
        </button>
        email: {user?.email}
      </ol>
    </div>
  );
}