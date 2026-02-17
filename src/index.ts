import { Hono } from "hono";
import { logger } from "hono/logger";
import { createAuth } from "./auth";
import { createDB } from "./db";
import apiRouter from "./routes";
import docsRouter from "./routes/docs";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error";
import type { HonoContext } from "./types";

const app = new Hono<HonoContext>();

// Middleware
app.use(logger());
app.use(corsMiddleware);

// Initialize context
app.use(async (c, next) => {
  const db = createDB(c.env.DATABASE_URL);
  const auth = createAuth(c.env.DATABASE_URL);
  
  c.set("db", db);
  c.set("auth", auth);

  // Skip getSession for /api/auth paths to avoid "Body already used" error
  if (!c.req.path.startsWith("/api/auth")) {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      c.set("session", session);
    } catch {
      c.set("session", null);
    }
  } else {
    c.set("session", null);
  }
  
  await next();
});

// Better Auth handler - handles all auth routes (not versioned)
app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

// Swagger UI at obscure path with basic auth
app.route("/api/funky-bird-slow", docsRouter);

// API v1 Routes
app.route("/api/v1", apiRouter);

// OpenAPI JSON spec endpoint
import { openApiSpec } from "./openapi/spec";
app.get("/api/v1/openapi.json", (c) => {
  return c.json(openApiSpec);
});

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
