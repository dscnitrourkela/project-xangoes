"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { getStoredItem, removeStoredItem, setStoredItem } from "@/lib/storage";
import { AuthResponseData, LoginInput, SignUpInput, User, UserRole } from "@/types/api";

/**
 * =============================================================================
 * PLACEHOLDER ROLE & AUTH CONTEXT STUB
 * =============================================================================
 * Since the backend server currently has no authentication routes implemented,
 * this AuthContext acts as the client-side authentication and role management
 * stub. It manages the user session, resolves the user role ('user', 'admin',
 * 'super_admin', 'guest'), and enables role-aware UI navigation.
 * =============================================================================
 */
interface AuthContextType {
    user: User | null;
    role: UserRole;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginInput) => Promise<User>;
    signup: (data: SignUpInput) => Promise<User>;
    logout: () => void;
    setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "xangoes_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize auth state from browser storage on client mount
    useEffect(() => {
        try {
            const storedUser = getStoredItem(USER_STORAGE_KEY);
            const storedToken = apiClient.getToken();

            if (storedUser && storedToken) {
                const parsedUser: User = JSON.parse(storedUser);
                setUser(parsedUser);
                setTokenState(storedToken);
            }
        } catch {
            // Storage access issues or corrupt JSON
            removeStoredItem(USER_STORAGE_KEY);
            apiClient.setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (credentials: LoginInput): Promise<User> => {
        setIsLoading(true);
        try {
            const res = await apiClient.post<AuthResponseData>("/api/auth/login", credentials);
            const authData = res.data;

            if (!authData || !authData.user || !authData.token) {
                throw new Error("Invalid response format received from auth server");
            }

            setUser(authData.user);
            setTokenState(authData.token);
            apiClient.setToken(authData.token);
            setStoredItem(USER_STORAGE_KEY, JSON.stringify(authData.user));

            return authData.user;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: SignUpInput): Promise<User> => {
        setIsLoading(true);
        try {
            const res = await apiClient.post<AuthResponseData>("/api/auth/sign-up", data);
            const authData = res.data;

            if (!authData || !authData.user || !authData.token) {
                throw new Error("Invalid response format received from auth server");
            }

            setUser(authData.user);
            setTokenState(authData.token);
            apiClient.setToken(authData.token);
            setStoredItem(USER_STORAGE_KEY, JSON.stringify(authData.user));

            return authData.user;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        setUser(null);
        setTokenState(null);
        apiClient.setToken(null);
        removeStoredItem(USER_STORAGE_KEY);
    };

    // Helper to test and preview different roles dynamically
    const setRole = (newRole: UserRole): void => {
        if (!user) return;
        const updatedUser: User = { ...user, role: newRole };
        setUser(updatedUser);
        setStoredItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    };

    const role: UserRole = user ? user.role : "guest";
    const isAuthenticated = !!user && !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                token,
                isAuthenticated,
                isLoading,
                login,
                signup,
                logout,
                setRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
