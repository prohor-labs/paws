import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../lib/env";

const s3Client = new S3Client({
  region: env.aws.region,
  endpoint: env.aws.endpoint,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
  forcePathStyle: env.aws.forcePathStyle,
});

const BUCKET_NAME = env.aws.bucket;
const DEFAULT_EXPIRES_IN = 3600;

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

function resolvePublicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  if (env.aws.publicUrl) {
    const base = env.aws.publicUrl.replace(/\/+$/, "");
    return `${base}/${cleanKey}`;
  }
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${cleanKey}`;
}

export const storageService = {
  async upload(
    file: Buffer | Uint8Array | Blob,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const buffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : Buffer.from(file);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return {
      url: resolvePublicUrl(key),
      key,
      size: buffer.length,
      mimeType,
    };
  },

  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn = DEFAULT_EXPIRES_IN,
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      uploadUrl,
      downloadUrl: resolvePublicUrl(key),
      key,
    };
  },

  async getPresignedDownloadUrl(key: string, expiresIn = DEFAULT_EXPIRES_IN): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },
};
