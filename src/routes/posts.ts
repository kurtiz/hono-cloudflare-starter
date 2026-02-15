import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { posts, comments, likes, userProfiles, follows } from "../db/schema";
import { createPostSchema, paginationSchema } from "../utils";
import { requireAuth } from "../middleware/auth";
import type { HonoContext } from "../types";

const postsRouter = new Hono<HonoContext>();

// Get feed - discovery/mixed
postsRouter.get("/", zValidator("query", paginationSchema), async (c) => {
  const db = c.get("db");
  const { page, limit } = c.req.valid("query");
  const offset = (page - 1) * limit;

  // Get posts with author info and engagement metrics
  const postsData = await db
    .select({
      id: posts.id,
      content: posts.content,
      mediaUrls: posts.mediaUrls,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userId: posts.userId,
      likeCount: sql<number>`count(distinct ${likes.id})`.as("like_count"),
      commentCount: sql<number>`count(distinct ${comments.id})`.as("comment_count"),
    })
    .from(posts)
    .leftJoin(likes, eq(likes.postId, posts.id))
    .leftJoin(comments, eq(comments.postId, posts.id))
    .groupBy(posts.id)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  // Get user profiles for authors
  const userIds = [...new Set(postsData.map((p) => p.userId))];
  const profiles = userIds.length > 0 
    ? await db.select().from(userProfiles).where(inArray(userProfiles.userId, userIds))
    : [];

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const enrichedPosts = postsData.map((post) => ({
    ...post,
    author: profileMap.get(post.userId) || { userId: post.userId },
  }));

  return c.json({
    posts: enrichedPosts,
    pagination: {
      page,
      limit,
      hasMore: postsData.length === limit,
    },
  });
});

// Get single post
postsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const postId = c.req.param("id");

  const [post] = await db
    .select({
      id: posts.id,
      content: posts.content,
      mediaUrls: posts.mediaUrls,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userId: posts.userId,
      likeCount: sql<number>`count(distinct ${likes.id})`.as("like_count"),
      commentCount: sql<number>`count(distinct ${comments.id})`.as("comment_count"),
    })
    .from(posts)
    .leftJoin(likes, eq(likes.postId, posts.id))
    .leftJoin(comments, eq(comments.postId, posts.id))
    .where(eq(posts.id, postId))
    .groupBy(posts.id)
    .limit(1);

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  // Get author profile
  const [authorProfile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, post.userId))
    .limit(1);

  return c.json({
    ...post,
    author: authorProfile || { userId: post.userId },
  });
});

// Create post
postsRouter.post("/", requireAuth, zValidator("json", createPostSchema), async (c) => {
  const db = c.get("db");
  const session = c.get("session");
  const data = c.req.valid("json");

  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [newPost] = await db
    .insert(posts)
    .values({
      userId: session.user.id,
      content: data.content,
      mediaUrls: data.mediaUrls || null,
    })
    .returning();

  // Update user post count
  await db
    .update(userProfiles)
    .set({
      postCount: sql`${userProfiles.postCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, session.user.id));

  return c.json(newPost, 201);
});

// Delete post
postsRouter.delete("/:id", requireAuth, async (c) => {
  const db = c.get("db");
  const session = c.get("session");
  const postId = c.req.param("id");

  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check ownership
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  if (post.userId !== session.user.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db.delete(posts).where(eq(posts.id, postId));

  // Decrement user post count
  await db
    .update(userProfiles)
    .set({
      postCount: sql`GREATEST(${userProfiles.postCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, session.user.id));

  return c.json({ success: true });
});

// Like/unlike post
postsRouter.post("/:id/like", requireAuth, async (c) => {
  const db = c.get("db");
  const session = c.get("session");
  const postId = c.req.param("id");

  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check if already liked
  const [existingLike] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, session.user.id)))
    .limit(1);

  if (existingLike) {
    // Unlike
    await db.delete(likes).where(eq(likes.id, existingLike.id));
    return c.json({ liked: false });
  } else {
    // Like
    await db.insert(likes).values({
      postId,
      userId: session.user.id,
    });
    return c.json({ liked: true });
  }
});

// Get post comments
postsRouter.get("/:id/comments", zValidator("query", paginationSchema), async (c) => {
  const db = c.get("db");
  const postId = c.req.param("id");
  const { page, limit } = c.req.valid("query");
  const offset = (page - 1) * limit;

  const commentsData = await db
    .select({
      id: comments.id,
      content: comments.content,
      userId: comments.userId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  // Get user profiles for comment authors
  const userIds = [...new Set(commentsData.map((c) => c.userId))];
  const profiles = userIds.length > 0
    ? await db.select().from(userProfiles).where(inArray(userProfiles.userId, userIds))
    : [];

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const enrichedComments = commentsData.map((comment) => ({
    ...comment,
    author: profileMap.get(comment.userId) || { userId: comment.userId },
  }));

  return c.json({
    comments: enrichedComments,
    pagination: {
      page,
      limit,
      hasMore: commentsData.length === limit,
    },
  });
});

// Add comment to post
postsRouter.post("/:id/comments", requireAuth, async (c) => {
  const db = c.get("db");
  const session = c.get("session");
  const postId = c.req.param("id");
  const { content } = await c.req.json();

  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!content || content.length < 1 || content.length > 1000) {
    return c.json({ error: "Invalid comment content" }, 400);
  }

  const [newComment] = await db
    .insert(comments)
    .values({
      postId,
      userId: session.user.id,
      content,
    })
    .returning();

  return c.json(newComment, 201);
});

export default postsRouter;
