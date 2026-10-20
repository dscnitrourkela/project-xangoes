"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calendar,
    CreditCard,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Sparkles,
    Users,
    X,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    open: boolean;
    onClose: () => void;
}

export const ADMIN_NAV_ITEMS = [
    {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: "Fests",
        href: "/admin/fests",
        icon: Sparkles,
        description: "Manage festivals & societies",
    },
    {
        label: "Events",
        href: "/admin/events",
        icon: Calendar,
        description: "Competitions & activities",
    },
    {
        label: "Registrations",
        href: "/admin/registrations",
        icon: Users,
        description: "Participant and team entries",
    },
    {
        label: "Transactions",
        href: "/admin/transactions",
        icon: CreditCard,
        description: "Payments and verification",
    },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user, role, logout } = useAuth();

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Brand Header */}
                <div className="flex h-16 items-center justify-between border-b border-border px-6">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-85 transition-opacity"
                    >
                        <span className="bg-primary text-primary-foreground h-8 w-8 rounded-md flex items-center justify-center font-extrabold text-sm shadow-sm">
                            PX
                        </span>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none">Project Xangoes</span>
                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5">Admin Console</span>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Current User Quick Info */}
                {user && (
                    <div className="px-6 py-4 border-b border-border bg-muted/20">
                        <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge
                                variant={role === "super_admin" ? "destructive" : "info"}
                                className="text-[10px] px-1.5 py-0 capitalize"
                            >
                                {role.replace("_", " ")}
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <p className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">
                        Admin Navigation
                    </p>

                    {ADMIN_NAV_ITEMS.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                                    isActive
                                        ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer Controls: Back to App and Logout */}
                <div className="border-t border-border p-4 space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/">
                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                            Return to Public Site
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                        <LogOut className="mr-2 h-3.5 w-3.5" />
                        Log out
                    </Button>
                </div>
            </aside>
        </>
    );
}
