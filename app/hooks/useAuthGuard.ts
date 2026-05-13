"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");


    if (!user || user === "null" || user === "undefined") {
      localStorage.removeItem("user");
      router.replace("/auth/login");
      return;
    }

    try {
      JSON.parse(user);
    } catch {
      localStorage.removeItem("user");
      router.replace("/auth/login");
    }
  }, [router]);
}