import { HTTPException } from "hono/http-exception";
import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error("Error:", err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  // Better Auth errors
  if (err.message?.includes("better-auth")) {
    return c.json(
      {
        error: "Authentication error",
        message: err.message,
      },
      401
    );
  }

    // Database errors
    const errorWithCode = err as Error & { code?: string };
    if (errorWithCode.code?.startsWith("P")) {
      return c.json(
        {
          error: "Database error",
          message: "A database operation failed",
        },
        500
      );
    }

  return c.json(
    {
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    },
    500
  );
};
