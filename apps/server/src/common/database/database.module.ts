import { Global, Module } from '@nestjs/common';
import postgres from 'postgres';
import { env } from '../env.js';
import { DRIZZLE_CLIENT } from './database.constants.js';
import { DrizzleService } from './drizzle.service.js';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      useFactory: () =>
        postgres(env.databaseUrl, {
          max: env.databaseMaxConnections,
          idle_timeout: 30,
          connect_timeout: 30,
          max_lifetime: 60 * 30,
          prepare: env.databasePrepare,
          transform: {
            undefined: null,
          },
        }),
    },
    DrizzleService,
  ],
  exports: [DRIZZLE_CLIENT, DrizzleService],
})
export class DatabaseModule {}
