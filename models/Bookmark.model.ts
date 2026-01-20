import mongoose, { Schema, model, models } from "mongoose";

const bookmarkSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }, // who is doing the bookmark
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
        }, // which post is being bookmarked
    },
    { timestamps: true },
);

const Bookmark = models.Bookmark || model("Bookmark", bookmarkSchema);

export default Bookmark;
