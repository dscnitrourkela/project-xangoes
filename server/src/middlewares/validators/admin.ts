import { z } from 'zod';

export const createAdminSchema = z.object({
    email: z.string().trim().email().max(255),
    // Optional: resolved from Firebase by email when omitted
    firebaseId: z.string().trim().min(1).max(255).optional(),
    festID: z.string().trim().min(1).max(255).nullable().optional(),
    isSuperAdmin: z.boolean().optional(),
    allowedToModifyContent: z.boolean().optional(),
});

export const updateAdminSchema = z
    .object({
        festID: z.string().trim().min(1).max(255).nullable(),
        isSuperAdmin: z.boolean(),
        allowedToModifyContent: z.boolean(),
    })
    .partial()
    .strict()
    .refine((v) => Object.keys(v).length > 0, 'At least one field is required');

export const adminIdParamsSchema = z.object({
    id: z.string().min(1).max(255),
});

export const festIdParamsSchema = z.object({
    festId: z.string().min(1).max(255),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
