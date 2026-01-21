import mongoose, { Schema, model, models } from "mongoose";

const messageSchema = new Schema(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

messageSchema.index({ conversationId: 1 }, { createdAt: 1 });
messageSchema.index({ conversationId: 1, receiver: 1 });

const Message = models.Message || model("Message", messageSchema);

export default Message;
