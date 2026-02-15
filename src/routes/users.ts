import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { userProfiles, follows, posts, likes } from "../db/schema";
import { updateProfileSchema, paginationSchema } from "../utils";
import { requireAuth } from "../middleware/auth";
import type { HonoContext } from "../types";

const usersRouter = new Hono<HonoContext>();

// Get current user profile
usersRouter.get("/me", requireAuth, async (c) => {
  const db = c.get("db");
  const session = c.get("session");

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session!.user.id))
    .limit(1);

  if (!profile) {
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        userId: session!.user.id,
      })
      .returning();
    return c.json({ ...session!.user, profile: newProfile });
  }

  return c.json({ ...session!.user, profile });
});

// Update current user profile
usersRouter.patch("/me", requireAuth, zValidator("json", updateProfileSchema), async (c) => {
  const db = c.get("db");
  const session = c.get("session");
  const data = c.req.valid("json");

  const [updatedProfile] = await db
    .update(userProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, session!.user.id))
    .returning();

  return c.json(updatedProfile);
});

// Get user by ID
usersRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const userId = c.req.param("id");
  const session = c.get("session");

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!profile) {
    return c.json({ error: "User not found" }, 404);
  }

  let isFollowing = false;
  if (session?.user?.id) {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, userId)
        )
      )
      .limit(1);
    isFollowing = !!follow;
  }

  return c.json({
    ...profile,
    isFollowing,
  });
});

// Get user posts
usersRouter.get("/:id/posts", zValidator("query", paginationSchema), async (c) => {
  const db = c.get("db");
  const userId = c.req.param("id");
  const { page, limit } = c.req.valid("query");
  const offset = (page - 1) * limit;

  const userPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      mediaUrls: posts.mediaUrls,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userId: posts.userId,
      likeCount: sql<number>`count(distinct ${likes.id})`.as("like_count"),
    })
    .from(posts)
    .leftJoin(likes, eq(likes.postId, posts.id))
    .where(eq(posts.userId, userId))
    .groupBy(posts.id)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    posts: userPosts,
    pagination: {
      page,
      limit,
      hasMore: userPosts.length === limit,
    },
  });
});

// Follow/unfollow user
usersRouter.post("/:id/follow", requireAuth, async (c) => {
  const db = c.get("db");
  const session = c.get("session");
  const targetUserId = c.req.param("id");

  if (targetUserId === session!.user.id) {
    return c.json({ error: "Cannot follow yourself" }, 400);
  }

  const [existingFollow] = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, session!.user.id),
        eq(follows.followingId, targetUserId)
      )
    )
    .limit(1);

  if (existingFollow) {
    await db.delete(follows).where(eq(follows.id, existingFollow.id));
    
    await db
      .update(userProfiles)
      .set({
        followingCount: sql`GREATEST(${userProfiles.followingCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session!.user.id));

    await db
      .update(userProfiles)
      .set({
        followerCount: sql`GREATEST(${userProfiles.followerCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, targetUserId));

    return c.json({ following: false });
  } else {
    await db.insert(follows).values({
      followerId: session!.user.id,
      followingId: targetUserId,
    });

    await db
      .update(userProfiles)
      .set({
        followingCount: sql`${userProfiles.followingCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session!.user.id));

    await db
      .update(userProfiles)
      .set({
        followerCount: sql`${userProfiles.followerCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, targetUserId));

    return c.json({ following: true });
  }
});

// Get followers
usersRouter.get("/:id/followers", zValidator("query", paginationSchema), async (c) => {
  const db = c.get("db");
  const userId = c.req.param("id");
  const { page, limit } = c.req.valid("query");
  const offset = (page - 1) * limit;

  const followersData = await db
    .select({
      followerId: follows.followerId,
      createdAt: follows.createdAt,
    })
    .from(follows)
    .where(eq(follows.followingId, userId))
    .orderBy(desc(follows.createdAt))
    .limit(limit)
    .offset(offset);

  const followerIds = followersData.map((f) => f.followerId);
  const profiles = followerIds.length > 0
    ? await db.select().from(userProfiles).where(inArray(userProfiles.userId, followerIds))
    : [];

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const enrichedFollowers = followersData.map((f) => ({
    ...f,
    profile: profileMap.get(f.followerId),
  }));

  return c.json({
    followers: enrichedFollowers,
    pagination: {
      page,
      limit,
      hasMore: followersData.length === limit,
    },
  });
});

// Get following
usersRouter.get("/:id/following", zValidator("query", paginationSchema), async (c) => {
  const db = c.get("db");
  const userId = c.req.param("id");
  const { page, limit } = c.req.valid("query");
  const offset = (page - 1) * limit;

  const followingData = await db
    .select({
      followingId: follows.followingId,
      createdAt: follows.createdAt,
    })
    .from(follows)
    .where(eq(follows.followerId, userId))
    .orderBy(desc(follows.createdAt))
    .limit(limit)
    .offset(offset);

  const followingIds = followingData.map((f) => f.followingId);
  const profiles = followingIds.length > 0
    ? await db.select().from(userProfiles).where(inArray(userProfiles.userId, followingIds))
    : [];

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const enrichedFollowing = followingData.map((f) => ({
    ...f,
    profile: profileMap.get(f.followingId),
  }));

  return c.json({
    following: enrichedFollowing,
    pagination: {
      page,
      limit,
      hasMore: followingData.length === limit,
    },
  });
});

export default usersRouter;
