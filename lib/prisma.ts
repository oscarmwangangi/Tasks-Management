import { PrismaClient } from "@prisma/client"; 
import { PrismaPg } from "@prisma/adapter-pg"; 
import { PrismaNeon } from "@prisma/adapter-neon";


// const globalForPrisma = global as unknown as {
//   prisma: PrismaClient; 
// }; 
// const adapter = new PrismaNeon({
//   connectionString: process.env.DATABASE_URL!,
// })
// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     adapter, 
//   }); 
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 
// export default prisma; 

const  connectionString = process.env.DATABASE_URL

const adapter = new PrismaNeon({connectionString})

const prisma = new PrismaClient({adapter})

export default prisma
