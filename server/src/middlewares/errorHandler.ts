import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { ApiResponse } from '@/types';

import { CustomError } from './asyncHandler';

function getRequestId(c: Context): string | undefined {
    try {
        return c.get('requestId') || c.req.header('x-request-id');
    } catch {
        return undefined;
    }
}

/**
 * Global error handler middleware for Hono
 * This should be used as the last middleware to catch any unhandled errors
 */
export const errorHandler = (error: Error, c: Context): Response => {
    const requestId = getRequestId(c);

    console.error("Global Error Handler:", {
        requestId,
        message: error.message,
        stack: error.stack,
        url: c.req.url,
        method: c.req.method,
        timestamp: new Date().toISOString(),
    });

    // Handle Hono HTTPException
    if (error instanceof HTTPException) {
        const response: ApiResponse = {
            success: false,
            message: error.message || "HTTP Exception",
            error:
                process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
                    ? error.stack
                    : undefined,
            requestId,
            timestamp: new Date().toISOString(),
        };
        return c.json(response, error.status);
    }

    // Handle custom errors
    if (error instanceof CustomError) {
        const response: ApiResponse = {
            success: false,
            message: error.message,
            error: error.details,
            requestId,
            timestamp: new Date().toISOString(),
        };
        return c.json(response, error.statusCode as any);
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
        const response: ApiResponse = {
            success: false,
            message: "Validation failed",
            error:
                process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
                    ? error.message
                    : "Invalid input data",
            requestId,
            timestamp: new Date().toISOString(),
        };
        return c.json(response, 400);
    }

    // Handle syntax errors
    if (error instanceof SyntaxError) {
        const response: ApiResponse = {
            success: false,
            message: "Invalid JSON format",
            error:
                process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
                    ? error.message
                    : undefined,
            requestId,
            timestamp: new Date().toISOString(),
        };
        return c.json(response, 400);
    }

    // Handle generic errors
    const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error:
            process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
                ? error.message
                : "Something went wrong",
        requestId,
        timestamp: new Date().toISOString(),
    };

    return c.json(response, 500);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (c: Context): Response => {
    const requestId = getRequestId(c);

    const response: ApiResponse = {
        success: false,
        message: "Route not found",
        error: `The requested endpoint ${c.req.method} ${c.req.url} does not exist`,
        requestId,
        timestamp: new Date().toISOString(),
    };

    return c.json(response, 404);
};
