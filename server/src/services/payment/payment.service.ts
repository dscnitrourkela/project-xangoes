import { IPaymentProvider, PaymentOrderParams, PaymentOrderResult, WebhookVerificationResult } from "./payment.interface";
import { ManualPaymentProvider } from "./manual.provider";
import { OnlineGatewayProvider } from "./onlineGateway.provider";

export class PaymentService {
    private providers: Map<string, IPaymentProvider> = new Map();

    constructor() {
        const manualProvider = new ManualPaymentProvider();
        const onlineProvider = new OnlineGatewayProvider();

        this.providers.set(manualProvider.name, manualProvider);
        this.providers.set(onlineProvider.name, onlineProvider);
    }

    /**
     * Get specific payment provider or default to manual
     */
    public getProvider(name?: string): IPaymentProvider {
        if (name && this.providers.has(name)) {
            const provider = this.providers.get(name)!;
            if (provider.isConfigured()) {
                return provider;
            }
        }

        // Check if online gateway is requested but unconfigured
        if (name === "online_gateway" || name === "razorpay" || name === "stripe") {
            const online = this.providers.get("online_gateway");
            if (online && online.isConfigured()) {
                return online;
            }
        }

        // Fallback to manual payment provider
        return this.providers.get("manual")!;
    }

    /**
     * Create payment order with the selected provider
     */
    public async createOrder(params: PaymentOrderParams, providerName?: string): Promise<PaymentOrderResult> {
        const provider = this.getProvider(providerName);
        return provider.createOrder(params);
    }

    /**
     * Cryptographically verify and parse incoming webhook
     */
    public async verifyWebhook(
        providerName: string,
        payload: any,
        headers: Record<string, string>
    ): Promise<WebhookVerificationResult> {
        const provider = this.providers.get(providerName);
        if (!provider) {
            return {
                isValid: false,
                provider: providerName,
                error: `Unknown payment provider: ${providerName}`,
            };
        }

        return provider.verifyWebhook(payload, headers);
    }

    /**
     * List available providers and configuration status
     */
    public getAvailableProviders(): { name: string; isConfigured: boolean }[] {
        const list: { name: string; isConfigured: boolean }[] = [];
        for (const [name, provider] of this.providers.entries()) {
            list.push({
                name,
                isConfigured: provider.isConfigured(),
            });
        }
        return list;
    }
}

export const paymentService = new PaymentService();
