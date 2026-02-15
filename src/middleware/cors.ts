import { createMiddleware } from "hono/factory";
import { cors } from "hono/cors";
import type { HonoContext } from "../types";

export const corsMiddleware = cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:19006",
    "https://*.vercel.app",
    "https://*.netlify.app",
    "https://*.empiredhv.workers.dev",
    "capacitor://localhost",
    "expo://*",
    "ionic://localhost",
  ],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cookie",
  ],
  exposeHeaders: ["Set-Cookie"],
  credentials: true,
  maxAge: 86400,
});
