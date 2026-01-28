import React from "react";
import Post from "@/components/Post";
import Container from "@/components/Container";
import { headers } from "next/headers";
import Comments from "@/components/Comments";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const headersList = await headers();
    let data;
    try {
        // this is a server to server call, tha's why we need to pass the cookie
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/post/${id}`, {
            headers: {
                cookie: headersList.get("cookie") || "",
            },
        });
        data = await res.json();
        console.log(data);
    } catch (error) {
        console.log(error);
        return;
    }
    const commentRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/comment/post/${id}`, {
        headers: {
            cookie: headersList.get("cookie") || "",
        },
    });
    const commentsData = await commentRes.json();
    console.log(commentsData);
    return (
        <section className="pt-10 pb-20">
            <Container>
                <Post {...data.post} />
                <Comments />
            </Container>
        </section>
    );
};

export default page;
