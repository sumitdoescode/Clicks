import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import User from "@/models/User.model";
import Message from "@/models/Message.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { MessageSchema } from "@/schemas/message.schema";
import { flattenError } from "zod";
import Conversation from "@/models/Conversation.model";
import { isValidObjectId } from "mongoose";

// delete a conversation by id
// DELETE => api/conversation/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let mongoSession: any;
    try {
        await connectDB();
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ email: session.user.email });
        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
        }

        // start a mongodb session for the transaction
        mongoSession = await Conversation.startSession();

        await mongoSession.withTransaction(async () => {
            const conversation = await Conversation.findOneAndDelete({
                _id: id,
                $or: [{ participant1: loggedInUser._id }, { participant2: loggedInUser._id }],
            });
            if (!conversation) {
                throw new Error("CONVERSATION_NOT_FOUND");
            }

            await Message.deleteMany({ conversationId: conversation._id }, { session: mongoSession });
        });

        return NextResponse.json({ success: true, message: "Conversation deleted successfully" }, { status: 200 });
    } catch (error: any) {
        if (error.message === "CONVERSATION_NOT_FOUND") {
            return NextResponse.json({ success: false, message: "Conversation not found" }, { status: 404 });
        }
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    } finally {
        if (mongoSession) {
            await mongoSession.endSession();
        }
    }
}
