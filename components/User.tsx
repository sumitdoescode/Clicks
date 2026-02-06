import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IUser {
    _id: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    bookMarksCount?: number;
}

const User = ({ _id, name, username, image, bio, followersCount, followingCount, postsCount, bookMarksCount }: IUser) => {
    return (
        <div>
            {/* avatar */}
            <div className="flex gap-6 items-center">
                <Avatar className="w-32 h-32">
                    <AvatarImage src={image} className="" />
                    <AvatarFallback>{username?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight first:mt-0">{name}</h1>
                    <p className="text-lg text-muted-foreground">@{username}</p>
                </div>
            </div>
            {/* bio */}
            <div className="mt-8 text-left">
                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-md font-semibold w-full">{bio}</code>
            </div>

            {/* followers and following  count*/}
            <div className="mt-6 flex items-centerg gap-2 w-full p-2 bg-secondary rounded-xl">
                <div className="bg-neutral-900 rounded-lg flex flex-col items-center justify-center p-2 grow">
                    <h2 className="text-lg text-muted-foreground tracking-tight">Posts</h2>
                    <p className="text-2xl font-semibold tracking-tight">{postsCount}</p>
                </div>
                <div className="bg-neutral-900 rounded-lg flex flex-col items-center justify-center p-2 grow">
                    <h2 className="text-lg text-muted-foreground tracking-tight">Followers</h2>
                    <p className="text-2xl font-semibold tracking-tight">{followersCount}</p>
                </div>
                <div className="bg-neutral-900 rounded-lg flex flex-col items-center justify-center p-2 grow">
                    <h2 className="text-lg text-muted-foreground tracking-tight">Following</h2>
                    <p className="text-2xl font-semibold tracking-tight">{followingCount}</p>
                </div>
            </div>

            {/* how can i increase my tab size ? */}
            {/* tabs */}
            <Tabs defaultValue="posts" className="w-100 mt-10">
                <TabsList className="flex gap-2">
                    <TabsTrigger className="text-lg p-1" value="posts">
                        Posts
                    </TabsTrigger>
                    <TabsTrigger className="text-lg p-1" value="followers">
                        Followers
                    </TabsTrigger>
                    <TabsTrigger className="text-lg p-1" value="following">
                        Following
                    </TabsTrigger>
                    <TabsTrigger className="text-lg p-1" value="bookmarks">
                        Bookmarks
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="posts">Make changes to your account here.</TabsContent>
                <TabsContent value="followers">Change your password here.</TabsContent>
                <TabsContent value="following">Change your password here.</TabsContent>
                <TabsContent value="bookmarks">Change your password here.</TabsContent>
            </Tabs>
        </div>
    );
};

export default User;
