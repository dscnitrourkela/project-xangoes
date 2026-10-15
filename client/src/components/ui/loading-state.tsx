import * as React from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
    description?: string;
    minHeight?: string;
}

function LoadingState({
    className,
    message = "Loading...",
    description,
    minHeight = "min-h-[200px]",
    ...props
}: LoadingStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 text-center",
                minHeight,
                className
            )}
            {...props}
        >
            <Spinner size="lg" className="mb-4" />
            <p className="text-sm font-medium text-foreground">{message}</p>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

export { LoadingState };
