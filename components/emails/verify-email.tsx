import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Tailwind } from "@react-email/components";

interface EmailTemplateProps {
    userEmail: string;
    verificationUrl: string;
}

const EmailVerification = ({ userEmail, verificationUrl }: EmailTemplateProps) => {
    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Preview>Verify your email address to complete your registration</Preview>
                <Body className="bg-gray-100 font-sans py-[40px]">
                    <Container className="bg-white rounded-[8px] shadow-lg max-w-[600px] mx-auto p-[40px]">
                        {/* Header */}
                        <Section className="text-center mb-[32px]">
                            <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">Verify Your Email</Heading>
                            <Text className="text-[16px] text-gray-600 m-0">We're excited to have you on board!</Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="mb-[32px]">
                            <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">Hi there,</Text>
                            <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">Thanks for signing up! To complete your registration and secure your account, please verify your email address by clicking the button below.</Text>
                            <Text className="text-[14px] text-gray-600 m-0 mb-[24px]">
                                Email: <strong>{userEmail}</strong>
                            </Text>
                        </Section>

                        {/* CTA Button */}
                        <Section className="text-center mb-[32px]">
                            <Button href={verificationUrl} className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border hover:bg-blue-700 transition-colors">
                                Verify Email Address
                            </Button>
                        </Section>

                        {/* Alternative Link */}
                        <Section className="mb-[32px]">
                            <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[8px]">If the button doesn't work, copy and paste this link into your browser:</Text>
                            <Text className="text-[14px] text-blue-600 break-all m-0">{verificationUrl}</Text>
                        </Section>

                        {/* Security Notice */}
                        <Section className="bg-gray-50 p-[20px] rounded-[8px] mb-[32px]">
                            <Text className="text-[14px] text-gray-700 leading-[20px] m-0 mb-[8px]">
                                <strong>Security Notice:</strong>
                            </Text>
                            <Text className="text-[14px] text-gray-600 leading-[20px] m-0">This verification link will expire in 24 hours. If you didn't create an account, please ignore this email or contact our support team.</Text>
                        </Section>

                        {/* Footer */}
                        <Section className="border-t border-gray-200 pt-[24px]">
                            <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                                Best regards,
                                <br />
                                The Team
                            </Text>
                            <Text className="text-[12px] text-gray-400 m-0 mb-[8px]">
                                123 Business Street, Suite 100
                                <br />
                                New York, NY 10001, United States
                            </Text>
                            <Text className="text-[12px] text-gray-400 m-0">
                                © 2026 Your Company. All rights reserved. |
                                <a href="#" className="text-blue-600 no-underline ml-[4px]">
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

EmailVerification.PreviewProps = {
    userEmail: "sumit.does.code@gmail.com",
    verificationUrl: "https://yourapp.com/verify-email?token=abc123xyz789",
};

export default EmailVerification;
