import { Hono } from "hono";

export const healthRoute = new Hono().get("/", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({
    status: "ok" as const,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
