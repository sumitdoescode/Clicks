import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Follow from "@/models/Follow.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";

// Get followers list by username
// GET => api/followers/[username]
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        await connectDB();

        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // not really necessary => extra DB query
        // const me = await User.findOne({ email: session.user.email });
        // if (!me) {
        //     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        // }

        const { username } = await params;

        if (!username || typeof username !== "string" || username.length < 3) {
            return NextResponse.json({ success: false, message: "Invalid username" }, { status: 400 });
        }

        const otherUser = await User.findOne({ username }).select("_id");
        if (!otherUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        let followers = await Follow.find({ following: otherUser._id })
            .populate({
                path: "follower",
                select: "_id name username image",
            })
            .select("follower");
        followers = followers.map((f) => f.follower);
        return NextResponse.json({ success: true, data: { followers } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
