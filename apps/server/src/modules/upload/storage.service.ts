import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { env } from '../../common/env.js';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  downloadUrl: string;
  key: string;
}

const DEFAULT_EXPIRES_IN = 3600;

@Injectable()
export class StorageService {
  private readonly client = new S3Client({
    region: env.aws.region,
    endpoint: env.aws.endpoint,
    credentials: {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    },
    forcePathStyle: env.aws.forcePathStyle,
  });

  private readonly bucket = env.aws.bucket;

  private resolvePublicUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, '');
    if (env.aws.publicUrl) {
      const base = env.aws.publicUrl.replace(/\/+$/, '');
      return `${base}/${cleanKey}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${cleanKey}`;
  }

  async upload(
    file: Buffer | Uint8Array | Blob,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const buffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : Buffer.from(file);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return {
      url: this.resolvePublicUrl(key),
      key,
      size: buffer.length,
      mimeType,
    };
  }

  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn = DEFAULT_EXPIRES_IN,
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      downloadUrl: this.resolvePublicUrl(key),
      key,
    };
  }

  async getPresignedDownloadUrl(key: string, expiresIn = DEFAULT_EXPIRES_IN): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }
}
