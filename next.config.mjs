/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bom.edu.vn",
      },
      {
        protocol: "https",
        hostname: "images7.alphacoders.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
