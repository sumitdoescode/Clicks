import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { UserSchema } from "@/schemas/user.schema";
import { flattenError } from "zod";
import { put, del } from "@vercel/blob";
import Post from "@/models/Post.model";
import Follow from "@/models/Follow.model";
import Bookmark from "@/models/Bookmark.model";

// get own user profile => postsCount, followersCount, followingCount, bookmarksCount
// GET => api/user
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth.api.getSession({
            headers: await headers(), // you need to pass the headers object.
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.findOne({ email: session.user.email }).select("_id name username image bio");
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const [postsCount, followersCount, followingCount, bookmarksCount] = await Promise.all([
            Post.countDocuments({ user: me._id }),
            Follow.countDocuments({ following: me._id }),
            Follow.countDocuments({ follower: me._id }),
            Bookmark.countDocuments({ user: me._id }),
        ]);
        return NextResponse.json({ success: true, data: { ...me.toObject(), postsCount, followersCount, followingCount, bookmarksCount } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// update user profile
// PUT => api/user
export async function PUT(request: NextRequest) {
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
        const name = formData.get("name");
        const username = formData.get("username");
        const bio = formData.get("bio");
        const image = formData.get("image") as File;

        // extracted data into an object

        const data = {
            name,
            username,
            bio: bio || undefined, // if we didn't pass the bio from frontend, it will be null so make it undefined,
            image: image || undefined,
        };

        // validate the data using zod schema
        const result = UserSchema.safeParse(data);
        if (!result.success) {
            return NextResponse.json({ success: false, error: flattenError(result.error).fieldErrors }, { status: 400 });
        }

        const updatedData = {
            name: result.data.name,
            username: result.data.username,
            bio: result.data.bio || me.bio, // keep the old if user didn't give a new bio
            image: me.image, // keep the old image by default
        };

        if (result.data.image) {
            // if user has given an image that means user wants to update the image

            // if previous image exists
            if (me.image) {
                await del(me.image);
            }

            // save new image to storage
            const blob = await put(image.name, image, {
                access: "public",
                addRandomSuffix: true,
            });

            // update the image url in the database
            updatedData.image = blob.url;
        }

        await me.updateOne({
            $set: updatedData,
        });

        return NextResponse.json({ success: true, message: "User updated successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
