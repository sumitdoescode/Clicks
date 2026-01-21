import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Bookmark from "@/models/Bookmark.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { isValidObjectId } from "mongoose";
import Post from "@/models/Post.model";

// bookmark a post => toogle bookmark
// POST => api/bookmarks/post/[id]
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, message: `Post not found with id ${id}` }, { status: 404 });
        }

        // check if user is already bookmarked that post
        const bookmark = await Bookmark.findOne({ user: loggedInUser._id, post: post._id });
        if (bookmark) {
            // remove bookmark is already bookmared the post
            await bookmark.deleteOne();
            return NextResponse.json({ success: true, message: "Bookmark removed successfully", data: { bookmark: false } }, { status: 200 });
        }

        // add bookmark
        await Bookmark.create({ user: loggedInUser._id, post: post._id });
        return NextResponse.json({ success: true, message: "Bookmarked successfully", data: { bookmark: true } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
