"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LoginSchema } from "@/schemas/auth.schema";
import type { LoginType } from "@/schemas/auth.schema";
import { flattenError } from "zod";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

type ErrorType = {
    email?: string[];
    password?: string[];
    backendError?: string;
};

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const [formData, setFormData] = useState<LoginType>({ email: "", password: "" });
    const [errors, setErrors] = useState<ErrorType>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // client side validation
        const result = LoginSchema.safeParse(formData);
        if (!result.success) {
            console.log(flattenError(result.error).fieldErrors);
            setErrors(flattenError(result.error).fieldErrors);
            return;
        }

        // call the login api
        setLoading(true);
        const { data, error } = await authClient.signIn.email(
            {
                email: result.data.email,
                password: result.data.password,
                callbackURL: "/dashboard",
            },
            {
                onSuccess: (ctx) => {
                    redirect("/dashboard");
                },
                onError: (ctx) => {
                    // if user email is not verified, status code 403
                    if (ctx.error.status === 403) {
                        toast.info("We've sent you a verification email. Please verify your email to continue.");
                    }
                },
            },
        );
        setLoading(false);

        if (error) {
            setErrors({ ...errors, backendError: error.message });
            return;
        }

        // there are no errors
        setErrors({});
        console.log("no errors", data);
    };
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
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
                                    required
                                />
                                {errors.email && errors.email.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link href="/auth/forget-password" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        setErrors({ ...errors, password: undefined });
                                    }}
                                    required
                                />
                                {errors.password && errors.password.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                                {errors.backendError && <FieldError>{errors.backendError}</FieldError>}
                            </Field>
                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Spinner /> : "Login"}
                                </Button>
                                <Button variant="outline" type="button" disabled={loading}>
                                    Login with Google
                                </Button>
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
