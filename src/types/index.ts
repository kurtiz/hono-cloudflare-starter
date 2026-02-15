import type { Context } from "hono";
import type { createAuth } from "../auth";
import type { createDB } from "../db";

export type HonoBindings = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
  FRONTEND_URL?: string;
  EXPO_APP_URL?: string;
  NODE_ENV?: string;
  R2_BUCKET?: R2Bucket;
  R2_PUBLIC_URL?: string;
};

export type HonoContext = {
  Bindings: HonoBindings;
  Variables: {
    auth: ReturnType<typeof createAuth>;
    db: ReturnType<typeof createDB>;
    session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]
    >> | null;
  };
};

export type AppContext = Context<HonoContext>;
