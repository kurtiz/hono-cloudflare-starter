export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Hono Cloudflare Starter API",
    version: "1.0.0",
    description: "A production-ready authentication API built with Hono, Better Auth, and Cloudflare Workers",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from Better Auth",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          emailVerified: { type: "boolean" },
          image: { type: "string", nullable: true },
          username: { type: "string", nullable: true },
          displayUsername: { type: "string", nullable: true },
          role: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "emailVerified", "createdAt", "updatedAt"],
      },
      Organization: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          logo: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          metadata: { type: "string", nullable: true },
        },
        required: ["id", "name", "slug", "createdAt"],
      },
      Member: {
        type: "object",
        properties: {
          id: { type: "string" },
          organizationId: { type: "string" },
          userId: { type: "string" },
          role: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "organizationId", "userId", "role", "createdAt"],
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 50, default: 20 },
          hasMore: { type: "boolean" },
        },
        required: ["page", "limit", "hasMore"],
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
    },
  },
  paths: {
    // Health Endpoints
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Get service health status",
        description: "Returns the current health status of the API service",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    version: { type: "string", example: "1.0.0" },
                    environment: { type: "string", example: "development" },
                  },
                  required: ["status", "timestamp", "version", "environment"],
                },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Check if service is ready",
        description: "Checks database connectivity and returns readiness status",
        responses: {
          200: {
            description: "Service is ready",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ready: { type: "boolean", example: true },
                  },
                  required: ["ready"],
                },
              },
            },
          },
          503: {
            description: "Service is not ready",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ready: { type: "boolean", example: false },
                    error: { type: "string", example: "Database connection failed" },
                  },
                  required: ["ready", "error"],
                },
              },
            },
          },
        },
      },
    },

    // Auth endpoints are handled by Better Auth at /api/auth/*
  },
};
