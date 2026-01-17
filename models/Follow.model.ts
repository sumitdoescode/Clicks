import mongoose, { Schema, model, models } from "mongoose";

const followSchema = new Schema(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }, // who is doing the follow
        following: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }, // who is being followed
    },
    { timestamps: true },
);

// alice follows bob
// follower: alice
// following : bob

// bob follows alice
// follower: bob
// following : alice

// if charlie follows bob
// follower : charlie
// following : bob

// prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true }); // ensuing pair must be unique

followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

const Follow = models.Follow || model("Follow", followSchema);

export default Follow;
