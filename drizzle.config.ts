import { defineConfig } from "drizzle-kit";

// Only used to generate SQL migrations from the schema (`npm run db:generate`).
// Applying them is done by scripts/db-migrate.ts so the same files work for Neon and PGlite.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
});
