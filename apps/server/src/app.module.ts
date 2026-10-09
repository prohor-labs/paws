import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './common/database/database.module.js';
import { AuthModule } from './core/auth/auth.module.js';
import { SessionGuard } from './core/auth/guards/session.guard.js';
import { RolesGuard } from './core/auth/guards/roles.guard.js';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter.js';
import { AppPipelineMiddleware } from './core/middleware/app-pipeline.middleware.js';
import { AuthRouteMiddleware } from './core/middleware/auth-route.middleware.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { ExamModule } from './modules/exam/exam.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { QbModule } from './modules/qb/qb.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { WatchModule } from './modules/watch/watch.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HealthModule,
    UploadModule,
    BillingModule,
    ExamModule,
    QbModule,
    WatchModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppPipelineMiddleware).forRoutes('*');
  }
}
