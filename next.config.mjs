// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from your S3 bucket domain
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
