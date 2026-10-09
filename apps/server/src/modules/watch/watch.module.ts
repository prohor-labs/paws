import { Module } from '@nestjs/common';
import { WatchController } from './watch.controller.js';
import { WatchService } from './watch.service.js';

@Module({
  controllers: [WatchController],
  providers: [WatchService],
  exports: [WatchService],
})
export class WatchModule {}
