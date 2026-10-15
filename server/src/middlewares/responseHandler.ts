import { Context } from 'hono';

import {
  ApiResponse,
  PaginatedResponse,
} from '@/types';

/**
 * Helper to safely extract requestId from context
 */
function getRequestId(c: Context): string | undefined {
    try {
        return c.get('requestId') || c.req.header('x-request-id');
    } catch {
        return undefined;
    }
}

/**
 * Success response handler for standardized API responses
 */
export class ResponseHandler {
    /**
     * Send a success response
     * @param c - Hono context
     * @param data - Response data
     * @param message - Success message
     * @param statusCode - HTTP status code (default: 200)
     * @returns JSON response
     */
    static success<T>(
        c: Context,
        data?: T,
        message: string = "Success",
        statusCode: number = 200
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            requestId: getRequestId(c),
            timestamp: new Date().toISOString(),
        };

        return c.json(response, statusCode as any);
    }

    /**
     * Send a created response (201)
     * @param c - Hono context
     * @param data - Created resource data
     * @param message - Success message
     * @returns JSON response
     */
    static created<T>(
        c: Context,
        data?: T,
        message: string = "Resource created successfully"
    ): Response {
        return ResponseHandler.success(c, data, message, 201);
    }

    /**
     * Send a no content response (204)
     * Note: HTTP 204 No Content specifications state that no message-body should be returned.
     * @param c - Hono context
     * @returns Empty Response
     */
    static noContent(
        c: Context,
        _message: string = "Operation completed successfully"
    ): Response {
        return c.body(null, 204);
    }

    /**
     * Send a paginated response
     * @param c - Hono context
     * @param data - Array of data
     * @param page - Current page number
     * @param limit - Items per page
     * @param total - Total number of items
     * @param message - Success message
     * @returns JSON response
     */
    static paginated<T>(
        c: Context,
        data: T[],
        page: number,
        limit: number,
        total: number,
        message: string = "Data retrieved successfully"
    ): Response {
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse<T> = {
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            requestId: getRequestId(c),
            timestamp: new Date().toISOString(),
        };

        return c.json(response, 200);
    }

    /**
     * Send an error response
     * @param c - Hono context
     * @param message - Error message
     * @param statusCode - HTTP status code
     * @param error - Additional error details
     * @returns JSON response
     */
    static error(
        c: Context,
        message: string,
        statusCode: number = 500,
        error?: any
    ): Response {
        const response: ApiResponse = {
            success: false,
            message,
            error: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || statusCode < 500
                ? error
                : undefined,
            requestId: getRequestId(c),
            timestamp: new Date().toISOString(),
        };

        return c.json(response, statusCode as any);
    }
}

/**
 * Convenience methods for common responses
 */
export const sendSuccess = (c: Context, data?: any, message?: string, statusCode?: number) =>
    ResponseHandler.success(c, data, message, statusCode);
export const sendCreated = (c: Context, data?: any, message?: string) =>
    ResponseHandler.created(c, data, message);
export const sendNoContent = (c: Context, message?: string) =>
    ResponseHandler.noContent(c, message);
export const sendPaginated = (c: Context, data: any[], page: number, limit: number, total: number, message?: string) =>
    ResponseHandler.paginated(c, data, page, limit, total, message);
export const sendError = (c: Context, message: string, statusCode?: number, error?: any) =>
    ResponseHandler.error(c, message, statusCode, error);
