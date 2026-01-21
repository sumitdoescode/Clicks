import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Like from "@/models/Like.model";
import Post from "@/models/Post.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { isValidObjectId } from "mongoose";

// toggle like a post by id
// POST => api/like/post/[id]
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // check if user is already liked the post
        const like = await Like.findOne({ user: loggedInUser._id, post: post._id });
        if (like) {
            // remove like is already liked the post
            await like.deleteOne();
            return NextResponse.json({ success: true, message: "Like removed successfully", data: { like: false } }, { status: 200 });
        }

        // add like
        await Like.create({ user: loggedInUser._id, post: post._id });
        return NextResponse.json({ success: true, message: "Liked successfully", data: { like: true } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
