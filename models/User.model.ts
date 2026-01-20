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
            index: true,
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

const User = models.User || model("User", userSchema);

export default User;
