"use client";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PostSchema, type Post } from "@/schemas/post.schema";
import Image from "next/image";
import { flattenError } from "zod";
import { Spinner } from "./ui/spinner";
import axios from "axios";
import { toast } from "sonner";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { BookmarkIcon, Heart } from "lucide-react";

interface IPost {
    _id: string;
    image: string;
    caption?: string;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isBookmarked: boolean;
    user: {
        name: string;
        username: string;
        image?: string;
    };
}

const Post = ({ _id, image, caption, likesCount, commentsCount, isLiked, isBookmarked, user: { name, username, image: userImage } }: IPost) => {
    return (
        <Item className="border border-muted rounded-xl">
            <ItemHeader>
                <div className="flex gap-2 items-center">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={userImage} className="" />
                        <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-md font-medium">{name}</p>
                        <p className="text-sm text-muted-foreground">@{username}</p>
                    </div>
                </div>
            </ItemHeader>
            <ItemContent>
                <ItemMedia>
                    <Image src={image} alt="post image" className="w-full h-full object-cover rounded-lg" width={500} height={500} />
                </ItemMedia>
            </ItemContent>
            <ItemFooter>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <Toggle aria-label="Toggle like" variant="outline">
                            <Heart className="group-data-[state=on]/toggle:fill-rose-600" />
                            Like
                        </Toggle>
                        <Toggle aria-label="Toggle bookmark" variant="outline">
                            <BookmarkIcon className="group-data-[state=on]/toggle:fill-primary" />
                            Bookmark
                        </Toggle>
                    </div>
                    <div>
                        <p className="text-md text-muted-foreground">
                            {likesCount} {likesCount > 1 ? "likes" : "like"}
                        </p>
                        <ItemTitle className="mt-1">{caption}</ItemTitle>
                    </div>
                    <div>
                        <ItemDescription>{commentsCount} comments</ItemDescription>
                    </div>
                </div>
            </ItemFooter>
        </Item>
    );
};

export default Post;
