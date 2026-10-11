import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { H1, Muted } from "@/components/ui/typography";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
}

function PageHeader({
    className,
    title,
    description,
    breadcrumbs,
    actions,
    ...props
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between",
                className
            )}
            {...props}
        >
            <div className="space-y-1.5">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center space-x-1 text-xs text-muted-foreground mb-2"
                    >
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={idx}>
                                    {crumb.href && !isLast ? (
                                        <Link
                                            href={crumb.href}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span
                                            className={cn(
                                                isLast && "font-medium text-foreground"
                                            )}
                                        >
                                            {crumb.label}
                                        </span>
                                    )}
                                    {!isLast && (
                                        <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </nav>
                )}
                <H1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    {title}
                </H1>
                {description && (
                    <Muted className="text-sm">{description}</Muted>
                )}
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                    {actions}
                </div>
            )}
        </div>
    );
}

export { PageHeader };
