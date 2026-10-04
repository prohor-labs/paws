import type { ContentfulStatusCode } from "hono/utils/http-status";

export interface ApiErrorOptions {
  details?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: ContentfulStatusCode;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: ContentfulStatusCode,
    code: string,
    message: string,
    options: ApiErrorOptions = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = options.details;
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, "BAD_REQUEST", message, { details });
  }

  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have access to this resource"): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, "CONFLICT", message);
  }

  static payloadTooLarge(message: string): ApiError {
    return new ApiError(413, "PAYLOAD_TOO_LARGE", message);
  }

  static unprocessable(message: string, details?: unknown): ApiError {
    return new ApiError(422, "UNPROCESSABLE_ENTITY", message, { details });
  }

  static internal(message = "An unexpected error occurred", cause?: unknown): ApiError {
    return new ApiError(500, "INTERNAL_ERROR", message, { cause });
  }
}

const STATUS_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

export function codeForStatus(status: number): string {
  return STATUS_CODES[status] ?? `HTTP_${status}`;
}
