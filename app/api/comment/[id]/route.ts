import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Comment from "@/models/Comment.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { isValidObjectId } from "mongoose";

// Delete by a comment by id
// DELETE => api/comment/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        // // check if comment exists
        // const comment = await Comment.findById(id);

        // if (!comment) {
        //     return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
        // }

        // // check if comment belongs to user
        // if (comment.user.toString() !== me._id.toString()) {
        //     return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        // }

        // // delete the comment
        // await comment.deleteOne();

        // fewer db queries
        const deleted = await Comment.findOneAndDelete({
            _id: id,
            user: me._id,
        });

        if (!deleted) {
            return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Comment Deleted Successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
