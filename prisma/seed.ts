import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Create Users
  const user1 = await prisma.user.create({
    data: {
      firstName: "Oscar",
      secondName: "Smith",
      email: "oscar@test.com",
      password: "hashedpassword",
      role: "admin",
    },
  })

  const user2 = await prisma.user.create({
    data: {
      firstName: "John",
      secondName: "james",
      email: "john@test.com",
      password: "hashedpassword",
    },
  })

  // 2. Create Team
  const team = await prisma.team.create({
    data: {
      name: "Dev Team",
      created_by: user1.id,
    },
  })

  // 3. Add members to team
  await prisma.teamMember.createMany({
    data: [
      {
        team_id: team.id,
        user_id: user1.id,
        role: "admin",
      },
      {
        team_id: team.id,
        user_id: user2.id,
        role: "member",
      },
    ],
  })

  // 4. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Setup project",
      description: "Initialize backend and frontend",
      status: "backlog",
      priority: "high",
      created_by: user1.id,
      assigned_to: user2.id,
      team_id: team.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: "Design UI",
      status: "todo",
      priority: "medium",
      created_by: user1.id,
      assigned_to: user2.id,
      team_id: team.id,
    },
  })
    const task3 = await prisma.task.create({
    data: {
      title: "Flutter project",
      description: "Initialize backend and frontend",
      status: "in_progress",
      priority: "high",
      created_by: user1.id,
      assigned_to: user2.id,
      team_id: team.id,
    },
  })
  const task4 = await prisma.task.create({
    data: {
      title: "Telegram project",
      description: "Initialize backend and frontend",
      status: "todo",
      priority: "high",
      created_by: user1.id,
      assigned_to: user2.id,
      team_id: team.id,
    },
  })
    const task5 = await prisma.task.create({
    data: {
      title: "Pen test project",
      description: "Initialize backend and frontend",
      status: "done",
      priority: "high",
      created_by: user1.id,
      assigned_to: user2.id,
      team_id: team.id,
    },
  })
    const task6 = await prisma.task.create({
    data: {
      title: "laravel project",
      description: "Initialize backend and frontend",
      status: "active",
      priority: "high",
      created_by: user1.id,
      assigned_to: user2.id,
      team_id: team.id,
    },
  })
  // 5. Add Favorite
  await prisma.favorite.create({
    data: {
      user_id: user2.id,
      task_id: task1.id,
    },
  })

  // 6. Add Message (Reminder)
  await prisma.message.create({
    data: {
      user_id: user2.id,
      task_id: task1.id,
      message: "Don't forget to start this task",
      type: "reminder",
    },
  })

  console.log("✅ Seed data inserted successfully")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })