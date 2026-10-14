import { asc } from "drizzle-orm";

import { getDb, users } from "@/lib/db";
import { route } from "@/lib/http";

/** Seeded demo accounts for the "Choose an account" screen. */
export const GET = route(async () => {
  const db = await getDb();
  const accounts = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      initials: users.initials,
      tone: users.tone,
    })
    .from(users)
    .orderBy(asc(users.createdAt), asc(users.email));
  return Response.json({ accounts });
});
