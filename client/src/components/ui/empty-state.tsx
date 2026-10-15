import * as React from "react";
import { FolderSearch, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon | React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    compact?: boolean;
}

function EmptyState({
    className,
    icon: Icon = FolderSearch,
    title,
    description,
    action,
    compact = false,
    ...props
}: EmptyStateProps) {
    const renderIcon = () => {
        if (!Icon) return null;
        if (React.isValidElement(Icon)) return Icon;
        const IconComponent = Icon as LucideIcon;
        return (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconComponent className="h-6 w-6" />
            </div>
        );
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                compact ? "p-4 space-y-2" : "p-8 sm:p-12 space-y-4",
                className
            )}
            {...props}
        >
            {renderIcon()}
            <div className="space-y-1">
                <h4 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>
                    {title}
                </h4>
                {description && (
                    <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {action && <div className="pt-2">{action}</div>}
        </div>
    );
}

export { EmptyState };
