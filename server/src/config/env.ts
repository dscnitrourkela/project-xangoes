import type { EnvConfig } from "@/types";

// Helper function to parse environment variables with type conversion
function parseEnv<T>(
    value: string | undefined,
    defaultValue: T,
    parser?: (val: string) => T
): T {
    if (!value) return defaultValue;

    if (parser) {
        try {
            return parser(value);
        } catch {
            return defaultValue;
        }
    }

    return value as T;
}

// Helper function to validate required environment variables
function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Required environment variable ${key} is not defined`);
    }
    return value;
}

// Environment configuration object
export const env: EnvConfig = {
    // Server Configuration
    PORT: parseEnv(process.env.PORT, 3000, parseInt),
    // Database Configuration
    DATABASE_URL: requireEnv("DATABASE_URL"),
    // Rate Limiting Configuration
    RATE_LIMIT: parseEnv(process.env.RATE_LIMIT, 100, parseInt),
    RATE_LIMIT_WINDOW: parseEnv(process.env.RATE_LIMIT_WINDOW, 60, parseInt),
};

// Validation function for critical environment variables
export function validateEnv(): void {
    const errors: string[] = [];

    const requiredVars: string[] = [];

    for (const varName of requiredVars) {
        try {
            requireEnv(varName);
        } catch (error) {
            errors.push((error as Error).message);
        }
    }

    if (errors.length > 0) {
        console.error("Environment validation failed:");
        errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
    }
}

export default env;
