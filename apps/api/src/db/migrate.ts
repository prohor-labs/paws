import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "../lib/env";

const connectionString = process.env.DIRECT_URL ?? env.databaseUrl;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function runMigrations() {
  await migrate(db, { migrationsFolder: join(__dirname, "migrations") });
  await client.end();
}

runMigrations().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
