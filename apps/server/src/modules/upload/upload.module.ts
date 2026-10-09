import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { UploadController } from './upload.controller.js';

@Module({
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class UploadModule {}
