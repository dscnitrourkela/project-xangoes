"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Topbar, type UserProfile } from "@/components/shell/topbar";
import { Sidebar } from "@/components/shell/sidebar";
import { type NavGroup } from "@/components/shell/navigation";

export interface AppShellProps {
    appName?: string;
    logo?: React.ReactNode;
    user?: UserProfile;
    navGroups?: NavGroup[];
    sidebarHeader?: React.ReactNode;
    sidebarFooter?: React.ReactNode;
    onSignOut?: () => void;
    topbarCenter?: React.ReactNode;
    topbarRight?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

function AppShell({
    appName = "Project Xangoes",
    logo,
    user,
    navGroups = [],
    sidebarHeader,
    sidebarFooter,
    onSignOut,
    topbarCenter,
    topbarRight,
    footer,
    children,
    className,
}: AppShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Topbar
                appName={appName}
                logo={logo}
                user={user}
                isMobileOpen={isMobileMenuOpen}
                onMobileToggle={() => setIsMobileMenuOpen((prev) => !prev)}
                onSignOut={onSignOut}
                centerContent={topbarCenter}
                rightContent={topbarRight}
            />

            <div className="flex flex-1">
                {navGroups.length > 0 && (
                    <Sidebar
                        groups={navGroups}
                        header={sidebarHeader}
                        footer={sidebarFooter}
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <main
                    className={cn(
                        "flex flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 lg:px-8",
                        className
                    )}
                >
                    <div className="mx-auto w-full max-w-7xl flex-1 space-y-8">
                        {children}
                    </div>
                </main>
            </div>

            {footer !== null && (
                <footer className="border-t border-border bg-muted/30 py-6 text-center text-xs text-muted-foreground">
                    {footer || (
                        <p>© {new Date().getFullYear()} {appName}. Built with precision.</p>
                    )}
                </footer>
            )}
        </div>
    );
}

export { AppShell };
