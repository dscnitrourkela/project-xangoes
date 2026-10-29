import { IStorageProvider, SignedUploadUrlResult, UploadMetadata } from "./storage.interface";
import crypto from "crypto";

export class SecureEvidenceStorageProvider implements IStorageProvider {
    public readonly name = "secure-evidence-storage";

    /**
     * Generate a signed upload URL or token for direct client-to-storage upload
     */
    public async generateSignedUploadUrl(
        fileName: string,
        mimeType: string,
        folder: string = "payment-evidence"
    ): Promise<SignedUploadUrlResult> {
        // Enforce supported mime types for payment evidence
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new Error(`Unsupported evidence format: ${mimeType}. Allowed formats: JPG, PNG, WEBP, PDF`);
        }

        const uniqueId = crypto.randomUUID();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileKey = `${folder}/${uniqueId}_${sanitizedFileName}`;

        // In production, this can generate AWS S3 Presigned URLs or Cloudinary signed upload presets.
        // If Cloudinary / S3 credentials aren't configured, provide a structured secure upload reference.
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes validity
        const publicUrl = `/storage/${fileKey}`;

        return {
            uploadUrl: `/api/transactions/upload-direct?key=${encodeURIComponent(fileKey)}`,
            fileKey,
            publicUrl,
            expiresAt,
            headers: {
                "Content-Type": mimeType,
            },
        };
    }

    /**
     * Validates and returns structured reference and metadata for storing in the database
     */
    public async verifyAndStoreReference(
        fileKeyOrUrl: string,
        metadata?: Record<string, any>
    ): Promise<UploadMetadata> {
        if (!fileKeyOrUrl || typeof fileKeyOrUrl !== "string") {
            throw new Error("Invalid file reference or URL provided");
        }

        const cleanRef = fileKeyOrUrl.trim();
        const isUrl = cleanRef.startsWith("http://") || cleanRef.startsWith("https://") || cleanRef.startsWith("/storage/");

        const fileName = cleanRef.split("/").pop() || "evidence";
        const extension = fileName.split(".").pop()?.toLowerCase() || "unknown";

        let fileType = "application/octet-stream";
        if (["jpg", "jpeg"].includes(extension)) fileType = "image/jpeg";
        else if (extension === "png") fileType = "image/png";
        else if (extension === "webp") fileType = "image/webp";
        else if (extension === "pdf") fileType = "application/pdf";

        return {
            fileReference: cleanRef,
            fileName,
            fileType,
            fileSize: metadata?.fileSize,
            url: isUrl ? cleanRef : `/storage/${cleanRef}`,
            uploadedAt: new Date().toISOString(),
            provider: metadata?.provider || this.name,
        };
    }
}

export const evidenceStorage = new SecureEvidenceStorageProvider();
