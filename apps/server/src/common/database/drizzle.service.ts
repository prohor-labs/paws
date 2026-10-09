import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type postgres from 'postgres';
import { DRIZZLE_CLIENT } from './database.constants.js';
import * as schema from './schema/index.js';

export type Database = PostgresJsDatabase<typeof schema>;

@Injectable()
export class DrizzleService implements OnApplicationShutdown {
  readonly db: Database;

  private readonly client: ReturnType<typeof postgres>;

  constructor(@Inject(DRIZZLE_CLIENT) client: ReturnType<typeof postgres>) {
    this.client = client;
    this.db = drizzle(client, { schema });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
