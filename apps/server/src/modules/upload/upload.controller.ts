import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { env } from '../../common/env.js';
import { ApiError } from '../../common/errors/api-error.js';
import { buildObjectKey, resolveUploadFolder } from '../../common/utils/upload.js';
import { Authenticated } from '../../core/auth/decorators/roles.decorator.js';
import { zodPipe } from '../../core/pipes/zod-validation.pipe.js';
import { StorageService } from './storage.service.js';

const FOLDER_PATTERN = /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/;

const presignedUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  folder: z.string().min(1).max(128).regex(FOLDER_PATTERN).default('uploads'),
});

type PresignedUploadInput = z.infer<typeof presignedUploadSchema>;

interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post('presigned')
  @HttpCode(200)
  async presigned(@Body(zodPipe(presignedUploadSchema)) body: PresignedUploadInput) {
    const key = buildObjectKey(body.folder, body.filename);
    const result = await this.storage.getPresignedUploadUrl(key, body.mimeType);
    return { success: true, data: result };
  }

  @Authenticated()
  @Post('direct')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: env.uploadMaxBytes } }))
  async direct(
    @UploadedFile() file: UploadedFileLike | undefined,
    @Body() body: { folder?: string },
  ) {
    if (!file) {
      throw ApiError.badRequest('A file is required');
    }
    if (file.size > env.uploadMaxBytes) {
      throw ApiError.payloadTooLarge('Uploaded file exceeds the maximum allowed size');
    }

    const key = buildObjectKey(resolveUploadFolder(body.folder), file.originalname);
    const result = await this.storage.upload(
      file.buffer,
      key,
      file.mimetype || 'application/octet-stream',
    );

    return { success: true, data: result };
  }
}
