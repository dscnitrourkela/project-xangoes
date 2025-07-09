# Server Directory Structure

A well-organized and scalable directory structure for the project's backend.

```tree
server/
├── src/
│   ├── app.ts            # Main Hono app instance and middleware setup
│   ├── index.ts          # Server entry point
│   │
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment variable validation (Zod)
│   │   └── firebase.ts   # Firebase Admin SDK initialization
│   │
│   ├── db/               # Drizzle ORM setup
│   │   ├── index.ts      # Drizzle client instance
│   │   ├── schema/       # Database table schemas
│   │   │   ├── users.ts
│   │   │   ├── events.ts
│   │   │   └── ...
│   │   └── migrations/   # Database migration files
│   │
│   ├── lib/              # Shared libraries and helpers
│   │   ├── auth.ts       # Authentication helpers
│   │   └── logger.ts     # Logging utility
│   │
│   ├── middlewares/      # Custom Hono middlewares
│   │   ├── auth.ts       # Protects routes by verifying JWT
│   │   ├── errorHandler.ts # Handles errors globally
│   │   ├── successHandler.ts # Formats successful responses
│   │   └── asyncHandler.ts # Wraps async route handlers to catch errors
│   │
│   ├── routes/           # API route definitions
│   │   ├── auth/
│   │   ├── users/
│   │   └── events/
│   │
│   ├── services/         # Business logic modules
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── ...
│   │
│   ├── graphql/          # GraphQL schema and resolvers
│   │   ├── schema.ts
│   │   └── resolvers/
│   │
│   └── types/            # TypeScript type definitions
│       └── index.d.ts
│
├── .env                # Environment variables (GIT-IGNORED)
├── AUTH_FLOW.md        # Document detailing the authentication flow
├── bun.lockb           # Bun lockfile
├── drizzle.config.ts   # Drizzle Kit configuration for migrations
├── package.json
└── tsconfig.json
```

# Error Handling and Response Utilities

This document explains how to use the async handler, success handler, and error handler utilities in your Hono application.

## Overview

These utilities provide:

-   **Async Handler**: Eliminates repetitive try-catch blocks
-   **Response Handler**: Standardized API response format
-   **Error Handler**: Centralized error handling with proper status codes
-   **Custom Error Classes**: Structured error creation

## Quick Start

```typescript
import { asyncHandler, sendSuccess, createError } from "@/middlewares";

// Simple route with async handler
app.get(
    "/users",
    asyncHandler(async (c) => {
        const users = await getUsersFromDatabase();
        return sendSuccess(c, users, "Users retrieved successfully");
    })
);
```

## Async Handler

The `asyncHandler` wraps your route handlers and automatically catches any thrown errors.

### Basic Usage

```typescript
import { asyncHandler } from "@/middlewares";

app.get(
    "/example",
    asyncHandler(async (c) => {
        // Your async code here
        // Any thrown errors will be automatically handled
        const data = await someAsyncOperation();
        return sendSuccess(c, data);
    })
);
```

### Error Throwing

```typescript
app.post(
    "/users",
    asyncHandler(async (c) => {
        const body = await c.req.json();

        if (!body.email) {
            throw createError.badRequest("Email is required");
        }

        const user = await createUser(body);
        return sendCreated(c, user, "User created successfully");
    })
);
```

## Response Handlers

### Success Responses

```typescript
import { sendSuccess, sendCreated, sendNoContent } from "@/middlewares";

// Basic success response
return sendSuccess(c, data, "Operation successful");

// Created response (201)
return sendCreated(c, newResource, "Resource created");

// No content response (204)
return sendNoContent(c, "Resource deleted");
```

### Paginated Responses

```typescript
import { sendPaginated } from "@/middlewares";

app.get(
    "/posts",
    asyncHandler(async (c) => {
        const page = parseInt(c.req.query("page") || "1");
        const limit = parseInt(c.req.query("limit") || "10");

        const { posts, total } = await getPaginatedPosts(page, limit);

        return sendPaginated(c, posts, page, limit, total, "Posts retrieved");
    })
);
```

### Using ResponseHandler Class

```typescript
import { ResponseHandler } from "@/middlewares";

// Direct class usage
return ResponseHandler.success(c, data, "Success message", 200);
return ResponseHandler.error(c, "Error message", 400, errorDetails);
```

## Error Handling

### Custom Error Creation

```typescript
import { createError, CustomError } from "@/middlewares";

// Predefined error types
throw createError.badRequest("Invalid input");
throw createError.unauthorized("Access denied");
throw createError.forbidden("Insufficient permissions");
throw createError.notFound("Resource not found");
throw createError.conflict("Resource already exists");
throw createError.internal("Server error");

// Custom error with details
throw createError.badRequest("Validation failed", {
    missing_fields: ["name", "email"],
});

// Direct CustomError usage
throw new CustomError("Custom message", 422, { field: "value" });
```

### Global Error Handler

The global error handler is automatically configured in `app.ts`:

```typescript
import { errorHandler, notFoundHandler } from "./middlewares";

// 404 handler for unmatched routes
app.notFound(notFoundHandler);

// Global error handler
app.onError(errorHandler);
```

## Response Format

All responses follow a consistent format:

### Success Response

```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
    "success": false,
    "message": "Error description",
    "error": "Additional error details (dev only)",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response

```json
{
    "success": true,
    "message": "Data retrieved successfully",
    "data": [...],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "totalPages": 10
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Complete Example

```typescript
import { Hono } from "hono";
import {
    asyncHandler,
    sendSuccess,
    sendCreated,
    sendPaginated,
    createError,
} from "@/middlewares";

const userRouter = new Hono();

// Get all users with pagination
userRouter.get(
    "/",
    asyncHandler(async (c) => {
        const page = parseInt(c.req.query("page") || "1");
        const limit = parseInt(c.req.query("limit") || "10");

        const { users, total } = await getUsersWithPagination(page, limit);

        return sendPaginated(
            c,
            users,
            page,
            limit,
            total,
            "Users retrieved successfully"
        );
    })
);

// Get single user
userRouter.get(
    "/:id",
    asyncHandler(async (c) => {
        const id = c.req.param("id");

        if (!id || isNaN(Number(id))) {
            throw createError.badRequest("Invalid user ID");
        }

        const user = await getUserById(id);

        if (!user) {
            throw createError.notFound("User not found");
        }

        return sendSuccess(c, user, "User retrieved successfully");
    })
);

// Create new user
userRouter.post(
    "/",
    asyncHandler(async (c) => {
        const body = await c.req.json();

        // Validation
        if (!body.name || !body.email) {
            throw createError.badRequest("Name and email are required");
        }

        // Check if user exists
        const existingUser = await getUserByEmail(body.email);
        if (existingUser) {
            throw createError.conflict("User with this email already exists");
        }

        const newUser = await createUser(body);
        return sendCreated(c, newUser, "User created successfully");
    })
);

export { userRouter };
```

## Environment Variables

Error details are shown based on environment:

-   **Development**: Full error details and stack traces
-   **Production**: Generic error messages for security

Set `NODE_ENV=production` for production deployments.

## Testing

You can test the error handling by making requests to routes that throw errors:

```bash
# Test validation error
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{}'

# Test not found error
curl http://localhost:3000/users/999

# Test server error
curl http://localhost:3000/users/trigger-error
```
