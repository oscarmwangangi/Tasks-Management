// lib/api-security.ts
import { Role } from "@prisma/client";

interface UserSession {
  id: string;
  role: "admin" | "user" | "super_admin"; 
  section_id: string | null;
}

/**
 * Generates a standard baseline 'where' filter to enforce strict multi-tenancy.
 * @param session The active user session from auth()
 * @param secondaryFilters Optional additional queries (e.g., { status: 'active' })
 */
export function getScopedFilter(sessionUser: UserSession, secondaryFilters: Record<string, any> = {}) {
  const { role, section_id, id: userId } = sessionUser;

  // 1. Super Admin bypasses all panel boundaries
  if (role === "super_admin") {
    return { ...secondaryFilters };
  }

  // 2. Admins are locked strictly to their section sandbox
  if (role === "admin") {
    return {
      ...secondaryFilters,
      section_id: section_id,
    };
  }

  // 3. Regular users are locked to their section panel
  if (role === "user") {
    return {
      ...secondaryFilters,
      section_id: section_id,
      // Optional: uncomment below if users should ONLY see teams they are members of
      // members: { some: { user_id: userId } } 
    };
  }

  // Fallback safe-failure: if role is unknown, deny all data access
  return { id: "deny-all-records-fallback" };
}