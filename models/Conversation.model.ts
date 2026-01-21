import { Schema, model, models } from "mongoose";

const conversationSchema = new Schema(
    {
        participant1: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        participant2: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    { timestamps: true },
);

// compound index
conversationSchema.index({ participant1: 1, participant2: 1 }, { unique: true }); // ensure pair must be unique
// conversationSchema.index({ participant1: 1, participant2: -1 });

const Conversation = models.Conversation || model("Conversation", conversationSchema);

export default Conversation;
