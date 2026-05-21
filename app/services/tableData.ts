"use server"

import prisma from "@/lib/prisma";


export async function tableData(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    try {
        // Run queries in parallel to save time
        const [stats, tasks, totalCount] = await Promise.all([
            // 1. Trend Stats (Raw Query)
            prisma.$queryRaw<any[]>`
                SELECT 
                    DATE_TRUNC('day', created_at) AS date, 
                    COUNT(id)::int AS "taskCount"
                FROM "Task"
                WHERE created_at > NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC;
            `,
            // 2. Paginated Table Rows
            prisma.task.findMany({
                skip: skip,
                take: pageSize,
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
            // 3. Total Count for Pagination Logic
            prisma.task.count()
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

export async function deleteTask(id:string){

    
    try{
        const deleteTask = prisma.task.delete({
           where:{
            id:id,
           },
        })
         return {success:true, message:"Deleted Sucessfull",deleteTask}

    }
    catch (error){
        console.error("Delete Task Error:", error);
        throw new Error("Failed to delete task. It might not exist.");

    }
}