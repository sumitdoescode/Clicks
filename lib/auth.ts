import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { Resend } from "resend";
import User from "@/models/User.model";
import { createAuthMiddleware } from "better-auth/api";
import { connectDB } from "./db";
import EmailVerificationTemplate from "@/components/emails/email-verify-template";
import ResetPasswordTemplate from "@/components/emails/reset-password-template";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }) => {
            console.log("reset password", url);
            const { data, error } = await resend.emails.send({
                from: "Clicks <onboarding@resend.dev>",
                to: user.email,
                subject: "Reset your password",
                react: ResetPasswordTemplate({ name: user.name, email: user.email, resetUrl: url }),
            });
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-up/email") {
                // User data is available even without a session
                const user = ctx.context.returned.user;

                if (user) {
                    await connectDB();
                    const newUser = await User.create({
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        image: user.image,
                        bio: "",
                    });
                }
            }
        }),
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,

        sendVerificationEmail: async ({ user, url, token }) => {
            console.log("verify email", url);
            const { data, error } = await resend.emails.send({
                from: "Clicks <onboarding@resend.dev>",
                to: user.email,
                subject: "Verify your email address",
                react: EmailVerificationTemplate({ name: user.name, email: user.email, verificationUrl: url }),
            });
            console.log({ data, error });
        },
    },

    database: mongodbAdapter(db, {
        client,
    }),

    plugins: [
        username({
            minUsernameLength: 3,
            maxUsernameLength: 20,
        }),
    ],

    session: {
        freshAge: 0, // Disable freshness check
    },
});
