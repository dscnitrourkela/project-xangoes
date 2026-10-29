export type { EnvConfig } from './env.types';

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    requestId?: string;
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

// User Context
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    mobile: string;
    college: string | null;
    festID: string | null;
    hasPaid: boolean | null;
    firebaseId: string;
    photo?: string | null;
    rollNumber?: string | null;
    hall?: string | null;
}

// Admin Context
export interface AuthAdmin {
    id: string;
    email: string;
    firebaseId: string;
    isSuperAdmin: boolean | null;
    festID: string | null;
    isDeleted: boolean | null;
    allowedToModifyContent: boolean | null;
}

// Registration Types
export type RegistrationStatus = 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED' | 'REJECTED';

// Team Types
export type TeamInvitationType = 'INVITATION' | 'JOIN_REQUEST';
export type TeamInvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

// Transaction Types
export type TransactionType = 'REGISTRATION' | 'MERCH' | 'EVENT';
export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
