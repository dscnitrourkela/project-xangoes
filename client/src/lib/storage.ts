/**
 * Safe cross-platform Web Storage utility.
 * Protects against Node.js 22/25 experimental localStorage bug where globalThis.localStorage
 * is an object without standard Storage methods (.getItem, .setItem).
 */

if (
    typeof globalThis !== "undefined" &&
    (!globalThis.localStorage || typeof (globalThis.localStorage as Partial<Storage>)?.getItem !== "function")
) {
    const memoryStore = new Map<string, string>();
    try {
        Object.defineProperty(globalThis, "localStorage", {
            value: {
                getItem: (key: string): string | null => memoryStore.get(String(key)) ?? null,
                setItem: (key: string, value: string): void => {
                    memoryStore.set(String(key), String(value));
                },
                removeItem: (key: string): void => {
                    memoryStore.delete(String(key));
                },
                clear: (): void => {
                    memoryStore.clear();
                },
                key: (index: number): string | null => Array.from(memoryStore.keys())[index] ?? null,
                get length(): number {
                    return memoryStore.size;
                },
            },
            configurable: true,
            writable: true,
        });
    } catch {
        // Ignore if property cannot be modified
    }
}

export function getStoredItem(key: string): string | null {
    try {
        if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.getItem === "function") {
            return window.localStorage.getItem(key);
        }
        if (typeof globalThis !== "undefined" && globalThis.localStorage && typeof globalThis.localStorage.getItem === "function") {
            return globalThis.localStorage.getItem(key);
        }
    } catch {
        // Ignore browser security restrictions
    }
    return null;
}

export function setStoredItem(key: string, value: string): void {
    try {
        if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.setItem === "function") {
            window.localStorage.setItem(key, value);
        } else if (typeof globalThis !== "undefined" && globalThis.localStorage && typeof globalThis.localStorage.setItem === "function") {
            globalThis.localStorage.setItem(key, value);
        }
    } catch {
        // Ignore browser security restrictions
    }
}

export function removeStoredItem(key: string): void {
    try {
        if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.removeItem === "function") {
            window.localStorage.removeItem(key);
        } else if (typeof globalThis !== "undefined" && globalThis.localStorage && typeof globalThis.localStorage.removeItem === "function") {
            globalThis.localStorage.removeItem(key);
        }
    } catch {
        // Ignore browser security restrictions
    }
}
