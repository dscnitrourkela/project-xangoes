/**
 * @fileoverview Request validation middleware using Zod schemas
 *
 * This module provides middleware for validating Hono request data
 * (body, query parameters, route parameters) against Zod schemas.
 * Automatically formats validation errors for consistent API responses.
 */

import {
  Context,
  Next,
} from 'hono';
import {
  ZodError,
  ZodTypeAny,
} from 'zod';

import { sendError } from './responseHandler.js';

/**
 * Supported request targets for validation
 */
type ValidationTarget = "body" | "query" | "params";

/**
 * Supported Zod schema types for validation
 */
type ZodSchema = ZodTypeAny;

/**
 * Creates middleware to validate request data against a Zod schema
 *
 * Validates the specified request target (body, query, or params) against
 * the provided Zod schema. On validation failure, returns a structured
 * error response with field-specific error messages.
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate ('body', 'query', or 'params')
 * @returns Hono middleware function
 *
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 *
 * app.post('/users',
 *   validateRequest(createUserSchema, 'body'),
 *   createUserHandler
 * );
 * ```
 */
export const validateRequest = (
    schema: ZodSchema,
    target: ValidationTarget
) => {
    return async (c: Context, next: Next) => {
        try {
            let dataToValidate: any;

            // Extract data based on validation target
            switch (target) {
                case "body":
                    dataToValidate = await c.req.json().catch(() => ({}));
                    break;
                case "query":
                    dataToValidate = c.req.query();
                    break;
                case "params":
                    dataToValidate = c.req.param();
                    break;
                default:
                    throw new Error(`Invalid validation target: ${target}`);
            }

            // Validate the extracted data against the schema
            await schema.parseAsync(dataToValidate);
            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod validation errors into a consistent structure
                const errors = error.issues.map((issue: any) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                return sendError(c, "Validation failed", 400, errors);
            }
            // Handle unexpected errors
            return sendError(c, "Internal server error", 500);
        }
    };
};
