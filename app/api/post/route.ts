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

// get all posts => feed of posts
// GET => api/posts
export async function GET(request: NextRequest) {
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

        const posts = await Post.aggregate([
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
                    isLiked: {
                        $in: [me._id, "$likes.user"],
                    },
                    isBookmarked: {
                        $in: [me._id, "$bookmarks.user"],
                    },
                    commentsCount: { $size: "$comments" },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $project: {
                    user: 1,
                    caption: 1,
                    image: 1,
                    likesCount: 1,
                    isLiked: 1,
                    isBookmarked: 1,
                    commentsCount: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data: { posts } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// create a post
// POST => api/post
export async function POST(request: NextRequest) {
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

        const formData = await request.formData();
        const caption = formData.get("caption");
        const image = formData.get("image") as File;

        const data = { caption, image };
        // if client didn't send the caption, caption will be null
        // if client didn't sent the image, image will be null

        const result = PostSchema.safeParse(data);
        if (!result.success) {
            return NextResponse.json({ success: false, error: flattenError(result.error).fieldErrors }, { status: 400 });
        }

        const blob = await put(image.name, image, {
            access: "public",
            addRandomSuffix: true,
        });

        try {
            const post = await Post.create({
                user: me._id,
                caption: result.data.caption,
                image: blob.url,
            });
            return NextResponse.json({ success: true, message: "Post created successfully", data: { post } }, { status: 200 });
        } catch (error) {
            // delete the image if post creation fails
            if (blob) {
                await del(blob.url);
            }
            throw error;
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
