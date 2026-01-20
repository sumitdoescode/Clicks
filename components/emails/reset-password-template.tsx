import * as React from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Tailwind } from "@react-email/components";

type ResetPasswordProps = {
    name: string;
    email: string;
    resetUrl: string;
};

const ResetPasswordTemplate = ({ name = "there", email = "example@gmail.com", resetUrl }: ResetPasswordProps) => {
    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Preview>Reset your password to regain access to your account</Preview>
                <Body className="bg-gray-100 font-sans py-[40px]">
                    <Container className="bg-white mx-auto px-[32px] py-[48px] max-w-[600px] rounded-[8px]">
                        {/* Main content */}
                        <Section>
                            <Heading className="text-[36px] font-bold text-gray-900 mb-[32px]">Hi, {name}</Heading>

                            <Heading className="text-[28px] font-bold text-gray-900 mb-[24px]">Reset your password</Heading>

                            <Text className="text-[16px] text-gray-700 mb-[32px] leading-[24px]">
                                We received a request to reset the password for your account associated with <strong>{email}</strong>. Click the button below to create a new password.
                            </Text>

                            {/* Reset button */}
                            <Section className="text-center mb-[32px]">
                                <Button href={resetUrl} className="box-border bg-[oklch(0.65_0.18_132)] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-medium no-underline inline-block">
                                    Reset Password
                                </Button>
                            </Section>

                            <Text className="text-[14px] text-gray-600 leading-[20px] mb-[24px]">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</Text>

                            <Text className="text-[14px] text-gray-600 leading-[20px]">This password reset link will expire in 1 hour for security reasons.</Text>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-gray-200 pt-[32px] mt-[48px]">
                            <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">© 2026 Your Company Name. All rights reserved.</Text>
                            <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">123 Business Street, Suite 100, City, State 12345</Text>
                            <Text className="text-[12px] text-gray-500 text-center m-0">
                                <a href="#" className="text-gray-500 no-underline">
                                    Unsubscribe
                                </a>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

ResetPasswordTemplate.PreviewProps = {
    username: "Sumit",
    userEmail: "sumit.does.code@gmail.com",
    resetUrl: "https://example.com/reset?token=xyz789",
};

export default ResetPasswordTemplate;
