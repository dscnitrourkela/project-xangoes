import { Context, Next } from 'hono';
import { randomUUID } from 'crypto';

declare module 'hono' {
    interface ContextVariableMap {
        requestId: string;
    }
}

/**
 * Middleware that assigns a unique Request ID to each incoming request.
 * Reads existing 'x-request-id' header or generates a new UUID.
 * Sets the 'x-request-id' on the response headers and in the context variable.
 */
export const requestIdMiddleware = async (c: Context, next: Next) => {
    const existingId = c.req.header('x-request-id');
    const id = existingId || randomUUID();

    c.set('requestId', id);
    c.header('x-request-id', id);

    await next();
};

