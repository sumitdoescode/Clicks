"use client";
import { Camera, GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/schemas/auth.schema";
import type { ResetPasswordType } from "@/schemas/auth.schema";
import { flattenError } from "zod";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

type ErrorType = {
    newPassword?: string[];
    backendError?: string;
};

export function ResetPassword({ className, token }: { token: string; className?: string }) {
    const [formData, setFormData] = useState<ResetPasswordType>({ newPassword: "" });
    const [errors, setErrors] = useState<ErrorType>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // client side validation
        const result = ResetPasswordSchema.safeParse(formData);
        if (!result.success) {
            setErrors(flattenError(result.error).fieldErrors);
            return;
        }

        // call the forget password api
        setLoading(true);
        const { data, error } = await authClient.resetPassword({
            newPassword: result.data.newPassword,
            token,
        });
        setLoading(false);

        if (error) {
            setErrors({ ...errors, backendError: error.message });
            return;
        }

        // // there are no errors
        setErrors({});
        toast.success("Password has been reset successfully. Login now");
    };

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Link href="/auth/login" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-foreground-primary">
                                <Camera className="size-6 text-primary-foreground" />
                                {/* <span>Clicks.</span> */}
                            </div>
                            <span className="sr-only">Clicks.</span>
                        </Link>
                        <h1 className="text-xl font-bold">Reset Password</h1>
                        {/* <FieldDescription>Enter your email to forget password</FieldDescription> */}
                    </div>
                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Your New Password"
                            value={formData.newPassword}
                            onChange={(e) => {
                                setFormData({ ...formData, newPassword: e.target.value });
                                setErrors({ ...errors, newPassword: undefined });
                            }}
                        />
                        {errors.newPassword && errors.newPassword.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                        {errors.backendError && <FieldError>{errors.backendError}</FieldError>}
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : "Reset Password"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
}
