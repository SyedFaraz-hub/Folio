import "server-only";

import { type Database, createDatabase } from "./client";

// One instance per server process; survives hot reloads in dev.
const globalForDb = globalThis as unknown as { folioDb?: Promise<Database> };

export function getDb(): Promise<Database> {
  globalForDb.folioDb ??= createDatabase(process.env.DATABASE_URL);
  return globalForDb.folioDb;
}

export type { Database } from "./client";
export * from "./schema";
