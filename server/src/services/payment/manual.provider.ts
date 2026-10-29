import { IPaymentProvider, PaymentOrderParams, PaymentOrderResult, WebhookVerificationResult } from "./payment.interface";
import crypto from "crypto";

/**
 * ManualPaymentProvider handles offline payments (UPI screenshot, bank slip, cash).
 * It does NOT pretend that payment has succeeded online.
 * Instead, it maintains a PENDING state until administrator review verifies payment evidence.
 */
export class ManualPaymentProvider implements IPaymentProvider {
    public readonly name = "manual";

    public isConfigured(): boolean {
        return true;
    }

    public async createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
        const orderId = `manual_ord_${crypto.randomUUID()}`;

        return {
            orderId,
            provider: this.name,
            amount: params.amount,
            currency: params.currency || "INR",
            metadata: {
                mode: "manual",
                status: "PENDING_EVIDENCE_SUBMISSION",
                instructions:
                    "Please complete your transfer and submit payment evidence (transaction ID and screenshot receipt) for administrator verification.",
                referenceId: params.transactionId,
            },
        };
    }

    public async verifyWebhook(
        _payload: any,
        _headers: Record<string, string>
    ): Promise<WebhookVerificationResult> {
        return {
            isValid: false,
            provider: this.name,
            error: "Manual payment provider does not process automated webhooks. Use administrator review workflow.",
        };
    }

    public async getOrderStatus(_orderId: string): Promise<{ status: string; amount?: number }> {
        return {
            status: "PENDING_ADMIN_VERIFICATION",
        };
    }
}
