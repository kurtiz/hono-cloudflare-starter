export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Yenzi API",
    version: "1.0.0",
    description: "Yenzi Social Platform API",
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
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string" },
          bio: { type: "string", nullable: true },
          avatarUrl: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          website: { type: "string", nullable: true },
          followerCount: { type: "integer", default: 0 },
          followingCount: { type: "integer", default: 0 },
          postCount: { type: "integer", default: 0 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "userId", "followerCount", "followingCount", "postCount", "createdAt", "updatedAt"],
      },
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
      UserWithProfile: {
        allOf: [
          { $ref: "#/components/schemas/User" },
          {
            type: "object",
            properties: {
              profile: { $ref: "#/components/schemas/UserProfile" },
            },
            required: ["profile"],
          },
        ],
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          content: { type: "string" },
          mediaUrls: { 
            type: "array", 
            items: { type: "string" },
            nullable: true 
          },
          userId: { type: "string" },
          author: { $ref: "#/components/schemas/UserProfile" },
          likeCount: { type: "integer", default: 0 },
          commentCount: { type: "integer", default: 0 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "content", "userId", "likeCount", "commentCount", "createdAt", "updatedAt"],
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          content: { type: "string" },
          userId: { type: "string" },
          postId: { type: "string", format: "uuid" },
          author: { $ref: "#/components/schemas/UserProfile" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "content", "userId", "postId", "createdAt", "updatedAt"],
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
      UpdateProfileRequest: {
        type: "object",
        properties: {
          bio: { type: "string", maxLength: 160 },
          location: { type: "string", maxLength: 100 },
          website: { type: "string", format: "uri", maxLength: 200 },
          avatarUrl: { type: "string", format: "uri" },
        },
      },
      CreatePostRequest: {
        type: "object",
        properties: {
          content: { type: "string", minLength: 1, maxLength: 280 },
          mediaUrls: { 
            type: "array", 
            items: { type: "string", format: "uri" } 
          },
        },
        required: ["content"],
      },
      CreateCommentRequest: {
        type: "object",
        properties: {
          content: { type: "string", minLength: 1, maxLength: 1000 },
        },
        required: ["content"],
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

    // Users Endpoints
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        description: "Returns the authenticated user's profile. Creates one if it doesn't exist.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile retrieved successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserWithProfile" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update current user profile",
        description: "Updates the authenticated user's profile information",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        description: "Returns a user's public profile by their ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
        ],
        responses: {
          200: {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/UserProfile" },
                    {
                      type: "object",
                      properties: {
                        isFollowing: { type: "boolean" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/{id}/posts": {
      get: {
        tags: ["Users"],
        summary: "Get user posts",
        description: "Returns a paginated list of posts by a specific user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Posts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["posts", "pagination"],
                },
              },
            },
          },
        },
      },
    },
    "/users/{id}/follow": {
      post: {
        tags: ["Users"],
        summary: "Follow or unfollow user",
        description: "Toggle follow status for a user. Returns following: true if now following, false if unfollowed.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID to follow/unfollow",
          },
        ],
        responses: {
          200: {
            description: "Follow status toggled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    following: { type: "boolean" },
                  },
                  required: ["following"],
                },
              },
            },
          },
          400: {
            description: "Cannot follow yourself",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/{id}/followers": {
      get: {
        tags: ["Users"],
        summary: "Get user followers",
        description: "Returns a paginated list of users who follow this user",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Followers retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    followers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          followerId: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          profile: { $ref: "#/components/schemas/UserProfile" },
                        },
                      },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["followers", "pagination"],
                },
              },
            },
          },
        },
      },
    },
    "/users/{id}/following": {
      get: {
        tags: ["Users"],
        summary: "Get users being followed",
        description: "Returns a paginated list of users this user follows",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User ID",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Following retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    following: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          followingId: { type: "string" },
                          createdAt: { type: "string", format: "date-time" },
                          profile: { $ref: "#/components/schemas/UserProfile" },
                        },
                      },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["following", "pagination"],
                },
              },
            },
          },
        },
      },
    },

    // Posts Endpoints
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "Get feed posts",
        description: "Returns a paginated list of posts from the feed",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Posts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["posts", "pagination"],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a new post",
        description: "Creates a new post for the authenticated user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePostRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Post created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Post" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Get post by ID",
        description: "Returns a single post with its details",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Post ID",
          },
        ],
        responses: {
          200: {
            description: "Post found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Post" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete post",
        description: "Deletes a post (must be the owner)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Post ID",
          },
        ],
        responses: {
          200: {
            description: "Post deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not the post owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}/like": {
      post: {
        tags: ["Posts"],
        summary: "Like or unlike post",
        description: "Toggle like status on a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Post ID",
          },
        ],
        responses: {
          200: {
            description: "Like status toggled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    liked: { type: "boolean" },
                  },
                  required: ["liked"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/posts/{id}/comments": {
      get: {
        tags: ["Posts"],
        summary: "Get post comments",
        description: "Returns a paginated list of comments on a post",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Post ID",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Comments retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    comments: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Comment" },
                    },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                  required: ["comments", "pagination"],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Add comment to post",
        description: "Adds a comment to a post",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Post ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCommentRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Comment added successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
          400: {
            description: "Invalid comment content",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};
