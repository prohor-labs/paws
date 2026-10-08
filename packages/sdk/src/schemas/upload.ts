import { z } from "zod";

export const FOLDER_PATTERN = /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/;

export const presignedUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  folder: z.string().min(1).max(128).regex(FOLDER_PATTERN).default("uploads"),
});
