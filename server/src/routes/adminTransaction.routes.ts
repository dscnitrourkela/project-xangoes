import { Hono } from "hono";
import { transactionController } from "@/controllers/transaction.controller";
import { asyncHandler, requireAdmin, validateRequest } from "@/middlewares";
import {
    adminReviewSchema,
    transactionParamsSchema,
    transactionQuerySchema,
} from "@/middlewares/validators";

export const adminTransactionRouter = new Hono();

// GET /admin/transactions - List pending transactions for review
adminTransactionRouter.get(
    "/",
    validateRequest(transactionQuerySchema, "query"),
    requireAdmin,
    asyncHandler(transactionController.getAdminTransactions)
);

// GET /admin/transactions/:id - Inspect transaction details and evidence
adminTransactionRouter.get(
    "/:id",
    validateRequest(transactionParamsSchema, "params"),
    requireAdmin,
    asyncHandler(transactionController.getAdminTransactionById)
);

// POST /admin/transactions/:id/review - Approve or reject transaction
adminTransactionRouter.post(
    "/:id/review",
    validateRequest(transactionParamsSchema, "params"),
    validateRequest(adminReviewSchema, "body"),
    requireAdmin,
    asyncHandler(transactionController.reviewTransaction)
);
