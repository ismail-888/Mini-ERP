import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// import { env } from "~/env";
import { db } from "~/server/db";

/** User shape from DB when using credentials (schema has password + role; generated client may not) */
type UserWithCredentials = {
  id: string;
  email: string | null;
  name: string | null;
  password: string | null;
  role: "ADMIN" | "MERCHANT";
};

/** User returned from authorize and passed into jwt callback */
type AuthorizedUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: "ADMIN" | "MERCHANT";
};

/** Token shape we store in JWT callback */
type TokenWithRole = { id?: string; role?: "ADMIN" | "MERCHANT" };

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "ADMIN" | "MERCHANT";
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
        } satisfies AuthorizedUser;
      },
    }),
  ],
  // adapter: PrismaAdapter(db),
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
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;