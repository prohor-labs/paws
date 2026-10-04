import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "../lib/env";
import { ApiError, codeForStatus } from "../lib/errors";

export function errorBody(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}

export function handleError(err: Error, c: Context): Response {
  if (err instanceof ApiError) {
    return c.json(errorBody(err.code, err.message, err.details), err.status);
  }

  if (err instanceof HTTPException) {
    return c.json(
      errorBody(codeForStatus(err.status), err.message || "Request failed", err.cause),
      err.status,
    );
  }

  console.error(`[api] Unhandled error on ${c.req.method} ${c.req.path}`, err);

  return c.json(
    errorBody(
      "INTERNAL_ERROR",
      env.isProduction
        ? "An unexpected error occurred"
        : err.message || "An unexpected error occurred",
    ),
    500,
  );
}

export function handleNotFound(c: Context): Response {
  return c.json(errorBody("NOT_FOUND", `Route not found: ${c.req.method} ${c.req.path}`), 404);
}
