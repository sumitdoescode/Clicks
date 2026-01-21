import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Follow from "@/models/Follow.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";

// get user profile by username
// GET => api/user/[username]
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
        if (!username) {
            return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
        }

        const user = await User.aggregate([
            {
                $match: {
                    username: username,
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "user",
                    as: "posts",
                },
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "following",
                    as: "followers",
                },
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "follower",
                    as: "following",
                },
            },
            {
                $addFields: {
                    postsCount: { $size: "$posts" },
                    followersCount: { $size: "$followers" },
                    followingCount: { $size: "$following" },
                },
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    image: 1,
                    bio: 1,
                    postsCount: 1,
                    followersCount: 1,
                    followingCount: 1,
                },
            },
        ]);
        // user will be an array
        if (!user.length) return NextResponse.json({ success: false, message: `User not found with username : ${username}` }, { status: 404 });

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// follow and unfollow user
// POST => api/user/[username]
export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        await connectDB();

        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ email: session.user.email });

        const { username } = await params;

        const user = await User.findOne({ username }).select("_id");
        if (!user) {
            return NextResponse.json({ success: false, message: `User not found with username ${username}` }, { status: 404 });
        }

        // cannot follow yourself
        if (loggedInUser._id.toString() === user._id.toString()) {
            return NextResponse.json({ success: false, message: "You cannot follow yourself" }, { status: 400 });
        }

        // check if user is already following ?
        const following = await Follow.findOne({ follower: loggedInUser._id, following: user._id });
        if (following) {
            // await Follow.deleteOne({ follower: loggedInUser._id, following: user._id });
            await following.deleteOne();
            return NextResponse.json({ success: true, message: "User unfollowed successfully", data: { follow: false } }, { status: 200 });
        }

        // follow the user now
        await Follow.create({ follower: loggedInUser._id, following: user._id });
        return NextResponse.json({ success: true, message: "User followed successfully", data: { follow: true } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
