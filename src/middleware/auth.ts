import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { HonoContext } from "../types";

export const requireAuth = createMiddleware<HonoContext>(async (c, next) => {
  const session = c.get("session");
  
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  
  await next();
});

export const optionalAuth = createMiddleware<HonoContext>(async (c, next) => {
  // Session is already set by the auth handler middleware
  await next();
});
