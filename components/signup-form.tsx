"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client"; //import the auth client
import { SignUpSchema } from "@/schemas/auth.schema";
import type { SignUpType } from "@/schemas/auth.schema";
import { flattenError } from "zod";
import { redirect } from "next/navigation";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

type ErrorType = {
    name?: string[];
    username?: string[];
    email?: string[];
    password?: string[];
    backendError?: string;
};

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const [formData, setFormData] = useState<SignUpType>({
        name: "",
        username: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<ErrorType>({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // client side validation
        const result = SignUpSchema.safeParse(formData);
        if (!result.success) {
            console.log(flattenError(result.error).fieldErrors);
            setErrors(flattenError(result.error).fieldErrors);
            return;
        }

        // call the signup api
        setLoading(true);
        const { data, error } = await authClient.signUp.email(
            {
                name: result.data.name,
                email: result.data.email,
                password: result.data.password,
                username: result.data.username,
                // callbackURL : "/dashboard"
            },
            {
                onSuccess: (ctx) => {
                    redirect("/auth/login");
                    //redirect to the dashboard or sign in page
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
        toast.success("Please verify your email before logging in.");
    };
    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <CardDescription>Fill the details below to create your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        setErrors({ ...errors, name: undefined });
                                    }}
                                    required
                                />
                                {errors.name && errors.name.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => {
                                        setFormData({ ...formData, username: e.target.value });
                                        setErrors({ ...errors, username: undefined });
                                    }}
                                    required
                                />
                                {errors.username && errors.username.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                            </Field>
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
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                                </Field>
                                {/* <FieldDescription>Must be at least 8 characters long.</FieldDescription> */}
                                {errors.password && errors.password.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                                {errors.backendError && <FieldError>{errors.backendError}</FieldError>}
                            </Field>
                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Spinner /> : "Create Account"}
                                </Button>
                                <FieldDescription className="text-center mt-4">
                                    Already have an account? <Link href="/auth/login">Login</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
