import { Global, Module } from '@nestjs/common';
import { DrizzleService } from '../../common/database/drizzle.service.js';
import { createAuth } from './auth.config.js';
import { AUTH_INSTANCE } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RolesGuard } from './guards/roles.guard.js';
import { SessionGuard } from './guards/session.guard.js';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_INSTANCE,
      useFactory: (drizzle: DrizzleService) => createAuth(drizzle.db),
      inject: [DrizzleService],
    },
    AuthService,
    SessionGuard,
    RolesGuard,
  ],
  exports: [AUTH_INSTANCE, AuthService, SessionGuard, RolesGuard],
})
export class AuthModule {}
