import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "muji1xaqhnsgals4.public.blob.vercel-storage.com",
            },
        ],
    },
};

export default nextConfig;
