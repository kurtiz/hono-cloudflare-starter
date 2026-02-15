// ============================================
// Re-export all schema tables and relations
// ============================================

// Auth schema
export {
  user,
  session,
  account,
  verification,
  passkey,
  twoFactor,
  rateLimit,
  userRelations,
  sessionRelations,
  accountRelations,
  passkeyRelations,
  twoFactorRelations,
} from "./auth";

// Organizations schema
export {
  organization,
  member,
  invitation,
  organizationRelations,
  memberRelations,
  invitationRelations,
} from "./organizations";

// Posts schema
export {
  posts,
  comments,
  likes,
  postsRelations,
  commentsRelations,
  likesRelations,
} from "./posts";

// Follows schema
export {
  follows,
  followsRelations,
} from "./follows";

// Profiles schema
export {
  userProfiles,
  userProfilesRelations,
} from "./profiles";

// ============================================
// Re-export all types
// ============================================

export type {
  User,
  NewUser,
  Session,
  NewSession,
  Account,
  NewAccount,
  Verification,
  NewVerification,
  Passkey,
  NewPasskey,
  TwoFactor,
  NewTwoFactor,
  RateLimit,
  NewRateLimit,
} from "./types/auth";

export type {
  Organization,
  NewOrganization,
  Member,
  NewMember,
  Invitation,
  NewInvitation,
} from "./types/organizations";

export type {
  Post,
  NewPost,
  Comment,
  NewComment,
  Like,
  NewLike,
} from "./types/posts";

export type {
  Follow,
  NewFollow,
} from "./types/follows";

export type {
  UserProfile,
  NewUserProfile,
} from "./types/profiles";
