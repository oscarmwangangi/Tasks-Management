"use server";
import { TaskStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function getDashboardCards() {
    
    const stats = await prisma.task.groupBy({
        by: ['status'],
        _count: {
            _all: true,
        },
    });

    // Initialize counts for the statuses you care about
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

    return {
        totalTasks: counts.total,
        backlogTasks: counts.backlog,
        todoTasks: counts.todo,
        inProgressTasks: counts.in_progress,
        activeTasks: counts.active,
        reviewTasks: counts.review,
        doneTasks: counts.done,
    };
}