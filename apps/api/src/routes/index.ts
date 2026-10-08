import { Hono } from "hono";
import { type AuthContextVariables, attachSession } from "../middleware/auth.middleware";
import { billingRoute } from "./billing.route";
import { examRoute } from "./exam";
import { healthRoute } from "./health.route";
import { qbRoute } from "./qb.route";
import { uploadRoute } from "./upload.route";
import { watchRoute } from "./watch.route";

export const apiRoutes = new Hono<{ Variables: AuthContextVariables }>()
  .use("/billing/*", attachSession)
  .use("/qb/*", attachSession)
  .use("/exam/*", attachSession)
  .use("/watch/*", attachSession)
  .route("/health", healthRoute)
  .route("/upload", uploadRoute)
  .route("/billing", billingRoute)
  .route("/qb", qbRoute)
  .route("/exam", examRoute)
  .route("/watch", watchRoute);

export type ApiRoutes = typeof apiRoutes;
