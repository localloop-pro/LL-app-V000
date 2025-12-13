import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Checks if the current user is an admin.
 * Should be called in Server Components for admin-only routes.
 *
 * @returns The session object if user is admin
 * @throws Redirects to dashboard if not admin or not authenticated
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/");
  }

  // Query database to get user role
  const userData = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const userRole = userData[0]?.role;

  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Gets the current session and checks if user is admin.
 * Returns null if not authenticated or not admin.
 *
 * @returns The session object or null
 */
export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return null;
  }

  // Query database to get user role
  const userData = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const userRole = userData[0]?.role;

  if (userRole !== "admin" && userRole !== "super_admin") {
    return null;
  }

  return session;
}

