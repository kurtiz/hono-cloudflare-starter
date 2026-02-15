import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { sql } from "drizzle-orm";
import type { HonoContext } from "../types";

const healthRouter = new OpenAPIHono<HonoContext>();

// Health check schemas
const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  version: z.string(),
  environment: z.string(),
});

const ReadyResponseSchema = z.object({
  ready: z.boolean(),
  error: z.string().optional(),
});

// Health check endpoint
const healthRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  summary: "Get service health status",
  description: "Returns the current health status of the API service",
  responses: {
    200: {
      description: "Service is healthy",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

// Ready check endpoint
const readyRoute = createRoute({
  method: "get",
  path: "/ready",
  tags: ["Health"],
  summary: "Check if service is ready",
  description: "Checks database connectivity and returns readiness status",
  responses: {
    200: {
      description: "Service is ready",
      content: {
        "application/json": {
          schema: ReadyResponseSchema,
        },
      },
    },
    503: {
      description: "Service is not ready",
      content: {
        "application/json": {
          schema: ReadyResponseSchema,
        },
      },
    },
  },
});

healthRouter.openapi(healthRoute, (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: c.env.NODE_ENV || "development",
  });
});

healthRouter.openapi(readyRoute, async (c) => {
  try {
    const db = c.get("db");
    await db.execute(sql`SELECT 1`);
    return c.json({ ready: true });
  } catch (error) {
    return c.json({ ready: false, error: "Database connection failed" }, 503);
  }
});

export default healthRouter;
