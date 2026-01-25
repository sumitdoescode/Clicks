import mongoose, { Schema, model, models } from "mongoose";

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

const User = models.User || model("User", userSchema);

export default User;
