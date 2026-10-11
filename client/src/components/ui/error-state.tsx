import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    message?: string;
    code?: string | number;
    onRetry?: () => void;
    retryLabel?: string;
    action?: React.ReactNode;
    compact?: boolean;
}

function ErrorState({
    className,
    title = "Something went wrong",
    message = "An unexpected error occurred while loading this content.",
    code,
    onRetry,
    retryLabel = "Try Again",
    action,
    compact = false,
    ...props
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center rounded-lg border border-destructive/20 bg-destructive/5",
                compact ? "p-4 space-y-2" : "p-8 sm:p-12 space-y-4",
                className
            )}
            {...props}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
                {code && (
                    <span className="inline-block rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive mb-1">
                        Error {code}
                    </span>
                )}
                <h4 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>
                    {title}
                </h4>
                {message && (
                    <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2">
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {retryLabel}
                    </Button>
                )}
                {action}
            </div>
        </div>
    );
}

export { ErrorState };
