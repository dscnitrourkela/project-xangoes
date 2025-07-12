<p align="center">
  <a href="#">
    <!-- <img src="public/server-logo.png" alt="Logo" width="800"> -->
  </a>

  <h3 align="center">Project Xangoes - Backend Server</h3>

  <p align="center">
    A high-performance, scalable backend server built with Hono and TypeScript, designed to power college fest management systems with robust API endpoints, comprehensive error handling, and modern development practices.
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-server">About The Server</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#architecture-overview">Architecture Overview</a></li>
        <li><a href="#directory-structure">Directory Structure</a></li>
      </ul>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#api-flow--architecture">API Flow & Architecture</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation--setup">Installation & Setup</a></li>
        <li><a href="#running-the-server">Running the Server</a></li>
      </ul>
    </li>
    <li><a href="#development-guidelines">Development Guidelines</a></li>
    <li><a href="#api-documentation">API Documentation</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#dsc-nit-rourkela">DSC NIT Rourkela</a></li>
    <li><a href="#starware">Starware</a></li>
  </ol>
</details>

## About The Server

The Project Xangoes backend server is a modern, high-performance API server built with Hono and TypeScript. It serves as the core backend infrastructure for the college fest management system, providing robust API endpoints, comprehensive error handling, and scalable architecture patterns.

### Architecture Overview

The server follows a modern layered architecture pattern:

-   **Services Layer**: Business logic and data processing
-   **Controllers Layer**: HTTP request handling and response formatting
-   **Routes Layer**: API endpoint definitions and middleware application
-   **Middleware Stack**: Custom middleware for validation, error handling, and response formatting
-   **Type System**: Comprehensive TypeScript types for all API interactions
-   **GraphQl Implmentation**: Upcoming Graphql implmentation.

### Directory Structure

```
server/
├── src/
│   ├── app.ts                    # Main Hono app instance and middleware setup
│   ├── index.ts                  # Server entry point
│   │
│   ├── config/                   # Configuration files
│   │   └── env.ts               # Environment variable validation (Zod)
│   │
│   ├── services/                 # Business logic layer
│   │   ├── health.service.ts    # Health check service
│   │   └── test.service.ts      # Test/demo service
│   │
│   ├── controllers/              # Request handlers layer
│   │   ├── index.ts             # Controller exports
│   │   ├── health.ts            # Health check controller
│   │   └── test.ts              # Test/demo controller
│   │
│   ├── routes/                   # Route definitions layer
│   │   ├── index.ts             # Route exports
│   │   ├── health.ts            # Health check routes
│   │   └── test.ts              # Test routes with validation
│   │
│   ├── middlewares/              # Custom Hono middlewares
│   │   ├── index.ts             # Middleware exports
│   │   ├── asyncHandler.ts      # Async error handling
│   │   ├── errorHandler.ts      # Global error handling
│   │   ├── responseHandler.ts   # Response formatting
│   │   ├── schemaValidator.ts   # Request validation
│   │   └── validators/          # Zod validation schemas
│   │       ├── index.ts         # Validator exports
│   │       └── test.ts          # User validation schemas
│   │
│   └── types/                   # TypeScript type definitions
│       ├── env.types.ts         # Environment variable types
│       └── index.ts             # API response types
│
├── .env                        # Environment variables (GIT-IGNORED)
├── .gitignore                  # Git ignore patterns
├── bun.lock                    # Bun lockfile
├── DATABASE_SCHEMA.md          # Database schema documentation
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Built With

### Runtime & Framework

-   **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
-   **[Hono](https://hono.dev/)** - Lightweight, fast web framework for the Edge
-   **[TypeScript](https://www.typescriptlang.org/)** - Type-safe backend development

### Database & ORM

-   **[PostgreSQL](https://www.postgresql.org/)** - Relational database for structured data (planned)
-   **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database ORM (planned for future implementation)

### Validation & Types

-   **[Zod](https://zod.dev/)** - TypeScript-first schema validation with runtime type checking
-   **Custom Types** - Comprehensive TypeScript type definitions for all API interactions

### Authentication & Security

-   **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** - Backend authentication and user management (planned)

## Database Schema

Project Xangoes uses a comprehensive database schema with **8 core entities** designed to manage college fests, events, and user interactions:

-   **User** - Participants, organizers, and students
-   **Fest** - Main festival/event management
-   **Club** - Organizing bodies and societies
-   **Event** - Individual competitions and activities
-   **Institute** - Educational institutions
-   **Transaction** - Payment and financial records
-   **EventRegistration** - User-event participation tracking
-   **Team** - User-club membership management

For detailed database schema documentation, entity relationships, field specifications, and implementation guidelines, please refer to:

**📋 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

## API Flow & Architecture

The server implements a comprehensive API architecture with multiple layers of processing and validation.

### Request-Response Flow

```
Client Request
      ↓
   Route Handler
      ↓
Schema Validation
      ↓
   Valid Request? ----→ [No] → Validation Error Response
      ↓ [Yes]
Async Handler Wrapper
      ↓
Controller Method
      ↓
  Service Layer
      ↓
Business Logic Processing
      ↓
 Response Handler
      ↓
Standardized JSON Response
      ↓
     Client
```

### Architecture Layers

```
Routes Layer → Controllers Layer → Services Layer → Data Layer
```

### API Response Format

All API responses follow a standardized format for consistency:

#### Success Response

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        /* response data */
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Error Response

```json
{
    "success": false,
    "message": "Error description",
    "error": "Additional error details (development only)",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Paginated Response

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

### Available Endpoints

#### Health Check Endpoints

-   `GET /health` - Basic health check
-   `GET /health/detailed` - Detailed system health information

#### Test Endpoints _(For Understanding Code Flow)_

-   `GET /test` - Basic test endpoint with documentation
-   `POST /test/users` - User creation endpoint with validation
-   `GET /test/users` - User listing endpoint
-   `POST /test/echo` - Echo endpoint for testing request/response flow

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

-   **[Bun](https://bun.sh/)** (latest version) - **Required** runtime and package manager
-   **[PostgreSQL](https://www.postgresql.org/)** (v14 or higher) _(for future database integration)_
-   **[Git](https://git-scm.com/)** - Version control

### Installation & Setup

1. **Navigate to Server Directory**

    ```bash
    cd server
    ```

2. **Install Dependencies**

    ```bash
    # Install using Bun (required)
    bun install
    ```

3. **Environment Configuration**

    Create a `.env` file in the server directory using `.env.sample` as a template. The default port is `5000`.

### Running the Server

1. **Development Mode**

    ```bash
    # Start development server with hot reload
    bun run dev
    ```

2. **Production Mode**

    ```bash
    # Build and start production server
    bun run build
    bun run start
    ```

3. **Server Information**
    - Server URL: `http://localhost:5000`
    - Health Check: `http://localhost:5000/health`
    - Test Documentation: `http://localhost:5000/test`

## Development Guidelines

### 🎯 Architecture Pattern

When adding new features, **always follow this layered flow**:

1. **Services Layer** (`src/services/`) - Business logic and data processing
2. **Controllers Layer** (`src/controllers/`) - HTTP request handling
3. **Routes Layer** (`src/routes/`) - API endpoint definitions
4. **App Integration** (`src/app.ts`) - Route registration

### 🔄 Data Flow Pattern

```
Request → Route → Validation → Controller → Service → Response
```

### ✅ Best Practices

| ✅ **DO**                       | ❌ **DON'T**                      |
| ------------------------------- | --------------------------------- |
| Put business logic in services  | Put business logic in controllers |
| Use asyncHandler for all routes | Handle errors manually in routes  |
| Validate all inputs with Zod    | Skip input validation             |
| Follow naming conventions       | Use inconsistent naming           |
| Use proper HTTP status codes    | Use generic 200/500 responses     |
| Write comprehensive types       | Use `any` types                   |

### 🏷️ Naming Conventions

-   **Services**: `*.service.ts` (e.g., `user.service.ts`)
-   **Controllers**: `*.ts` (e.g., `user.ts`)
-   **Routes**: `*.ts` (e.g., `user.ts`)
-   **Validators**: `*.ts` (e.g., `user.ts`)
-   **Types**: `*.types.ts` (e.g., `user.types.ts`)

### 📚 Learning from Examples

Study the test route implementation to understand the patterns:

1. **Service**: `src/services/test.service.ts` - Business logic organization
2. **Controller**: `src/controllers/test.ts` - HTTP handling patterns
3. **Routes**: `src/routes/test.ts` - Endpoint definitions and validation
4. **Validators**: `src/middlewares/validators/test.ts` - Schema validation

## API Documentation

### Response Utilities

-   **`sendSuccess(c, data, message?)`** - Standard success response
-   **`sendCreated(c, data, message?)`** - 201 Created response
-   **`sendError(c, message, statusCode?)`** - Error response
-   **`createError(message, statusCode?)`** - Structured error creation

### Validation Utilities

-   **`validateRequest(schema, target)`** - Middleware for request validation
-   **`asyncHandler(fn)`** - Wrapper for async route handlers

### Error Handling

The server implements comprehensive error handling:

-   **Validation Errors** - Automatic Zod validation with detailed messages
-   **Async Errors** - Automatic error catching in async handlers
-   **Global Error Handler** - Centralized error processing
-   **Development Mode** - Detailed error information in development

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## DSC NIT Rourkela

[![DSC NIT Rourkela][dsc-nitrourkela]](https://dscnitrourkela.org)

## Starware

This project is Starware.
This means you're free to use the project, as long as you star its GitHub repository.
Your appreciation makes us grow and glow up. ⭐

[dsc-nitrourkela]: ../client/public/repoCover.png
