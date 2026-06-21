# Tasks-Management (Next.js + Prisma)

Multi-tenant task management application with **role-based dashboards** (admin/user/super_admin) and **section-isolated data access**.

---

## Features

- **Multi-tenant isolation** using `section_id` (admins/users can only see data for their section)
- **Role-based UI**:
  - Admin/super_admin: dashboard analytics + user management (create users, invite links, user directory)
  - User: task center (assigned tasks + teams)
- **Secure mutations**:
  - Server enforces ownership checks for update/delete
  - Server forces `section_id` from the authenticated session (client cannot override)
- **Invite links** with expiration (7 days)
- **Email notifications** for new users created by admin

---

## Tech Stack

- **Next.js** (App Router)
- **Prisma** ORM
- **PostgreSQL**
- **NextAuth (v5 beta)** for authentication
- **TailwindCSS**

---

## Prerequisites

- Node.js (LTS recommended)
- A PostgreSQL database

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# --- Database ---
# Used by Prisma. Example:
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public

# --- App ---
APP_URL=http://localhost:3000

# --- Email (for admin user provisioning) ---
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# --- Auth ---
# Required by NextAuth
NEXTAUTH_SECRET=replace-with-a-long-random-string
```

> Note: If your repo already has additional auth/SMTP variables, add them as required by your deployment.

---

## How to Run (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Start Postgres and create the DB

Make sure your `DATABASE_URL` points to an existing PostgreSQL database.

### 3) Generate Prisma client

```bash
npx prisma generate
```

### 4) Apply migrations

If you use migrations included in `prisma/migrations`, run:

```bash
npx prisma migrate dev
```

### 5) (Optional) Seed data

If your project includes a seed script, add it as:

```bash
npx prisma db seed
```

### 6) Run the dev server

```bash
npm run dev
```

Open:

- http://localhost:3000

---

## Useful Scripts

- `npm run dev` – start development server
- `npm run build` – generate Prisma client + build
- `npm run start` – run production server
- `npm run lint` – eslint

---

## Security / Multi-Tenancy Verification

Use this checklist to confirm isolation works correctly.

1. **Admin vs User UI**
   - Login as `admin` → should see admin panel + user management
   - Login as `user` → should see only task center (no user management)

2. **Data isolation**
   - Create two sections (Section A + Section B)
   - Admin A creates a task in Section A
   - Admin B should not see that task

3. **Mutation safety**
   - Attempt to update/delete a task from a different section
   - Server should reject the operation (ownership/section verification)

---

## Project Structure (high level)

- `prisma/schema.prisma` – data model
- `app/actions/` – server actions (admin + team)
- `app/(pages)/dashboard/` – role-aware dashboard UI
- `app/services/` – data services (dashboard cards, tables, etc.)
- `app/(pages)/projects/page.tsx` – projects/tasks UI

---

## Documentation & References

This repo includes additional internal docs:

- `QUICK_START.md` – multi-tenant + env setup + verification steps
- `IMPLEMENTATION_SUMMARY.md` – what was changed and where
- `SECURITY_PATTERNS.md` / `SECURITY_QUICK_REFERENCE.md` – section-scoping patterns and anti-patterns
- `MIGRATION_GUIDE.md` – notes for migration workflow

---

## Notes

Because multi-tenant enforcement is implemented at the data/query layer, always ensure new Prisma queries use the repo’s section-scoping helpers (e.g., `getScopedFilter()`), and always enforce `section_id` server-side for create/update/delete.

