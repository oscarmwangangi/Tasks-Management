import { Prisma } from "@prisma/client";

interface UserSession {
  id: string;
  role: "admin" | "user" | "super_admin";
  section_id: string | null;
}

function applyScope(sessionUser: UserSession, args: any) {
  if (sessionUser.role !== "super_admin") {
    if (!args.where) args.where = {};
    args.where.section_id = sessionUser.section_id;
  }
  return args;
}

export function createPrismaScopingExtension(sessionUser: UserSession) {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        task: {
          findMany({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
          count({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
        },

        team: {
          findMany({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
          count({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
        },

        user: {
          findMany({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
          count({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
        },

        section: {
          findMany({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
          count({ args, query }) {
            return query(applyScope(sessionUser, args));
          },
        },
      },
    });
  });
}