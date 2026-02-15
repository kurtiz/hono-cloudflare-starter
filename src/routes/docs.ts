import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";
import type { HonoContext } from "../types";

const docsRouter = new Hono<HonoContext>();

// Basic auth middleware for Swagger UI
const basicAuth = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  
  // In production, use environment variables for credentials
  const username = c.env.SWAGGER_USERNAME || "admin";
  const password = c.env.SWAGGER_PASSWORD || "admin";
  
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return c.json({ error: "Unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="API Documentation"',
    });
  }
  
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = atob(base64Credentials);
  const [providedUser, providedPass] = credentials.split(":");
  
  if (providedUser !== username || providedPass !== password) {
    return c.json({ error: "Unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="API Documentation"',
    });
  }
  
  await next();
};

// Swagger UI with Scalar
docsRouter.use("/*", basicAuth);
docsRouter.get(
  "/",
  Scalar({
    theme: "purple",
    url: "/api/v1/openapi.json",
    pageTitle: "API Documentation",
    layout: "classic",
  })
);

export default docsRouter;
