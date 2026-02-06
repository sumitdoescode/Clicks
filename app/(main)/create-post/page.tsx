import Container from "@/components/Container";
import React from "react";
import CreatePost from "@/components/post/CreatePost";

const page = () => {
    return (
        <section className="py-20">
            <Container>
                <CreatePost />
            </Container>
        </section>
    );
};

export default page;
