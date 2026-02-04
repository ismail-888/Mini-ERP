import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

/** الحقول الكاملة من الداتابيز */
type UserWithCredentials = {
  id: string;
  email: string | null;
  name: string | null;
  password: string | null;
  role: "ADMIN" | "MERCHANT";
  status: "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELED";
  plan: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL";
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null; // الحقل الجديد للاشتراك المدفوع
};

/** البيانات الممررة للمصادقة */
type AuthorizedUser = {
  id: string;
  name: string;
  role: "ADMIN" | "MERCHANT";
  status: UserWithCredentials["status"];
  plan: UserWithCredentials["plan"];
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
};

type TokenWithRole = { 
  id?: string; 
  name?: string;
  role?: "ADMIN" | "MERCHANT";
  status?: AuthorizedUser["status"];
  plan?: AuthorizedUser["plan"];
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null; // الحقل الجديد في التوكن
};

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      role: "ADMIN" | "MERCHANT";
      status: AuthorizedUser["status"];
      plan: AuthorizedUser["plan"];
      trialEndsAt: Date | null;
      subscriptionEndsAt: Date | null; // الحقل الجديد في الجلسة
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
          name: user.name,
          role: user.role,
          status: user.status,
          plan: user.plan,
          trialEndsAt: user.trialEndsAt,
          subscriptionEndsAt: user.subscriptionEndsAt,
        } as AuthorizedUser;
      },
    }),
  ],
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as AuthorizedUser;
        token.id = u.id;
        token.name = u.name;
        token.role = u.role;
        token.status = u.status;
        token.plan = u.plan;
        token.trialEndsAt = u.trialEndsAt?.toISOString();
        token.subscriptionEndsAt = u.subscriptionEndsAt?.toISOString();
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
          name: t.name,
          role: t.role ?? "MERCHANT",
          status: t.status ?? "ACTIVE",
          plan: t.plan ?? "FREE_TRIAL",
          trialEndsAt: t.trialEndsAt ? new Date(t.trialEndsAt) : null,
          subscriptionEndsAt: t.subscriptionEndsAt ? new Date(t.subscriptionEndsAt) : null,
        },
      };
    },
  },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;