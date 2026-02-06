"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BadgePlus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";

const AddComment = ({ postId }: { postId: string }) => {
    const [text, setText] = useState<string>("");
    const [commenting, setCommenting] = useState<boolean>(false);

    const createComment = async () => {
        try {
            setCommenting(true);
            const { data } = await axios.post(`/api/comment/post/${postId}`, {
                text: text,
            });
            toast.success("Comment created successfully");
            setText("");
        } catch (error) {
            toast.error("Error creating comment");
            console.log(error);
        } finally {
            setCommenting(false);
        }
    };
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size={"lg"} variant={"secondary"} className="w-full">
                    <BadgePlus />
                    Add a comment
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
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
    );
};

export default AddComment;
