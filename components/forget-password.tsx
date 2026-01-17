"use client";
import { Camera, GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ForgetPasswordSchema } from "@/schemas/auth.schema";
import type { ForgetPasswordType } from "@/schemas/auth.schema";
import { flattenError } from "zod";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

type ErrorType = {
    email?: string[];
    backendError?: string;
};

export function ForgetPassword({ className, ...props }: React.ComponentProps<"div">) {
    const [formData, setFormData] = useState<ForgetPasswordType>({ email: "" });
    const [errors, setErrors] = useState<ErrorType>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // client side validation
        const result = ForgetPasswordSchema.safeParse(formData);
        if (!result.success) {
            console.log(flattenError(result.error).fieldErrors);
            setErrors(flattenError(result.error).fieldErrors);
            return;
        }

        // call the forget password api

        setLoading(true);
        const { data, error } = await authClient.requestPasswordReset(
            {
                email: result.data.email,
                redirectTo: "/auth/reset-password",
            },
            {
                onError: (ctx) => {
                    console.log("coming here here here ");
                    console.log("error error");
                },
            },
        );
        if (error) {
            setLoading(false);
            setErrors({ ...errors, backendError: error.message });
            return;
        }

        // // there are no errors
        setLoading(false);
        setErrors({});
        toast.success("We've sent you a password reset email");
    };
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                        <h1 className="text-xl font-bold">Forget Password</h1>
                        {/* <FieldDescription>Enter your email to forget password</FieldDescription> */}
                    </div>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                setErrors({ ...errors, email: undefined });
                            }}
                        />
                        {errors.email && errors.email.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                        {errors.backendError && <FieldError>{errors.backendError}</FieldError>}
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Spinner /> : "Send Email"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    );
}
