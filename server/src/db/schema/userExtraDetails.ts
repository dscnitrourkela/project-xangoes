import { z } from "zod";

export const extraDetailsSchema = z
    .object({
        stream: z.string().max(255).optional(),
        referredBy: z.string().max(255).optional(),
        ca: z.array(z.string()).optional(),
    })
    .strict();

export type UserExtraDetails = z.infer<typeof extraDetailsSchema>;

export function parseExtraDetails(value: unknown): UserExtraDetails {
    return extraDetailsSchema.parse(value);
}
