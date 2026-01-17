import mongoose, { Schema, model, models } from "mongoose";

const commentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
        },
        text: {
            type: String,
            required: true,
            maxlength: [300, "Comment cannot exceed 300 characters"],
        },
    },
    { timestamps: true },
);

const Comment = models.Comment || model("Comment", commentSchema);

export default Comment;
