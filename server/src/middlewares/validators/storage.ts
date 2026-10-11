import { z } from 'zod';

export const signedUploadUrlSchema = z.object({
    fileName: z
        .string()
        .min(1, 'fileName is required')
        .max(255, 'fileName is too long'),
    contentType: z
        .string()
        .min(1, 'contentType is required')
        .regex(/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/, 'Invalid MIME type'),
    fileSize: z
        .number()
        .positive('fileSize must be positive')
        .max(50 * 1024 * 1024, 'File size exceeds maximum limit of 50MB')
        .optional(),
    folder: z
        .string()
        .max(100)
        .regex(/^[a-zA-Z0-9_-]+$/, 'folder may only contain alphanumeric characters, hyphens and underscores')
        .optional(),
    purpose: z
        .enum(['id_card', 'profile_photo', 'payment_receipt', 'event_poster', 'other'])
        .optional()
        .default('other'),
});

export type SignedUploadUrlInput = z.infer<typeof signedUploadUrlSchema>;

