import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { ExplanationService } from './explanation.service.js';

@Module({
  controllers: [BillingController],
  providers: [BillingService, ExplanationService],
  exports: [BillingService, ExplanationService],
})
export class BillingModule {}
