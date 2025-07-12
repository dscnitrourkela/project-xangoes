import { z } from 'zod';

// Validation schemas for demonstration
export const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    age: z.number().min(18, "Must be at least 18 years old").optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
});

export const getUserQuerySchema = z.object({
    page: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1))
        .optional(),
    limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100))
        .optional(),
    search: z.string().optional(),
});

export const userParamsSchema = z.object({
    id: z.string().uuid("Invalid user ID format"),
});
