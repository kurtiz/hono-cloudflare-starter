# Hono Cloudflare Starter

A production-ready authentication backend template built with **Hono**, **Better Auth**, **Drizzle ORM**, and **Cloudflare Workers**. Spin up secure, scalable APIs in minutes.

## Features

- **Authentication** - Complete auth system via Better Auth
  - Email/password authentication
  - OAuth providers (Google, GitHub, LinkedIn)
  - Email verification
  - Password reset
  - Session management
  - Organizations/teams support
  - Admin panel
  
- **Database** - Type-safe PostgreSQL with Drizzle ORM
  - Auto-generated migrations
  - Relations and types
  - Connection pooling ready
  
- **API** - Modern REST API with OpenAPI docs
  - Automatic Swagger documentation
  - Request validation with Zod
  - Health check endpoints
  - Rate limiting
  
- **Developer Experience**
  - TypeScript throughout
  - Hot reload development
  - Powerful CLI scaffolding tool
  - Code generators for routes, schemas, middleware
  - Comprehensive error handling
  
- **Production Ready**
  - Cloudflare Workers deployment
  - Environment-based configuration
  - CORS configured
  - Secure by default

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- PostgreSQL database (we recommend [Neon](https://neon.tech))

### Option 1: Use the CLI Scaffolding Script (Recommended)

```bash
# Download and run directly from GitHub
curl -fsSL https://raw.githubusercontent.com/kurtiz/hono-cloudflare-starter/main/create-project.sh | bash -s my-api

# Or with specific package manager
curl -fsSL https://raw.githubusercontent.com/kurtiz/hono-cloudflare-starter/main/create-project.sh | bash -s my-api --pm pnpm
```

**Supports:** Bun, pnpm, Yarn, npm (auto-detected)

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/kurtiz/hono-cloudflare-starter.git my-project
cd my-project

# Install dependencies (uses your preferred package manager)
bun install    # or: pnpm install, yarn install, npm install

# Set up environment variables
cp .env.example .env

# Edit .env with your configuration
# - Generate BETTER_AUTH_SECRET: openssl rand -base64 32
# - Add your DATABASE_URL from Neon

# Generate auth schema and push to database
# (replace <pm> with your package manager: bun, pnpm, yarn, npm)
<pm> run auth:generate
<pm> run db:push

# Start development server
<pm> run dev
```

Your API will be running at `http://localhost:8787`

## CLI Tools

This template includes two powerful CLI tools to help you scaffold projects and generate code:

### 1. `create-project.sh` - Project Scaffolding

Creates a new project from the GitHub template with your preferred package manager.

**Auto-detects package manager** (priority: bun → pnpm → yarn → npm)

```bash
# Download and run directly from GitHub
curl -fsSL https://raw.githubusercontent.com/kurtiz/hono-cloudflare-starter/main/create-project.sh | bash -s my-api

# Or clone and run locally
git clone https://github.com/kurtiz/hono-cloudflare-starter.git
cd hono-cloudflare-starter
./create-project.sh my-api

# Specify package manager
./create-project.sh my-api --pm pnpm
./create-project.sh my-api --pm npm
```

**Features:**
- Clones latest template from GitHub
- Auto-detects available package managers
- Installs all dependencies
- Generates Cloudflare types
- Initializes git repository
- Shows next steps

### 2. `hono-cf` - Code Generator

A powerful CLI for generating boilerplate code within your project.

#### Installation

Add the CLI to your PATH or use it directly:

```bash
# Copy to your project
cp /path/to/hono-cloudflare-starter/hono-cf ./

# Or make it globally available
sudo ln -s $(pwd)/hono-cf /usr/local/bin/hono-cf
```

#### Commands

```bash
# Show help
hono-cf --help

# Create a new project
hono-cf create my-api
hono-cf create my-api --pm yarn

# Generate code components
hono-cf generate route posts
hono-cf generate schema projects
hono-cf generate middleware logger
hono-cf generate types product
hono-cf generate service orders

# Shorthand syntax
hono-cf g route users
hono-cf g schema organizations
hono-cf g mw auth
hono-cf g t customer
hono-cf g svc billing
```

#### Generators

**Route Generator** (`hono-cf g route <name>`)

Generates a complete CRUD route file:

```bash
hono-cf g route posts
```

Creates `src/routes/posts.ts` with:
- Full CRUD endpoints (GET, POST, PATCH, DELETE)
- Zod validation schemas
- Authentication middleware
- TypeScript types
- TODO comments for implementation

**Schema Generator** (`hono-cf g schema <name>`)

Generates a Drizzle schema file:

```bash
hono-cf g schema projects
```

Creates:
- `src/db/schema/project.ts` - Table definition
- `src/db/schema/types/project.ts` - TypeScript types
- Updates `src/db/schema/index.ts` with exports

**Middleware Generator** (`hono-cf g middleware <name>`)

Generates custom middleware:

```bash
hono-cf g middleware rate-limit
```

Creates `src/middleware/rate-limit.ts` with:
- Standard middleware structure
- Required and optional variants
- Error handling

**Types Generator** (`hono-cf g types <name>`)

Generates TypeScript type definitions:

```bash
hono-cf g types product
```

Creates `src/types/product.ts` with:
- Entity interface
- Input types
- Response types
- Pagination support

**Service Generator** (`hono-cf g service <name>`)

Generates a service class for business logic:

```bash
hono-cf g service orders
```

Creates `src/services/order.ts` with:
- Service class with CRUD methods
- Factory function
- Database integration
- TODOs for implementation

#### Example Workflow

```bash
# Create new project
hono-cf create my-shop --pm pnpm
cd my-shop

# Generate code for your feature
hono-cf g schema products
hono-cf g route products
hono-cf g types product
hono-cf g service products

# Register the route (manually add to src/routes/index.ts)
# Then run the server
pnpm run dev
```

## Project Structure

```
.
├── src/
│   ├── auth/                 # Better Auth configuration
│   │   ├── index.ts         # Auth server setup
│   │   └── auth-client.ts   # Auth client for frontend
│   ├── db/                   # Database layer
│   │   ├── index.ts         # Database connection
│   │   ├── schema/          # Drizzle schema definitions
│   │   │   ├── auth.ts
│   │   │   ├── organizations.ts
│   │   │   └── types/
│   │   └── migrations/      # Migration files
│   ├── middleware/           # Hono middleware
│   │   ├── auth.ts          # Authentication middleware
│   │   ├── cors.ts          # CORS configuration
│   │   └── error.ts         # Error handling
│   ├── openapi/             # OpenAPI documentation
│   │   ├── schemas.ts
│   │   └── spec.ts
│   ├── routes/              # API routes
│   │   ├── docs.ts          # Swagger UI
│   │   ├── health.ts        # Health endpoints
│   │   └── index.ts         # Route aggregator
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── index.ts
│   └── index.ts             # Application entry point
├── public/                   # Static assets
├── .env.example             # Environment template
├── create-project.sh        # CLI scaffolding script
├── drizzle.config.ts        # Drizzle configuration
├── package.json
├── tsconfig.json
└── wrangler.jsonc           # Cloudflare Workers config
```

## API Endpoints

### Authentication (Better Auth)

All auth routes are automatically available at `/api/auth/*`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register with email/password |
| POST | `/api/auth/sign-in/email` | Login with email/password |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/forget-password` | Request password reset |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/sign-in/social` | OAuth login (Google, GitHub, LinkedIn) |

### Application Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/health/ready` | Readiness check (DB connection) |
| GET | `/api/v1/openapi.json` | OpenAPI specification |
| GET | `/docs` | Swagger UI (basic auth protected) |

### Documentation

Access the Swagger UI at `http://localhost:8787/docs` (default credentials: admin/admin)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required
BETTER_AUTH_SECRET=your_32_char_secret
BETTER_AUTH_URL=http://localhost:8787
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Optional - OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000

# Swagger Auth
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=your_password
```

## Database Setup

### Using Neon (Recommended)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to your `.env` file

### Running Migrations

```bash
# Generate migrations from schema changes
bun run db:generate

# Push schema to database (development)
bun run db:push

# Run migrations (production)
bun run db:migrate

# Open Drizzle Studio
bun run db:studio
```

### Better Auth Schema

```bash
# Generate Better Auth tables
bun run auth:generate

# Or use the Better Auth CLI
bun run auth:migrate
```

## Deployment

### Deploy to Cloudflare Workers

1. **Install Wrangler and authenticate:**
   ```bash
   bun install -g wrangler
   wrangler login
   ```

2. **Set up secrets:**
   ```bash
   wrangler secret put BETTER_AUTH_SECRET
   wrangler secret put DATABASE_URL
   # Add other secrets as needed
   ```

3. **Deploy:**
   ```bash
   bun run deploy
   ```

### Custom Domain (Optional)

Add a custom domain in the Cloudflare Dashboard:

1. Go to Workers & Pages
2. Select your worker
3. Click "Triggers" → "Custom Domains"
4. Add your domain

## Frontend Integration

### React/Vue/Angular

```typescript
import { authClient } from "hono-cloudflare-starter/src/auth/auth-client";

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// Get session
const { data: session } = await authClient.getSession();
```

### Making Authenticated Requests

```typescript
const response = await fetch("/api/v1/protected-route", {
  method: "GET",
  credentials: "include", // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Scripts

All scripts work with **Bun, pnpm, Yarn, or npm**:

| Command | Bun | pnpm | Yarn | npm |
|---------|-----|------|------|-----|
| Start dev server | `bun dev` | `pnpm dev` | `yarn dev` | `npm run dev` |
| Deploy | `bun run deploy` | `pnpm run deploy` | `yarn deploy` | `npm run deploy` |
| Generate migrations | `bun run db:generate` | `pnpm run db:generate` | `yarn db:generate` | `npm run db:generate` |
| Run migrations | `bun run db:migrate` | `pnpm run db:migrate` | `yarn db:migrate` | `npm run db:migrate` |
| Push to DB | `bun run db:push` | `pnpm run db:push` | `yarn db:push` | `npm run db:push` |
| Drizzle Studio | `bun run db:studio` | `pnpm run db:studio` | `yarn db:studio` | `npm run db:studio` |
| Auth schema | `bun run auth:generate` | `pnpm run auth:generate` | `yarn auth:generate` | `npm run auth:generate` |
| Generate types | `bun run cf-typegen` | `pnpm run cf-typegen` | `yarn cf-typegen` | `npm run cf-typegen` |
| Type check | `bun run lint` | `pnpm run lint` | `yarn lint` | `npm run lint` |

## Customization

### Adding New Routes

Create a new route file in `src/routes/`:

```typescript
// src/routes/users.ts
import { Hono } from "hono";
import type { HonoContext } from "../types";

const usersRouter = new Hono<HonoContext>();

usersRouter.get("/", async (c) => {
  const db = c.get("db");
  // Your logic here
  return c.json({ users: [] });
});

export default usersRouter;
```

Register it in `src/routes/index.ts`:

```typescript
import usersRouter from "./users";

apiRouter.route("/users", usersRouter);
```

### Adding OAuth Providers

Edit `src/auth/index.ts`:

```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  // Add more providers
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
},
```

Don't forget to add the client to `src/auth/auth-client.ts` too.

### Adding Database Tables

Create a new schema file in `src/db/schema/`:

```typescript
// src/db/schema/projects.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

Export it from `src/db/schema/index.ts` and generate migrations.

## Security

- **CSRF Protection:** Enabled by default
- **Secure Cookies:** Automatically set in production
- **Rate Limiting:** 100 requests/minute per IP
- **CORS:** Configured for your frontend URLs
- **Password Hashing:** Argon2id via Better Auth
- **Session Management:** Secure, HTTP-only cookies

## Troubleshooting

### Database Connection Issues

```bash
# Test your connection string
psql "postgresql://..."

# Check SSL requirements
# Neon requires sslmode=require
```

### Type Errors

```bash
# Regenerate types
bun run cf-typegen

# Clear node_modules and reinstall
rm -rf node_modules bun.lock
bun install
```

### Deployment Failures

1. Check `wrangler.jsonc` configuration
2. Verify secrets are set: `wrangler secret list`
3. Check logs: `wrangler tail`

## Tech Stack

- [Hono](https://hono.dev) - Web framework
- [Better Auth](https://better-auth.com) - Authentication
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge runtime
- [Neon](https://neon.tech) - Serverless Postgres
- [Zod](https://zod.dev) - Schema validation
- [Scalar](https://scalar.com) - API documentation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this for personal and commercial projects.

## Support

- [Better Auth Docs](https://better-auth.com/docs)
- [Hono Docs](https://hono.dev/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

Built with ❤️ using Hono, Better Auth, and Cloudflare Workers.
