import mongoose, { Schema, model, models } from "mongoose";
import Post from "./Post.model";
import Like from "./Like.model";
import Comment from "./Bookmark.model";
import Bookmark from "./Bookmark.model";
import { put, del } from "@vercel/blob";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        bio: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
    },
    { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// a very big cleanup is required here
// delete the user data if user is deleted
// userSchema.pre("remove", async function (next) {
//     await Post.deleteMany({ user: this._id });
//     // delete the post image
//     try {
//         await del();
//     } catch (error) {
//         console.log(error);
//     }
//     await Like.deleteMany({ user: this._id });
// });

const User = models.User || model("User", userSchema);

export default User;
