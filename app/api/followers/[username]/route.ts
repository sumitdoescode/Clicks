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
        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await connectDB();

        const { username } = await params;

        const user = await User.findOne({ username: username }).select("_id");
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const followers = await Follow.aggregate([
            {
                $match: {
                    following: user._id,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "follower",
                    foreignField: "_id",
                    as: "follower",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                username: 1,
                                image: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$follower",
            },
            {
                $project: {
                    follower: 1,
                    // "follower.name": 1,
                    // "follower.username": 1,
                    // "follower.image": 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data: { followers } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
