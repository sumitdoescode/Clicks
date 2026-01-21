import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { UserSchema } from "@/schemas/user.schema";
import { flattenError } from "zod";
import { put, del } from "@vercel/blob";

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

        const user = await User.aggregate([
            {
                $match: {
                    email: session.user.email,
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "user",
                    as: "posts",
                },
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "following",
                    as: "followers",
                },
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "_id",
                    foreignField: "follower",
                    as: "following",
                },
            },
            {
                $lookup: {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "user",
                    as: "bookmarks",
                },
            },
            {
                $addFields: {
                    postsCount: { $size: "$posts" },
                    followersCount: { $size: "$followers" },
                    followingCount: { $size: "$following" },
                    bookmarksCount: { $size: "$bookmarks" },
                },
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    image: 1,
                    bio: 1,
                    postsCount: 1,
                    followersCount: 1,
                    followingCount: 1,
                    bookmarksCount: 1,
                },
            },
        ]);
        // user will be an array
        if (!user.length) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: { user: user[0] } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
