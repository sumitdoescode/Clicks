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

        const me = await User.exists({ email: session.user.email });
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        const post = await Post.exists({ _id: id });
        if (!post) {
            return NextResponse.json({ success: false, message: `Post not found with id ${id}` }, { status: 404 });
        }

        const deleted = await Bookmark.findOneAndDelete({ user: me._id, post: post._id });
        if (deleted) {
            return NextResponse.json({ success: true, message: "Bookmarked removed", isBookmark: false }, { status: 200 });
        }

        await Bookmark.create({ user: me._id, post: post._id });

        return NextResponse.json({ success: true, message: "Bookmarked successfully", isBookmark: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
