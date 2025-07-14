# Project Xangoes - Client

A high-performance, scalable Next.js-based client application built with TypeScript, designed to provide a seamless user interface for college fest management systems with modern development practices.

## Table of Contents

- [About The Client](#about-the-client)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Built With](#built-with)
- [Client Flow & Architecture](#client-flow--architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running the Client](#running-the-client)
- [Development Guidelines](#development-guidelines)
- [API Integration](#api-integration)
- [License](#license)
- [DSC NIT Rourkela](#dsc-nit-rourkela)
- [Starware](#starware)

## About The Client

The Project Xangoes client is a modern, responsive Next.js application built with TypeScript. It serves as the frontend interface for the college fest management system, providing an intuitive user experience, server-side rendering, and scalable UI components suitable for production use.  
_Last updated at 01:28 PM IST on Monday, July 14, 2025._

## Key Features

- **Server-side rendering (SSR)** and **static site generation (SSG)** with Next.js
- **Responsive design** for desktop and mobile devices
- **Global CSS** with Tailwind CSS
- **Dynamic page routing** with Next.js
- **Type-safe development** with TypeScript
- **Comprehensive testing** and **CI/CD readiness**

## Architecture Overview

The client follows a Next.js-based architecture pattern optimized for production:

- **App Layer**: Next.js app directory for page routing
- **Public Layer**: Static assets and favicon
- **Components Layer**: Reusable UI components
- **Hooks Layer**: Custom React hooks for logic
- **Context Layer**: Global state management
- **Utils Layer**: Utility functions and helpers
- **Assets Layer**: Static files like images and fonts
- **Config Layer**: Environment and configuration files
- **Tests Layer**: Unit and integration tests
- **Playground Layer**: Dedicated space for testing components
- **Type System**: Comprehensive TypeScript types

## Directory Structure

```
client/
├── public/
│   ├── favicon.ico
│   ├── client-logo.png  # Logo and other static assets
├── src/
│   ├── app/
│   │   ├── page.tsx  # Homepage
│   │   ├── events/  # Nested routes for events
│   │   │   ├── page.tsx  # Events page
│   │   │   └── [eventId]/  # Dynamic route for event details
│   │   │       └── page.tsx  # Event detail page
│   │   ├── auth/  # Authentication routes
│   │   │   ├── login/  # Login page
│   │   │   └── page.tsx  # Login page
│   │   ├── profile/  # Profile routes
│   │   │   └── page.tsx  # Profile page
│   │   └── playground/  # Dedicated space for testing components
│   │       ├── TestComponent1.tsx  # Example test component
│   │       └── TestComponent2.tsx  # Another test component
│   ├── assets/  # Static assets like images and fonts
│   │   ├── images/  # Image files
│   │   └── fonts/  # Font files
│   ├── components/  # Reusable UI components
│   │   ├── Header.tsx  # Navigation header
│   │   ├── Footer.tsx  # Page footer
│   │   └── EventCard.tsx  # Event display card
│   ├── config/  # Configuration files
│   │   ├── env.ts  # Environment variable validation
│   │   └── constants.ts  # Application constants
│   ├── context/  # Context providers
│   │   ├── AuthContext.tsx  # Authentication context
│   │   └── EventContext.tsx  # Events context
│   ├── hooks/  # Custom React hooks
│   │   ├── useAuth.ts  # Authentication hook
│   │   └── useEvents.ts  # Events data hook
│   ├── types/  # TypeScript type definitions
│   │   ├── auth.types.ts  # Authentication types
│   │   └── event.types.ts  # Event types
│   ├── utils/  # Utility functions
│   │   ├── api.ts  # API client utilities
│   │   └── format.ts  # Data formatting utilities
│   ├── tests/  # Test files
│   │   ├── unit/  # Unit tests
│   │   ├── integration/  # Integration tests
│   │   └── setup.ts  # Test setup
├── globals.css  # Global CSS styles
├── .gitignore  # Git ignore patterns
├── yarn.lock  # Yarn lockfile
├── eslint.config.mjs  # ESLint configuration
├── next.config.ts  # Next.js configuration
├── package.json  # Project dependencies and scripts
├── postcss.config.mjs  # PostCSS configuration
├── README.md  # Project documentation
├── tsconfig.json  # TypeScript configuration
├── .env  # Environment variables (GIT-IGNORED)
```

## Built With

### Framework & Libraries

- **Next.js** - React framework with SSR and SSG
- **TypeScript** - Type-safe frontend development
- **Tailwind CSS** - Utility-first CSS framework

### Build Tools

- **Yarn** - Package manager
- **ESLint** - JavaScript linting
- **PostCSS** - CSS processing
- **Jest** - Testing framework (optional)

## Client Flow & Architecture

The client implements a Next.js-based architecture with a production-ready flow.

### Request-Response Flow

```
User Request
↓
Route Matching (Next.js)
↓
Page Component Load (SSR/SSG)
↓
API Data Fetch (if needed)
↓
UI Render
↓
Performance Monitoring
```

### Architecture Layers

```
Public → App (Page/Playground) → Components → Hooks → Context → Utils → Tests → Render
```

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **Yarn** (latest version)
- **Git** - Version control

### Installation & Setup

1. **Navigate to Client Directory**

   ```bash
   cd client
   ```

2. **Install Dependencies**

   ```bash
   # Install using Yarn
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `client` directory (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5000`).

### Running the Client

#### Development Mode

```bash
# Start development server with hot reload
yarn dev
```

#### Build for Production

```bash
# Build the application
yarn build

# Start production server
yarn start
```

#### Client Information

- **Development URL**: `http://localhost:3000` (default Next.js port)
- Access via browser after running the development server

## Development Guidelines

### 🎯 Architecture Pattern

When adding new features, follow this Next.js flow:

- **App Layer** (`src/app/`) - Define pages and playground for testing
- **Components** (`src/components/`) - Reusable UI elements
- **Hooks** (`src/hooks/`) - Business logic
- **Context** (`src/context/`) - Global state
- **Utils** (`src/utils/`) - Helper functions
- **Tests** (`src/tests/`) - Add unit and integration tests

### 🔄 Data Flow Pattern

```
Request → Route Match → Page/Playground → Component → Hook → Context → Utils → Render
```

### ✅ Best Practices

| ✅ **DO**                      | ❌ **DON'T**                  |
| ------------------------------ | ----------------------------- |
| Use Next.js file-based routing | Manually define routes        |
| Leverage SSR/SSG               | Skip server-side rendering    |
| Validate props with TypeScript | Skip prop types               |
| Use Tailwind for styling       | Use inline styles excessively |
| Write tests for critical logic | Skip testing                  |
| Follow naming conventions      | Use inconsistent naming       |

### 🏷️ Naming Conventions

- **Pages**: `page.tsx` (e.g., `src/app/page.tsx`)
- **Folders**: `name*.tsx` (e.g., `contact-form`)
- **Components**: `*.tsx` (e.g., `Header.tsx`, `FormInput.tsx`)
- **Hooks**: `use*.ts` (e.g., `useAuth.ts`)
- **Context**: `*.tsx` (e.g., `AuthContext.tsx`)
- **Types**: `*.types.ts` (e.g., `auth.types.ts`)
- **Tests**: `*.test.ts` (e.g., `useAuth.test.ts`)

### 📚 Learning from Examples

Study the `src/app` and `src/components` directories:

- **Page**: `src/app/page.tsx` - Homepage component
- **Playground**: `src/app/playground/page.tsx` - Example test playground
- **Component**: `src/components/Header.tsx` - Reusable header
- **Test**: `src/tests/unit/Header.test.ts` - Unit test example

## API Integration

The client integrates with the Project Xangoes backend API. Use Next.js API routes or fetch utilities. Example:

```typescript
// src/utils/api.ts
export async function getEvents() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
  return response.json();
}
```

Ensure all API calls are type-safe and handle errors appropriately.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## DSC NIT Rourkela

Developed by DSC NIT Rourkela.

## Starware

This project is **Starware**. This means you're free to use the project, as long as you star its GitHub repository. Your appreciation makes us grow and glow up. ⭐
