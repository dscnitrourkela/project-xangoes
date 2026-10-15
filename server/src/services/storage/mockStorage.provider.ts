import { randomUUID } from 'crypto';
import {
    StorageProvider,
    SignedUploadUrlOptions,
    SignedUploadUrlResult,
} from './storage.interface';

/**
 * Default / Mock storage provider implementation.
 * Can easily be swapped with AWS S3, Cloudinary, or GCP Cloud Storage.
 */
export class MockStorageProvider implements StorageProvider {
    private baseUrl: string;

    constructor(baseUrl: string = 'https://storage.xangoes.internal') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    async getSignedUploadUrl(options: SignedUploadUrlOptions): Promise<SignedUploadUrlResult> {
        const folder = options.folder ? `${options.folder.replace(/^\/|\/$/g, '')}/` : '';
        const fileExt = options.fileName.includes('.')
            ? options.fileName.substring(options.fileName.lastIndexOf('.'))
            : '';
        const uniqueKey = `${folder}${randomUUID()}${fileExt}`;
        const expiresIn = options.expiresInSeconds || 900; // 15 mins default

        // Generate simulated signed upload URL
        const signature = Buffer.from(`${uniqueKey}:${Date.now() + expiresIn * 1000}`).toString('base64url');
        const uploadUrl = `${this.baseUrl}/upload/${uniqueKey}?signature=${signature}&expires=${expiresIn}`;
        const fileUrl = `${this.baseUrl}/${uniqueKey}`;

        return {
            uploadUrl,
            fileUrl,
            key: uniqueKey,
            expiresIn,
            headers: {
                'Content-Type': options.contentType,
            },
        };
    }

    async deleteFile(_key: string): Promise<boolean> {
        return true;
    }

    getFileUrl(key: string): string {
        return `${this.baseUrl}/${key.replace(/^\//, '')}`;
    }
}

export const defaultStorageProvider: StorageProvider = new MockStorageProvider();

