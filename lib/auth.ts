import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { Resend } from "resend";
import User from "@/models/User.model";
import { connectDB } from "./db";
import EmailVerificationTemplate from "@/components/emails/email-verify-template";
import ResetPasswordTemplate from "@/components/emails/reset-password-template";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),
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
    plugins: [
        username({
            minUsernameLength: 3,
            maxUsernameLength: 20,
        }),
    ],

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
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await connectDB();
                    const newUser = await User.create({
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        image: user.image,
                        bio: "",
                    });
                },
            },
            delete: {
                after: async (user) => {
                    try {
                        await connectDB();
                        const dbUser = await User.findOne({ email: user.email });
                        if (!dbUser) {
                            return;
                        }
                        await dbUser.deleteOne();
                        console.log(`Successfully cleaned up Mongoose data for user: ${user.id}`);
                    } catch (error) {
                        console.error("Failed to delete Mongoose user during cleanup:", error);
                    }
                },
            },
        },
    },

    session: {
        freshAge: 0, // Disable freshness check
    },
});
