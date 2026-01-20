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
import { send } from "process";

// get all conversations of logged in user
// GET => api/conversation
export async function GET(request: NextRequest) {
    try {
        connectDB();
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

        // find all the conversations of the logged in user
        const conversations = await Conversation.aggregate([
            {
                $match: {
                    $or: [{ participant1: loggedInUser._id }, { participant2: loggedInUser._id }],
                },
            },

            // Determine the other participant not the logged in user
            {
                $addFields: {
                    otherParticipant: {
                        $cond: {
                            $if: { $eq: ["$participant1", loggedInUser._id] },
                            then: "$participant2",
                            else: "$participant1",
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "otherParticipant",
                    foreignField: "_id",
                    as: "otherParticipant",
                },
            },
            {
                $unwind: {
                    path: "$otherparticipant",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "lastMessage",
                    foreignField: "_id",
                    as: "lastMessage",
                },
            },
            {
                $unwind: {
                    path: "$lastMessage",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                // Calculate unread message count
                $lookup: {
                    from: "messages",
                    let: { conversationId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$conversationId", "$$conversationId"] },
                                        { $eq: ["$receiver", loggedInUser._id] }, // Messages sent TO me
                                        { $eq: ["$isRead", false] }, // Unread messages
                                    ],
                                },
                            },
                        },
                        {
                            $count: "count",
                        },
                    ],
                    as: "unreadData",
                },
            },
            {
                $addFields: {
                    unreadCount: {
                        $ifNull: [{ $arrayElemAt: ["$unreadData.count", 0] }, 0],
                    },
                },
            },
            {
                $sort: {
                    updatedAt: -1,
                },
            },
            {
                $project: {
                    _id: 1,
                    otherParticipant: {
                        _id: 1,
                        name: 1,
                        username: 1,
                        image: 1,
                    },
                    lastMessage: {
                        text: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        isRead: 1,
                    },
                    unreadCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, data: { conversations } }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
