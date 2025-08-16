# Design Schema

## Overview

A modern, dashboard design system built with shadcn/ui components. The design maintains a clean, professional aesthetic and with minimal and organized approach.

## Typography System

### Primary Font Stack

-   **Default Sans**: `font-geist` (Geist Sans)
-   **Monospace**: `font-mono` (for code blocks, inline code)
-   **Fallback**: `font-sans` (system fallback)

### Typography Hierarchy

Following your existing typography components with Geist Sans as the primary font:

#### Headings

-   **H1**: `text-4xl lg:text-5xl font-extrabold tracking-tight` - Main page titles
-   **H2**: `text-3xl font-semibold tracking-tight border-b pb-2` - Section headers
-   **H3**: `text-2xl font-semibold tracking-tight` - Subsection headers
-   **H4**: `text-xl font-semibold tracking-tight` - Component headers

#### Body Text

-   **Paragraph**: `leading-7 [&:not(:first-child)]:mt-6` - Main content
-   **Lead**: `text-xl text-muted-foreground` - Introduction text
-   **Large**: `text-lg font-semibold` - Emphasized content
-   **Small**: `text-sm font-medium leading-none` - Metadata, labels
-   **Muted**: `text-sm text-muted-foreground` - Secondary information

## Color Palette

### Light Theme (Primary)

```css
/* Base Colors */
--background: 0 0% 100%           /* #ffffff - Main background */
--foreground: 0 0% 9%             /* #171717 - Primary text */

/* Muted Colors */
--muted: 0 0% 96.1%               /* #f5f5f5 - Subtle backgrounds */
--muted-foreground: 0 0% 45.1%    /* #737373 - Secondary text */

/* Card & Surfaces */
--card: 0 0% 100%                 /* #ffffff - Card backgrounds */
--card-foreground: 0 0% 9%        /* #171717 - Card text */

/* Borders */
--border: 0 0% 89.8%              /* #e5e5e5 - Default borders */
--input: 0 0% 89.8%               /* #e5e5e5 - Input borders */

/* Accents */
--accent: 0 0% 96.1%              /* #f5f5f5 - Subtle accents */
--accent-foreground: 0 0% 9%      /* #171717 - Accent text */

/* Primary Actions */
--primary: 0 0% 9%                /* #171717 - Primary buttons */
--primary-foreground: 0 0% 98%    /* #fafafa - Primary button text */

/* Secondary Actions */
--secondary: 0 0% 96.1%           /* #f5f5f5 - Secondary buttons */
--secondary-foreground: 0 0% 9%   /* #171717 - Secondary button text */
```

### Dark Theme (Alternative)

```css
/* Base Colors */
--background: 0 0% 3.9%           /* #0a0a0a - Main background */
--foreground: 0 0% 98%            /* #fafafa - Primary text */

/* Muted Colors */
--muted: 0 0% 14.9%               /* #262626 - Subtle backgrounds */
--muted-foreground: 0 0% 63.9%    /* #a3a3a3 - Secondary text */

/* Card & Surfaces */
--card: 0 0% 3.9%                 /* #0a0a0a - Card backgrounds */
--card-foreground: 0 0% 98%       /* #fafafa - Card text */

/* Borders */
--border: 0 0% 14.9%              /* #262626 - Default borders */
--input: 0 0% 14.9%               /* #262626 - Input borders */

/* Accents */
--accent: 0 0% 14.9%              /* #262626 - Subtle accents */
--accent-foreground: 0 0% 98%     /* #fafafa - Accent text */

/* Primary Actions */
--primary: 0 0% 98%               /* #fafafa - Primary buttons */
--primary-foreground: 0 0% 9%     /* #171717 - Primary button text */

/* Secondary Actions */
--secondary: 0 0% 14.9%           /* #262626 - Secondary buttons */
--secondary-foreground: 0 0% 98%  /* #fafafa - Secondary button text */
```

### Semantic Colors

-   **Success**: `hsl(142, 76%, 36%)` - Green for positive actions
-   **Warning**: `hsl(38, 92%, 50%)` - Orange for warnings
-   **Error**: `hsl(0, 84%, 60%)` - Red for errors
-   **Info**: `hsl(217, 91%, 60%)` - Blue for information

## Layout Structure

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo + Navigation + User Menu                      │
├─────────────────────────────────────────────────────────────┤
│ Sidebar │ Main Content Area                                 │
│         │                                                   │
│ Nav     │ ┌─────────────────────────────────────────────┐   │
│ Items   │ │ Content Sections                             │
│         │ │ ┌─────┐ ┌─────┐ ┌─────┐                     │   │
│         │ │ │Card1│ │Card2│ │Card3│                     │   │
│         │ │ └─────┘ └─────┘ └─────┘                     │   │
│         │ │ ┌─────────────────────────┐                   │   │
│         │ │ │     Main Content        │                   │   │
│         │ │ │                         │                   │   │
│         │ │ └─────────────────────────┘                   │   │
│         │ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
│ Footer: Simple Footer Content                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Spacing

-   **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
-   **Section spacing**: `space-y-8` (2rem between sections)
-   **Component spacing**: `space-y-4` (1rem between components)
-   **Element spacing**: `space-y-2` (0.5rem between elements)

## Basic Layout Components

### 1. Simple Card Layout

Basic card structure for content:

```jsx
// Simple Card Component
<div className="bg-card border border-border rounded-lg p-4">
    <H4>Card Title</H4>
    <Paragraph className="text-muted-foreground">Card content</Paragraph>
</div>
```

### 2. Grid Layout

Simple responsive grid for organizing content:

```jsx
// Basic Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="bg-card border border-border rounded-lg p-4">
        <H4>Content 1</H4>
        <Paragraph>Description</Paragraph>
    </div>
    <div className="bg-card border border-border rounded-lg p-4">
        <H4>Content 2</H4>
        <Paragraph>Description</Paragraph>
    </div>
    <div className="bg-card border border-border rounded-lg p-4">
        <H4>Content 3</H4>
        <Paragraph>Description</Paragraph>
    </div>
</div>
```

### 3. Simple Footer

Basic footer structure:

```jsx
// Simple Footer
<footer className="border-t border-border bg-muted/40">
    <div className="container mx-auto px-4 py-8">
        <div className="text-center">
            <p className="text-muted-foreground">Dashboard Footer</p>
        </div>
    </div>
</footer>
```

## Basic Dashboard Structure

### 1. Header Section

-   **Layout**: Simple horizontal bar with logo and basic controls
-   **Features**: Logo, navigation menu, user profile
-   **Style**: Clean border and minimal background

### 2. Navigation

-   **Layout**: Basic sidebar or top navigation
-   **Items**: Main menu items (to be defined)
-   **Style**: Simple list with hover states

### 3. Main Content Area

-   **Layout**: Clean, organized content sections
-   **Content**: Basic cards and content blocks
-   **Style**: Simple borders and spacing

### 4. Footer

-   **Layout**: Basic footer with minimal content
-   **Content**: Simple branding or links
-   **Style**: Clean border and subtle background

## Interactive States

### Hover States

-   **Cards**: `hover:bg-accent/50 transition-colors duration-200`
-   **Buttons**: Built-in shadcn hover states
-   **Links**: `hover:text-primary transition-colors duration-200`

### Focus States

-   **Interactive elements**: `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`

### Active States

-   **Navigation**: `bg-accent text-accent-foreground`
-   **Tabs**: `border-b-2 border-primary`

## Responsive Design

### Breakpoints

-   **Mobile**: `sm:` (640px+)
-   **Tablet**: `md:` (768px+)
-   **Desktop**: `lg:` (1024px+)
-   **Large Desktop**: `xl:` (1280px+)

### Mobile Adaptations

-   Collapsible sidebar with hamburger menu
-   Stack bento grid cards vertically on mobile
-   Reduce padding and font sizes appropriately
-   Touch-friendly button sizes (min 44px)

## Accessibility

### Color Contrast

-   Focus indicators clearly visible
-   Interactive elements have sufficient contrast

### Typography

-   Minimum font size: 14px (0.875rem)
-   Line height: 1.5 minimum for body text
-   Proper heading hierarchy maintained

### UI Components

-   **shadcn/ui**: Base component library
-   **Basic CSS**: Standard styling and transitions

## Implementation Guidelines

### CSS Variables

Use CSS custom properties for theme values:

```css
:root {
    --font-geist: "Geist Sans", var(--font-sans);
}

.font-geist {
    font-family: var(--font-geist);
}
```

### Component Consistency

-   Always use typography components instead of raw HTML
-   Maintain consistent spacing with Tailwind space utilities
-   Use shadcn component variants for consistent styling
-   Keep layouts simple and organized

### Performance

-   Use proper semantic HTML for better accessibility
-   Optimize font loading with `font-display: swap`
-   Keep transitions simple and lightweight

### Theme Switching

-   Smooth transitions between light and dark themes
-   Persistent theme preference storage
-   System theme detection and auto-switching

### Animation System

-   Consistent animation durations (200ms, 300ms, 500ms)
-   Easing functions for smooth transitions
-   Reduced motion support for accessibility
