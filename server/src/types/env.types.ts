// Environment configuration types

export interface EnvConfig {
    // Server Configuration
    PORT: number;
    NODE_ENV: string;
    // Database Configuration
    DATABASE_URL: string;
    // Rate Limiting Configuration
    RATE_LIMIT: number;
    RATE_LIMIT_WINDOW: number;
    // Google Auth Configuration
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
}
