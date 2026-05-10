"use server";
import { TaskPriority } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function doughnutData() {
    const data = await prisma.task.groupBy({
        by: ["priority"],
        _count: {
            priority: true,
        },
    });
    const count = {
        low: 0,
        medium: 0,
        high: 0,
    }

    data.forEach((group) => {
        switch (group.priority) {
            case TaskPriority.low:
                count.low = group._count.priority;
                break;
            case TaskPriority.medium:
                count.medium = group._count.priority;
                break;
            case TaskPriority.high:
                count.high = group._count.priority;
                break;
            default:
                break;
        }
    });
  
    return{
        lowStatus: count.low,
        mediumStatus: count.medium,
        highStatus: count.high

    }
}