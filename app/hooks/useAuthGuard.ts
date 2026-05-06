"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    // ❌ block all invalid cases
    if (!user || user === "null" || user === "undefined") {
      localStorage.removeItem("user");
      router.replace("/auth/login");
      return;
    }

    // ✅ extra safety: validate JSON
    try {
      JSON.parse(user);
    } catch {
      localStorage.removeItem("user");
      router.replace("/auth/login");
    }
  }, [router]);
}