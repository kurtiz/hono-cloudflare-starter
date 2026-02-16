import {z} from "zod";
import {OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

// ============================================
// Common Schemas
// ============================================

export const PaginationSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(20),
});

export const PaginationResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
});

export const ErrorResponseSchema = z.object({
    error: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
});

// ============================================
// User Schemas
// ============================================

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.url().nullable().optional(),
    username: z.string().nullable().optional(),
    displayUsername: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

// ============================================
// Organization Schemas
// ============================================

export const OrganizationSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo: z.url().nullable().optional(),
    createdAt: z.iso.datetime(),
    metadata: z.string().nullable().optional(),
});

export const MemberSchema = z.object({
    id: z.string(),
    organizationId: z.string(),
    userId: z.string(),
    role: z.string(),
    createdAt: z.iso.datetime(),
});

// ============================================
// Health Schemas
// ============================================

export const HealthResponseSchema = z.object({
    status: z.string(),
    timestamp: z.iso.datetime(),
    version: z.string(),
    environment: z.string(),
});

export const ReadyResponseSchema = z.object({
    ready: z.boolean(),
    error: z.string().optional(),
});

// ============================================
// Register Schemas with OpenAPI
// ============================================

registry.register("User", UserSchema);
registry.register("Organization", OrganizationSchema);
registry.register("Member", MemberSchema);
registry.register("Pagination", PaginationSchema);
registry.register("PaginationResponse", PaginationResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("HealthResponse", HealthResponseSchema);
registry.register("ReadyResponse", ReadyResponseSchema);
