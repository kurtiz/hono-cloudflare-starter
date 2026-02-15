import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

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

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  website: z.string().url().nullable().optional(),
  followerCount: z.number().default(0),
  followingCount: z.number().default(0),
  postCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().url().nullable().optional(),
  username: z.string().nullable().optional(),
  displayUsername: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserWithProfileSchema = UserSchema.extend({
  profile: UserProfileSchema,
});

export const UpdateProfileSchema = z.object({
  bio: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().max(200).optional(),
  avatarUrl: z.string().url().optional(),
});

export const UserResponseSchema = UserProfileSchema.extend({
  isFollowing: z.boolean().optional(),
});

export const FollowResponseSchema = z.object({
  following: z.boolean(),
});

export const FollowerSchema = z.object({
  followerId: z.string(),
  createdAt: z.string().datetime(),
  profile: UserProfileSchema.optional(),
});

export const FollowingSchema = z.object({
  followingId: z.string(),
  createdAt: z.string().datetime(),
  profile: UserProfileSchema.optional(),
});

// ============================================
// Post Schemas
// ============================================

export const PostSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  mediaUrls: z.array(z.string().url()).nullable().optional(),
  userId: z.string(),
  author: UserProfileSchema.optional(),
  likeCount: z.number().default(0),
  commentCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(280),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const CommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  userId: z.string(),
  postId: z.string().uuid(),
  author: UserProfileSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const LikeResponseSchema = z.object({
  liked: z.boolean(),
});

export const PostsListResponseSchema = z.object({
  posts: z.array(PostSchema),
  pagination: PaginationResponseSchema,
});

export const CommentsListResponseSchema = z.object({
  comments: z.array(CommentSchema),
  pagination: PaginationResponseSchema,
});

// ============================================
// Health Schemas
// ============================================

export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string().datetime(),
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
registry.register("UserProfile", UserProfileSchema);
registry.register("UserWithProfile", UserWithProfileSchema);
registry.register("UserResponse", UserResponseSchema);
registry.register("UpdateProfile", UpdateProfileSchema);
registry.register("Post", PostSchema);
registry.register("CreatePost", CreatePostSchema);
registry.register("Comment", CommentSchema);
registry.register("CreateComment", CreateCommentSchema);
registry.register("PostsListResponse", PostsListResponseSchema);
registry.register("CommentsListResponse", CommentsListResponseSchema);
registry.register("Pagination", PaginationSchema);
registry.register("PaginationResponse", PaginationResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("HealthResponse", HealthResponseSchema);
registry.register("ReadyResponse", ReadyResponseSchema);
registry.register("LikeResponse", LikeResponseSchema);
registry.register("FollowResponse", FollowResponseSchema);
registry.register("Follower", FollowerSchema);
registry.register("Following", FollowingSchema);
