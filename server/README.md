# Project Xangoes - Backend Server

A high-performance, type-safe REST API server built with [Hono](https://hono.dev/) and TypeScript, powering the college fest and event management platform for DSC NIT Rourkela.

## Table of Contents

- [About The Server](#about-the-server)
- [Architecture & Layered Flow](#architecture--layered-flow)
- [Directory Structure](#directory-structure)
- [Built With](#built-with)
- [Database Schema](#database-schema)
- [Standardized API Response Envelope](#standardized-api-response-envelope)
- [API Routes & Endpoints](#api-routes--endpoints)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running the Server](#running-the-server)
  - [Database Scripts](#database-scripts)
- [Development Guidelines](#development-guidelines)
- [License](#license)

---

## About The Server

The Project Xangoes backend provides core services for managing college festivals, club competitions, student registrations, role-based authorization, and payment receipt verifications. It features strict schema validation with [Zod](https://zod.dev/), centralized error handling, and rate limiting.

---

## Architecture & Layered Flow

The server follows a strict four-layer architecture:

```
Incoming Request
      ↓
  Middlewares (Logger, Sliding-Window Rate Limiter)
      ↓
 Routes Layer (`src/routes/`) - URL routing & middleware attachment
      ↓
 Schema Validation (`src/middlewares/schemaValidator.ts`) - Zod validation
      ↓
 Controllers Layer (`src/controllers/`) - HTTP request parsing & response dispatch
      ↓
 Services Layer (`src/services/`) - Pure business logic
      ↓
 Response Envelope (`src/middlewares/responseHandler.ts`)
      ↓
Standardized JSON Response
```

---

## Directory Structure

```
server/
├── drizzle/                  # Drizzle SQL migrations and metadata
│   ├── meta/
│   ├── 0000_steep_supreme_intelligence.sql
│   ├── 0001_oval_plazm.sql
│   └── 0002_broken_doctor_strange.sql
├── src/
│   ├── app.ts                # Hono application instance, middlewares, and 404 handler
│   ├── index.ts              # Server bootstrap and runtime entry point
│   ├── config/
│   │   └── env.ts            # Environment variable validation & parser
│   ├── controllers/
│   │   ├── auth.ts           # Authentication controller (login, sign-up, me)
│   │   ├── health.ts         # Health check controller
│   │   ├── index.ts          # Controller exports
│   │   └── test.ts           # Demo test controller
│   ├── db/
│   │   ├── schema/           # Drizzle table schemas
│   │   │   ├── admin.ts      # Admin and super admin entity
│   │   │   ├── club.ts       # Clubs and societies
│   │   │   ├── event.ts      # Event specifications and prize structures
│   │   │   ├── eventRegistration.ts # Event participation records
│   │   │   ├── fest.ts       # Fest configuration and status
│   │   │   ├── institute.ts  # Educational institutions
│   │   │   ├── relations.ts  # Drizzle relational mappings
│   │   │   ├── team.ts       # Team compositions
│   │   │   ├── transaction.ts# Payment records & audit verifications
│   │   │   ├── user.ts       # Student and participant user profiles
│   │   │   └── index.ts      # Schema barrel exports
│   │   └── schema.ts         # Database connection setup
│   ├── middlewares/
│   │   ├── asyncHandler.ts   # Async wrapper catching runtime exceptions
│   │   ├── errorHandler.ts   # Global error and 404 handlers
│   │   ├── index.ts          # Middleware barrel exports
│   │   ├── rateLimit.ts      # In-memory sliding-window rate limiter
│   │   ├── responseHandler.ts# Standardized success/error response helpers
│   │   ├── schemaValidator.ts# Zod request validation middleware
│   │   └── validators/       # Zod schemas for endpoints
│   │       ├── auth.ts       # Auth validation schemas
│   │       ├── index.ts      # Validator exports
│   │       └── test.ts       # Test endpoint schemas
│   ├── routes/
│   │   ├── auth.ts           # /auth routes (login, sign-up, me)
│   │   ├── health.ts         # /health routes (basic and detailed)
│   │   ├── index.ts          # Route aggregator mounting /auth, /health, /test
│   │   └── test.ts           # /test validation example routes
│   ├── services/
│   │   ├── auth.service.ts   # Authentication and session service
│   │   ├── health.service.ts # System health metrics service
│   │   └── test.service.ts   # Test demo service
│   └── types/
│       ├── env.types.ts      # Typed environment configurations
│       └── index.ts          # Envelope types: ApiResponse, PaginatedResponse
├── .env.sample               # Environment variables template
├── .gitignore
├── bun.lock                  # Lockfile
├── drizzle.config.ts         # Drizzle Kit configuration
├── package.json              # Server scripts and dependencies
└── tsconfig.json             # TypeScript configuration
```

---

## Built With

- **[Hono](https://hono.dev/)** (v4.8+) - Ultrafast, lightweight web framework
- **[Bun](https://bun.sh/)** / **[Node.js](https://nodejs.org/)** (with `tsx`) - Runtime execution
- **[TypeScript](https://www.typescriptlang.org/)** (v5) - Strict type safety
- **[Drizzle ORM](https://orm.drizzle.team/)** & **[drizzle-kit](https://orm.drizzle.team/kit-docs/overview)** - Next-generation ORM and migration tool
- **[PostgreSQL](https://www.postgresql.org/)** via `pg` - Relational datastore
- **[Zod](https://zod.dev/)** (v4) - Request validation and runtime type assertion

---

## Database Schema

The database defines **10 primary entities** in `src/db/schema/`:

| Entity | Table Name | Purpose | Key Attributes |
|---|---|---|---|
| **Users** | `users` | Students & Participants | `id`, `email`, `name`, `mobile`, `rollNumber`, `college`, `firebaseId`, `hasPaid`, `hall` |
| **Admins** | `admins` | Fest Organizers & Authorities | `id`, `email`, `firebaseId`, `isSuperAdmin`, `festID`, `allowedToModifyContent` |
| **Fests** | `fests` | Festivals | `id`, `name`, `tagline`, `startDate`, `endDate`, `status` (`ACTIVE`/`DRAFT`/`EXPIRED`), `registrationFee`, `collegeStatus` |
| **Events** | `events` | Competitions & Shows | `id`, `name`, `subHeading`, `prizeMoney`, `rules`, `location`, `clubId`, `pocID`, `status` |
| **Event Registrations** | `event_registrations` | Event Sign-ups | `id`, `eventID`, `userID`, `teamID`, `createdAt` |
| **Transactions** | `transactions` | Payments & Fees | `id`, `amount`, `userID`, `transactionID`, `type` (`REGISTRATION`/`MERCH`/`EVENT`), `isVerified` |
| **Clubs** | `clubs` | Student Organizing Bodies | `id`, `name`, `description`, `society` |
| **Institutes** | `institutes` | Colleges | `id`, `name`, `state`, `city` |
| **Teams** | `teams` | Student Groups | `id`, `name`, `leaderID` |
| **Relations** | N/A | Drizzle Relational Mappings | Cross-table foreign key relationships |

---

## Standardized API Response Envelope

Every endpoint returns a consistent JSON envelope conforming to `ApiResponse<T>`:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-19T17:00:00.000Z"
}
```

### Error / Validation Response
```json
{
  "success": false,
  "message": "Validation failed",
  "error": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2026-10-19T17:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "timestamp": "2026-10-19T17:00:00.000Z"
}
```

---

## API Routes & Endpoints

### 1. General & Health
- `GET /` - Root endpoint displaying server name and active status
- `GET /health` - Basic health ping returning status and timestamp
- `GET /health/detailed` - Detailed system uptime, memory usage, and process status

### 2. Authentication (`/auth`)
- `POST /auth/login` - Authenticates user credentials (validates `email`, `password`, optional `role`)
- `POST /auth/sign-up` - Registers new user (validates `name`, `email`, `mobile`, `password`, optional `role`)
- `GET /auth/me` - Resolves current user from Bearer token (`Authorization: Bearer <token>`)

### 3. Demo / Test (`/test`)
- `GET /test` - Documentation of test validation endpoints and schemas
- `POST /test/users` - Creates user with body validation (`createUserSchema`: `name`, `email`, `age`)
- `GET /test/users` - Queries users with pagination (`getUserQuerySchema`: `page`, `limit`, `search`)
- `GET /test/users/:id` - Retrieves user by UUID (`userParamsSchema`: `id` UUID)
- `PUT /test/users/:id` - Updates user with parameter and body validation

---

## Environment Variables

Configure environment variables in `server/.env` based on `server/.env.sample`:

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | Number | `5000` | HTTP listening port |
| `DATABASE_URL` | String | Required | PostgreSQL database connection URI |
| `RATE_LIMIT` | Number | `100` | Maximum requests allowed within window |
| `RATE_LIMIT_WINDOW`| Number | `60` | Sliding window duration in seconds |

---

## Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** (recommended) or **[Node.js](https://nodejs.org/)** (v18+)
- **[PostgreSQL](https://www.postgresql.org/)** (v14+) database instance

### Installation & Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   # Using Bun
   bun install

   # Or using npm
   npm install
   ```

3. Setup environment configuration:
   ```bash
   cp .env.sample .env
   ```
   Edit `.env` to supply your valid `DATABASE_URL`.

### Running the Server

Start development mode with hot-reloading:
```bash
# Using Bun
bun run dev

# Or using npm with tsx
npx tsx watch src/index.ts
```

### Database Scripts

Manage database migrations via Drizzle Kit:
```bash
# Generate SQL migration files from schema definitions
bun run db:generate

# Execute pending migrations against target database
bun run db:migrate

# Launch Drizzle Studio web GUI for inspecting records
bun run db:studio
```

---

## Development Guidelines

1. **Follow the Layered Pattern**: Always define `schema` -> `validator` -> `service` -> `controller` -> `route`.
2. **Standard Envelopes**: Always return responses via `sendSuccess`, `sendCreated`, or `sendError` from `src/middlewares/responseHandler.ts`.
3. **No Unhandled Promises**: Wrap all route controllers with `asyncHandler(...)`.
4. **Input Validation**: Validate every body, query, and path parameter with `validateRequest(schema, "body" | "query" | "params")`.

---

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
