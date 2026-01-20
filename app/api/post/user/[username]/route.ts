import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Post from "@/models/Post.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { isValidObjectId } from "mongoose";

// get all posts of a user by username
// GET => api/post/user/[username]
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        connectDB();

        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ email: session.user.email });
        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { username } = await params;
        if (!username) {
            return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
        }
        const user = await User.findOne({ username: username }).select("_id");
        if (!user) {
            return NextResponse.json({ success: false, message: `User not found with username : ${username}` }, { status: 404 });
        }

        // fetch posts from database
        const posts = await Post.aggregate([
            {
                $match: {
                    user: user._id,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "likes",
                },
            },
            {
                $lookup: {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "post",
                    as: "bookmarks",
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "post",
                    as: "comments",
                },
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    isLiked: {
                        $in: [loggedInUser._id, "$likes.user"],
                    },
                    isBookmarked: {
                        $in: [loggedInUser._id, "$bookmarks.user"],
                    },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $project: {
                    _id: 1,
                    image: 1,
                    caption: 1,
                    user: {
                        name: 1,
                        username: 1,
                        image: 1,
                    },
                    likesCount: 1,
                    commentsCount: 1,
                    isLiked: 1,
                    isBookmarked: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        return NextResponse.json({ success: true, data: { posts } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
