import { Context } from 'hono';
import { sendCreated, sendSuccess } from '@/middlewares';
import { defaultStorageProvider } from '@/services/storage';
import { SignedUploadUrlInput } from '@/middlewares/validators/storage';

export const storageController = {
    getSignedUploadUrl: async (c: Context) => {
        const body = (await c.req.json()) as SignedUploadUrlInput;
        const result = await defaultStorageProvider.getSignedUploadUrl({
            fileName: body.fileName,
            contentType: body.contentType,
            fileSize: body.fileSize,
            folder: body.folder || body.purpose,
        });

        return sendCreated(c, result, 'Signed upload URL generated successfully');
    },

    getFileUrl: async (c: Context) => {
        // Extract everything after /storage/url/
        const urlPath = new URL(c.req.url).pathname;
        const prefix = '/storage/url/';
        const key = urlPath.includes(prefix)
            ? urlPath.substring(urlPath.indexOf(prefix) + prefix.length)
            : c.req.param('*') || '';

        const fileUrl = defaultStorageProvider.getFileUrl(key);
        return sendSuccess(c, { fileUrl }, 'File URL retrieved successfully');
    },
};

