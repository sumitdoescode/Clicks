import React from "react";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(), // you need to pass the headers object.
    });
    console.log(session?.user);
    return <div>Hi, {session?.user?.name}</div>;
};

export default page;
