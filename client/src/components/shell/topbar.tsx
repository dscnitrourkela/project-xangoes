"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface UserProfile {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
}

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
    appName?: string;
    logo?: React.ReactNode;
    user?: UserProfile;
    isMobileOpen?: boolean;
    onMobileToggle?: () => void;
    onSignOut?: () => void;
    centerContent?: React.ReactNode;
    rightContent?: React.ReactNode;
}

function Topbar({
    className,
    appName = "Project Xangoes",
    logo,
    user,
    isMobileOpen,
    onMobileToggle,
    onSignOut,
    centerContent,
    rightContent,
    ...props
}: TopbarProps) {
    const initials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    return (
        <header
            className={cn(
                "sticky top-0 z-40 flex h-16 w-full items-center border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-3">
                {onMobileToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onMobileToggle}
                        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                )}

                <Link href="/" className="flex items-center gap-2.5 font-bold">
                    {logo || (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-sm shadow-xs">
                            X
                        </div>
                    )}
                    <span className="text-lg font-bold tracking-tight">{appName}</span>
                </Link>
            </div>

            {centerContent && (
                <div className="mx-4 hidden flex-1 md:flex justify-center max-w-md">
                    {centerContent}
                </div>
            )}

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {rightContent}

                <ThemeToggle />

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative flex items-center gap-2 px-2 h-9 rounded-full"
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold ring-1 ring-border">
                                    {initials}
                                </div>
                                <span className="hidden md:inline-block text-xs font-medium max-w-[100px] truncate">
                                    {user.name}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                    {user.role && (
                                        <div className="pt-1">
                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                {user.role}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onSignOut}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}

export { Topbar };
