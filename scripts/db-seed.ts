import { config } from "dotenv";

import { closeDatabase, createDatabase } from "../src/lib/db/client";
import { seedDatabase } from "../src/lib/db/seed";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const db = await createDatabase(process.env.DATABASE_URL);
  const result = await seedDatabase(db);
  console.log(`✓ seeded ${result.users} users and ${result.documents} documents`);
}

main()
  .then(closeDatabase)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
