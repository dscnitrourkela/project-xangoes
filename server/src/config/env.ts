import dotenv from 'dotenv';
import { z } from 'zod';
import type { EnvConfig } from '@/types';

// Load environment variables from .env if present
dotenv.config();

const envSchema = z.object({
    PORT: z
        .string()
        .optional()
        .default('3000')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().positive()),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    DATABASE_URL: z
        .string()
        .min(1, 'DATABASE_URL is required'),
    RATE_LIMIT: z
        .string()
        .optional()
        .default('100')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().positive()),
    RATE_LIMIT_WINDOW: z
        .string()
        .optional()
        .default('60')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().positive()),
    GOOGLE_CLIENT_ID: z
        .string()
        .min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z
        .string()
        .min(1, 'GOOGLE_CLIENT_SECRET is required'),
    GOOGLE_REDIRECT_URI: z
        .string()
        .min(1, 'GOOGLE_REDIRECT_URI is required')
        .url('GOOGLE_REDIRECT_URI must be a valid URL'),
});

let parsedEnv: EnvConfig;

/**
 * Validates environment variables and provides structured startup errors.
 */
export function validateEnv(): EnvConfig {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Environment validation failed with the following errors:');
        for (const issue of result.error.issues) {
            const path = issue.path.join('.') || 'Root';
            console.error(`  - [${path}]: ${issue.message}`);
        }
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw new Error(
            `Environment validation failed:\n` +
            result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
        );
    }

    parsedEnv = result.data as EnvConfig;
    return parsedEnv;
}

// Initialise lazy-evaluated env accessor so imports don't crash before test setup or validateEnv
export const env: EnvConfig = new Proxy({} as EnvConfig, {
    get(_target, prop: keyof EnvConfig) {
        if (!parsedEnv) {
            const result = envSchema.safeParse(process.env);
            if (result.success) {
                parsedEnv = result.data as EnvConfig;
            } else {
                // Return reasonable fallback if accessing in test or early load
                if (prop === 'PORT') return parseInt(process.env.PORT || '3000', 10);
                if (prop === 'NODE_ENV') return process.env.NODE_ENV || 'development';
                if (prop === 'RATE_LIMIT') return parseInt(process.env.RATE_LIMIT || '100', 10);
                if (prop === 'RATE_LIMIT_WINDOW') return parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10);
                return (process.env as Record<string, any>)[prop as string] || '';
            }
        }
        return parsedEnv[prop];
    },
});

export default env;
