import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import * as schema from "./schema";

/** Driver-agnostic Drizzle handle: Neon in production, PGlite locally and in tests. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const LOCAL_DB_DIR = ".data/folio";

type Closable = { close: () => Promise<void> };
let localClient: Closable | null = null;

/** Flushes and closes the embedded PGlite database (no-op for Neon). */
export async function closeDatabase() {
  const client = localClient;
  localClient = null;
  await client?.close();
}

/**
 * Neon when a postgres URL is configured, otherwise an embedded PGlite database on disk.
 * Pass `"memory://"` for an in-memory PGlite instance (tests).
 */
export async function createDatabase(url: string | undefined): Promise<Database> {
  if (url && /^postgres(ql)?:\/\//.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema }) as unknown as Database;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  let client;
  if (url === "memory://") {
    client = new PGlite();
  } else {
    const { mkdirSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    // PGlite creates the data dir itself but needs its parent; an empty pre-created dir hangs init.
    mkdirSync(dirname(LOCAL_DB_DIR), { recursive: true });
    client = new PGlite(LOCAL_DB_DIR);
    localClient = client;
    // Killing the process while PGlite has the data dir open can corrupt it; close cleanly first.
    const shutdown = () => void closeDatabase().finally(() => process.exit(0));
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
  return drizzle(client, { schema }) as unknown as Database;
}

export async function migrateDatabase(db: Database, url: string | undefined) {
  const migrationsFolder = "drizzle";
  if (url && /^postgres(ql)?:\/\//.test(url)) {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder });
  } else {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migrate(db as any, { migrationsFolder });
  }
}
