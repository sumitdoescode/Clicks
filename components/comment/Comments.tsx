"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Item, ItemHeader, ItemFooter, ItemContent, ItemMedia, ItemTitle, ItemDescription } from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface IComment {
    _id: string;
    text: string;
    isCommentOwner: boolean;
    createdAt: string;
    user: {
        name: string;
        username: string;
        image?: string;
    };
}

const Comments = ({ postId }: { postId: string }) => {
    const [comments, setComments] = useState<IComment[]>([]);

    const getComments = async () => {
        try {
            const { data } = await axios.get(`/api/comment/post/${postId}`);
            setComments(data.comments);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getComments();
    }, []);

    if (!comments.length) {
        return (
            <div className="text-center">
                <p className="text-lg text-neutral-200 font-semibold">No comments yet</p>
            </div>
        );
    }
    return (
        <div className="mt-6">
            {/* comments count */}
            <div className="flex items-center gap-2">
                <Badge className="h-8 min-w-8 rounded-full px-1 font-mono tabular-nums text-xl" variant={"secondary"}>
                    {comments.length}
                </Badge>
                <p className="text-lg text-neutral-200 font-semibold">{comments.length > 1 ? "Comments" : "Comment"}</p>
            </div>

            {/* actual comments */}
            <div className="flex flex-col gap-2 mt-4">
                {comments.map((comment) => (
                    <Comment {...comment} key={comment._id} />
                ))}
            </div>
        </div>
    );
};
export default Comments;

const Comment = ({ _id, text, isCommentOwner, createdAt, user: { name, username, image } }: IComment) => {
    const deleteComment = async (commentId: string) => {
        try {
            await axios.delete(`/api/comment/${commentId}`);
            toast.success("Comment deleted successfully");
            // getComments();
        } catch (error) {
            toast.error("Error deleting comment");
            console.log(error);
        }
    };
    return (
        <Item key={_id} className="border border-muted rounded-xl w-full">
            <ItemHeader className="w-full">
                <div className="flex gap-2 items-center w-full justify-between">
                    <Link href={`/${username}`} className="flex items-center gap-2">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={image} className="" />
                            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">@{username}</p>
                        </div>
                    </Link>

                    {/* delete button */}
                    {isCommentOwner && (
                        <Button variant="destructive" size="lg" className="cursor-pointer" onClick={() => deleteComment(_id)}>
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </ItemHeader>
            <ItemContent>
                <p className="text-foreground">{text}</p>
            </ItemContent>
            <ItemFooter>
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">{new Date(createdAt).toLocaleString()}</p>
                </div>
            </ItemFooter>
        </Item>
    );
};
