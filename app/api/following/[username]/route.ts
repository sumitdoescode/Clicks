import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Follow from "@/models/Follow.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";

// Get following list by username
// GET => api/following/[username]
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        connectDB();

        const { username } = await params;

        const user = await User.findOne({ username: username }).select("_id");
        if (!user) {
            return NextResponse.json({ success: false, message: `User not found with username : ${username}` }, { status: 404 });
        }

        const following = await Follow.aggregate([
            {
                $match: {
                    follower: user._id,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "following",
                    foreignField: "_id",
                    as: "following",
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
                $unwind: "$following",
            },
            {
                $project: {
                    following: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data: { following } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
