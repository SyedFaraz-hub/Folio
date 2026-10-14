import { cache } from "react";

import { cookies } from "next/headers";

import { eq } from "drizzle-orm";
import "server-only";

import { type User, getDb, users } from "./db";
import { unauthorized } from "./http";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";

export type SessionUser = Pick<User, "id" | "email" | "name" | "initials" | "tone">;

/** Current user for server components and route handlers (deduped per request). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const userId = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const db = await getDb();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      initials: users.initials,
      tone: users.tone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function startSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
