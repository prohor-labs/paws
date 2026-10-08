import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { ApiError } from "../lib/errors";

export type UserRole = "student" | "mentor" | "admin";

export type AuthContextVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export const attachSession = createMiddleware<{
  Variables: AuthContextVariables;
}>(async (c, next) => {
  if (c.get("user") && c.get("session")) {
    await next();
    return;
  }

  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("user", sessionData?.user ?? null);
  c.set("session", sessionData?.session ?? null);

  await next();
});

export const requireAuth = createMiddleware<{
  Variables: AuthContextVariables;
}>(async (c, next) => {
  const cachedUser = c.get("user");
  const cachedSession = c.get("session");

  if (cachedUser && cachedSession) {
    await next();
    return;
  }

  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData) {
    throw ApiError.unauthorized();
  }

  c.set("user", sessionData.user);
  c.set("session", sessionData.session);

  await next();
});

export const requireRole = (allowedRoles: UserRole[]) =>
  createMiddleware<{
    Variables: AuthContextVariables;
  }>(async (c, next) => {
    let currentUser = c.get("user");
    if (!currentUser) {
      const sessionData = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (!sessionData) {
        throw ApiError.unauthorized();
      }
      currentUser = sessionData.user;
      c.set("user", currentUser);
      c.set("session", sessionData.session);
    }

    const role = ((currentUser as unknown as { role?: UserRole })?.role || "student") as UserRole;
    if (!allowedRoles.includes(role)) {
      throw ApiError.forbidden("এই অ্যাকশনটি সম্পন্ন করার প্রয়োজনীয় অনুমতি আপনার নেই।");
    }

    await next();
  });

export const requireAdmin = requireRole(["admin"]);
export const requireMentorOrAdmin = requireRole(["mentor", "admin"]);
