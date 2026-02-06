import Post from "./Post";
import { headers } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";

export const Posts = async () => {
    const headersList = await headers();

    // this is a server to server call, that's why we need to pass the cookie
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/post`, {
        headers: {
            cookie: headersList.get("cookie") || "",
        },
    });
    const { posts } = await res.json();

    if (!posts.length) {
        return <h1 className="text-2xl font-bold">No posts found</h1>;
    }

    return (
        <div className="flex flex-col gap-5 items-center">
            {posts.length &&
                posts.map((post: any) => {
                    return <Post key={post._id} {...post} />;
                })}
        </div>
    );
};

export const PostsSkeleton = () => {
    return (
        <div className="flex flex-col gap-5 items-center">
            {[1, 2, 3].map((index) => (
                <div key={index} className="border border-muted rounded-xl p-4 w-full max-w-2xl">
                    {/* Header */}
                    <div className="flex gap-2 items-center mb-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>

                    {/* Image */}
                    <Skeleton className="w-full h-96 rounded-lg mb-3" />

                    {/* Footer */}
                    <div className="flex flex-col gap-4">
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-md" />
                        </div>

                        {/* Likes and Caption */}
                        <div>
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4 mt-1" />
                        </div>

                        {/* Comments */}
                        <Skeleton className="h-3 w-28" />
                    </div>
                </div>
            ))}
        </div>
    );
};
