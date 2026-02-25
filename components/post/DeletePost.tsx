"use client";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const DeletePost = ({ postId }: { postId: string }) => {
    const [deleting, setDeleting] = useState<boolean>(false);
    const [open, setOpen] = useState(false);

    const router = useRouter();

    const deletePost = async () => {
        try {
            setDeleting(true);
            const { data } = await axios.delete(`/api/post/${postId}`);
            toast.success("Post deleted successfully");
            setOpen(false);
            router.push("/");
        } catch (error: any) {
            toast.error(error.response.data.message || "Couldn't delete the post");
        } finally {
            setDeleting(false);
        }
    };
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Post</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <Trash2 />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your post from our servers.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            deletePost();
                        }}
                    >
                        {deleting ? (
                            <>
                                Deleting...
                                <Spinner />
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeletePost;
