import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, AuthResponseData, loginSchema, UserRole } from "@/types/api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            const fieldErrors = validation.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            const errorResponse: ApiResponse = {
                success: false,
                message: "Validation failed",
                error: fieldErrors,
                timestamp: new Date().toISOString(),
            };

            return NextResponse.json(errorResponse, { status: 400 });
        }

        const { email, role: requestedRole } = validation.data;

        // Determine user role (supports admin login detection by email or requested role)
        let resolvedRole: UserRole = "user";
        if (email.toLowerCase().includes("superadmin")) {
            resolvedRole = "super_admin";
        } else if (email.toLowerCase().includes("admin") || requestedRole === "admin") {
            resolvedRole = "admin";
        } else if (requestedRole === "super_admin") {
            resolvedRole = "super_admin";
        }

        const displayName = email.split("@")[0].replace(/[._-]/g, " ");
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        const responsePayload: ApiResponse<AuthResponseData> = {
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: `usr_${Buffer.from(email).toString("base64url").slice(0, 12)}`,
                    email,
                    name: formattedName || "Fest User",
                    role: resolvedRole,
                    mobile: "9876543210",
                    college: "National Institute of Technology Rourkela",
                },
                token: `jwt_xangoes_${Buffer.from(JSON.stringify({ email, role: resolvedRole, ts: Date.now() })).toString("base64url")}`,
            },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(responsePayload, { status: 200 });
    } catch (err) {
        const errorResponse: ApiResponse = {
            success: false,
            message: "Internal server error during authentication",
            error: err instanceof Error ? err.message : "Unknown error",
            timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}
