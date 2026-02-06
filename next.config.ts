import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "muji1xaqhnsgals4.public.blob.vercel-storage.com",
            },
        ],
    },
    serverExternalPackages: ["mongodb", "better-auth"],
};

export default nextConfig;
