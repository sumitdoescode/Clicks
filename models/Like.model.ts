import mongoose, { Schema, model, models } from "mongoose";

const likeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }, // who is doing the like
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
        }, // who is being liked
    },
    { timestamps: true },
);

likeSchema.index({ user: 1, post: 1 }, { unique: true }); // ensure pair must be unique
likeSchema.index({ user: 1 });
likeSchema.index({ post: 1 });

const Like = models.Like || model("Like", likeSchema);

export default Like;
