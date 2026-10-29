process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/xangoes";
import { describe, expect, it } from "vitest";
import { ManualPaymentProvider } from "@/services/payment/manual.provider";
import { OnlineGatewayProvider } from "@/services/payment/onlineGateway.provider";
import { paymentService } from "@/services/payment/payment.service";
import { SecureEvidenceStorageProvider } from "@/services/storage/storage.service";
import {
    createRegistrationSchema,
    cancelRegistrationSchema,
    createTeamSchema,
    respondInvitationSchema,
    createTransactionSchema,
    submitEvidenceSchema,
    adminReviewSchema,
} from "@/middlewares/validators";
import crypto from "crypto";

describe("Payment Provider Abstraction", () => {
    it("should provide manual payment provider by default", async () => {
        const provider = paymentService.getProvider("manual");
        expect(provider.name).toBe("manual");
        expect(provider.isConfigured()).toBe(true);

        const order = await provider.createOrder({
            transactionId: "test-tx-123",
            amount: 500,
            description: "Test fest registration fee",
            userId: "user-1",
        });

        expect(order.provider).toBe("manual");
        expect(order.amount).toBe(500);
        expect(order.orderId).toContain("manual_ord_");
        expect(order.metadata?.mode).toBe("manual");
        expect(order.metadata?.status).toBe("PENDING_EVIDENCE_SUBMISSION");
    });

    it("manual provider should reject automated webhooks without pretending payment succeeded", async () => {
        const provider = new ManualPaymentProvider();
        const webhookResult = await provider.verifyWebhook({}, {});
        expect(webhookResult.isValid).toBe(false);
        expect(webhookResult.error).toContain("Manual payment provider does not process automated webhooks");
    });

    it("online gateway should verify cryptographic HMAC signatures", async () => {
        process.env.PAYMENT_GATEWAY_KEY = "test_key_id";
        process.env.PAYMENT_GATEWAY_SECRET = "test_key_secret";
        process.env.PAYMENT_WEBHOOK_SECRET = "my_super_secret_webhook_key";

        const gateway = new OnlineGatewayProvider();
        expect(gateway.isConfigured()).toBe(true);

        const payload = JSON.stringify({
            event: "payment.captured",
            transactionId: "tx-456",
            amount: 1000,
            status: "SUCCESS",
        });

        const signature = crypto
            .createHmac("sha256", "my_super_secret_webhook_key")
            .update(payload)
            .digest("hex");

        const result = await gateway.verifyWebhook(payload, {
            "x-webhook-signature": signature,
        });

        expect(result.isValid).toBe(true);
        expect(result.status).toBe("SUCCESS");
        expect(result.transactionId).toBe("tx-456");
        expect(result.amount).toBe(1000);
    });

    it("online gateway should reject tampered webhook signatures", async () => {
        const gateway = new OnlineGatewayProvider();
        const payload = JSON.stringify({ event: "payment.captured", transactionId: "tx-456" });

        const result = await gateway.verifyWebhook(payload, {
            "x-webhook-signature": "invalid_signature_hex",
        });

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Webhook signature verification failed");
    });
});

describe("Secure Storage Provider for Payment Evidence", () => {
    const storage = new SecureEvidenceStorageProvider();

    it("should generate signed upload URL with expiration and mime type checks", async () => {
        const signedUrl = await storage.generateSignedUploadUrl("receipt.png", "image/png");
        expect(signedUrl.fileKey).toContain("payment-evidence/");
        expect(signedUrl.fileKey).toContain("receipt.png");
        expect(signedUrl.publicUrl).toContain("/storage/payment-evidence/");
        expect(signedUrl.expiresAt).toBeDefined();
    });

    it("should reject unsupported evidence file types", async () => {
        await expect(
            storage.generateSignedUploadUrl("malicious.exe", "application/x-msdownload")
        ).rejects.toThrow("Unsupported evidence format");
    });

    it("should store structured reference and metadata rather than raw file", async () => {
        const meta = await storage.verifyAndStoreReference("https://res.cloudinary.com/test/receipt.jpg", {
            fileSize: 204800,
        });

        expect(meta.fileReference).toBe("https://res.cloudinary.com/test/receipt.jpg");
        expect(meta.fileType).toBe("image/jpeg");
        expect(meta.fileSize).toBe(204800);
        expect(meta.uploadedAt).toBeDefined();
    });
});

describe("Zod Validation Schemas", () => {
    it("should validate createRegistration schema", () => {
        const valid = createRegistrationSchema.safeParse({ eventID: "event-1" });
        expect(valid.success).toBe(true);

        const invalid = createRegistrationSchema.safeParse({ eventID: "" });
        expect(invalid.success).toBe(false);
    });

    it("should validate cancelRegistration schema", () => {
        const valid = cancelRegistrationSchema.safeParse({ reason: "Cannot attend" });
        expect(valid.success).toBe(true);
    });

    it("should validate createTeam schema", () => {
        const valid = createTeamSchema.safeParse({ name: "Code Warriors", eventID: "ev-1" });
        expect(valid.success).toBe(true);

        const invalidName = createTeamSchema.safeParse({ name: "A", eventID: "ev-1" });
        expect(invalidName.success).toBe(false);
    });

    it("should validate respondInvitation schema", () => {
        const validAccept = respondInvitationSchema.safeParse({ action: "ACCEPT" });
        expect(validAccept.success).toBe(true);

        const validReject = respondInvitationSchema.safeParse({ action: "REJECT" });
        expect(validReject.success).toBe(true);

        const invalidAction = respondInvitationSchema.safeParse({ action: "MAYBE" });
        expect(invalidAction.success).toBe(false);
    });

    it("should validate createTransaction schema", () => {
        const valid = createTransactionSchema.safeParse({
            amount: 500,
            type: "REGISTRATION",
            festID: "fest-1",
            paymentProvider: "manual",
        });
        expect(valid.success).toBe(true);

        const negativeAmount = createTransactionSchema.safeParse({
            amount: -50,
            type: "REGISTRATION",
        });
        expect(negativeAmount.success).toBe(false);
    });

    it("should validate submitEvidence schema", () => {
        const valid = submitEvidenceSchema.safeParse({
            screenshot: "https://storage.xangoes.org/evidence/tx123.jpg",
            transactionID: "UPI-9876543210",
            comment: "Paid via Google Pay",
        });
        expect(valid.success).toBe(true);

        const missingScreenshot = submitEvidenceSchema.safeParse({
            comment: "No evidence attached",
        });
        expect(missingScreenshot.success).toBe(false);
    });

    it("should validate adminReview schema", () => {
        const approve = adminReviewSchema.safeParse({ action: "APPROVE", comment: "Verified" });
        expect(approve.success).toBe(true);

        const reject = adminReviewSchema.safeParse({
            action: "REJECT",
            rejectionReason: "Screenshot blurred, cannot read UTR",
        });
        expect(reject.success).toBe(true);

        const invalid = adminReviewSchema.safeParse({ action: "DELETE" });
        expect(invalid.success).toBe(false);
    });
});

describe("Hono HTTP Route & Middleware Integration", () => {
    // Import app to test endpoints end-to-end
    const appPromise = import("@/app").then((m) => m.default);

    it("POST /registrations without auth should return 401 Unauthorized", async () => {
        const app = await appPromise;
        const res = await app.request("/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventID: "event-1" }),
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toContain("Authentication required");
    });

    it("POST /registrations with invalid body should return 400 Validation failed", async () => {
        const app = await appPromise;
        const res = await app.request("/registrations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": "mock-user-id",
            },
            body: JSON.stringify({}), // Missing eventID
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("Validation failed");
    });

    it("POST /teams without auth should return 401 Unauthorized", async () => {
        const app = await appPromise;
        const res = await app.request("/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Team Rocket", eventID: "event-1" }),
        });

        expect(res.status).toBe(401);
    });

    it("POST /teams with invalid body should return 400 Validation failed", async () => {
        const app = await appPromise;
        const res = await app.request("/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": "mock-user-id",
            },
            body: JSON.stringify({ name: "" }), // Missing eventID and name too short
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toBe("Validation failed");
    });

    it("POST /transactions without auth should return 401 Unauthorized", async () => {
        const app = await appPromise;
        const res = await app.request("/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 100, type: "REGISTRATION" }),
        });

        expect(res.status).toBe(401);
    });

    it("POST /transactions with negative amount should return 400 Validation failed", async () => {
        const app = await appPromise;
        const res = await app.request("/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": "mock-user-id",
            },
            body: JSON.stringify({ amount: -100, type: "REGISTRATION" }),
        });

        expect(res.status).toBe(400);
    });

    it("GET /participant/status without auth should return 401 Unauthorized", async () => {
        const app = await appPromise;
        const res = await app.request("/participant/status");
        expect(res.status).toBe(401);
    });

    it("GET /admin/transactions without admin access should return 403 Forbidden", async () => {
        const app = await appPromise;
        const res = await app.request("/admin/transactions");
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toContain("Administrator access required");
    });

    it("POST /transactions/webhook/manual should return 400 since manual provider has no webhooks", async () => {
        const app = await appPromise;
        const res = await app.request("/transactions/webhook/manual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.message).toContain("Webhook verification failed");
    });
});
