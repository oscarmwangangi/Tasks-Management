
import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import  prisma  from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

 
class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "OTP Authentication",
      credentials: {
        email: { type: "text" },
        otp: { type: "text" },
        token: { type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.token as string;
        const otp = credentials?.otp as string;
        const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";

        if (!token || !otp) {
          throw new CustomAuthError("Missing required login tokens.");
        }

        try {
          // 1. Verify and decode your custom temporary JWT
          const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
          };

          // 2. Lookup the OTP Record in the database
          const otpRecord = await prisma.otp.findUnique({
            where: { email: decoded.email },
          });

          if (!otpRecord) {
            throw new CustomAuthError("OTP not found.");
          }

          // 3. Check for expiration
          if (otpRecord.expiresAt < new Date()) {
            await prisma.otp.delete({
              where: { email: decoded.email },
            });
            throw new CustomAuthError("OTP expired.");
          }

          // 4. Compare the hashes using bcrypt
          const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
          if (!isOtpValid) {
            throw new CustomAuthError("Invalid OTP.");
          }

          // 5. Clean up the database by deleting the used OTP
          await prisma.otp.delete({
            where: { email: decoded.email },
          });

          // 6. SUCCESS! Fetch the complete user from your database to log them in
          const dbUser = await prisma.user.findUnique({
            where: { email: decoded.email }
          });

          if (!dbUser) {
            throw new CustomAuthError("User account no longer exists.");
          }

          // Return this object. Auth.js saves this into your secure cookie!
          return {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName,
            lastName: dbUser.secondName,
            role: dbUser.role,
            section_id: (dbUser as any).section_id ?? null,
          } as {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            role: "admin" | "super_admin" | "user";
            section_id: string | null;
          };

        } catch (error: any) {
          console.error("[auth.ts authorize] Error:", error);
         
          if (error instanceof CustomAuthError) throw error;
          // Otherwise, handle a generic fallback crash
          throw new CustomAuthError("Session expired or invalid token.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.section_id = (user as any).section_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.role = token.role;
        session.user.section_id = token.section_id;
      }
      return session;
    },
  },
});