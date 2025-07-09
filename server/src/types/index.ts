export type { EnvConfig } from './env.types';

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
    details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
