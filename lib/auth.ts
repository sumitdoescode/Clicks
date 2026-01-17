import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { Resend } from "resend";
import EmailVerification from "@/components/emails/verify-email";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }) => {
            console.log(url);
            const { data, error } = await resend.emails.send({
                from: "sumit.does.code@gmail.com",
                to: "sumit.does.code@gmail.com",
                subject: "Verify your email address on Clicks",
                react: EmailVerification({ userEmail: user.email, verificationUrl: url }),
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,

        sendVerificationEmail: async ({ user, url, token }) => {
            console.log(url);
            const { data, error } = await resend.emails.send({
                from: "sumit.does.code@gmail.com",
                to: "sumit.does.code@gmail.com",
                subject: "Verify your email address on Clicks",
                react: EmailVerification({ userEmail: user.email, verificationUrl: url }),
            });
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
