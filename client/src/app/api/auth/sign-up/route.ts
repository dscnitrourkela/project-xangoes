import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, AuthResponseData, signUpSchema, UserRole } from "@/types/api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const validation = signUpSchema.safeParse(body);

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

        const { name, email, mobile, role: requestedRole } = validation.data;

        // Auto-detect role or honour explicitly chosen role
        let resolvedRole: UserRole = requestedRole || "user";
        if (email.toLowerCase().includes("superadmin")) {
            resolvedRole = "super_admin";
        } else if (email.toLowerCase().includes("admin")) {
            resolvedRole = "admin";
        }

        const responsePayload: ApiResponse<AuthResponseData> = {
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    id: `usr_${Buffer.from(email).toString("base64url").slice(0, 12)}`,
                    email,
                    name,
                    role: resolvedRole,
                    mobile,
                    college: "National Institute of Technology Rourkela",
                },
                token: `jwt_xangoes_${Buffer.from(JSON.stringify({ email, role: resolvedRole, ts: Date.now() })).toString("base64url")}`,
            },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(responsePayload, { status: 201 });
    } catch (err) {
        const errorResponse: ApiResponse = {
            success: false,
            message: "Internal server error during registration",
            error: err instanceof Error ? err.message : "Unknown error",
            timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}
