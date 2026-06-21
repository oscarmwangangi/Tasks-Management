// lib/prisma-scoped-queries.ts
/**
 * UNIFIED MULTI-TENANT QUERY WRAPPER
 * ===================================
 *
 * This module enforces tenant isolation across ALL Prisma queries.
 *
 * Core Principle:
 * - super_admin: no filtering (NULL section_id)
 * - admin/user: ALWAYS filtered by section_id
 * - Every query must use scopedWhere from getScopedFilter()
 */

import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { getScopedFilter } from "./api-security";

interface UserSession {
  id: string;
  role: "admin" | "user" | "super_admin";
  section_id: string | null;
}

/**
 * ✅ PATTERN 1: Safe FindMany with Scoping
 * Use this for all list/read operations
 */
export async function findManyScoped<T>(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  options: {
    where?: Record<string, any>;
    select?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    take?: number;
    skip?: number;
  }
) {
  const scopedWhere = getScopedFilter(sessionUser, options.where || {});

  return (prisma[model] as any).findMany({
    ...options,
    where: scopedWhere,
  });
}

/**
 * ✅ PATTERN 2: Safe FindUnique with Ownership Verification
 * Use this before update/delete operations
 */
export async function findUniqueScoped<T>(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  id: string,
  options?: {
    select?: Record<string, any>;
    include?: Record<string, any>;
  }
) {
  const record = await (prisma[model] as any).findUnique({
    where: { id },
    ...options,
  });

  if (!record) return null;

  // Verify ownership for non-super_admin
  if (sessionUser.role !== "super_admin") {
    const recordSectionId = record.section_id;
    if (recordSectionId !== sessionUser.section_id) {
      throw new Error(`Unauthorized: Record not in your section`);
    }
  }

  return record;
}

/**
 * ✅ PATTERN 3: Safe Delete with Automatic Scoping
 * Use this for all delete operations
 */
export async function deleteScopedRecord<T>(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  id: string
) {
  // Step 1: Verify ownership
  await findUniqueScoped(sessionUser, model, id);

  // Step 2: Delete
  return (prisma[model] as any).delete({
    where: { id },
  });
}

/**
 * ✅ PATTERN 4: Safe Update with Section Lock
 * Use this for all update operations
 */
export async function updateScopedRecord<T>(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  id: string,
  data: Record<string, any>
) {
  // Step 1: Verify ownership
  await findUniqueScoped(sessionUser, model, id);

  // Step 2: Sanitize data - remove dangerous fields
  const sanitized = { ...data };
  delete sanitized.section_id;
  delete sanitized.section;
  delete sanitized.created_by;
  delete sanitized.created_at;

  // Step 3: Update
  return (prisma[model] as any).update({
    where: { id },
    data: sanitized,
  });
}

/**
 * ✅ PATTERN 5: Safe GroupBy with Scoping
 * Use this for aggregations (dashboard cards, charts)
 */
export async function groupByScoped<T>(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  options: {
    by: string[];
    where?: Record<string, any>;
    _count?: Record<string, any>;
    _sum?: Record<string, any>;
  }
) {
  const scopedWhere = getScopedFilter(sessionUser, options.where || {});

  return (prisma[model] as any).groupBy({
    ...options,
    where: scopedWhere,
  });
}

/**
 * ✅ PATTERN 6: Safe Count with Scoping
 * Use this for pagination totals
 */
export async function countScoped(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  where?: Record<string, any>
) {
  const scopedWhere = getScopedFilter(sessionUser, where || {});

  return (prisma[model] as any).count({
    where: scopedWhere,
  });
}

/**
 * ✅ PATTERN 7: Verify Record Belongs to Section
 * Use this for cross-checks (e.g., team belongs to section before task creation)
 */
export async function verifyRecordBelongsToSection(
  sessionUser: UserSession,
  model: keyof typeof prisma,
  id: string,
  idField: string = "id"
): Promise<boolean> {
  if (sessionUser.role === "super_admin") return true;

  const record = await (prisma[model] as any).findUnique({
    where: { [idField]: id },
    select: { section_id: true },
  });

  return record?.section_id === sessionUser.section_id;
}
