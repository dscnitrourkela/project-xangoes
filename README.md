# Project Xangoes

A unified, modern full-stack management system for college fests and events at NIT Rourkela, built to streamline event registration, festival operations, payment audits, and participant management.

Developed with ❤️ by **[DSC NIT Rourkela](https://dscnitrourkela.org)**.

---

## Table of Contents

- [About The Project](#about-the-project)
- [System Architecture](#system-architecture)
- [Monorepo Directory Structure](#monorepo-directory-structure)
- [Tech Stack](#tech-stack)
- [Standardized API Response Envelope](#standardized-api-response-envelope)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Running the Client](#running-the-client)
  - [Running the Server](#running-the-server)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Endpoints Summary](#api-endpoints-summary)
- [Design Guidelines](#design-guidelines)
- [Contributing](#contributing)
- [License](#license)

---

## About The Project

Project Xangoes provides a centralized platform for college festival organizers, clubs, participants, and institute administrators:

- **Centralized Fest Operations**: Create, schedule, and oversee annual flagship fests (Innovision, Nitrutsav, ISM).
- **Club Events Catalog**: Organize technical, robotics, and cultural competitions with prize pools and POC coordinators.
- **Participant Registrations**: Streamlined user account creation, team formations, and roll number verifications.
- **Payment & Transaction Auditing**: External UPI/gateway payment tracking, screenshot receipt audit, and fee verification.
- **Role-Based Access Control**: Clean role gating separating regular participants (`user`), fest coordinators (`admin`), and institute leadership (`super_admin`).

---

## System Architecture

Project Xangoes is architected into two focused modules:

```
┌─────────────────────────────────────────────────────────────┐
│                    Project Xangoes                          │
├──────────────────────────────┬──────────────────────────────┤
│      client/ (Frontend)      │      server/ (Backend API)   │
│                              │                              │
│ • Next.js 15 (App Router)    │ • Hono HTTP Framework        │
│ • React 19 + TypeScript      │ • Bun / Node.js + TypeScript │
│ • Tailwind CSS v4            │ • Drizzle ORM + PostgreSQL   │
│ • Zod Form Validation        │ • Zod Schema Validation      │
│ • Typed Fetch API Client     │ • Sliding-Window Rate Limit  │
│ • Role-Aware AppShell        │ • Standard Response Envelope │
│ • Collapsible Admin Portal   │ • 4-Layer Service Flow       │
└──────────────────────────────┴──────────────────────────────┘
```

---

## Monorepo Directory Structure

```
project-xangoes/
├── client/                     # Next.js 15 Frontend
│   ├── public/                 # Static assets and icons
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Public auth route group
│   │   │   │   ├── login/      # Sign-in page with role redirect
│   │   │   │   └── sign-up/    # Registration page
│   │   │   ├── (dev)/          # Developer design verification
│   │   │   │   ├── playground/ # Component playground
│   │   │   │   └── typography/ # Geist Sans typography hierarchy
│   │   │   ├── (home)/         # Main public landing page
│   │   │   ├── admin/          # Protected Admin Dashboard
│   │   │   │   ├── layout.tsx  # Role guard & responsive sidebar
│   │   │   │   ├── page.tsx    # Admin overview dashboard
│   │   │   │   ├── fests/      # Fest management catalog
│   │   │   │   ├── events/     # Events catalog & prize pools
│   │   │   │   ├── registrations/ # Student registry & CSV export
│   │   │   │   └── transactions/  # Payment verification audit
│   │   │   ├── api/auth/       # Next.js route handlers
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── sign-up/route.ts
│   │   │   │   └── me/route.ts
│   │   │   ├── globals.css     # Tailwind v4 theme & CSS tokens
│   │   │   └── layout.tsx      # Root layout (Theme & Auth providers)
│   │   ├── components/
│   │   │   ├── admin/          # Admin sidebar and topbar
│   │   │   ├── layout/         # Role-aware AppShell & mobile nav
│   │   │   └── ui/             # Reusable UI primitives (Button, Card, Input, Badge, Typography)
│   │   ├── context/            # AuthProvider & useAuth hook
│   │   ├── fonts/              # Geist Sans and Inter configurations
│   │   ├── lib/                # Typed API client wrapper & cn utils
│   │   └── types/              # ApiResponse envelope & Zod schemas
│   ├── DESIGN.md               # Source of truth for client design & typography
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Hono Backend API
│   ├── drizzle/                # SQL migration files
│   ├── src/
│   │   ├── app.ts              # Hono app configuration & middleware
│   │   ├── index.ts            # Server entry point
│   │   ├── config/             # Environment validation (env.ts)
│   │   ├── controllers/        # HTTP handlers (auth, health, test)
│   │   ├── db/
│   │   │   ├── schema/         # Drizzle table schemas (10 entities)
│   │   │   └── schema.ts       # Database client
│   │   ├── middlewares/        # asyncHandler, rateLimit, responseHandler, schemaValidator
│   │   ├── routes/             # Route modules (auth, health, test)
│   │   ├── services/           # Business logic (auth, health, test)
│   │   └── types/              # Server envelope & config types
│   ├── .env.sample             # Backend env template
│   ├── drizzle.config.ts       # Drizzle Kit migration config
│   ├── package.json
│   ├── README.md               # Backend specific documentation
│   └── tsconfig.json
│
├── .github/                    # Issue templates and workflows
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md                   # Root documentation
```

---

## Tech Stack

### Client
- **Framework**: [Next.js](https://nextjs.org/) 15.3 (App Router)
- **Library**: [React](https://react.dev/) 19 & TypeScript 5
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 & [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/) (Dropdown Menu, Slot)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) (Light / Dark mode support)

### Server
- **Framework**: [Hono](https://hono.dev/) v4.8 (High-speed edge & Node framework)
- **Runtime**: [Bun](https://bun.sh/) / [Node.js](https://nodejs.org/) with `tsx`
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/) v4
- **Database Driver**: `pg`

---

## Standardized API Response Envelope

Both the frontend API client and the backend server adhere to the standardized response envelope:

```typescript
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string | Array<{ field: string; message: string }> | unknown;
    timestamp: string;
}
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) or **Bun** (latest)
- **npm** or **bun**
- **PostgreSQL** (v14 or higher) for server database operations

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dscnitrourkela/project-xangoes.git
   cd project-xangoes
   ```

2. **Setup Client**:
   ```bash
   cd client
   npm install
   ```

3. **Setup Server**:
   ```bash
   cd ../server
   npm install   # or: bun install
   cp .env.sample .env
   ```
   Configure your `DATABASE_URL` in `server/.env`.

---

## Running the Client

From the `client/` directory:

```bash
# Start Next.js development server with Turbopack (default port: 3000)
npm run dev

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

Access the frontend in your browser at `http://localhost:3000`.

---

## Running the Server

From the `server/` directory:

```bash
# Run with hot-reloading (using Bun)
bun run dev

# Or run with Node/tsx
npx tsx watch src/index.ts
```

Server endpoints are available at `http://localhost:5000` (or your configured `PORT`).

---

## Available Scripts

### Client (`client/package.json`)
| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev --turbopack` | Starts client development server |
| `build` | `next build` | Compiles optimized static & dynamic production build |
| `start` | `next start` | Runs the compiled Next.js production build |
| `lint` | `next lint` | Executes ESLint across all files |

### Server (`server/package.json`)
| Script | Command | Purpose |
|---|---|---|
| `dev` | `bun run --hot src/index.ts` | Starts backend development server with hot-reloading |
| `db:generate` | `bunx drizzle-kit generate` | Generates SQL migrations from Drizzle schemas |
| `db:migrate` | `bunx drizzle-kit migrate` | Applies SQL migrations to the PostgreSQL database |
| `db:studio` | `bunx drizzle-kit studio` | Opens Drizzle Studio browser interface |

---

## Environment Variables

### Client (`client/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Optional | `""` (relative `/api`) | Backend base URL (e.g. `http://localhost:5000`) |

### Server (`server/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port for the HTTP server |
| `DATABASE_URL` | Required | N/A | PostgreSQL connection string |
| `RATE_LIMIT` | Optional | `100` | Max requests allowed per rate limit window |
| `RATE_LIMIT_WINDOW` | Optional | `60` | Duration of rate limiting window in seconds |

---

## API Endpoints Summary

| Method | Endpoint | Description | Validation Target |
|---|---|---|---|
| `GET` | `/` | Root server status | None |
| `GET` | `/health` | Basic health check | None |
| `GET` | `/health/detailed` | Detailed uptime & memory | None |
| `POST` | `/auth/login` | User authentication | Body (`loginValidatorSchema`) |
| `POST` | `/auth/sign-up` | User registration | Body (`signUpValidatorSchema`) |
| `GET` | `/auth/me` | Authenticated session check | Header (`Authorization: Bearer <token>`) |
| `GET` | `/test` | Test endpoints documentation | None |
| `POST` | `/test/users` | Test user creation | Body (`createUserSchema`) |
| `GET` | `/test/users` | Test users listing with pagination | Query (`getUserQuerySchema`) |
| `GET` | `/test/users/:id` | Test user lookup by UUID | Params (`userParamsSchema`) |
| `PUT` | `/test/users/:id` | Test user update | Params + Body |

---

## Design Guidelines

The frontend strictly implements the design specifications in [`client/DESIGN.md`](client/DESIGN.md):
- **Typography Stack**: Geist Sans (`font-geist`) as default sans, Inter (`font-inter`), and mono for code.
- **Theme Variables**: OKLCH color palette with automatic Light / Dark theme transitions.
- **Spacing**: Container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, `space-y-8` between sections.
- **Focus Rings**: `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`.
- **Accessibility**: Full keyboard accessibility, semantic headings, and ARIA labels.

---

## Contributing

Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) for contribution guidelines and project standards.

---

## License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.
