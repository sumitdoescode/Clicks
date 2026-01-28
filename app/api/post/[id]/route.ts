import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import Post from "@/models/Post.model";
import Like from "@/models/Like.model";
import Comment from "@/models/Comment.model";
import Bookmark from "@/models/Bookmark.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put, del } from "@vercel/blob";
import { UpdatePostSchema } from "@/schemas/post.schema";
import { flattenError } from "zod";
import mongoose, { isValidObjectId } from "mongoose";

// Get a post by id
// GET => api/post/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.findOne({ email: session.user.email });
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        const post = await Post.findById(id).populate({
            path: "user",
            select: "name username image",
        });
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        const [likesCount, isLiked, isBookmarked] = await Promise.all([Like.countDocuments({ post: post._id }), Like.exists({ user: me._id, post: post._id }), Bookmark.exists({ user: me._id, post: post._id })]);
        const postData = {
            ...post.toObject(),
            likesCount,
            isLiked,
            isBookmarked,
        };
        return NextResponse.json({ success: true, post: postData }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// Delete a post by id
// DELETE => api/post/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let mongoSession: any;
    try {
        await connectDB();

        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.exists({ email: session.user.email });
        if (!me) {
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

        // check if post belongs to user
        if (post.user.toString() !== me._id.toString()) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        mongoSession = await Post.startSession();

        await mongoSession.withTransaction(async () => {
            await Promise.all([Like.deleteMany({ post: post._id }, { session: mongoSession }), Comment.deleteMany({ post: post._id }, { session: mongoSession }), Bookmark.deleteMany({ post: post._id }, { session: mongoSession })]);

            await post.deleteOne({ session: mongoSession });
        });

        // delete the post image from storage
        try {
            if (post.image) {
                await del(post.image);
            }
        } catch (error) {
            // if image deletion fails, don't throw an error
            console.log(error);
        }

        return NextResponse.json({ success: true, message: "Post Deleted Successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    } finally {
        if (mongoSession) {
            await mongoSession.endSession();
        }
    }
}

// Update a post by id (can only update caption)
// PUT => api/post/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

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

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        // check if post exists
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        // check if post belongs to user
        if (post.user.toString() !== loggedInUser._id.toString()) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const { caption } = await request.json();

        const result = UpdatePostSchema.safeParse({ caption });
        if (!result.success) {
            return NextResponse.json({ success: false, error: flattenError(result.error).fieldErrors }, { status: 400 });
        }

        await post.updateOne({
            $set: {
                caption: result.data.caption,
            },
        });

        return NextResponse.json({ success: true, message: "Post updated successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
