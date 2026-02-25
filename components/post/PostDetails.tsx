import Post from "@/components/post/Post";
import { headers } from "next/headers";
import Comments from "../comment/Comments";
import AddComment from "../comment/AddComment";
import UpdatePost from "./UpdatePost";
import DeletePost from "./DeletePost";
import { notFound } from "next/navigation";

const PostDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const headersList = await headers();

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/post/${id}`, {
        headers: {
            cookie: headersList.get("cookie") || "",
        },
    });
    if (res.status === 404) {
        return notFound();
    }
    const { post } = await res.json();
    console.log(post);

    return (
        <>
            <Post {...post} />

            {/* post buttons */}
            <div className="mt-4 flex flex-col gap-2">
                <AddComment postId={id} />
                {post.isPostOwner && (
                    <>
                        <UpdatePost postId={id} postCaption={post.caption} />
                        <DeletePost postId={id} />
                    </>
                )}
            </div>
            <Comments postId={id} />
        </>
    );
};

export default PostDetails;
