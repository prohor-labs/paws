import { describe, expect, test } from "bun:test";
import { getDefaultApiUrl, normalizeBaseUrl } from "../src/client/base-url";
import { ApiError, isApiError } from "../src/client/errors";
import { presignedUploadSchema } from "../src/schemas/upload";

describe("presignedUploadSchema", () => {
  test("defaults the folder", () => {
    const parsed = presignedUploadSchema.parse({
      filename: "cat.png",
      mimeType: "image/png",
    });
    expect(parsed.folder).toBe("uploads");
  });

  test("accepts nested folders", () => {
    const parsed = presignedUploadSchema.parse({
      filename: "cat.png",
      mimeType: "image/png",
      folder: "users/avatars",
    });
    expect(parsed.folder).toBe("users/avatars");
  });

  test("rejects path traversal", () => {
    const result = presignedUploadSchema.safeParse({
      filename: "cat.png",
      mimeType: "image/png",
      folder: "../../etc",
    });
    expect(result.success).toBe(false);
  });
});

describe("base url", () => {
  test("normalizes trailing slashes", () => {
    expect(normalizeBaseUrl("http://localhost:7000///")).toBe("http://localhost:7000");
  });

  test("falls back to empty string outside the browser when unset", () => {
    expect(getDefaultApiUrl()).toBe("");
  });
});

describe("ApiError", () => {
  test("maps structured API errors", async () => {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: { code: "CONFLICT", message: "Already exists" },
      }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );

    const error = await ApiError.fromResponse(response);
    expect(error.status).toBe(409);
    expect(error.code).toBe("CONFLICT");
    expect(error.message).toBe("Already exists");
    expect(isApiError(error)).toBe(true);
  });

  test("falls back when the body is not JSON", async () => {
    const response = new Response("boom", {
      status: 502,
      statusText: "Bad Gateway",
    });
    const error = await ApiError.fromResponse(response);
    expect(error.status).toBe(502);
    expect(error.code).toBe("HTTP_502");
  });
});
