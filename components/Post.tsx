"use client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PostSchema, type Post } from "@/schemas/post.schema";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { BookmarkIcon, Heart } from "lucide-react";
import Link from "next/link";
import { Send, Copy } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogMedia } from "@/components/ui/alert-dialog";

interface IPost {
    _id: string;
    image: string;
    caption?: string;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isPostOwner?: boolean;
    user: {
        _id?: string;
        name: string;
        username: string;
        image?: string;
    };
}

const Post = ({ _id, image, caption, likesCount, commentsCount, isLiked, isBookmarked, isPostOwner, user: { name, username, image: userImage } }: IPost) => {
    const [isLikedState, setIsLikedState] = useState<boolean>(isLiked);
    const [isBookmarkedState, setIsBookmarkedState] = useState<boolean>(isBookmarked);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isBookmarking, setIsBookmarking] = useState<boolean>(false);
    const [likesCountState, setLikesCountState] = useState<number>(likesCount);
    const [postUrl, setPostUrl] = useState<string>(`${process.env.NEXT_PUBLIC_APP_URL}/post/${_id}`);

    const handleLike = async () => {
        setIsLiking(true);
        setIsLikedState(!isLikedState);
        try {
            const { data } = await axios.post(`/api/like/post/${_id}`);
            console.log(data);
            if (data.success && data.isLike) {
                setLikesCountState((prev) => prev + 1);
                return;
            }
            setLikesCountState((prev) => prev - 1);
        } catch (error: any) {
            // revert the state
            setIsLikedState(!isLikedState);
            setLikesCountState((prev) => prev - 1);
            toast.error(error.response.data.message);
        } finally {
            setIsLiking(false);
        }
    };

    const handleBookmark = async () => {
        setIsBookmarking(true);
        setIsBookmarkedState(!isBookmarkedState);
        try {
            const { data } = await axios.post(`/api/bookmark/post/${_id}`);
            console.log(data);
        } catch (error: any) {
            // revert the state
            setIsBookmarkedState(!isBookmarkedState);
            toast.error(error.response.data.message);
        } finally {
            setIsBookmarking(false);
        }
    };

    return (
        <Item className="border border-muted rounded-xl">
            <ItemHeader>
                <Link href={`/${username}`}>
                    <div className="flex gap-2 items-center cursor-pointer">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={userImage} className="" />
                            <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-md font-medium">{name}</p>
                            <p className="text-sm text-muted-foreground">@{username}</p>
                        </div>
                    </div>
                </Link>
            </ItemHeader>
            <ItemContent>
                <Link href={`/post/${_id}`}>
                    <ItemMedia className="w-full">
                        <Image src={image} alt="post image" className="w-full h-auto object-cover rounded-lg" width={500} height={500} priority />
                    </ItemMedia>
                </Link>
            </ItemContent>
            <ItemFooter className="mt-3 w-full">
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex gap-2">
                            <Toggle aria-label="Toggle like" variant="outline" size={"lg"} pressed={isLikedState} onPressedChange={handleLike} disabled={isLiking}>
                                <Heart className="group-data-[state=on]/toggle:fill-rose-600" />
                                Like
                            </Toggle>
                            <Toggle aria-label="Toggle bookmark" variant="default" size={"lg"} pressed={isBookmarkedState} onPressedChange={handleBookmark} disabled={isBookmarking}>
                                <BookmarkIcon className="group-data-[state=on]/toggle:fill-primary" />
                                Bookmark
                            </Toggle>
                        </div>
                        <div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant={"default"} size={"lg"}>
                                        <Send size={30} />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogMedia>
                                            <Send />
                                        </AlertDialogMedia>
                                        <AlertDialogTitle>Share this post?</AlertDialogTitle>
                                        <AlertDialogDescription>Copy the link to share this post with your friends.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <Input id="url" type="url" value={postUrl} readOnly />
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(postUrl);
                                                toast.success("Copied to clipboard");
                                            }}
                                        >
                                            Copy
                                            <Copy size={20} />
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div>
                        <p className="text-md text-muted-foreground">
                            {likesCountState} {likesCountState > 1 ? "likes" : "like"}
                        </p>
                        <ItemTitle className="mt-1">{caption!?.length > 100 ? `${caption?.slice(0, 100)}...` : caption}</ItemTitle>
                    </div>
                    {commentsCount && (
                        <div>
                            <ItemDescription>{commentsCount} sdfasdf comments</ItemDescription>
                        </div>
                    )}
                </div>
            </ItemFooter>
        </Item>
    );
};

export default Post;
