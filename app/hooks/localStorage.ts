"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
     
      setUserId(parsedUser.userId || parsedUser.id || null);
    }
    console.log("User loaded from localStorage:", stored);
  }, []);

  // Return as an object for easier destructuring in components
  return { user, userId };
}