import { z } from "zod";

export const SignUpSchema = z.object({
    name: z.string().min(3, "Name must be at least of 3 characters").max(25, "Name can't be more than 25 characters"),
    username: z
        .string()
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .min(3, "Username must be at least of 3 characters")
        .max(20, "Username can't be more than 20 characters"),
    email: z.string().email("Invalid email").min(1, "Email is required").max(50, "Email cannot be more than 50 characters"),
    password: z.string().min(8, "Password must be at least 8 characters long").max(30, "Password cannot be more than 30 characters"),
});

export type SignUpType = z.infer<typeof SignUpSchema>;

export const LoginSchema = z.object({
    email: z.string().email("Invalid email").min(1, "Email is required").max(50, "Email cannot be more than 50 characters"),
    password: z.string().max(30, "Password cannot be more than 30 characters"),
});

export type LoginType = z.infer<typeof LoginSchema>;

export const ForgetPasswordSchema = z.object({
    email: z.email("Invalid email").min(1, "Email is required").max(50, "Email cannot be more than 50 characters"),
});

export type ForgetPasswordType = z.infer<typeof ForgetPasswordSchema>;

export const ResetPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters long").max(30, "Password cannot be more than 30 characters"),
});

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
