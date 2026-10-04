import { Hono } from "hono";
import { type AuthContextVariables, attachSession } from "../middleware/auth.middleware";
import { healthRoute } from "./health.route";
import { qbRoute } from "./qb.route";
import { uploadRoute } from "./upload.route";

export const apiRoutes = new Hono<{ Variables: AuthContextVariables }>()
  .use("/qb/*", attachSession)
  .route("/health", healthRoute)
  .route("/upload", uploadRoute)
  .route("/qb", qbRoute);

export type ApiRoutes = typeof apiRoutes;
