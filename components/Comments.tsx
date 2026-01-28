"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgePlus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { Textarea } from "./ui/textarea";

const Comments = () => {
    const [commentText, setCommentText] = useState<string>("");
    return (
        <div className="mt-6">
            {/* create comment */}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size={"lg"} variant={"secondary"} className="w-full">
                        <BadgePlus />
                        Create Comment
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <BadgePlus />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Add a comment</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* actual comments */}
            <div></div>
        </div>
    );
};

export default Comments;
