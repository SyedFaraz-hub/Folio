import { type Database, createDatabase, migrateDatabase } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { seedDatabase } from "@/lib/db/seed";

/** Fresh in-memory Postgres (PGlite) with real migrations + demo seed data. */
export async function createTestDb() {
  const db = await createDatabase("memory://");
  await migrateDatabase(db, "memory://");
  await seedDatabase(db);
  const rows = await db.select().from(users);
  const id = (email: string) => rows.find((u) => u.email === email)!.id;
  return {
    db: db as Database,
    maya: id("maya@folio.test"),
    daniel: id("daniel@folio.test"),
    priya: id("priya@folio.test"),
  };
}
