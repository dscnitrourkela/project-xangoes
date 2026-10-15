import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin text-muted-foreground", {
    variants: {
        size: {
            sm: "h-4 w-4",
            default: "h-6 w-6",
            lg: "h-8 w-8",
            xl: "h-12 w-12",
        },
        variant: {
            default: "text-primary",
            muted: "text-muted-foreground",
            white: "text-white",
        },
    },
    defaultVariants: {
        size: "default",
        variant: "default",
    },
});

export interface SpinnerProps
    extends React.HTMLAttributes<SVGSVGElement>,
        VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, variant, ...props }: SpinnerProps) {
    return (
        <Loader2
            className={cn(spinnerVariants({ size, variant, className }))}
            {...props}
        />
    );
}

export { Spinner, spinnerVariants };
