import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";

export async function GET(request: NextRequest) {
    try {
        const users = await User.find({});
        return NextResponse.json({ success: true, message: "Users fetched successfully", data: users }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
