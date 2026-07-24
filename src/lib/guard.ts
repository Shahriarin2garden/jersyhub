import { auth } from "@/lib/auth";

/** Returns the admin session or null. Use in API routes. */
export async function requireAdmin() {
  const session = await auth();
  return session?.user ? session : null;
}
