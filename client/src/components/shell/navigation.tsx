"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface NavItem {
    label: string;
    href: string;
    icon?: LucideIcon;
    badge?: string | number;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
    active?: boolean;
}

export interface NavGroup {
    title?: string;
    items: NavItem[];
}

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
    groups: NavGroup[];
    onItemClick?: () => void;
}

function Navigation({
    groups,
    className,
    onItemClick,
    ...props
}: NavigationProps) {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main Navigation"
            className={cn("space-y-6", className)}
            {...props}
        >
            {groups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1.5">
                    {group.title && (
                        <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {group.title}
                        </h4>
                    )}
                    <ul className="space-y-1">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.active !== undefined
                                    ? item.active
                                    : pathname === item.href ||
                                      (item.href !== "/" && pathname?.startsWith(item.href));

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onItemClick}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-accent text-accent-foreground font-semibold"
                                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                                        <span className="flex-1 truncate">{item.label}</span>
                                        {item.badge !== undefined && (
                                            <Badge
                                                variant={item.badgeVariant || "secondary"}
                                                className="ml-auto text-[10px] px-1.5 py-0"
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

export { Navigation };
