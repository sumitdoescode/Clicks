"use client";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { UpdatePostSchema } from "@/schemas/post.schema";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { flattenError } from "zod";
import { useRouter } from "next/navigation";

const UpdatePost = ({ postId, postCaption }: { postId: string; postCaption: string }) => {
    const [caption, setCaption] = useState<string>(postCaption);
    const [updating, setUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [open, setOpen] = useState(false);

    const router = useRouter();

    const updatePost = async () => {
        // client side validation
        const result = UpdatePostSchema.safeParse({ caption });
        if (!result.success) {
            setError(flattenError(result.error).fieldErrors.caption![0]);
            return;
        }
        try {
            setUpdating(true);
            const { data } = await axios.put(`/api/post/${postId}`, {
                caption: caption,
            });
            toast.success("Post updated successfully");
            setOpen(false);
            setCaption("");
            setError("");
            router.refresh();
        } catch (error: any) {
            if (error.response.data.errorType === "VALIDATION_ERROR") {
                setError(error.response.data.error.caption[0]);
                return;
            }
        } finally {
            setUpdating(false);
        }
    };
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Update Post</Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="min-w-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Update Post</AlertDialogTitle>
                    <AlertDialogDescription>You can only update the caption of the post</AlertDialogDescription>
                </AlertDialogHeader>

                <Field>
                    <FieldLabel htmlFor="caption">Caption</FieldLabel>
                    <Textarea
                        id="caption"
                        placeholder="Your new caption..."
                        value={caption}
                        onChange={(e) => {
                            setCaption(e.target.value);
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
                            updatePost();
                        }}
                        disabled={caption.length === 0 || updating}
                    >
                        {updating ? "Updating..." : "Update"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UpdatePost;
