import Container from "@/components/Container";
import { Posts, PostsSkeleton } from "@/components/post/Posts";
import { Suspense } from "react";

export default async function page() {
    return (
        <section className="pt-10 py-30">
            <Container>
                <Suspense fallback={<PostsSkeleton />}>
                    <Posts />
                </Suspense>
            </Container>
        </section>
    );
}
