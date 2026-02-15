# Yenzi Backend - Social Media Platform API

A modern, scalable social media backend built with Cloudflare Workers, Hono, Better Auth, and Neon Postgres.

## Tech Stack

- **Runtime**: Cloudflare Workers (Edge Computing)
- **Framework**: Hono (Ultra-fast web framework)
- **Authentication**: Better Auth (TypeScript-first auth framework)
- **Database**: Neon Postgres (Serverless PostgreSQL)
- **ORM**: Drizzle ORM (Type-safe SQL)
- **Validation**: Zod (Schema validation)
- **Language**: TypeScript
- **Package Manager**: Bun

## Features

### Authentication (Better Auth)
- Email/Password authentication
- OAuth providers (Google, LinkedIn)
- Username plugin (unique usernames)
- Organization plugin (teams/communities)
- Admin plugin (user management)
- Passkey plugin (WebAuthn/passwordless)
- Two-factor authentication (2FA)
- Email verification
- Password reset
- Rate limiting

### Social Media Features
- **Posts**: Create, read, delete posts with media support
- **Comments**: Add comments to posts
- **Likes**: Like/unlike posts and comments
- **Follows**: Follow/unfollow users
- **User Profiles**: Rich user profiles with bio, avatar, stats
- **Feed**: Discovery feed with pagination

### API Endpoints

#### Auth Routes (Better Auth)
All auth routes are automatically handled by Better Auth at `/api/auth/*`:

- `POST /api/auth/sign-up/email` - Register with email/password
- `POST /api/auth/sign-in/email` - Login with email/password
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/sign-in/social` - OAuth login (Google, LinkedIn)

#### Application Routes

**Posts**
- `GET /api/posts` - Get feed (discovery/mixed)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (authenticated)
- `DELETE /api/posts/:id` - Delete own post (authenticated)
- `POST /api/posts/:id/like` - Like/unlike post (authenticated)
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment (authenticated)

**Users**
- `GET /api/users/me` - Get current user profile (authenticated)
- `PATCH /api/users/me` - Update profile (authenticated)
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/posts` - Get user's posts
- `POST /api/users/:id/follow` - Follow/unfollow user (authenticated)
- `GET /api/users/:id/followers` - Get followers list
- `GET /api/users/:id/following` - Get following list

**Health**
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness check (includes DB connection)

## Project Structure

```
src/
├── index.ts                    # Main application entry point
├── auth/
│   ├── index.ts               # Better Auth server configuration
│   └── auth-client.ts         # Auth client configuration
├── routes/
│   ├── index.ts               # Route aggregator
│   ├── posts.ts               # Post endpoints
│   ├── users.ts               # User endpoints
│   └── health.ts              # Health check endpoints
├── db/
│   ├── index.ts               # Database connection
│   ├── schema.ts              # Drizzle schema definitions
│   └── migrations/            # Migration files
├── middleware/
│   ├── cors.ts                # CORS configuration
│   ├── auth.ts                # Authentication middleware
│   └── error.ts               # Error handling
├── types/
│   └── index.ts               # TypeScript type definitions
└── utils/
    └── index.ts               # Utility functions
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- A [Neon](https://neon.tech) database account
- OAuth credentials from Google and LinkedIn (optional, for OAuth login)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd yenzi-backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Copy the example file and fill in your values:
   ```bash
   cp .env .env
   ```

   Edit `.dev.vars` with your credentials:
   ```
   # Better Auth
   BETTER_AUTH_SECRET=your_32_char_secret_here
   BETTER_AUTH_URL=http://localhost:8787

   # Database
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

   # OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

   # Frontend URLs
   FRONTEND_URL=http://localhost:3000
   EXPO_APP_URL=http://localhost:19006
   ```

4. **Generate Better Auth secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output to `BETTER_AUTH_SECRET` in `.dev.vars`

### Database Setup

1. **Generate Better Auth schema**
   ```bash
   bun run auth:generate
   ```

2. **Generate app schema migrations**
   ```bash
   bun run db:generate
   ```

3. **Push schema to database**
   ```bash
   bun run db:push
   ```

   Or migrate using Better Auth CLI:
   ```bash
   bun run auth:migrate
   ```

### Development

Run the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:8787`

### Testing

Health check:
```bash
curl http://localhost:8787/api/health
```

### Deployment

1. **Set secrets in Cloudflare**
   ```bash
   wrangler secret put BETTER_AUTH_SECRET
   wrangler secret put DATABASE_URL
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put LINKEDIN_CLIENT_ID
   wrangler secret put LINKEDIN_CLIENT_SECRET
   ```

2. **Deploy to Cloudflare Workers**
   ```bash
   bun run deploy
   ```

## Frontend Integration

### React (TanStack Start)

Install the auth client:
```bash
npm install better-auth @better-auth/passkey
```

Example usage:
```typescript
import { authClient } from "yenzi-backend/src/auth/auth-client";

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// Get session
const { data: session } = await authClient.getSession();

// Create post
const response = await fetch("/api/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    content: "Hello, World!",
  }),
});
```

### Expo (React Native)

For Expo, you'll need to use the native auth flow and store cookies properly. Refer to the Better Auth Expo documentation.

## Database Schema

### Better Auth Tables (Auto-generated)
- `user` - User accounts
- `account` - OAuth account linking
- `session` - Active sessions
- `verification` - Email verifications

### App Tables
- `posts` - User posts with media support
- `comments` - Post comments
- `likes` - Post/comment likes
- `follows` - User follow relationships
- `user_profiles` - Extended user profile information

## Scripts

```bash
# Development
bun run dev                 # Start development server
bun run deploy             # Deploy to Cloudflare Workers

# Database
bun run db:generate        # Generate Drizzle migrations
bun run db:migrate         # Run migrations
bun run db:push            # Push schema to database
bun run db:studio          # Open Drizzle Studio

# Auth
bun run auth:generate      # Generate Better Auth schema
bun run auth:migrate       # Run Better Auth migrations

# Types
bun run cf-typegen         # Generate Cloudflare types

# Linting
bun run lint               # Type check TypeScript
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BETTER_AUTH_SECRET` | Secret key for encryption (32+ chars) | Yes |
| `BETTER_AUTH_URL` | Base URL of the API | Yes |
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID | No |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth client secret | No |
| `FRONTEND_URL` | Production frontend URL | Yes |
| `EXPO_APP_URL` | Production mobile app URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` - React dev server
- `http://localhost:5173` - Vite dev server
- `http://localhost:19006` - Expo web
- Production URLs (configurable in wrangler.jsonc)

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP
- Configurable in `src/auth/index.ts`

## Security Features

- CSRF protection enabled
- Secure cookies in production
- CORS properly configured
- Rate limiting
- SQL injection protection (Drizzle ORM)
- Input validation (Zod)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/yourusername/yenzi-backend/issues).

## Acknowledgments

- [Hono](https://hono.dev) - The web framework
- [Better Auth](https://better-auth.com) - Authentication framework
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe SQL
- [Neon](https://neon.tech) - Serverless Postgres
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge computing platform
