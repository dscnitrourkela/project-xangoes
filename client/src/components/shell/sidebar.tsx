"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Navigation, type NavGroup } from "@/components/shell/navigation";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
    groups: NavGroup[];
    header?: React.ReactNode;
    footer?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
}

function Sidebar({
    groups,
    header,
    footer,
    isOpen = false,
    onClose,
    className,
    ...props
}: SidebarProps) {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity md:hidden"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out md:static md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    className
                )}
                {...props}
            >
                {header && (
                    <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
                        {header}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <Navigation groups={groups} onItemClick={onClose} />
                </div>

                {footer && (
                    <div className="border-t border-sidebar-border p-3">
                        {footer}
                    </div>
                )}
            </aside>
        </>
    );
}

export { Sidebar };
