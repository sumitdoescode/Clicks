import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Comment from "@/models/Comment.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { isValidObjectId } from "mongoose";
import { CommentSchema } from "@/schemas/comment.schema";
import { flattenError } from "zod";
import Post from "@/models/Post.model";

// Get all comments of a post by post id
// GET => api/comment/post/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ email: session.user.email });
        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid post id" }, { status: 400 });
        }

        // check if post exists
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        const comments = await Comment.aggregate([
            {
                $match: {
                    post: post._id,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                username: 1,
                                image: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$user",
            },
            {
                $addFields: {
                    isPostOwner: {
                        $eq: ["$user._id", post.user],
                    },
                },
            },
            {
                $sort: {
                    isPostOwner: -1,
                    createdAt: -1,
                },
            },
            {
                $project: {
                    text: 1,
                    user: {
                        name: 1,
                        username: 1,
                        image: 1,
                    },
                    createdAt: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data: { comments } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Create a comment on a post
// POST => api/comment/post/[id]

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ email: session.user.email });
        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        // check if post exists
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        const data = await request.json();

        const result = CommentSchema.safeParse(data);
        if (!result.success) {
            return NextResponse.json({ success: false, error: flattenError(result.error).fieldErrors || "Invalid Data" }, { status: 400 });
        }

        // create the comment
        await Comment.create({ user: loggedInUser._id, post: post._id, text: result.data.text });
        return NextResponse.json({ success: true, message: "Comment created successfully" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Sever Error" }, { status: 500 });
    }
}
