import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "./schema";

const client = postgres(env.databaseUrl, {
  max: env.databaseMaxConnections,
  idle_timeout: 30,
  connect_timeout: 30,
  max_lifetime: 60 * 30,
  prepare: env.databasePrepare,
  transform: {
    undefined: null,
  },
});

export const db = drizzle(client, { schema });

export async function closeDatabase(): Promise<void> {
  await client.end();
}
