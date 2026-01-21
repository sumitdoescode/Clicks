import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User.model";
import Post from "@/models/Post.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put, del } from "@vercel/blob";
import { PostSchema } from "@/schemas/post.schema";
import { flattenError } from "zod";
import { isValidObjectId } from "mongoose";

// Delete a post by id
// DELETE => api/post/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // delete the post image from storage
        if (post.image) {
            await del(post.image);
        }

        // delete the post from database
        await post.deleteOne();

        return NextResponse.json({ success: true, message: "Post Deleted Successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// Update a post by id
// PUT => api/post/[id]
// user can update their post image and caption
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

        const formData = await request.formData();
        const image = formData.get("image") as File;
        const caption = formData.get("caption"); // if user won't even send caption key caption = null

        if (!image) {
            return NextResponse.json({ success: false, message: "Image is required" }, { status: 400 });
        }

        const result = PostSchema.safeParse({ caption });
        if (!result.success) {
            return NextResponse.json({ success: false, error: flattenError(result.error).fieldErrors }, { status: 400 });
        }

        // remove old image from storage
        if (post.image) {
            await del(post.image);
        }

        // save new post image to storage
        const blob = await put(image.name, image, {
            access: "public",
            addRandomSuffix: true,
        });

        await post.updateOne({
            $set: {
                caption: result.data.caption,
                image: blob.url,
            },
        });

        return NextResponse.json({ success: true, message: "Post updated successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
