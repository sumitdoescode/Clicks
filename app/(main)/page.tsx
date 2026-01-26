import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/Container";
import Post from "@/components/Post";
import { headers } from "next/headers";

export default async function page() {
    const headersList = await headers();
    let data;
    try {
        // this is a server to server call, tha's why we need to pass the cookie
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/post`, {
            headers: {
                cookie: headersList.get("cookie") || "",
            },
        });
        data = await res.json();
    } catch (error) {
        console.log(error);
        return;
    }
    return (
        <section className="pt-10 py-30">
            <Container>
                <div className="flex flex-col gap-5 items-center">
                    {data.posts.length &&
                        data.posts.map((post: any) => {
                            return <Post key={post._id} {...post} />;
                        })}
                </div>
            </Container>
        </section>
    );
}
