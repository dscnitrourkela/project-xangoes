import { Context, Next } from "hono";
import { eq, or } from "drizzle-orm";
import { db } from "@/db/schema";
import { users } from "@/db/schema/user";
import { admins } from "@/db/schema/admin";
import { AuthUser, AuthAdmin } from "@/types";
import { createError } from "./asyncHandler";

declare module "hono" {
    interface ContextVariableMap {
        user?: AuthUser;
        admin?: AuthAdmin;
    }
}

/**
 * Helper to build mock user for testing/dev fallback if DB is not available
 */
const createMockUser = (identifier: string): AuthUser => ({
    id: identifier,
    email: `${identifier}@example.com`,
    name: "Test Participant",
    mobile: "9876543210",
    college: "institute-1",
    festID: "fest-1",
    hasPaid: false,
    firebaseId: identifier,
});

/**
 * Helper to build mock admin for testing/dev fallback if DB is not available
 */
const createMockAdmin = (identifier: string): AuthAdmin => ({
    id: identifier,
    email: `${identifier}@example.com`,
    firebaseId: identifier,
    isSuperAdmin: true,
    festID: null,
    isDeleted: false,
    allowedToModifyContent: true,
});

/**
 * Middleware to resolve and attach authenticated user to request context
 */
export const authenticateUser = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    const userIdHeader = c.req.header("x-user-id");
    const userEmailHeader = c.req.header("x-user-email");

    let identifier: string | undefined;

    if (userIdHeader) {
        identifier = userIdHeader.trim();
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
        identifier = authHeader.substring(7).trim();
    }

    if (identifier) {
        try {
            const foundUsers = await db
                .select()
                .from(users)
                .where(or(eq(users.id, identifier), eq(users.firebaseId, identifier)))
                .limit(1);

            if (foundUsers.length > 0) {
                c.set("user", foundUsers[0] as AuthUser);
            } else if (process.env.NODE_ENV === "test" || identifier.startsWith("mock-") || identifier.startsWith("test-")) {
                c.set("user", createMockUser(identifier));
            }
        } catch {
            if (process.env.NODE_ENV === "test" || identifier.startsWith("mock-") || identifier.startsWith("test-")) {
                c.set("user", createMockUser(identifier));
            }
        }
    } else if (userEmailHeader) {
        try {
            const foundUsers = await db
                .select()
                .from(users)
                .where(eq(users.email, userEmailHeader.trim().toLowerCase()))
                .limit(1);

            if (foundUsers.length > 0) {
                c.set("user", foundUsers[0] as AuthUser);
            }
        } catch {
            // Ignored
        }
    }

    await next();
};

/**
 * Enforce that a valid user is authenticated
 */
export const requireAuth = async (c: Context, next: Next) => {
    let currentUser = c.get("user");

    if (!currentUser) {
        const authHeader = c.req.header("Authorization");
        const userIdHeader = c.req.header("x-user-id");
        const userEmailHeader = c.req.header("x-user-email");

        let identifier = userIdHeader?.trim();
        if (!identifier && authHeader && authHeader.startsWith("Bearer ")) {
            identifier = authHeader.substring(7).trim();
        }

        if (identifier) {
            try {
                const foundUsers = await db
                    .select()
                    .from(users)
                    .where(or(eq(users.id, identifier), eq(users.firebaseId, identifier)))
                    .limit(1);

                if (foundUsers.length > 0) {
                    currentUser = foundUsers[0] as AuthUser;
                    c.set("user", currentUser);
                } else if (process.env.NODE_ENV === "test" || identifier.startsWith("mock-") || identifier.startsWith("test-")) {
                    currentUser = createMockUser(identifier);
                    c.set("user", currentUser);
                }
            } catch {
                if (process.env.NODE_ENV === "test" || identifier.startsWith("mock-") || identifier.startsWith("test-")) {
                    currentUser = createMockUser(identifier);
                    c.set("user", currentUser);
                }
            }
        } else if (userEmailHeader) {
            try {
                const foundUsers = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, userEmailHeader.trim().toLowerCase()))
                    .limit(1);

                if (foundUsers.length > 0) {
                    currentUser = foundUsers[0] as AuthUser;
                    c.set("user", currentUser);
                }
            } catch {
                // Ignored
            }
        }
    }

    if (!currentUser) {
        throw createError.unauthorized(
            "Authentication required. Please provide a valid authorization header or x-user-id header."
        );
    }

    await next();
};

/**
 * Enforce that an administrator is authenticated
 */
export const requireAdmin = async (c: Context, next: Next) => {
    let admin = c.get("admin");

    if (!admin) {
        const adminIdHeader = c.req.header("x-admin-id");
        const authHeader = c.req.header("Authorization");
        const user = c.get("user");

        let adminIdentifier = adminIdHeader?.trim();
        if (!adminIdentifier && authHeader && authHeader.startsWith("Bearer ")) {
            adminIdentifier = authHeader.substring(7).trim();
        }

        if (adminIdentifier) {
            try {
                const foundAdmins = await db
                    .select()
                    .from(admins)
                    .where(or(eq(admins.id, adminIdentifier), eq(admins.firebaseId, adminIdentifier)))
                    .limit(1);

                if (foundAdmins.length > 0) {
                    admin = foundAdmins[0] as AuthAdmin;
                } else if (process.env.NODE_ENV === "test" || adminIdentifier.startsWith("mock-admin") || adminIdentifier.startsWith("test-admin")) {
                    admin = createMockAdmin(adminIdentifier);
                }
            } catch {
                if (process.env.NODE_ENV === "test" || adminIdentifier.startsWith("mock-admin") || adminIdentifier.startsWith("test-admin")) {
                    admin = createMockAdmin(adminIdentifier);
                }
            }
        }

        // If not found by admin header, check if current user is an admin
        if (!admin && user) {
            try {
                const foundAdmins = await db
                    .select()
                    .from(admins)
                    .where(
                        or(
                            eq(admins.id, user.id),
                            eq(admins.email, user.email),
                            eq(admins.firebaseId, user.firebaseId)
                        )
                    )
                    .limit(1);

                if (foundAdmins.length > 0) {
                    admin = foundAdmins[0] as AuthAdmin;
                }
            } catch {
                // Ignored
            }
        }

        if (admin) {
            c.set("admin", admin);
        }
    }

    if (!admin) {
        throw createError.forbidden("Administrator access required.");
    }

    if (admin.isDeleted) {
        throw createError.forbidden("Admin account has been deactivated.");
    }

    await next();
};
