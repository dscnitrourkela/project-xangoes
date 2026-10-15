import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
    htmlFor?: string;
    required?: boolean;
    description?: string;
    error?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
    ({ className, label, htmlFor, required, description, error, children, ...props }, ref) => {
        const generatedId = React.useId();
        const id = htmlFor || generatedId;

        return (
            <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
                {label && (
                    <Label htmlFor={id} required={required}>
                        {label}
                    </Label>
                )}
                {/* Clone child if it is a single valid React element to inject id and error */}
                {React.isValidElement(children)
                    ? React.cloneElement(children as React.ReactElement<{ id?: string; error?: boolean }>, {
                          id: (children.props as { id?: string }).id || id,
                          error: Boolean(error) || (children.props as { error?: boolean }).error,
                      })
                    : children}
                {description && !error && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
                {error && (
                    <p className="text-xs font-medium text-destructive">{error}</p>
                )}
            </div>
        );
    }
);
FormField.displayName = "FormField";

export { FormField };
