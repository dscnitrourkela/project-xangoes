import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, User } from "@/types/api";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const errorResponse: ApiResponse = {
            success: false,
            message: "Authentication required",
            timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 401 });
    }

    const token = authHeader.substring(7);

    try {
        // Decode payload from demo token jwt_xangoes_<base64url>
        let email = "user@xangoes.dscnitrourkela.org";
        let role: User["role"] = "user";

        if (token.startsWith("jwt_xangoes_")) {
            const rawPayload = token.replace("jwt_xangoes_", "");
            const decoded = JSON.parse(Buffer.from(rawPayload, "base64url").toString("utf-8"));
            if (decoded.email) email = decoded.email;
            if (decoded.role) role = decoded.role;
        }

        const displayName = email.split("@")[0].replace(/[._-]/g, " ");
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        const responsePayload: ApiResponse<User> = {
            success: true,
            message: "User session active",
            data: {
                id: `usr_${Buffer.from(email).toString("base64url").slice(0, 12)}`,
                email,
                name: formattedName || "Fest User",
                role,
                mobile: "9876543210",
                college: "National Institute of Technology Rourkela",
            },
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(responsePayload, { status: 200 });
    } catch {
        const errorResponse: ApiResponse = {
            success: false,
            message: "Invalid or expired authentication token",
            timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 401 });
    }
}
