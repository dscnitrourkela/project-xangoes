import { ApiResponse } from "@/types/api";
import { getStoredItem, setStoredItem, removeStoredItem } from "./storage";

export interface RequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    token?: string | null;
}

/**
 * Standard typed API client error encapsulating HTTP status, message,
 * structured field-level errors (from server Zod validation), and raw response.
 */
export class ApiClientError extends Error {
    public readonly status: number;
    public readonly timestamp: string;
    public readonly fieldErrors: Record<string, string>;
    public readonly response?: ApiResponse<unknown>;

    constructor(
        message: string,
        status: number,
        fieldErrors: Record<string, string> = {},
        response?: ApiResponse<unknown>
    ) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.response = response;
        this.timestamp = response?.timestamp || new Date().toISOString();
    }
}

/**
 * Extract structured field errors from envelope error field
 */
function parseFieldErrors(errorPayload: unknown): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (Array.isArray(errorPayload)) {
        for (const item of errorPayload) {
            if (item && typeof item === "object" && "field" in item && "message" in item) {
                const field = String(item.field);
                const message = String(item.message);
                if (field && message) {
                    fieldErrors[field] = message;
                }
            }
        }
    } else if (errorPayload && typeof errorPayload === "object") {
        for (const [key, value] of Object.entries(errorPayload)) {
            if (typeof value === "string") {
                fieldErrors[key] = value;
            }
        }
    }

    return fieldErrors;
}

class ApiClient {
    private baseURL: string;
    private token: string | null = null;
    private readonly tokenStorageKey = "xangoes_auth_token";

    constructor(baseURL?: string) {
        this.baseURL = baseURL ?? (process.env.NEXT_PUBLIC_API_URL || "");
        this.token = getStoredItem(this.tokenStorageKey);
    }

    /**
     * Set or clear the active Bearer auth token
     */
    public setToken(token: string | null): void {
        this.token = token;
        if (token) {
            setStoredItem(this.tokenStorageKey, token);
        } else {
            removeStoredItem(this.tokenStorageKey);
        }
    }

    /**
     * Retrieve the current auth token
     */
    public getToken(): string | null {
        return this.token;
    }

    /**
     * Update the base URL dynamically
     */
    public setBaseURL(url: string): void {
        this.baseURL = url;
    }

    /**
     * Construct URL with query parameters
     */
    private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
        let fullUrl: string;

        if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
            fullUrl = endpoint;
        } else {
            const base = this.baseURL.replace(/\/+$/, "");
            const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
            fullUrl = `${base}${path}`;
        }

        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            }
            const query = searchParams.toString();
            if (query) {
                fullUrl += (fullUrl.includes("?") ? "&" : "?") + query;
            }
        }

        return fullUrl;
    }

    /**
     * Primary typed request method executing fetch and normalizing against ApiResponse envelope
     */
    public async request<T = unknown>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const {
            body,
            params,
            headers: customHeaders = {},
            token: overrideToken,
            credentials = "same-origin",
            ...fetchOptions
        } = options;

        const url = this.buildUrl(endpoint, params);
        const headers = new Headers(customHeaders);

        // Ensure JSON headers when sending payload
        if (!headers.has("Accept")) {
            headers.set("Accept", "application/json");
        }

        let serializedBody: BodyInit | null | undefined = undefined;

        if (body !== undefined && body !== null) {
            if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string") {
                serializedBody = body as BodyInit;
            } else {
                if (!headers.has("Content-Type")) {
                    headers.set("Content-Type", "application/json");
                }
                serializedBody = JSON.stringify(body);
            }
        }

        // Apply Bearer Authorization token if available
        const activeToken = overrideToken !== undefined ? overrideToken : this.token;
        if (activeToken && !headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${activeToken}`);
        }

        let rawResponse: Response;
        try {
            rawResponse = await fetch(url, {
                ...fetchOptions,
                headers,
                credentials,
                body: serializedBody,
            });
        } catch (networkError) {
            throw new ApiClientError(
                networkError instanceof Error ? networkError.message : "Network request failed",
                0
            );
        }

        // Parse JSON response body
        const contentType = rawResponse.headers.get("content-type") || "";
        let parsedData: unknown = null;

        if (contentType.includes("application/json")) {
            try {
                parsedData = await rawResponse.json();
            } catch {
                parsedData = null;
            }
        } else {
            parsedData = await rawResponse.text();
        }

        // Validate envelope shape
        const isEnvelope =
            parsedData !== null &&
            typeof parsedData === "object" &&
            "success" in parsedData;

        if (isEnvelope) {
            const envelope = parsedData as ApiResponse<T>;
            if (!envelope.success || !rawResponse.ok) {
                const fieldErrors = parseFieldErrors(envelope.error);
                const errorMessage =
                    envelope.message ||
                    (typeof envelope.error === "string" ? envelope.error : "Request failed");
                throw new ApiClientError(
                    errorMessage,
                    rawResponse.status,
                    fieldErrors,
                    envelope as ApiResponse<unknown>
                );
            }
            return envelope;
        }

        // Non-envelope fallback (e.g. standard HTTP responses or unexpected server output)
        if (!rawResponse.ok) {
            const fallbackMessage =
                typeof parsedData === "string" && parsedData.length > 0
                    ? parsedData
                    : `Request failed with status ${rawResponse.status}`;
            throw new ApiClientError(fallbackMessage, rawResponse.status);
        }

        // Wrap plain data in agreed envelope format
        return {
            success: true,
            message: "Success",
            data: parsedData as T,
            timestamp: new Date().toISOString(),
        };
    }

    public async get<T = unknown>(
        endpoint: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    public async post<T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: "POST", body: data });
    }

    public async put<T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: "PUT", body: data });
    }

    public async patch<T = unknown>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: "PATCH", body: data });
    }

    public async delete<T = unknown>(
        endpoint: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }

    /**
     * Safe wrapper returning [data, null] or [null, error] to avoid try/catch boilerplate
     */
    public async safe<T = unknown>(
        requestPromise: Promise<ApiResponse<T>>
    ): Promise<[ApiResponse<T> | null, ApiClientError | null]> {
        try {
            const res = await requestPromise;
            return [res, null];
        } catch (error) {
            if (error instanceof ApiClientError) {
                return [null, error];
            }
            return [
                null,
                new ApiClientError(
                    error instanceof Error ? error.message : "Unknown error occurred",
                    0
                ),
            ];
        }
    }
}

export const apiClient = new ApiClient();
