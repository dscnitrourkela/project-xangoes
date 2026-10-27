import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface ApiEnvelope<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: { code?: string } & Record<string, unknown>;
}

export interface SessionData {
    user: {
        id: string;
        email: string;
        name: string | null;
        mobile: string | null;
        college: string | null;
        profileComplete: boolean;
        missingFields: string[];
    };
    admin: {
        id: string;
        isSuperAdmin: boolean;
        festID: string | null;
        allowedToModifyContent: boolean;
    } | null;
}

/** Calls the API with the current user's Firebase ID token. */
export async function apiFetch<T>(
    path: string,
    init: RequestInit = {}
): Promise<{ status: number; body: ApiEnvelope<T> }> {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init.headers,
        },
    });
    return { status: res.status, body: (await res.json()) as ApiEnvelope<T> };
}

/** Registers the signed-in Firebase user with the server (creates the user row on first sign-in). */
export const createSession = () =>
    apiFetch<SessionData>("/auth/session", { method: "POST" });
