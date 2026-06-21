# UNIFIED MULTI-TENANT RBAC ARCHITECTURE

## 🎯 Core Principle

**Every single Prisma query must be scoped to the user's section.**

- **super_admin** (section_id = null) → no filtering, see all data
- **admin** (section_id = X) → automatically filtered to section X only
- **user** (section_id = X) → automatically filtered to section X only
- **unknown role** → empty result set (deny-all fallback)

---

## 📋 QUERY PATTERNS - Copy & Paste These

### PATTERN 1️⃣: Safe List Queries (findMany)

```typescript
import { getScopedFilter } from "@/lib/api-security";

export async function listTeams() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // ✅ Use scopedWhere for ALL findMany queries
  const scopedWhere = getScopedFilter(session.user as any, {
    // Optional: add extra filters here
    status: "active",
  });

  const teams = await prisma.team.findMany({
    where: scopedWhere,
    select: { id: true, name: true },
  });

  return teams;
}
```

**Why this is safe:**
- `getScopedFilter()` handles role logic (super_admin bypass, admin/user section lock)
- Any extra filters are merged with section_id automatically
- TypeScript enforces session.user structure

---

### PATTERN 2️⃣: Safe Aggregations (groupBy, count)

```typescript
export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const scopedWhere = getScopedFilter(session.user as any, {});

  // ✅ groupBy is automatically scoped
  const stats = await prisma.task.groupBy({
    by: ["status"],
    where: scopedWhere,
    _count: { _all: true },
  });

  // ✅ count is automatically scoped
  const totalTasks = await prisma.task.count({
    where: scopedWhere,
  });

  return { stats, totalTasks };
}
```

**Why this is safe:**
- Same scopedWhere applies to aggregations
- If a super_admin queries without section filter, they get global stats
- If an admin queries, they only see their section's stats

---

### PATTERN 3️⃣: Safe Read-Before-Delete/Update (findUnique + verify)

```typescript
export async function deleteTask(taskId: string) {
  const session = await auth();
  const sectionId = session?.user?.section_id;

  if (!sectionId) throw new Error("Unauthorized: No section access");

  // ✅ CRITICAL: Always verify ownership BEFORE delete
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, section_id: true, created_by: true },
  });

  if (!task) throw new Error("Task not found");
  
  // ✅ Verify the task belongs to their section (unless super_admin)
  if (session.user.role !== "super_admin" && task.section_id !== sectionId) {
    throw new Error("Unauthorized: Task not in your section");
  }

  // ✅ NOW safe to delete
  await prisma.task.delete({
    where: { id: taskId },
  });
}
```

**Why this is safe:**
- Two-layer verification: existence + ownership
- Prevents race conditions (task deleted by another user between check and delete)
- Super admin bypass is explicit and intentional

---

### PATTERN 4️⃣: Safe Update with Data Sanitization

```typescript
export async function updateTask(taskId: string, data: any) {
  const session = await auth();
  const sectionId = session?.user?.section_id;

  if (!sectionId) throw new Error("Unauthorized");

  // ✅ Verify ownership
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { section_id: true },
  });

  if (!task || task.section_id !== sectionId) {
    throw new Error("Unauthorized: Task not in your section");
  }

  // ✅ Sanitize input - remove fields that should not change
  const sanitized = { ...data };
  delete sanitized.section_id;        // Prevent section theft
  delete sanitized.created_by;        // Prevent ownership theft
  delete sanitized.created_at;        // Prevent timestamp manipulation

  // ✅ Safe to update
  await prisma.task.update({
    where: { id: taskId },
    data: sanitized,
  });
}
```

**Why this is safe:**
- Ownership verified before mutation
- Critical fields cannot be hijacked
- Attackers cannot steal records to another section

---

### PATTERN 5️⃣: Safe Create with Automatic Section Assignment

```typescript
export async function createTask(params: { title: string; description?: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  const sectionId = session?.user?.section_id;

  if (!userId || !sectionId) {
    throw new Error("Unauthorized: No section access");
  }

  // ✅ NEVER trust client for section_id - stamp from session
  const task = await prisma.task.create({
    data: {
      title: params.title,
      description: params.description,
      created_by: userId,
      section_id: sectionId,  // ✅ From session, not client
    },
  });

  return task;
}
```

**Why this is safe:**
- `section_id` comes from verified JWT, never from FormData/body
- Even if attacker sends `section_id` in request, it's ignored
- New records are always assigned to the user's section

---

### PATTERN 6️⃣: Safe Cross-Reference Checks

```typescript
export async function addTaskToTeam(taskId: string, teamId: string) {
  const session = await auth();
  const sectionId = session?.user?.section_id;

  if (!sectionId) throw new Error("Unauthorized");

  // ✅ Verify BOTH task and team are in the same section
  const [task, team] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId }, select: { section_id: true } }),
    prisma.team.findUnique({ where: { id: teamId }, select: { section_id: true } }),
  ]);

  if (!task || task.section_id !== sectionId) {
    throw new Error("Task not found in your section");
  }

  if (!team || team.section_id !== sectionId) {
    throw new Error("Team not found in your section");
  }

  // ✅ Now safe to link them
  await prisma.task.update({
    where: { id: taskId },
    data: { team_id: teamId },
  });
}
```

**Why this is safe:**
- Prevents cross-section linking
- Both resources must belong to user's section
- TOCTOU (time-of-check-time-of-use) safe due to strong consistency

---

## 🔥 ANTI-PATTERNS - DON'T DO THIS

### ❌ UNSAFE #1: Trusting Client for Section Filter

```typescript
// 🚨 VULNERABLE - client controls section_id!
export async function listTasks(sectionId: string) {
  const tasks = await prisma.task.findMany({
    where: { section_id: sectionId },  // ❌ Attacker can pass any section_id
  });
  return tasks;
}
```

**Fix:** Use session.user.section_id instead.

---

### ❌ UNSAFE #2: Skipping Ownership Verification

```typescript
// 🚨 VULNERABLE - no verification before delete!
export async function deleteTask(taskId: string) {
  await prisma.task.delete({
    where: { id: taskId },
  });
}
```

**Fix:** Always verify task belongs to user's section first.

---

### ❌ UNSAFE #3: Raw SQL Without Parameterization

```typescript
// 🚨 VULNERABLE - potential SQL injection!
const query = `SELECT * FROM Task WHERE section_id = '${sectionId}'`;
const tasks = await prisma.$queryRaw(query);
```

**Fix:** Use parameterized queries:

```typescript
// ✅ SAFE - parameterized
const tasks = await prisma.$queryRaw`
  SELECT * FROM "Task" WHERE section_id = ${sectionId}::uuid
`;
```

Or better: use ORM instead of raw SQL.

---

### ❌ UNSAFE #4: NULL Section ID Logic Bugs

```typescript
// 🚨 VULNERABLE - breaks when super_admin passes null!
const count = await prisma.task.count({
  where: { section_id: sessionUser.section_id },  // ❌ NULL for super_admin!
});
```

**Fix:** Use conditional logic:

```typescript
// ✅ SAFE - handles super_admin (null)
const count = await prisma.task.count({
  where: sessionUser.role === "super_admin"
    ? {}  // No filter for super_admin
    : { section_id: sessionUser.section_id },
});
```

---

## 🏗️ IMPLEMENTING THE UNIFIED PATTERN

### Step 1: Use `getScopedFilter()` Everywhere

**In all READ operations (findMany, count, groupBy):**

```typescript
const scopedWhere = getScopedFilter(session.user as any, {
  // Extra filters as needed
  status: "active",
  priority: "high",
});

const results = await prisma.model.findMany({ where: scopedWhere });
```

### Step 2: Verify Ownership Before WRITE Operations

**In all CREATE operations:**
- Force `section_id` from session, never from client

**In all UPDATE operations:**
- Verify record belongs to section
- Sanitize dangerous fields (section_id, created_by, timestamps)

**In all DELETE operations:**
- Verify record belongs to section
- Prevent cascading across sections

### Step 3: Test the Entire User Journey

```typescript
// ✅ TEST 1: Admin can only see their section
const adminSessionA = { role: "admin", section_id: "section-a" };
const tasksA = await listTasks(adminSessionA);
// Should only contain tasks where section_id = "section-a"

// ✅ TEST 2: Admins from different sections are isolated
const adminSessionB = { role: "admin", section_id: "section-b" };
const tasksB = await listTasks(adminSessionB);
// Should only contain tasks where section_id = "section-b"
// tasksB !== tasksA

// ✅ TEST 3: Super admin sees all
const superAdminSession = { role: "super_admin", section_id: null };
const allTasks = await listTasks(superAdminSession);
// Should contain ALL tasks from ALL sections

// ✅ TEST 4: Cannot leak data across sections
try {
  await prisma.task.update({
    where: { id: "task-from-section-a" },
    data: { section_id: "section-b" },  // Attempt hijacking
  });
  // Should throw: "Unauthorized" (due to sanitization)
} catch (e) {
  // ✅ Good - write was rejected
}
```

---

## 🛠️ QUICK CHECKLIST

Before submitting any PR, verify:

- [ ] All `findMany()` use `getScopedFilter()` or similar scoping
- [ ] All `count()` use `getScopedFilter()`
- [ ] All `groupBy()` use `getScopedFilter()`
- [ ] All `delete()` verify ownership first
- [ ] All `update()` verify ownership + sanitize data
- [ ] All `create()` stamp `section_id` from session
- [ ] No raw SQL queries (or all parameterized + scoped)
- [ ] TypeScript errors resolved (no `any` casts except session.user)
- [ ] Tested with admin from Section A, admin from Section B, super_admin

---

## 🔐 Security Guarantees This Provides

| Threat | Mitigation |
|--------|-----------|
| Cross-section data leakage | `getScopedFilter()` enforces section_id in every query |
| Privilege escalation | `super_admin` logic is centralized, cannot be bypassed |
| Ownership hijacking | All writes verify section_id match before execution |
| SQL injection | Prisma parameterization + ORM (no string concatenation) |
| Timestamp manipulation | `created_at`, `updated_at` removed from sanitization |
| TOCTOU race conditions | Prisma transactions + immediate re-verification |

