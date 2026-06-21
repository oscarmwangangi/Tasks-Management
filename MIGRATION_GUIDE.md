# MIGRATION GUIDE: Adopting Unified Multi-Tenant Patterns

## 📍 Overview

This guide shows you how to migrate existing Prisma queries to the unified, security-hardened patterns.

---

## 🔄 MIGRATION PATTERN 1: Converting List Queries

### BEFORE (Current - Some Without Proper Scoping)

```typescript
// ❌ Missing scopedWhere in some functions
export async function fetchTeamMembers(teamId: string) {
  const members = await prisma.teamMember.findMany({
    where: { team_id: teamId },
    select: { id: true, user: { select: { id: true, email: true } } },
  });
  return members;
}
```

### AFTER (Migrated - Properly Scoped)

```typescript
// ✅ Includes section scoping for team_member queries
export async function fetchTeamMembers(teamId: string) {
  const session = await auth();
  if (!session?.user?.section_id) throw new Error("Unauthorized");

  // Step 1: Verify team belongs to section
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { section_id: true },
  });

  if (!team || team.section_id !== session.user.section_id) {
    throw new Error("Unauthorized: Team not in your section");
  }

  // Step 2: Query members scoped to section
  const scopedWhere = getScopedFilter(session.user as any, {
    team_id: teamId,
  });

  const members = await prisma.teamMember.findMany({
    where: scopedWhere,
    select: { id: true, user: { select: { id: true, email: true } } },
  });

  return members;
}
```

---

## 🔄 MIGRATION PATTERN 2: Converting Count/Aggregation Queries

### BEFORE

```typescript
export async function listSectionTasks(targetSectionId?: string) {
  const session = await auth();
  let querySectionId = session.user.section_id || null;

  const count = await prisma.task.count({
    where: {
      section_id: querySectionId,  // ❌ Breaks when null
      status: { notIn: ["done"] },
    },
  });

  return { success: true, data: { count } };
}
```

### AFTER

```typescript
export async function listSectionTasks(targetSectionId?: string) {
  const session = await auth();

  let querySectionId: string | null = null;

  if (session.user.role === "super_admin") {
    querySectionId = targetSectionId || null;
  } else {
    querySectionId = session.user.section_id ?? null;
    if (!querySectionId) {
      throw new Error("Admin must belong to a section");
    }
  }

  // ✅ Use getScopedFilter to handle null gracefully
  const scopedWhere = getScopedFilter(
    { ...session.user, section_id: querySectionId } as any,
    { status: { notIn: ["done"] } }
  );

  const count = await prisma.task.count({ where: scopedWhere });

  return { success: true, data: { count } };
}
```

---

## 🔄 MIGRATION PATTERN 3: Converting Delete Operations

### BEFORE

```typescript
export async function deleteTask(id: string) {
  // ❌ No ownership verification!
  await prisma.task.delete({
    where: { id },
  });
}
```

### AFTER

```typescript
export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.section_id) throw new Error("Unauthorized");

  // ✅ Step 1: Verify ownership
  const task = await prisma.task.findUnique({
    where: { id },
    select: { section_id: true },
  });

  if (!task) throw new Error("Task not found");
  if (task.section_id !== session.user.section_id) {
    throw new Error("Unauthorized: Task not in your section");
  }

  // ✅ Step 2: Now safe to delete
  const deleted = await prisma.task.delete({
    where: { id },
  });

  return { success: true, deleted };
}
```

---

## 🔄 MIGRATION PATTERN 4: Converting Update Operations

### BEFORE

```typescript
export async function updateTask(id: string, data: any) {
  // ❌ No verification, no sanitization!
  const updated = await prisma.task.update({
    where: { id },
    data,
  });
  return updated;
}
```

### AFTER

```typescript
export async function updateTask(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.section_id) throw new Error("Unauthorized");

  // ✅ Step 1: Verify ownership
  const task = await prisma.task.findUnique({
    where: { id },
    select: { section_id: true },
  });

  if (!task || task.section_id !== session.user.section_id) {
    throw new Error("Unauthorized: Task not in your section");
  }

  // ✅ Step 2: Sanitize input
  const sanitized = { ...data };
  delete sanitized.section_id;  // Prevent hijacking
  delete sanitized.created_by;  // Prevent ownership theft
  delete sanitized.created_at;  // Prevent timestamp manipulation

  // ✅ Step 3: Safe to update
  const updated = await prisma.task.update({
    where: { id },
    data: sanitized,
  });

  return updated;
}
```

---

## 🔄 MIGRATION PATTERN 5: Converting Create Operations

### BEFORE

```typescript
export async function createTask(params: { title: string; section_id?: string }) {
  // ❌ Trusts client for section_id!
  const task = await prisma.task.create({
    data: {
      title: params.title,
      section_id: params.section_id,  // ❌ Client-controlled!
    },
  });
  return task;
}
```

### AFTER

```typescript
export async function createTask(params: { title: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  const sectionId = session?.user?.section_id;

  if (!userId || !sectionId) {
    throw new Error("Unauthorized: No section access");
  }

  // ✅ Stamp section_id from verified session
  const task = await prisma.task.create({
    data: {
      title: params.title,
      created_by: userId,
      section_id: sectionId,  // ✅ From session, never from client
    },
  });

  return task;
}
```

---

## 🔄 MIGRATION PATTERN 6: Converting Raw SQL Queries

### BEFORE

```typescript
// ⚠️ Raw SQL is risky and hard to audit
const stats = await prisma.$queryRaw`
  SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) as count
  FROM "Task"
  WHERE section_id = ${session.user.section_id}::uuid
`;
```

### AFTER (Option 1: Use ORM)

```typescript
// ✅ Prefer ORM when possible
const stats = await prisma.task.groupBy({
  by: ["created_at"],  // Approximate grouping
  where: { section_id: session.user.section_id },
  _count: { _all: true },
});
```

### AFTER (Option 2: If Raw SQL is Necessary)

```typescript
// ✅ If you must use raw SQL, parameterize and scope
const stats = await prisma.$queryRaw`
  SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) as count
  FROM "Task"
  WHERE section_id = ${session.user.section_id}::uuid
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY date ASC
`;
```

Key points:
- Always use `${...}` parameterization, never string concatenation
- Always include the section_id filter
- Comment why raw SQL was necessary

---

## 🚀 MIGRATION CHECKLIST

For each file in your codebase:

### READ Operations (findMany, findFirst, count, groupBy)
- [ ] Uses `getScopedFilter(session.user, {...})`
- [ ] Handles super_admin (NULL section_id) correctly
- [ ] No hardcoded section_id values

### WRITE Operations (create, update)
- [ ] Stamps `section_id` from session, never from client
- [ ] Verifies ownership BEFORE update
- [ ] Sanitizes input (removes dangerous fields)

### DELETE Operations
- [ ] Verifies ownership before deletion
- [ ] Throws clear error if unauthorized
- [ ] Uses transaction if cascading deletes

### RAW SQL (if any)
- [ ] Uses parameterized queries (`${...}`)
- [ ] Includes section_id filter
- [ ] Comment explaining why ORM wasn't sufficient

---

## 📝 Pre-Commit Security Review

Before committing code, ask yourself:

1. **If this query returns data:**
   - [ ] Does it use `getScopedFilter()`?
   - [ ] Would a super_admin see all data?
   - [ ] Would an admin only see their section?
   - [ ] Would a user from another section see nothing?

2. **If this query modifies data:**
   - [ ] Did I verify ownership first?
   - [ ] Did I sanitize the input?
   - [ ] Is `section_id` stamped from session?
   - [ ] Could an attacker move data to another section?

3. **If this query uses raw SQL:**
   - [ ] Is it parameterized?
   - [ ] Why wasn't the ORM sufficient?
   - [ ] Is there a section_id filter?

---

## 🧪 Testing Your Migrations

After migrating a function, test it with different user roles:

```typescript
// ✅ Test 1: Admin from Section A
const result1 = await myFunction(adminSessionA);
// Verify: Only shows Section A data

// ✅ Test 2: Admin from Section B
const result2 = await myFunction(adminSessionB);
// Verify: Only shows Section B data, result1 !== result2

// ✅ Test 3: Super Admin
const result3 = await myFunction(superAdminSession);
// Verify: Shows data from both sections

// ✅ Test 4: Unauthorized attempt
try {
  // Attempt to access another section's data
  await myFunction({ ...adminSessionA, section_id: "section-b" });
  throw new Error("Should have failed!");
} catch (e) {
  // ✅ Good - caught the unauthorized attempt
}
```

---

## 🎯 Priority Order for Migration

1. **CRITICAL (Migrate First):**
   - adminActions.ts functions
   - teamActions.ts functions
   - Any DELETE or UPDATE operations

2. **HIGH (Migrate Second):**
   - tableData.ts functions
   - Dashboard service functions
   - Any public-facing endpoints

3. **MEDIUM (Migrate Third):**
   - User-facing list operations
   - Dashboard read operations
   - Analytics queries

4. **LOW (Migrate Last):**
   - Logging/audit functions
   - One-off admin operations

