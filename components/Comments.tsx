"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BadgePlus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Item, ItemHeader, ItemFooter, ItemContent, ItemMedia, ItemTitle, ItemDescription } from "./ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

interface IComment {
    _id: string;
    text: string;
    isCommentOwner: boolean;
    createdAt: string;
    user: {
        name: string,
        username: string,
        image?: string
    }
}

const Comments = ({ postId }: { postId: string }) => {
    const [text, setText] = useState<string>("");
    const [commenting, setCommenting] = useState<boolean>(false);
    const [comments, setComments] = useState<IComment[]>([]);

    const createComment = async () => {
        try {
            setCommenting(true);
            const { data } = await axios.post(`/api/comment/post/${postId}`, {
                text: text,
            });
            toast.success("Comment created successfully");
            setText("");
            getComments();
            console.log(data);
        } catch (error) {
            toast.error("Error creating comment");
            console.log(error);
        } finally {
            setCommenting(false);
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await axios.delete(`/api/comment/${commentId}`);
            toast.success("Comment deleted successfully");
            getComments();
        } catch (error) {
            toast.error("Error deleting comment");
            console.log(error);
        }
    };

    const getComments = async () => {
        try {
            const { data } = await axios.get(`/api/comment/post/${postId}`);
            console.log(data)
            setComments(data.comments);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getComments();
    }, []);
    return (
        <div className="mt-6">
            {/* create comment */}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size={"lg"} variant={"secondary"} className="w-full">
                        <BadgePlus />
                        Add a comment
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        {/* <AlertDialogMedia>
                            <BadgePlus />
                        </AlertDialogMedia> */}
                        <AlertDialogTitle>Add a comment</AlertDialogTitle>
                    </AlertDialogHeader>
                    <Textarea placeholder="Type your message here." value={text} onChange={(e) => setText(e.target.value)} />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={createComment} disabled={text.length === 0 || commenting}>
                            {commenting ? "Creating..." : "Create"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* actual comments */}
            <div className="mt-6">
                {/* if there are no comments */}
                {comments.length === 0 && (
                    <div className="text-center">
                        <p className="text-muted-foreground">No comments yet</p>
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    {comments.map((comment) => (
                        <Item key={comment._id} className="border border-muted rounded-xl w-full">
                            <ItemHeader className="w-full">
                                <div className="flex gap-2 items-center w-full justify-between">
                                    <Link href={`/${comment.user.username}`} className="flex items-center gap-2">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={comment.user.image} className="" />
                                            <AvatarFallback>{comment.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{comment.user.name}</p>
                                            <p className="text-xs text-muted-foreground">@{comment.user.username}</p>
                                        </div>

                                    </Link>

                                    {/* delete button */}
                                    {comment.isCommentOwner && (
                                        <Button variant="destructive" size="lg" className="cursor-pointer" onClick={() => deleteComment(comment._id)}>
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}


                                </div>
                            </ItemHeader>
                            <ItemContent>
                                <p className="text-foreground">{comment.text}</p>
                            </ItemContent>
                            <ItemFooter>
                                <div className="flex items-center gap-2">
                                    <p className="text-muted-foreground text-xs">{new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                            </ItemFooter>
                        </Item>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Comments;
