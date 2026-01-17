import mongoose, { Schema, model, models } from "mongoose";

const postSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        caption: {
            type: String,
            required: false,
            default: "",
            maxlength: [300, "Caption cannot exceed 300 characters"],
        },
        image: {
            type: String,
            required: true,
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true },
);

const Post = models.Post || model("Post", postSchema);

export default Post;
