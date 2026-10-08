import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "../lib/env";

const connectionString = process.env.DIRECT_URL ?? env.databaseUrl;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: `${import.meta.dir}/migrations` });
  await client.end();
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
