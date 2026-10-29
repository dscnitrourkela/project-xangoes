import { z } from "zod";

export const createTransactionSchema = z.object({
    amount: z.number().int().min(0, "Amount must be zero or positive"),
    type: z.enum(["REGISTRATION", "EVENT", "MERCH"], {
        error: "Type must be REGISTRATION, EVENT, or MERCH",
    }),
    festID: z.string().optional(),
    comment: z.string().max(500).optional(),
    paymentProvider: z.string().default("manual"),
});

export const submitEvidenceSchema = z.object({
    transactionID: z.string().optional(), // External transaction reference ID (e.g. UPI ref or bank UTR)
    screenshot: z.string().min(1, "Payment evidence / screenshot reference is required"),
    comment: z.string().max(500).optional(),
    fileSize: z.number().optional(),
});

export const adminReviewSchema = z.object({
    action: z.enum(["APPROVE", "REJECT"], {
        error: "Action must be APPROVE or REJECT",
    }),
    rejectionReason: z.string().max(500).optional(),
    comment: z.string().max(500).optional(),
});

export const transactionQuerySchema = z.object({
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
    status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
    type: z.enum(["REGISTRATION", "EVENT", "MERCH"]).optional(),
    festID: z.string().optional(),
    userID: z.string().optional(),
});

export const transactionParamsSchema = z.object({
    id: z.string().min(1, "Transaction ID is required"),
});
