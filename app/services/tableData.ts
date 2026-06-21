"use server"
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/app/middlware/auth";
import { getScopedFilter } from "@/lib/api-security";

export type DashboardTask = Prisma.TaskGetPayload<{
  include: {
    team: { select: { name: true } };
    creator: { select: { firstName: true; secondName: true } };
  };
}>;

export async function tableData(page: number = 1, pageSize: number = 10) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized: No session");

    const skip = (page - 1) * pageSize;
    const scopedWhere = getScopedFilter(session.user as any, {});

    try {
        // Run queries in parallel to save time
        const [stats, tasks, totalCount] = await Promise.all([
            // 1. Trend Stats (Raw Query with section_id filter)
            prisma.$queryRaw<any[]>`
                SELECT
                    DATE_TRUNC('day', created_at) AS date,
                    COUNT(id)::int AS "taskCount"
                FROM "Task"
                WHERE created_at > NOW() - INTERVAL '30 days'
                AND section_id = ${session.user.section_id}::uuid
                GROUP BY date
                ORDER BY date ASC;
            `,
            // 2. Paginated Table Rows with section scoping
            prisma.task.findMany({
                skip: skip,
                take: pageSize,
                where: scopedWhere,
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    team: {
                        select: { name: true },
                    },
                    creator:{
                        select: { firstName: true, secondName: true},
                    },
                },
            }),
            // 3. Total Count for Pagination Logic with section scoping
            prisma.task.count({ where: scopedWhere })
        ]);

        return {
            stats,
            tasks,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize),
                totalItems: totalCount,
                hasNextPage: skip + tasks.length < totalCount,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error("Dashboard Data Error:", error);
        throw new Error("Failed to fetch dashboard data");
    }
}

export async function deleteTask(id: string) {
    const session = await auth();
    // if (!session?.user?.section_id) throw new Error("Unauthorized: No session");

    try {
        // Verify task belongs to user's section before deletion
        // const task = await prisma.task.findUnique({ where: { id } });
        // if (!task || task.section_id !== session.user.section_id) {
        //     throw new Error("Task not found or unauthorized");
        // }

        const deletedTask = await prisma.task.delete({
            where: { id },
        });

        return { success: true, message: "Deleted Successfully", deletedTask };
    } catch (error) {
        console.error("Delete Task Error:", error);
        throw new Error("Failed to delete task. It might not exist.");
    }
}

export async function updateTask(id: string, data: Prisma.TaskUpdateInput) {
    const session = await auth();
    // if (!session?.user?.section_id) throw new Error("Unauthorized: No session");

    try {
        // Verify task belongs to user's section before update
        // const task = await prisma.task.findUnique({ where: { id } });
        // if (!task || task.section_id !== session.user.section_id) {
        //     throw new Error("Task not found or unauthorized");
        // }

        // Create a copy of data to avoid mutating the original
        const updateData = { ...data };

        // Remove any attempts to change section_id
        if ('section_id' in updateData) {
            delete updateData.section_id;
        }
        if ('section' in updateData) {
            delete updateData.section;
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
        });

        return { success: true, message: "Updated Successfully", updatedTask };
    } catch (error) {
        console.error("Update Task Error:", error);
        return { success: false, message: "Failed to update task." };
    }
}