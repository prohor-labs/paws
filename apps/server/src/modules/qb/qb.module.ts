import { Module } from '@nestjs/common';
import { QbController } from './qb.controller.js';
import { QbService } from './qb.service.js';

@Module({
  controllers: [QbController],
  providers: [QbService],
  exports: [QbService],
})
export class QbModule {}
