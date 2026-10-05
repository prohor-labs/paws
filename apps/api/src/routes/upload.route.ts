import { zValidator } from "@hono/zod-validator";
import { presignedUploadSchema } from "@paws/sdk/schemas";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { env } from "../lib/env";
import { ApiError } from "../lib/errors";
import { buildObjectKey, resolveUploadFolder } from "../lib/upload";
import {
  type AuthContextVariables,
  attachSession,
  requireAuth,
} from "../middleware/auth.middleware";
import { errorBody } from "../middleware/error.middleware";
import { storageService } from "../services/storage.service";

const requestBodyLimit = bodyLimit({
  maxSize: env.uploadMaxBytes,
  onError: (c) =>
    c.json(errorBody("PAYLOAD_TOO_LARGE", "Uploaded file exceeds the maximum allowed size"), 413),
});

export const uploadRoute = new Hono<{ Variables: AuthContextVariables }>()
  .use("*", attachSession)
  .post(
    "/presigned",
    zValidator("json", presignedUploadSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          errorBody("VALIDATION_ERROR", "Invalid request body", result.error.issues),
          400,
        );
      }
    }),
    async (c) => {
      const { filename, mimeType, folder } = c.req.valid("json");
      const key = buildObjectKey(folder, filename);
      const result = await storageService.getPresignedUploadUrl(key, mimeType);
      return c.json({ success: true, data: result });
    },
  )
  .post("/direct", requireAuth, requestBodyLimit, async (c) => {
    const body = await c.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      throw ApiError.badRequest("A file is required");
    }

    if (file.size > env.uploadMaxBytes) {
      throw ApiError.payloadTooLarge("Uploaded file exceeds the maximum allowed size");
    }

    const key = buildObjectKey(resolveUploadFolder(body.folder), file.name);
    const result = await storageService.upload(file, key, file.type || "application/octet-stream");

    return c.json({ success: true, data: result }, 201);
  });
