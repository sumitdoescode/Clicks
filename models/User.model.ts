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
        },
        email: {
            type: String,
            required: true,
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

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

const User = models.User || model("User", userSchema);

export default User;
