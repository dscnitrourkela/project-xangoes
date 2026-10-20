import { z } from "zod";

/**
 * Standard API response envelope matching the server schema
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string | Array<{ field: string; message: string }> | unknown;
    timestamp: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * User roles supported across Project Xangoes
 */
export type UserRole = "super_admin" | "admin" | "user" | "guest";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    mobile?: string;
    college?: string;
    rollNumber?: string;
    festID?: string;
}

export interface AuthResponseData {
    user: User;
    token: string;
}

/**
 * Login validation schema
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin", "super_admin"]).default("user"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Sign-up validation schema matching server User model constraints
 */
export const signUpSchema = z
    .object({
        name: z
            .string()
            .min(1, "Full name is required")
            .min(2, "Full name must be at least 2 characters"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format"),
        mobile: z
            .string()
            .min(1, "Mobile number is required")
            .regex(/^\+?[0-9]{10,15}$/, "Please enter a valid 10-15 digit mobile number"),
        role: z.enum(["user", "admin"]).default("user"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignUpInput = z.infer<typeof signUpSchema>;
