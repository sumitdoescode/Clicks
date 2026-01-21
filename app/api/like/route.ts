import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import User from "@/models/User.model";
import Like from "@/models/Like.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";

// get all liked post of a user
// GET => api/like

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.findOne({ email: session.user.email });
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const likedPosts = await Like.aggregate([
            {
                $match: {
                    user: me._id,
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "post",
                    foreignField: "_id",
                    as: "post",
                    pipeline: [
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
                                bookmarksCount: { $size: "$bookmarks" },
                                commentsCount: { $size: "$comments" },
                                isBookmarked: {
                                    $in: [me._id, "$bookmarks.user"],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                image: 1,
                                caption: 1,
                                "user.image": 1,
                                "user.name": 1,
                                "user.username": 1,
                                likesCount: 1,
                                bookmarksCount: 1,
                                commentsCount: 1,
                                isLiked: 1,
                                isBookmarked: 1,
                                createdAt: 1,
                                updatedAt: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$post",
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $project: {
                    _id: 1,
                    post: 1,
                },
            },
        ]);
        return NextResponse.json({ success: true, data: { likedPosts } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Sever Error" }, { status: 500 });
    }
}
