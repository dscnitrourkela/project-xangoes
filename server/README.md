# Server Backend Documentation

A well-organized and scalable backend server built with Hono, TypeScript, and modern development practices.

## Table of Contents

-   [🚀 Getting Started](#-getting-started)
-   [🏗️ Directory Structure](#️-directory-structure)
-   [🔄 Codebase Flow & Architecture](#-codebase-flow--architecture)
-   [📋 Development Guidelines](#-development-guidelines)
-   [🛠️ Error Handling & Response Utilities](#️-error-handling--response-utilities)
-   [📝 Response Format](#-response-format)
-   [📚 Learning from Test Routes](#-learning-from-test-routes)
-   [🌍 Environment Configuration](#-environment-configuration)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed on your system.

### Installation & Running

```bash
# Install dependencies using Bun (IMPORTANT!)
bun install

# Start the development server
bun run dev

# Or start the production server
bun start
```

The server will start on `http://localhost:3000` by default.

---

## 🏗️ Directory Structure

```tree
server/
├── src/
│   ├── app.ts            # Main Hono app instance and middleware setup
│   ├── index.ts          # Server entry point
│   │
│   ├── config/           # Configuration files
│   │   └── env.ts        # Environment variable validation (Zod)
│   │
│   ├── services/         # Business logic layer
│   │   ├── health.service.ts  # Health check service
│   │   └── test.service.ts    # Test/demo service
│   │
│   ├── controllers/      # Request handlers layer
│   │   ├── index.ts      # Controller exports
│   │   ├── health.ts     # Health check controller
│   │   └── test.ts       # Test/demo controller
│   │
│   ├── routes/           # Route definitions layer
│   │   ├── index.ts      # Route exports
│   │   ├── health.ts     # Health check routes
│   │   └── test.ts       # Test routes with validation
│   │
│   ├── middlewares/      # Custom Hono middlewares
│   │   ├── index.ts      # Middleware exports
│   │   ├── asyncHandler.ts    # Async error handling
│   │   ├── errorHandler.ts    # Global error handling
│   │   ├── responseHandler.ts # Response formatting
│   │   ├── schemaValidator.ts # Request validation
│   │   └── validators/        # Zod validation schemas
│   │       └── test.ts        # User validation schemas
│   │
│   └── types/            # TypeScript type definitions
│       └── index.ts      # API response types
│
├── .env                # Environment variables (GIT-IGNORED)
├── .gitignore          # Git ignore patterns
├── bun.lock           # Bun lockfile
├── DATABASE_SCHEMA.md # Database schema documentation
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

---

## 🔄 Codebase Flow & Architecture

Our codebase follows a layered architecture pattern with clear separation of concerns:

### 📊 Data Flow Diagram

```
Services ➡️ Controllers ➡️ Routes ➡️ App
   ⬆️          ⬆️          ⬆️      ⬆️
Business    Request    Route     Hono
 Logic     Handling   Definition  Setup
```

### 🎯 Layer Responsibilities

#### 1. **Services Layer** (`src/services/`)

-   Contains all business logic
-   Handles data processing and manipulation
-   Independent of HTTP concerns
-   Reusable across different controllers

```typescript
// Example: health.service.ts
class HealthService {
    public getHealth() {
        return {
            status: "ok",
            message: "Server is healthy and running!",
        };
    }
}
```

#### 2. **Controllers Layer** (`src/controllers/`)

-   Handles HTTP requests and responses
-   Imports and uses services for business logic
-   Formats responses using response handlers
-   Should be thin - logic goes in services

```typescript
// Example: health.ts
import { healthService } from "@/services/health.service";

export const healthController = {
    getHealth: async (c: Context) => {
        const result = healthService.getHealth();
        return sendSuccess(c, result);
    },
};
```

#### 3. **Routes Layer** (`src/routes/`)

-   Defines API endpoints and their HTTP methods
-   Applies validation middleware
-   Connects routes to controllers
-   Uses asyncHandler for error handling

```typescript
// Example: health.ts
import { healthController } from "@/controllers";

const healthRouter = new Hono();
healthRouter.get("/", asyncHandler(healthController.getHealth));
```

#### 4. **App Layer** (`src/app.ts`)

-   Combines all routes
-   Sets up global middleware
-   Configures error handling
-   Main application entry point

```typescript
// app.ts structure
const app = new Hono();
app.use("*", logger());
app.route("/", routes);
app.notFound(notFoundHandler);
app.onError(errorHandler);
```

---

## 📋 Development Guidelines

### 🎯 Please Adhere to This Pattern

When adding new features, **always follow this flow**:

1. **Start with Services** - Create your business logic in `src/services/`
2. **Create Controllers** - Import services and handle HTTP concerns in `src/controllers/`
3. **Define Routes** - Set up endpoints with validation in `src/routes/`
4. **Update App** - Ensure routes are properly imported in the main app

### ✅ Do's and ❌ Don'ts

| ✅ **DO**                      | ❌ **DON'T**                         |
| ------------------------------ | ------------------------------------ |
| Put business logic in services | Put business logic in controllers    |
| Use services in controllers    | Skip the service layer               |
| Import services at the top     | Import services inside functions     |
| Use asyncHandler for routes    | Handle errors manually in each route |
| Follow the naming conventions  | Use inconsistent naming              |
| Use Zod for validation         | Skip input validation                |

### 🏷️ Naming Conventions

-   **Services**: `*.service.ts` (e.g., `user.service.ts`)
-   **Controllers**: `*.ts` (e.g., `user.ts`)
-   **Routes**: `*.ts` (e.g., `user.ts`)
-   **Service Exports**: `export const userService = new UserService();`
-   **Controller Exports**: `export const userController = { ... };`

---

## 🛠️ Error Handling & Response Utilities

### Core Utilities

-   **asyncHandler**: Wraps route handlers to catch errors automatically
-   **sendSuccess/sendCreated**: Standardized success responses
-   **createError**: Structured error creation with proper HTTP status codes
-   **validateRequest**: Zod-based request validation middleware

### Usage Pattern

```typescript
// Always use this pattern in routes
routerName.method(
    "/endpoint",
    validateRequest(schema, "body"), // Optional validation
    asyncHandler(controllerName.methodName)
);
```

---

## 📝 Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        /* your data */
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
    "success": false,
    "message": "Error description",
    "error": "Additional details (dev only)",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📚 Learning from Test Routes

To understand the codebase pattern better, **examine the test route implementation**:

### 🔍 Study This Flow:

1. **Service**: `src/services/test.service.ts`

    - See how business logic is organized
    - Notice the clean separation of concerns

2. **Controller**: `src/controllers/test.ts`

    - See how services are imported and used
    - Notice the thin controller pattern

3. **Routes**: `src/routes/test.ts`

    - See how validation is applied
    - Notice the asyncHandler usage
    - See how routes connect to controllers

4. **Validation**: `src/middlewares/validators/test.ts`
    - See how Zod schemas are defined
    - Notice the validation patterns

### 🧪 Test the Flow

```bash
# Start the server
bun run dev

# Visit the test endpoint to see the documentation
curl http://localhost:3000/test

# Try the endpoints to see the pattern in action
curl -X POST http://localhost:3000/test/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "age": 25}'
```

---
