export interface PaymentOrderParams {
    transactionId: string;
    amount: number; // in smallest unit (e.g. paise or INR)
    currency?: string;
    description: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    metadata?: Record<string, any>;
}

export interface PaymentOrderResult {
    orderId: string;
    provider: string;
    amount: number;
    currency: string;
    paymentUrl?: string;
    clientSecret?: string;
    metadata?: Record<string, any>;
}

export interface WebhookVerificationResult {
    isValid: boolean;
    provider: string;
    transactionId?: string;
    providerOrderId?: string;
    status?: "SUCCESS" | "FAILED" | "PENDING";
    amount?: number;
    error?: string;
    rawPayload?: any;
}

export interface IPaymentProvider {
    readonly name: string;
    isConfigured(): boolean;
    createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
    verifyWebhook(payload: any, headers: Record<string, string>): Promise<WebhookVerificationResult>;
    getOrderStatus(orderId: string): Promise<{ status: string; amount?: number }>;
}
