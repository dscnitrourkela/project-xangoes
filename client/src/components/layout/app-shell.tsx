"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Compass,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    Shield,
    UserCheck,
    UserPlus,
    X,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * =============================================================================
 * Role-Aware Navigation Configuration
 * =============================================================================
 * Logged-out users: See only Home, Sign in, and Create Account.
 * Regular users: See Home and User account controls.
 * Admin users: See Home, Admin Dashboard link, and Admin controls.
 * (Typography and Playground are dev pages and excluded from public navigation).
 */
export interface NavItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
    guest: [
        { label: "Home", href: "/", icon: Compass },
    ],
    user: [
        { label: "Home", href: "/", icon: Compass },
    ],
    admin: [
        { label: "Home", href: "/", icon: Compass },
        { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
    super_admin: [
        { label: "Home", href: "/", icon: Compass },
        { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
};

export interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const pathname = usePathname();
    const { user, role, isAuthenticated, logout, setRole } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.guest;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-6">
                            <Link
                                href="/"
                                className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-85 transition-opacity"
                            >
                                <span className="bg-primary text-primary-foreground h-8 w-8 rounded-md flex items-center justify-center font-extrabold text-sm shadow-sm">
                                    PX
                                </span>
                                <span>Project Xangoes</span>
                            </Link>

                            {/* Desktop Navigation Links (Role-Aware) */}
                            <nav className="hidden md:flex items-center space-x-1">
                                {navItems.map((item) => {
                                    const isActive =
                                        item.href === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1.5",
                                                isActive
                                                    ? "bg-accent text-accent-foreground font-semibold"
                                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                            )}
                                        >
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right Controls: Single ThemeToggle + Role-Aware Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <ThemeToggle />

                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-2">
                                    {/* Role Badge Indicator */}
                                    <Badge
                                        variant={
                                            role === "super_admin"
                                                ? "destructive"
                                                : role === "admin"
                                                ? "info"
                                                : "secondary"
                                        }
                                        className="capitalize font-mono text-xs"
                                    >
                                        {role.replace("_", " ")}
                                    </Badge>

                                    {/* User Dropdown Menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 font-medium"
                                                aria-label="User account menu"
                                            >
                                                <UserCheck className="h-4 w-4" />
                                                <span className="max-w-[120px] truncate">{user.name}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground leading-none">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />

                                            {/* Admin Dashboard shortcut visible ONLY for admin / super_admin */}
                                            {(role === "admin" || role === "super_admin") && (
                                                <DropdownMenuItem asChild>
                                                    <Link href="/admin" className="cursor-pointer">
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        <span>Admin Dashboard</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}

                                            {/* Role preview switcher stub (for local developer testing since server has no auth routes) */}
                                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground pt-2">
                                                Switch Role Stub
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => setRole("user")}
                                                className={role === "user" ? "font-bold" : ""}
                                            >
                                                Participant (User)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setRole("admin")}
                                                className={role === "admin" ? "font-bold" : ""}
                                            >
                                                Organizer (Admin)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setRole("super_admin")}
                                                className={role === "super_admin" ? "font-bold" : ""}
                                            >
                                                Authority (Super Admin)
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={logout}
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Log out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/login" className="flex items-center gap-1.5">
                                            <LogIn className="h-4 w-4" />
                                            <span>Sign in</span>
                                        </Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href="/sign-up" className="flex items-center gap-1.5">
                                            <UserPlus className="h-4 w-4" />
                                            <span>Create Account</span>
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Menu Toggle Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <ThemeToggle />
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle navigation menu"
                                aria-expanded={mobileMenuOpen}
                                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Menu className="h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3">
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === "/"
                                        ? pathname === "/"
                                        : pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium",
                                            isActive
                                                ? "bg-accent text-accent-foreground font-semibold"
                                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-4 border-t border-border space-y-2">
                            {isAuthenticated && user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-3 py-2 bg-muted/40 rounded-md">
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {role.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-destructive justify-center"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" asChild size="sm">
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                            Sign in
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                            Create Account
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1">{children}</main>

            {/* Minimal Footer (no dev links, no admin links) */}
            <footer className="border-t border-border bg-muted/40 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Project Xangoes &bull; DSC NIT Rourkela
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
