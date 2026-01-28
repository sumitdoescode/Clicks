import React from "react";
import Container from "@/components/Container";
import { headers } from "next/headers";
import User from "@/components/User";

const page = async ({ params }: { params: Promise<{ username: string }> }) => {
    const { username } = await params;
    const headersList = await headers();
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/${username}`, {
        headers: {
            cookie: headersList.get("cookie") || "",
        },
    });
    const data = await res.json();
    console.log(data.user);
    return (
        <section className="pt-10 pb-20">
            <Container>
                <User {...data.user} />
            </Container>
        </section>
    );
};

export default page;
