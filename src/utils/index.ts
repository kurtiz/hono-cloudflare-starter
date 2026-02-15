import {z} from "zod";

export const createPostSchema = z.object({
    content: z.string().min(1).max(280),
    mediaUrls: z.array(z.string().url()).optional(),
});

export const updatePostSchema = z.object({
    content: z.string().min(1).max(280).optional(),
    mediaUrls: z.array(z.url()).optional(),
});

export const createCommentSchema = z.object({
    content: z.string().min(1).max(1000),
});

export const updateProfileSchema = z.object({
    bio: z.string().max(160).optional(),
    location: z.string().max(100).optional(),
    website: z.url().max(200).optional(),
    avatarUrl: z.url().optional(),
});

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
});

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 50);
}

export function generateId(): string {
    return crypto.randomUUID();
}
