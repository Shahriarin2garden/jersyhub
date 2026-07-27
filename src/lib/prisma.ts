import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cached in every environment, production included. On a serverless host each
// warm invocation reuses the same container, so without this we would build a
// new PrismaClient — and a new pool — per request and exhaust the database's
// connection limit. Pair this with Neon's pooled (`-pooler`) connection string.
globalForPrisma.prisma = prisma;
