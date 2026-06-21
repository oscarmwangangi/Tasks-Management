"use server";
import prisma from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import { auth } from "@/app/middlware/auth";
import { getScopedFilter } from "@/lib/api-security";

export async function getDashboardCards() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized: No session");

    const scopedWhere = getScopedFilter(session.user as any, {});

    const stats = await prisma.task.groupBy({
        by: ['status'],
        where: scopedWhere,
        _count: {
            _all: true,
        },
    });
console.log("Dashboard Stats", stats);
    // Initialize counts for the statuses
    const counts = {
        total: 0,
        backlog: 0,
        todo: 0,
        in_progress: 0,
        active: 0,
        review: 0,
        done: 0,
    };

    stats.forEach((group) => {
        const count = group._count._all;
        counts.total += count;


        switch (group.status) {
            case TaskStatus.backlog:
                counts.backlog = count;
                break;
            case TaskStatus.todo:
                counts.todo = count;
                break;
            case TaskStatus.in_progress:
                counts.in_progress = count;
                break;
            case TaskStatus.active:
                counts.active = count;
                break;
            case TaskStatus.review:
                counts.review = count;
                break;
            case TaskStatus.done:
                counts.done = count;
                break;
            default:
                break;
        }
    });

    const overdueTasks = await prisma.task.count({
        where: {
            ...scopedWhere,
            due_date: { lt: new Date() },
            status: { not: TaskStatus.done },
        },
    });

    const activeTeamsCount = await prisma.team.count({
        where: scopedWhere,
    });

    return {
        totalTasks: counts.total,
        completedTasks: counts.done,
        overdueTasks,
        activeTeams: activeTeamsCount,
        backlogTasks: counts.backlog,
        todoTasks: counts.todo,
        inProgressTasks: counts.in_progress,
        activeTasks: counts.active,
        reviewTasks: counts.review,
        doneTasks: counts.done,
    };
}