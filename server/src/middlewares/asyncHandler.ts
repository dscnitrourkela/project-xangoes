import { Context } from 'hono';

import { ApiResponse } from '@/types';

/**
 * Async handler wrapper to eliminate try-catch blocks in route handlers
 * @param fn - Async function to be wrapped
 * @returns Wrapped function that handles errors automatically
 */
export const asyncHandler = (fn: (c: Context) => Promise<Response | void>) => {
    return async (c: Context): Promise<Response> => {
        try {
            const result = await fn(c);
            return (
                result ||
                c.json({ success: false, message: "No response" }, 500)
            );
        } catch (error: unknown) {
            console.error("AsyncHandler Error:", error);

            // Handle different types of errors
            if (error instanceof CustomError) {
                return c.json(
                    {
                        success: false,
                        message: error.message,
                        error: error.details,
                        timestamp: new Date().toISOString(),
                    } as ApiResponse,
                    error.statusCode as any
                );
            }

            // Handle validation errors
            if (error instanceof Error && error.name === "ValidationError") {
                return c.json(
                    {
                        success: false,
                        message: "Validation failed",
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    } as ApiResponse,
                    400
                );
            }

            // Handle generic errors
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            return c.json(
                {
                    success: false,
                    message: "Internal server error",
                    error:
                        process.env.NODE_ENV === "development"
                            ? errorMessage
                            : "Something went wrong",
                    timestamp: new Date().toISOString(),
                } as ApiResponse,
                500
            );
        }
    };
};

/**
 * Custom error class for structured error handling
 */
export class CustomError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message);
        this.name = "CustomError";
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Common error constructors for convenience
 */
export const createError = {
    badRequest: (message: string = "Bad Request", details?: any) =>
        new CustomError(message, 400, details),

    unauthorized: (message: string = "Unauthorized", details?: any) =>
        new CustomError(message, 401, details),

    forbidden: (message: string = "Forbidden", details?: any) =>
        new CustomError(message, 403, details),

    notFound: (message: string = "Not Found", details?: any) =>
        new CustomError(message, 404, details),

    conflict: (message: string = "Conflict", details?: any) =>
        new CustomError(message, 409, details),

    internal: (message: string = "Internal Server Error", details?: any) =>
        new CustomError(message, 500, details),
};
