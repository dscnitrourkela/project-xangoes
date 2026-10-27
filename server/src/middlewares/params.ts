import type { Context } from 'hono';

import { createError } from './asyncHandler';

/** Reads a required route parameter, rejecting with 400 if it is missing. */
export function getParam(c: Context, name: string): string {
    const value = c.req.param(name);
    if (!value) throw createError.badRequest(`Missing route parameter: ${name}`);
    return value;
}
