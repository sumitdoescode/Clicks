import Container from "@/components/Container";
import { headers } from "next/headers";
import PostDetails from "@/components/post/PostDetails";
import { Suspense } from "react";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    return (
        <section className="pt-10 pb-20">
            <Container>
                <Suspense fallback={<div>Loading...</div>}>
                    <PostDetails params={params} />
                </Suspense>
            </Container>
        </section>
    );
};

export default page;
