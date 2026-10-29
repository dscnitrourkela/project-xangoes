import { Hono } from "hono";
import { transactionController } from "@/controllers/transaction.controller";
import { asyncHandler, requireAuth, validateRequest } from "@/middlewares";
import {
    createTransactionSchema,
    submitEvidenceSchema,
    transactionParamsSchema,
} from "@/middlewares/validators";

export const transactionRouter = new Hono();

// POST /transactions - Create transaction
transactionRouter.post(
    "/",
    validateRequest(createTransactionSchema, "body"),
    requireAuth,
    asyncHandler(transactionController.createTransaction)
);

// POST /transactions/upload-url - Generate secure upload URL for evidence
transactionRouter.post(
    "/upload-url",
    requireAuth,
    asyncHandler(transactionController.getSignedUploadUrl)
);

// GET /transactions/me - List current user's transactions
transactionRouter.get(
    "/me",
    requireAuth,
    asyncHandler(transactionController.getMyTransactions)
);

// GET /transactions/:id - Get transaction details and receipt
transactionRouter.get(
    "/:id",
    validateRequest(transactionParamsSchema, "params"),
    requireAuth,
    asyncHandler(transactionController.getTransactionById)
);

// POST /transactions/:id/evidence - Submit payment evidence
transactionRouter.post(
    "/:id/evidence",
    validateRequest(transactionParamsSchema, "params"),
    validateRequest(submitEvidenceSchema, "body"),
    requireAuth,
    asyncHandler(transactionController.submitEvidence)
);

// POST /transactions/webhook/:provider - Automated payment provider webhook callback
transactionRouter.post(
    "/webhook/:provider",
    asyncHandler(transactionController.handleWebhook)
);
