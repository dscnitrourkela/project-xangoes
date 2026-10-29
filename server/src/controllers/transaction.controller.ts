import { Context } from "hono";
import { sendCreated, sendPaginated, sendSuccess } from "@/middlewares";
import { transactionService } from "@/services/transaction.service";
import { evidenceStorage } from "@/services/storage/storage.service";
import { AuthUser, AuthAdmin } from "@/types";

export const transactionController = {
    /**
     * POST /transactions
     * Create a transaction and initialize payment order
     */
    createTransaction: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const body = await c.req.json();

        const result = await transactionService.createTransaction(user, body);
        return sendCreated(c, result, result.message);
    },

    /**
     * POST /transactions/upload-url
     * Generate secure signed upload URL for payment evidence
     */
    getSignedUploadUrl: async (c: Context) => {
        const body = await c.req.json();
        const fileName = body.fileName || "evidence.jpg";
        const mimeType = body.mimeType || "image/jpeg";

        const result = await evidenceStorage.generateSignedUploadUrl(fileName, mimeType);
        return sendSuccess(c, result, "Signed upload URL generated successfully");
    },

    /**
     * POST /transactions/:id/evidence
     * Submit payment evidence (reference ID and screenshot URL)
     */
    submitEvidence: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await transactionService.submitPaymentEvidence(id, user, body);
        return sendSuccess(c, result, result.message);
    },

    /**
     * GET /transactions/me
     * List authenticated participant's transactions
     */
    getMyTransactions: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const transactions = await transactionService.getUserTransactions(user.id);
        return sendSuccess(c, transactions, "Transactions retrieved successfully");
    },

    /**
     * GET /transactions/:id
     * Get transaction details and receipt details
     */
    getTransactionById: async (c: Context) => {
        const user = c.get("user") as AuthUser;
        const { id } = c.req.param();

        const transaction = await transactionService.getTransactionById(id, user.id);
        return sendSuccess(c, transaction, "Transaction details retrieved successfully");
    },

    /**
     * POST /transactions/webhook/:provider
     * Cryptographically verified payment provider callback
     */
    handleWebhook: async (c: Context) => {
        const { provider } = c.req.param();
        const payload = await c.req.json().catch(() => ({}));
        const headers: Record<string, string> = {};

        // Collect request headers for signature verification
        for (const [key, value] of Object.entries(c.req.header())) {
            if (typeof value === "string") {
                headers[key.toLowerCase()] = value;
            }
        }

        const result = await transactionService.handleWebhook(provider, payload, headers);
        return sendSuccess(c, result, result.message);
    },

    // ==========================================
    // Administrator Workflow Endpoints
    // ==========================================

    /**
     * GET /admin/transactions
     * List transactions with filters (status, type, festID, pagination)
     */
    getAdminTransactions: async (c: Context) => {
        const admin = c.get("admin") as AuthAdmin;
        const query = c.req.query();

        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        const status = query.status as any;
        const type = query.type as any;
        const festID = query.festID;
        const userID = query.userID;

        const result = await transactionService.getPendingTransactions(admin, {
            page,
            limit,
            status,
            type,
            festID,
            userID,
        });

        return sendPaginated(
            c,
            result.items,
            result.page,
            result.limit,
            result.total,
            "Transactions retrieved successfully"
        );
    },

    /**
     * GET /admin/transactions/:id
     * Administrator inspects full transaction details and evidence
     */
    getAdminTransactionById: async (c: Context) => {
        const { id } = c.req.param();
        const transaction = await transactionService.getTransactionById(id);
        return sendSuccess(c, transaction, "Transaction details retrieved successfully");
    },

    /**
     * POST /admin/transactions/:id/review
     * Administrator approves or rejects a submission
     */
    reviewTransaction: async (c: Context) => {
        const admin = c.get("admin") as AuthAdmin;
        const { id } = c.req.param();
        const body = await c.req.json();

        const result = await transactionService.reviewTransaction(id, admin, body);
        return sendSuccess(c, result, result.message);
    },
};
