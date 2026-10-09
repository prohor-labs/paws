import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../env.js';

const MIGRATIONS_FOLDER = new URL('../../../drizzle', import.meta.url).pathname;

async function runMigrations(): Promise<void> {
  const client = postgres(process.env.DIRECT_URL ?? env.databaseUrl, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  await client.end();
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
