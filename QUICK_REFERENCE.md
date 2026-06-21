# SECURITY QUICK REFERENCE - Keep This Handy While Coding

## 🚨 The One Rule to Rule Them All

**EVERY Prisma query must be scoped to the user's section.**

```typescript
const scopedWhere = getScopedFilter(session.user as any, {/* extra filters */});
```

---

## ✅ COPY & PASTE THESE 6 PATTERNS

### 1️⃣ LIST (findMany)
```typescript
const scopedWhere = getScopedFilter(session.user as any, {});
const items = await prisma.model.findMany({ where: scopedWhere });
```

### 2️⃣ COUNT/GROUP (count, groupBy)
```typescript
const scopedWhere = getScopedFilter(session.user as any, {});
const count = await prisma.model.count({ where: scopedWhere });
const stats = await prisma.model.groupBy({ by: ["status"], where: scopedWhere });
```

### 3️⃣ READ + DELETE
```typescript
const item = await prisma.model.findUnique({ where: { id } });
if (!item || item.section_id !== session.user.section_id) throw new Error("Unauthorized");
await prisma.model.delete({ where: { id } });
```

### 4️⃣ READ + UPDATE (with sanitization)
```typescript
const item = await prisma.model.findUnique({ where: { id } });
if (!item || item.section_id !== session.user.section_id) throw new Error("Unauthorized");

const sanitized = { ...data };
delete sanitized.section_id;  // No hijacking!
delete sanitized.created_by;
delete sanitized.created_at;

await prisma.model.update({ where: { id }, data: sanitized });
```

### 5️⃣ CREATE (force section_id from session)
```typescript
const item = await prisma.model.create({
  data: {
    ...params,
    section_id: session.user.section_id,  // ← From session ONLY
    created_by: session.user.id,
  },
});
```

### 6️⃣ CROSS-CHECK (verify both belong to section)
```typescript
const [task, team] = await Promise.all([
  prisma.task.findUnique({ where: { id: taskId }, select: { section_id: true } }),
  prisma.team.findUnique({ where: { id: teamId }, select: { section_id: true } }),
]);

if (!task?.section_id || task.section_id !== session.user.section_id) throw new Error("Task unauthorized");
if (!team?.section_id || team.section_id !== session.user.section_id) throw new Error("Team unauthorized");
```

---

## 🚫 NEVER DO THIS

```typescript
❌ prisma.task.findMany()  // Missing section_id!
❌ prisma.task.count()     // Missing filter!
❌ prisma.task.delete({where: {id}})  // No ownership check!
❌ await prisma.task.create({data: {section_id: req.body.section_id}})  // Trust client!
❌ (await prisma.task.update({where:{id}, data}))  // No sanitization!
❌ const q = `WHERE section_id = '${sectionId}'`  // SQL injection!
```

---

## 🔍 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "User can see other section's data" | Add `getScopedFilter()` to findMany |
| "NULL errors in count queries" | Use conditional: `querySectionId ? {section_id} : {}` |
| "Attacker could delete other section's items" | Add `findUnique` verification before delete |
| "Can't update section_id field" | Add `delete data.section_id` before update |
| "TypeError: Cannot read section_id" | Ensure session.user includes section_id in auth callback |

---

## ✔️ PRE-COMMIT CHECKLIST

- [ ] All `findMany()` / `count()` / `groupBy()` use `scopedWhere`
- [ ] All `delete()` / `update()` verify section_id first
- [ ] All `create()` stamp `section_id: session.user.section_id`
- [ ] No raw SQL without parameterization + section filter
- [ ] `section_id` never comes from client request body
- [ ] All timestamp/ownership fields removed from update data

---

## 📚 FULL DOCS

- **SECURITY_PATTERNS.md** - Detailed patterns + anti-patterns
- **MIGRATION_GUIDE.md** - Step-by-step before/after code
- **SECURITY_AUDIT_REPORT.md** - Full audit findings
