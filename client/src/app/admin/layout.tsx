"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, role, isLoading, isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Role-based route protection: only admin and super_admin may access /admin/*
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || !user) {
                // Not authenticated -> redirect to login with return redirect param
                router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (role !== "admin" && role !== "super_admin") {
                // Authenticated as standard user -> redirect to home
                router.replace("/");
            }
        }
    }, [isLoading, isAuthenticated, user, role, router, pathname]);

    // Keep state clean during initial auth hydration
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium">
                Checking admin permissions...
            </div>
        );
    }

    // Prevent flashing protected content before redirect takes effect
    if (!isAuthenticated || (role !== "admin" && role !== "super_admin")) {
        return null;
    }

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Collapsible Sidebar */}
            <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Admin Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminTopbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
