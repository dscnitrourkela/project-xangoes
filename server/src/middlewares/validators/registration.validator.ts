import { z } from "zod";

export const createRegistrationSchema = z.object({
    eventID: z.string().min(1, "Event ID is required"),
    teamID: z.string().optional(),
    transactionID: z.string().optional(),
});

export const cancelRegistrationSchema = z.object({
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
});

export const getRegistrationsQuerySchema = z.object({
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
    status: z.enum(["CONFIRMED", "PENDING_PAYMENT", "CANCELLED", "REJECTED"]).optional(),
    eventID: z.string().optional(),
});

export const registrationParamsSchema = z.object({
    id: z.string().min(1, "Registration ID is required"),
});
