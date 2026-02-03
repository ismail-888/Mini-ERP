import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

/** الحقول التي نريد جلبها من قاعدة البيانات */
type UserWithCredentials = {
  id: string;
  email: string | null;
  name: string | null;
  password: string | null;
  role: "ADMIN" | "MERCHANT";
  status: "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELED";
  plan: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL";
  trialEndsAt: Date | null; // إضافة هذا الحقل
};

/** الحقول التي ستمرر لـ JWT ثم لـ Session */
type AuthorizedUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: "ADMIN" | "MERCHANT";
  status: "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELED";
  plan: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL";
  trialEndsAt: Date | null; // إضافة هذا الحقل
};

type TokenWithRole = { 
  id?: string; 
  role?: "ADMIN" | "MERCHANT";
  status?: AuthorizedUser["status"];
  plan?: AuthorizedUser["plan"];
  trialEndsAt?: string | null; // JWT يخزن التاريخ كنص (String) عادةً
};

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "ADMIN" | "MERCHANT";
      status: "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELED";
      plan: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL";
      trialEndsAt: Date | null; // إضافة هذا الحقل ليراه الميدل وير والسايدبار
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = (await db.user.findUnique({
          where: { email },
        })) as UserWithCredentials | null;

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          plan: user.plan,
          trialEndsAt: user.trialEndsAt, // تمريره من الداتابيز
        } satisfies AuthorizedUser;
      },
    }),
  ],
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as AuthorizedUser;
        token.id = u.id;
        token.role = u.role;
        token.status = u.status;
        token.plan = u.plan;
        // تخزين التاريخ في التوكن (يُحول لـ ISO String تلقائياً)
        token.trialEndsAt = u.trialEndsAt?.toISOString(); 
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as TokenWithRole;
      return {
        ...session,
        user: {
          ...session.user,
          id: t.id ?? "",
          role: t.role ?? "MERCHANT",
          status: t.status ?? "ACTIVE",
          plan: t.plan ?? "FREE_TRIAL",
          // تحويل النص لـ Date Object مرة أخرى عند الاستخدام
          trialEndsAt: t.trialEndsAt ? new Date(t.trialEndsAt) : null,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;