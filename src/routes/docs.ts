import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";
import type { HonoContext } from "../types";

const docsRouter = new Hono<HonoContext>();

// Basic auth credentials (should be moved to env vars in production)
const SWAGGER_USERNAME = "admin";
const SWAGGER_PASSWORD = "yenzi-secret-2025";

// Basic auth middleware
const basicAuth = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return c.json({ error: "Unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="Swagger UI"',
    });
  }
  
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(":");
  
  if (username !== SWAGGER_USERNAME || password !== SWAGGER_PASSWORD) {
    return c.json({ error: "Unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="Swagger UI"',
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
    pageTitle: "Yenzi API Documentation",
    layout: "classic",
  })
);

export default docsRouter;
