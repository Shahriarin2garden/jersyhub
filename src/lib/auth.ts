import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { phoneSchema } from "@/lib/validations";

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const otpSchema = z.object({
  phone: phoneSchema,
  code: z.string().min(4),
  name: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required when self-hosting (Render) — host header is trusted for callback URLs.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin" },
  providers: [
    // Admin — email + password
    Credentials({
      id: "admin-credentials",
      name: "Admin",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = adminSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return null;
        if (!(await bcrypt.compare(password, admin.passwordHash))) return null;
        return { id: admin.id, email: admin.email, name: admin.name, role: "admin" };
      },
    }),
    // Customer — phone + OTP
    Credentials({
      id: "customer-otp",
      name: "OTP",
      credentials: { phone: {}, code: {}, name: {} },
      async authorize(raw) {
        const parsed = otpSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { phone, code, name } = parsed.data;

        const result = await verifyOtp(phone, code);
        if (!result.ok) return null;

        const customer = await prisma.customer.upsert({
          where: { phone },
          update: { phoneVerified: true, ...(name ? { name } : {}) },
          create: { phone, name: name || "Customer", phoneVerified: true },
        });
        return {
          id: customer.id,
          name: customer.name,
          role: "customer",
          phone: customer.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        // @ts-expect-error custom fields on authorize return
        token.role = user.role;
        // @ts-expect-error custom fields on authorize return
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "admin" | "customer") ?? "customer";
        session.user.phone = token.phone as string | undefined;
      }
      return session;
    },
  },
});
