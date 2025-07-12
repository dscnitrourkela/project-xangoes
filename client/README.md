<p align="center">
  <a href="#">
    <!-- <img src="public/client-logo.png" alt="Logo" width="800"> -->
  </a>

  <h3 align="center">Project Xangoes - Frontend Client</h3>

  <p align="center">
    A modern, responsive frontend application built with Next.js and TypeScript, designed to provide an intuitive user experience for college fest management, event registration, and participant interaction.
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-client">About The Client</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#architecture-overview">Architecture Overview</a></li>
        <li><a href="#project-structure">Project Structure</a></li>
      </ul>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#documentation-status">Documentation Status</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation--setup">Installation & Setup</a></li>
        <li><a href="#running-the-application">Running the Application</a></li>
      </ul>
    </li>
    <li><a href="#development-guidelines">Development Guidelines</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#dsc-nit-rourkela">DSC NIT Rourkela</a></li>
    <li><a href="#starware">Starware</a></li>
  </ol>
</details>

## About The Client

The Project Xangoes frontend client is a modern, responsive web application built with Next.js and TypeScript. It serves as the user-facing interface for the college fest management system, providing an intuitive and engaging experience for students, organizers, and administrators.

### Project Structure

```
client/
├── public/                     # Static assets
│   └── repoCover.png          # Repository cover image
│
├── src/
│   └── app/                   # Next.js App Router
│       ├── globals.css        # Global styles
│       ├── layout.tsx         # Root layout component
│       ├── page.tsx           # Home page
│       └── favicon.ico        # Application favicon
│
├── .next/                     # Next.js build output (auto-generated)
├── node_modules/              # Dependencies (auto-generated)
│
├── package.json               # Project dependencies and scripts
├── next.config.ts             # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.mjs        # PostCSS configuration
├── eslint.config.mjs         # ESLint configuration
├── next-env.d.ts             # Next.js type definitions
└── .gitignore                # Git ignore patterns
```

## Built With

### Core Framework

-   **[Next.js](https://nextjs.org/)** - React framework with App Router for server-side rendering
-   **[React](https://reactjs.org/)** - Frontend library for building user interfaces
-   **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development

### Styling & UI

-   **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
-   **[PostCSS](https://postcss.org/)** - CSS processing and optimization

### Development Tools

-   **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
-   **[ESLint](https://eslint.org/)** - Code linting and style enforcement

### Runtime & Deployment

-   **[Vercel](https://vercel.com/)** - Deployment platform (planned)
-   **[Node.js](https://nodejs.org/)** - JavaScript runtime environment

## Documentation Status

> **📋 Notice**: Comprehensive documentation for the frontend client is currently being developed and will be updated soon.

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

-   **[Bun](https://bun.sh/)** (latest version) - **Required** runtime and package manager
-   **[Node.js](https://nodejs.org/)** (v18 or higher) - JavaScript runtime
-   **[Git](https://git-scm.com/)** - Version control

### Installation & Setup

1. **Navigate to Client Directory**

    ```bash
    cd client
    ```

2. **Install Dependencies**

    ```bash
    # Install using Bun (required)
    bun install
    ```

3. **Environment Configuration**

    Create a `.env.local` file in the client directory using `.env.sample` as a template (when available).

### Running the Application

1. **Development Mode**

    ```bash
    # Start development server with hot reload
    bun run dev
    ```

2. **Production Build**

    ```bash
    # Build the application for production
    bun run build

    # Start production server
    bun run start
    ```

3. **Application Information**
    - Development URL: `http://localhost:3000`
    - Production URL: TBD
    - API Integration: Connects to backend server at `http://localhost:5000`

## Development Guidelines

### 🎯 Development Standards

-   **TypeScript First**: All components and utilities must be properly typed
-   **Component Architecture**: Follow React best practices for component design
-   **Responsive Design**: Mobile-first approach with Tailwind CSS
-   **Performance**: Optimize for Core Web Vitals and user experience
-   **Accessibility**: Follow WCAG guidelines for inclusive design
-   **Code Quality**: Maintain high code quality with ESLint and proper formatting

### 📚 Coming Soon

Detailed development guidelines, coding standards, and best practices will be documented as the application development progresses.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## DSC NIT Rourkela

[![DSC NIT Rourkela][dsc-nitrourkela]](https://dscnitrourkela.org)

## Starware

This project is Starware.
This means you're free to use the project, as long as you star its GitHub repository.
Your appreciation makes us grow and glow up. ⭐

[dsc-nitrourkela]: ./public/repoCover.png
