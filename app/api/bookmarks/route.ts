import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Bookmark from "@/models/Bookmark.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";

// get own bookmarks =>
// GET => api/bookmarks
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.exists({ email: session.user.email });
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const bookmarks = await Bookmark.aggregate([
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
                                let: { postId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$post", "$$postId"],
                                            },
                                        },
                                    },
                                    {
                                        $count: "count",
                                    },
                                ],
                                as: "likesCount",
                            },
                        },
                        {
                            $lookup: {
                                from: "comments",
                                let: { postId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$post", "$$postId"],
                                            },
                                        },
                                    },
                                    {
                                        $count: "count",
                                    },
                                ],
                                as: "commentsCount",
                            },
                        },
                        {
                            $addFields: {
                                likesCount: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: ["$likesCount.count", 0],
                                        },
                                        0,
                                    ],
                                },
                                commentsCount: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: ["$commentsCount.count", 0],
                                        },
                                        0,
                                    ],
                                },
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
                    _id: 0,
                    post: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data: { bookmarks } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
