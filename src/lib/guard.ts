import { auth } from "@/lib/auth";

/** Returns the session if the user is an admin, else null. */
export async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin" ? session : null;
}

/** Returns the session if the user is a logged-in customer, else null. */
export async function requireCustomer() {
  const session = await auth();
  return session?.user?.role === "customer" ? session : null;
}
