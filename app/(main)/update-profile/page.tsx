import React from "react";
import UpdateProfile from "@/components/UpdateProfile";
import Container from "@/components/Container";
import { headers } from "next/headers";

const page = async () => {
    const headersList = await headers();
    let data;
    try {
        // this is a server to server call, tha's why we need to pass the cookie
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user`, {
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

    return (
        <section className="pt-10 pb-30">
            <Container>
                <UpdateProfile {...data.data} />
            </Container>
        </section>
    );
};

export default page;
