import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    if (request.method !== "GET") {
        return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
    }
    return NextResponse.json({ success: true, message: "Server is healthy" }, { status: 200 });
}
