import { ResetPassword } from "@/components/reset-password";
import { redirect } from "next/navigation";

export default async function page({ params, searchParams }: { params: {}; searchParams: { token?: string } }) {
    const token = (await searchParams).token;
    console.log("token", token);

    if (!token) {
        return redirect("/auth/login");
    }
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ResetPassword token={token} />
            </div>
        </div>
    );
}
