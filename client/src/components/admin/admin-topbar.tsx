"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, UserCheck } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminTopbarProps {
    onMenuToggle: () => void;
}

export function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
    const pathname = usePathname();
    const { user, role, logout, setRole } = useAuth();

    // Map pathname to breadcrumb label
    const getPageTitle = () => {
        if (pathname === "/admin") return "Overview";
        if (pathname.startsWith("/admin/fests")) return "Fests Management";
        if (pathname.startsWith("/admin/events")) return "Events Management";
        if (pathname.startsWith("/admin/registrations")) return "Registrations";
        if (pathname.startsWith("/admin/transactions")) return "Transactions";
        return "Admin Console";
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            {/* Left: Mobile hamburger toggle & Breadcrumb */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    aria-label="Open sidebar"
                    className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent lg:hidden focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 text-sm">
                    <Link
                        href="/admin"
                        className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                        Admin
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-foreground">{getPageTitle()}</span>
                </div>
            </div>

            {/* Right: Controls & User Menu */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Role Switcher dropdown for quick testing */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5 h-8 text-xs">
                            <Shield className="h-3.5 w-3.5" />
                            <span className="capitalize">{role.replace("_", " ")}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">Preview Role</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setRole("admin")}>
                            Admin (Fest Lead)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRole("super_admin")}>
                            Super Admin (Authority)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRole("user")}>
                            Switch to User (Locks Admin)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Menu */}
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 h-9 px-2.5"
                                aria-label="Admin account menu"
                            >
                                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden md:inline-block max-w-[100px] truncate text-xs font-medium">
                                    {user.name}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] w-fit capitalize font-mono mt-1"
                                    >
                                        {role.replace("_", " ")}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/" className="cursor-pointer">
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    <span>Main Site</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
