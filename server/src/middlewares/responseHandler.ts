import { Context } from 'hono';

import {
  ApiResponse,
  PaginatedResponse,
} from '@/types';

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
        return this.success(c, data, message, 201);
    }

    /**
     * Send a no content response (204)
     * @param c - Hono context
     * @param message - Success message
     * @returns JSON response
     */
    static noContent(
        c: Context,
        message: string = "Operation completed successfully"
    ): Response {
        return this.success(c, undefined, message, 204);
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
            error: process.env.NODE_ENV === "development" ? error : undefined,
            timestamp: new Date().toISOString(),
        };

        return c.json(response, statusCode as any);
    }
}

/**
 * Convenience methods for common responses
 */
export const sendSuccess = ResponseHandler.success;
export const sendCreated = ResponseHandler.created;
export const sendNoContent = ResponseHandler.noContent;
export const sendPaginated = ResponseHandler.paginated;
export const sendError = ResponseHandler.error;
