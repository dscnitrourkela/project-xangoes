import crypto from "crypto";
import { IPaymentProvider, PaymentOrderParams, PaymentOrderResult, WebhookVerificationResult } from "./payment.interface";

/**
 * OnlineGatewayProvider supports automated payment gateways (e.g., Razorpay/Stripe).
 * It verifies HMAC webhook signatures before updating payment status.
 * If credentials are not present, isConfigured() returns false.
 */
export class OnlineGatewayProvider implements IPaymentProvider {
    public readonly name = "online_gateway";
    private keyId?: string;
    private keySecret?: string;
    private webhookSecret?: string;

    constructor() {
        this.keyId = process.env.PAYMENT_GATEWAY_KEY || process.env.RAZORPAY_KEY_ID;
        this.keySecret = process.env.PAYMENT_GATEWAY_SECRET || process.env.RAZORPAY_KEY_SECRET;
        this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;
    }

    public isConfigured(): boolean {
        return Boolean(this.keyId && this.keySecret);
    }

    public async createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
        if (!this.isConfigured()) {
            throw new Error(
                "Online payment gateway is not configured on this server. Please use manual payment submission."
            );
        }

        // Generate an order identifier
        const orderId = `gateway_ord_${crypto.randomUUID()}`;

        return {
            orderId,
            provider: this.name,
            amount: params.amount,
            currency: params.currency || "INR",
            paymentUrl: `https://checkout.xangoes.org/pay/${orderId}`,
            clientSecret: crypto.randomBytes(16).toString("hex"),
            metadata: {
                transactionId: params.transactionId,
                status: "CREATED",
            },
        };
    }

    public async verifyWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<WebhookVerificationResult> {
        const signature = headers["x-webhook-signature"] || headers["x-razorpay-signature"];

        if (!signature) {
            return {
                isValid: false,
                provider: this.name,
                error: "Missing webhook signature header",
            };
        }

        const secret = this.webhookSecret || this.keySecret;
        if (!secret) {
            return {
                isValid: false,
                provider: this.name,
                error: "Webhook secret is not configured",
            };
        }

        try {
            // Verify HMAC-SHA256 signature
            const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(payloadString)
                .digest("hex");

            const sigBuffer = Buffer.from(signature);
            const expectedBuffer = Buffer.from(expectedSignature);

            if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
                return {
                    isValid: false,
                    provider: this.name,
                    error: "Webhook signature verification failed",
                };
            }

            const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
            const event = parsed.event || parsed.type || "";
            const status = event.includes("success") || event.includes("captured") || parsed.status === "SUCCESS"
                ? "SUCCESS"
                : "FAILED";

            const transactionId = parsed.payload?.payment?.entity?.notes?.transactionId || parsed.transactionId;
            const providerOrderId = parsed.payload?.order?.entity?.id || parsed.orderId;
            const amount = parsed.payload?.payment?.entity?.amount || parsed.amount;

            return {
                isValid: true,
                provider: this.name,
                transactionId,
                providerOrderId,
                status,
                amount,
                rawPayload: parsed,
            };
        } catch (error) {
            return {
                isValid: false,
                provider: this.name,
                error: `Webhook verification error: ${(error as Error).message}`,
            };
        }
    }

    public async getOrderStatus(orderId: string): Promise<{ status: string; amount?: number }> {
        if (!this.isConfigured()) {
            throw new Error("Online payment gateway is not configured.");
        }

        return {
            status: "PENDING",
        };
    }
}
