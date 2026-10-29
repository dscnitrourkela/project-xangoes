export interface SignedUploadUrlOptions {
    fileName: string;
    contentType: string;
    fileSize?: number;
    folder?: string;
    expiresInSeconds?: number;
}

export interface SignedUploadUrlResult {
    uploadUrl: string;
    fileUrl?: string;
    key?: string;
    expiresIn?: number;
    fileKey?: string;
    publicUrl?: string;
    expiresAt?: string;
    headers?: Record<string, string>;
}

export interface StorageProvider {
    /**
     * Generates a pre-signed URL for direct client upload
     */
    getSignedUploadUrl(options: SignedUploadUrlOptions): Promise<SignedUploadUrlResult>;

    /**
     * Deletes a file from the storage provider by key/path
     */
    deleteFile(key: string): Promise<boolean>;

    /**
     * Retrieves the public or CDN URL for an existing file
     */
    getFileUrl(key: string): string;
}

export interface UploadMetadata {
    fileReference: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    url: string;
    uploadedAt: string;
    provider: string;
}

export interface IStorageProvider {
    readonly name: string;
    generateSignedUploadUrl(fileName: string, mimeType: string, folder?: string): Promise<SignedUploadUrlResult>;
    verifyAndStoreReference(fileKeyOrUrl: string, metadata?: Record<string, any>): Promise<UploadMetadata>;
}
