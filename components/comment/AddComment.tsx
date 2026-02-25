"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BadgePlus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { CommentSchema } from "@/schemas/comment.schema";
import { flattenError } from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

const AddComment = ({ postId }: { postId: string }) => {
    const [text, setText] = useState<string>("");
    const [commenting, setCommenting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const createComment = async () => {
        // client side validation
        const result = CommentSchema.safeParse({ text });
        if (!result.success) {
            setError(flattenError(result.error).fieldErrors.text?.[0] || "Invalid comment");
            return;
        }

        // create a comment
        try {
            setCommenting(true);
            const { data } = await axios.post(`/api/comment/post/${postId}`, {
                text: text,
            });
            toast.success("Comment created successfully");
            setText("");
            setError("");
            setOpen(false);
        } catch (error: any) {
            if (error.response.data.errorType === "VALIDATION_ERROR") {
                setError(error.response.data.error.text[0]);
                return;
            }
        } finally {
            setCommenting(false);
        }
    };
    return (
        <AlertDialog open={open} onOpenChange={(open) => setOpen(open)}>
            <AlertDialogTrigger asChild>
                <Button size={"lg"} variant={"secondary"} className="w-full">
                    <BadgePlus />
                    Add a comment
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add a comment</AlertDialogTitle>
                    <AlertDialogDescription>Enter your comment below</AlertDialogDescription>
                </AlertDialogHeader>

                <Field>
                    <FieldLabel htmlFor="text">Comment</FieldLabel>
                    <Textarea
                        id="text"
                        placeholder="Type your message here."
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setError("");
                        }}
                    />
                    {error && <FieldError>{error}</FieldError>}
                </Field>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            createComment();
                        }}
                        disabled={text.length === 0 || commenting}
                    >
                        {commenting ? (
                            <>
                                Creating...
                                <Spinner />
                            </>
                        ) : (
                            "Create"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddComment;
