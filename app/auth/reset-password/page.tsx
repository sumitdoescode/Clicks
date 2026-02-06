import { ResetPasswordEmail } from "@/components/reset-password/reset-password-email";
import { ResetPassword } from "@/components/reset-password/reset-password";
// import { redirect } from "next/navigation";

export default async function page({ params, searchParams }: { params: {}; searchParams: { token?: string } }) {
    const token = (await searchParams).token;

    if (!token) {
        // no token, show the email form to request a password reset email
        return (
            <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <ResetPasswordEmail />
                </div>
            </div>
        );
    }

    // token is present, show the password reset form
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ResetPassword token={token} />
            </div>
        </div>
    );
}
