import { config } from "dotenv";

import { closeDatabase, createDatabase, migrateDatabase } from "../src/lib/db/client";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const url = process.env.DATABASE_URL;
  const db = await createDatabase(url);
  await migrateDatabase(db, url);
  console.log(`✓ migrations applied (${url ? "DATABASE_URL" : "local PGlite"})`);
}

main()
  .then(closeDatabase)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
