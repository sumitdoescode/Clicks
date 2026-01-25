import mongoose, { Schema, model, models } from "mongoose";

const bookmarkSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // who is doing the bookmark
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        }, // which post is being bookmarked
    },
    { timestamps: true },
);

bookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark = models.Bookmark || model("Bookmark", bookmarkSchema);

export default Bookmark;
