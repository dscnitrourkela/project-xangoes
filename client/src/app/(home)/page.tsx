"use client";

import Link from "next/link";
import { LogIn, UserPlus, LayoutDashboard } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { H1, Lead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function Home() {
    const { user, role, isAuthenticated } = useAuth();

    return (
        <AppShell>
            <div className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <H1>Project Xangoes</H1>
                    <Lead>
                        College fest and event management platform.
                    </Lead>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                        {isAuthenticated ? (
                            <>
                                {role === "admin" || role === "super_admin" ? (
                                    <Button asChild size="lg">
                                        <Link href="/admin" className="flex items-center gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Admin Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Signed in as <span className="font-medium text-foreground">{user?.name}</span> ({user?.email})
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <Button asChild size="lg">
                                    <Link href="/login" className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Sign in
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <Link href="/sign-up" className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Create Account
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
