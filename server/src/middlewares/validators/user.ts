import { z } from 'zod';

const lowercased = z.string().trim().min(1).max(100).transform((v) => v.toLowerCase());

/** Only fields a user may edit themselves; unknown keys (hasPaid, email, ...) are rejected. */
export const updateProfileSchema = z
    .object({
        name: z.string().trim().min(1).max(255),
        photo: z.string().url().nullable(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHERS']),
        dob: z.coerce.date().max(new Date(), 'dob cannot be in the future').nullable(),
        state: lowercased.nullable(),
        city: lowercased.nullable(),
        college: z.string().trim().min(1).max(255),
        idCard: z.string().url().nullable(),
        mobile: z
            .string()
            .trim()
            .regex(/^\+?[0-9]{10,15}$/, 'mobile must be 10-15 digits, optionally prefixed with +'),
        rollNumber: z.string().trim().min(1).max(50).nullable(),
    })
    .partial()
    .strict()
    .refine((v) => Object.keys(v).length > 0, 'At least one field is required');

export const userIdParamsSchema = z.object({
    id: z.string().min(1).max(255),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
