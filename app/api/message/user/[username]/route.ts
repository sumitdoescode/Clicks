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

// send a message to a user by username
// POST => api/message/user/[username]
export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    let mongoSession: any;
    try {
        await connectDB();
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.findOne({ email: session.user.email });
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { username } = await params;
        if (!username) {
            return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
        }

        const otherUser = await User.findOne({ username }).select("_id");
        if (!otherUser) {
            return NextResponse.json({ success: false, message: `User not found with username : ${username}` }, { status: 404 });
        }

        // cannot send message to yourself
        if (me._id.toString() === otherUser._id.toString()) {
            return NextResponse.json({ success: false, message: "You cannot send message to yourself" }, { status: 400 });
        }

        // validate the data using zod schema
        const { text } = await request.json();
        const data = { text };
        const result = MessageSchema.safeParse(data);
        if (!result.success) {
            return NextResponse.json({ success: false, error: flattenError(result.error).fieldErrors || "Invalid Data" }, { status: 400 });
        }

        mongoSession = await Conversation.startSession();

        await mongoSession.withTransaction(async () => {
            let conversation = await Conversation.findOne(
                {
                    $or: [
                        { participant1: me._id, participant2: otherUser._id },
                        { participant1: otherUser._id, participant2: me._id },
                    ],
                },
                null,
                { session: mongoSession },
            );

            if (!conversation) {
                [conversation] = await Conversation.create(
                    [
                        {
                            participant1: me._id,
                            participant2: otherUser._id,
                        },
                    ],
                    { session: mongoSession },
                );
            }

            const [message] = await Message.create([{ sender: me._id, receiver: otherUser._id, text: result.data.text, conversationId: conversation._id }], { session: mongoSession });

            await Conversation.findByIdAndUpdate(
                conversation._id,
                {
                    $set: {
                        lastMessage: message._id,
                    },
                },
                { session: mongoSession },
            );
        });

        return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    } finally {
        if (mongoSession) {
            await mongoSession.endSession();
        }
    }
}

// get messages of a user by username
// GET => api/message/user/[username]
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        await connectDB();
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const me = await User.findOne({ email: session.user.email });
        if (!me) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { username } = await params;
        if (!username) {
            return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 });
        }

        const otherUser = await User.findOne({ username }).select("_id");
        if (!otherUser) {
            return NextResponse.json({ success: false, message: `User not found with username : ${username}` }, { status: 404 });
        }

        // find the conversation between sender and receiver
        const conversation = await Conversation.findOne({
            $or: [
                { participant1: me._id, participant2: otherUser._id },
                { participant1: otherUser._id, participant2: me._id },
            ],
        });
        if (!conversation) {
            return NextResponse.json({ success: false, message: "No messages found" }, { status: 404 });
        }

        // conversation exists => messages exists
        const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

        // update the isRead to true, of those message are which sent to me by other user
        await Message.updateMany(
            {
                conversationId: conversation._id,
                receiver: me._id,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            },
        );

        return NextResponse.json({ success: true, data: { messages } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
