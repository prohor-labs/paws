import type { ApiErrorResponse } from "./types/common";

export interface ApiErrorOptions {
  status?: number;
  code?: string;
  details?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status ?? 500;
    this.code = options.code ?? "INTERNAL_ERROR";
    this.details = options.details;
  }

  static async fromResponse(response: Response, fallbackMessage?: string): Promise<ApiError> {
    const body = (await response.json().catch(() => undefined)) as ApiErrorResponse | undefined;
    const error = body && typeof body === "object" ? body.error : undefined;

    return new ApiError(
      error?.message || fallbackMessage || response.statusText || `HTTP ${response.status}`,
      {
        status: response.status,
        code: error?.code ?? `HTTP_${response.status}`,
        details: error?.details,
      },
    );
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
