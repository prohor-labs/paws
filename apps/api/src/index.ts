import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./auth";
import { closeDatabase } from "./db";
import { env } from "./lib/env";
import { isTrustedOrigin } from "./lib/origins";
import { handleError, handleNotFound } from "./middleware/error.middleware";
import { type ApiRoutes, apiRoutes } from "./routes";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;

const authApp = new Hono().on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const app = new Hono()
  .use("*", requestId())
  .use("*", secureHeaders())
  .use("*", compress())
  .use("*", async (c, next) => {
    if (env.isProduction) {
      await next();
      return;
    }
    const startedAt = performance.now();
    await next();
    console.info(
      `${c.req.method} ${c.req.path} ${c.res.status} ${(performance.now() - startedAt).toFixed(1)}ms`,
    );
  })
  .use(
    "*",
    cors({
      origin: (origin) => (isTrustedOrigin(origin) ? origin : undefined),
      allowMethods: [...ALLOWED_METHODS],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Cookie",
        "X-Request-Id",
        "X-Client-Request-Id",
      ],
      exposeHeaders: ["Set-Cookie", "X-Request-Id"],
      credentials: true,
      maxAge: 86_400,
    }),
  )
  .route("/", authApp)
  .route("/api/v1", apiRoutes)
  .onError(handleError)
  .notFound(handleNotFound);

export { auth };
export type AppType = typeof app;
export type ApiRoutesType = ApiRoutes;
export type Auth = typeof auth;

async function shutdown(): Promise<void> {
  await closeDatabase().catch((error) => {
    console.error("[api] Failed to close database connections", error);
  });
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

export default {
  port: env.port,
  hostname: env.hostname,
  fetch: app.fetch,
};
