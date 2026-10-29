import crypto from "crypto";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/schema";
import { transactions, Transaction, transactionTypeEnum } from "@/db/schema/transaction";
import { users } from "@/db/schema/user";
import { eventRegistrations } from "@/db/schema/eventRegistration";
import { fests } from "@/db/schema/fest";
import { AuthUser, AuthAdmin, TransactionStatus, TransactionType } from "@/types";
import { createError } from "@/middlewares";
import { paymentService } from "./payment/payment.service";
import { evidenceStorage } from "./storage/storage.service";

export interface CreateTransactionInput {
    amount: number;
    type: TransactionType;
    festID?: string;
    comment?: string;
    paymentProvider?: string;
}

export interface SubmitEvidenceInput {
    transactionID?: string; // External transaction ID / UPI ref / UTR
    screenshot: string; // File URL or upload key reference
    comment?: string;
    fileSize?: number;
}

export interface AdminReviewInput {
    action: "APPROVE" | "REJECT";
    rejectionReason?: string;
    comment?: string;
}

export interface TransactionFilter {
    page?: number;
    limit?: number;
    status?: TransactionStatus;
    type?: TransactionType;
    festID?: string;
    userID?: string;
}

export class TransactionService {
    /**
     * Create a new transaction record and initialize payment order
     * Note: Does NOT mark payment as successful based on client input!
     */
    public async createTransaction(user: AuthUser, input: CreateTransactionInput) {
        const { amount, type, festID, comment, paymentProvider = "manual" } = input;

        const transactionId = crypto.randomUUID();
        const effectiveFestId = festID || user.festID || null;

        // Initialize payment order via provider abstraction
        const paymentOrder = await paymentService.createOrder(
            {
                transactionId,
                amount,
                currency: "INR",
                description: `${type} payment for user ${user.name || user.email}`,
                userId: user.id,
                userEmail: user.email,
                userName: user.name || undefined,
                metadata: {
                    festID: effectiveFestId,
                    type,
                },
            },
            paymentProvider
        );

        // Store transaction in database with initial PENDING status
        const [newTransaction] = await db
            .insert(transactions)
            .values({
                id: transactionId,
                amount,
                userID: user.id,
                transactionID: paymentOrder.orderId,
                type,
                timestamp: new Date(),
                festID: effectiveFestId,
                comment: comment || null,
                screenshot: null,
                isVerified: false, // Never verified initially!
                status: "PENDING",
                provider: paymentOrder.provider,
                providerOrderID: paymentOrder.orderId,
                metadata: paymentOrder.metadata || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return {
            transaction: newTransaction,
            paymentOrder,
            message:
                paymentOrder.provider === "manual"
                    ? "Transaction created. Please submit payment evidence (screenshot/reference) to complete verification."
                    : "Payment order initialized. Please complete payment through the gateway.",
        };
    }

    /**
     * Submit payment evidence (screenshot reference and external transaction ID)
     * Securely stores reference and metadata rather than raw binary in DB.
     */
    public async submitPaymentEvidence(
        transactionInternalId: string,
        user: AuthUser,
        input: SubmitEvidenceInput
    ) {
        const [existing] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionInternalId))
            .limit(1);

        if (!existing) {
            throw createError.notFound(`Transaction with ID '${transactionInternalId}' not found.`);
        }

        if (existing.userID !== user.id) {
            throw createError.forbidden("You do not have permission to update this transaction.");
        }

        if (existing.isVerified) {
            throw createError.badRequest("This transaction has already been verified and completed.");
        }

        // Validate and store evidence reference via storage provider
        const evidenceMeta = await evidenceStorage.verifyAndStoreReference(input.screenshot, {
            fileSize: input.fileSize,
        });

        // Update transaction record with evidence references
        const [updated] = await db
            .update(transactions)
            .set({
                screenshot: evidenceMeta.url,
                transactionID: input.transactionID || existing.transactionID,
                comment: input.comment || existing.comment,
                status: "PENDING", // Stays pending until admin review
                metadata: {
                    ...(existing.metadata as object),
                    evidence: evidenceMeta,
                    evidenceSubmittedAt: new Date().toISOString(),
                },
                updatedAt: new Date(),
            })
            .where(eq(transactions.id, transactionInternalId))
            .returning();

        return {
            transaction: updated,
            message: "Payment evidence submitted successfully. Awaiting administrator review.",
        };
    }

    /**
     * Handle payment provider webhook callbacks with cryptographic verification
     */
    public async handleWebhook(
        providerName: string,
        payload: any,
        headers: Record<string, string>
    ) {
        // Cryptographically verify webhook signature
        const verification = await paymentService.verifyWebhook(providerName, payload, headers);
        if (!verification.isValid) {
            throw createError.badRequest(`Webhook verification failed: ${verification.error}`);
        }

        const transactionId = verification.transactionId;
        if (!transactionId) {
            throw createError.badRequest("Webhook payload does not contain a valid transaction identifier.");
        }

        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .limit(1);

        if (!transaction) {
            throw createError.notFound(`Transaction '${transactionId}' not found.`);
        }

        if (transaction.isVerified) {
            return { message: "Transaction was already verified." };
        }

        if (verification.status === "SUCCESS") {
            // Update transaction and related records in a database transaction
            return await db.transaction(async (tx) => {
                const [verifiedTx] = await tx
                    .update(transactions)
                    .set({
                        isVerified: true,
                        status: "VERIFIED",
                        providerOrderID: verification.providerOrderId || transaction.providerOrderID,
                        metadata: {
                            ...(transaction.metadata as object),
                            webhookPayload: verification.rawPayload,
                            verifiedAt: new Date().toISOString(),
                        },
                        updatedAt: new Date(),
                    })
                    .where(eq(transactions.id, transactionId))
                    .returning();

                // If transaction is REGISTRATION, update user hasPaid and pending registrations
                if (transaction.type === "REGISTRATION") {
                    await tx
                        .update(users)
                        .set({
                            hasPaid: true,
                            transactionID: verifiedTx.transactionID || verifiedTx.id,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, transaction.userID));

                    // Confirm any pending registrations for this user
                    await tx
                        .update(eventRegistrations)
                        .set({
                            status: "CONFIRMED",
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(eventRegistrations.userID, transaction.userID),
                                eq(eventRegistrations.status, "PENDING_PAYMENT")
                            )
                        );
                }

                return {
                    transaction: verifiedTx,
                    message: "Payment confirmed via provider webhook.",
                };
            });
        } else {
            const [failedTx] = await db
                .update(transactions)
                .set({
                    status: "REJECTED",
                    rejectionReason: "Payment failed at gateway provider",
                    updatedAt: new Date(),
                })
                .where(eq(transactions.id, transactionId))
                .returning();

            return {
                transaction: failedTx,
                message: "Payment marked as failed based on provider callback.",
            };
        }
    }

    /**
     * Administrator Workflow: List pending or filtered transactions
     */
    public async getPendingTransactions(admin: AuthAdmin, filter: TransactionFilter = {}) {
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const offset = (page - 1) * limit;

        const conditions = [];

        // If admin is fest-scoped and not super-admin, restrict to admin's fest
        if (!admin.isSuperAdmin && admin.festID) {
            conditions.push(eq(transactions.festID, admin.festID));
        } else if (filter.festID) {
            conditions.push(eq(transactions.festID, filter.festID));
        }

        if (filter.status) {
            conditions.push(eq(transactions.status, filter.status));
        }
        if (filter.type) {
            conditions.push(eq(transactions.type, filter.type));
        }
        if (filter.userID) {
            conditions.push(eq(transactions.userID, filter.userID));
        }

        const combinedCondition = conditions.length > 0 ? and(...conditions) : undefined;

        const [{ total }] = await db
            .select({ total: count() })
            .from(transactions)
            .where(combinedCondition);

        const items = await db
            .select({
                id: transactions.id,
                amount: transactions.amount,
                userID: transactions.userID,
                transactionID: transactions.transactionID,
                type: transactions.type,
                timestamp: transactions.timestamp,
                festID: transactions.festID,
                comment: transactions.comment,
                screenshot: transactions.screenshot,
                isVerified: transactions.isVerified,
                status: transactions.status,
                rejectionReason: transactions.rejectionReason,
                reviewedBy: transactions.reviewedBy,
                reviewedAt: transactions.reviewedAt,
                provider: transactions.provider,
                providerOrderID: transactions.providerOrderID,
                metadata: transactions.metadata,
                createdAt: transactions.createdAt,
                userName: users.name,
                userEmail: users.email,
                userMobile: users.mobile,
                userCollege: users.college,
            })
            .from(transactions)
            .leftJoin(users, eq(transactions.userID, users.id))
            .where(combinedCondition)
            .orderBy(desc(transactions.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            items,
            total: Number(total),
            page,
            limit,
        };
    }

    /**
     * Administrator Workflow: Review (Approve / Reject) a submission
     * Ensures transaction and related user/registration states remain consistent.
     */
    public async reviewTransaction(
        transactionId: string,
        admin: AuthAdmin,
        input: AdminReviewInput
    ) {
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .limit(1);

        if (!transaction) {
            throw createError.notFound(`Transaction with ID '${transactionId}' not found.`);
        }

        // Scope check for fest admin
        if (!admin.isSuperAdmin && admin.festID && transaction.festID && admin.festID !== transaction.festID) {
            throw createError.forbidden("You cannot review transactions outside your assigned fest.");
        }

        const { action, rejectionReason, comment } = input;

        if (action === "APPROVE") {
            // Use database transaction to update transaction, user, and registrations together
            return await db.transaction(async (tx) => {
                const [approvedTx] = await tx
                    .update(transactions)
                    .set({
                        isVerified: true,
                        status: "VERIFIED",
                        reviewedBy: admin.id,
                        reviewedAt: new Date(),
                        comment: comment || transaction.comment,
                        rejectionReason: null,
                        updatedAt: new Date(),
                    })
                    .where(eq(transactions.id, transactionId))
                    .returning();

                // If type is REGISTRATION or fest-related, update user.hasPaid
                if (transaction.type === "REGISTRATION") {
                    await tx
                        .update(users)
                        .set({
                            hasPaid: true,
                            transactionID: approvedTx.transactionID || approvedTx.id,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, transaction.userID));

                    // Transition any PENDING_PAYMENT registrations to CONFIRMED
                    await tx
                        .update(eventRegistrations)
                        .set({
                            status: "CONFIRMED",
                            updatedAt: new Date(),
                        })
                        .where(
                            and(
                                eq(eventRegistrations.userID, transaction.userID),
                                eq(eventRegistrations.status, "PENDING_PAYMENT")
                            )
                        );
                }

                return {
                    transaction: approvedTx,
                    message: "Transaction approved and verified successfully. Related registrations confirmed.",
                };
            });
        } else {
            // Reject workflow
            return await db.transaction(async (tx) => {
                const [rejectedTx] = await tx
                    .update(transactions)
                    .set({
                        isVerified: false,
                        status: "REJECTED",
                        rejectionReason: rejectionReason || "Evidence could not be verified by administrator",
                        reviewedBy: admin.id,
                        reviewedAt: new Date(),
                        comment: comment || transaction.comment,
                        updatedAt: new Date(),
                    })
                    .where(eq(transactions.id, transactionId))
                    .returning();

                return {
                    transaction: rejectedTx,
                    message: "Transaction rejected. Reason recorded and exposed to participant.",
                };
            });
        }
    }

    /**
     * Get user's transactions with status and receipt details
     */
    public async getUserTransactions(userId: string) {
        return await db
            .select()
            .from(transactions)
            .where(eq(transactions.userID, userId))
            .orderBy(desc(transactions.createdAt));
    }

    /**
     * Retrieve single transaction details by ID
     */
    public async getTransactionById(transactionId: string, userId?: string) {
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .limit(1);

        if (!transaction) {
            throw createError.notFound(`Transaction with ID '${transactionId}' not found.`);
        }

        if (userId && transaction.userID !== userId) {
            throw createError.forbidden("You do not have permission to view this transaction.");
        }

        // Fetch fest info if applicable
        let festInfo = null;
        if (transaction.festID) {
            const [fest] = await db
                .select({ id: fests.id, name: fests.name, logo: fests.logo })
                .from(fests)
                .where(eq(fests.id, transaction.festID))
                .limit(1);
            festInfo = fest || null;
        }

        return {
            ...transaction,
            fest: festInfo,
            receiptDetails: {
                receiptNumber: `RCP-${transaction.id.substring(0, 8).toUpperCase()}`,
                issuedTo: transaction.userID,
                amount: transaction.amount,
                status: transaction.status,
                isVerified: transaction.isVerified,
                paymentReference: transaction.transactionID,
                date: transaction.timestamp,
            },
        };
    }
}

export const transactionService = new TransactionService();
