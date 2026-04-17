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
      {
        protocol: "https",
        hostname: "photo2.tinhte.vn",
      },
      {
        protocol: "https",
        hostname: "doanhnhanplus.vn",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "cdn-media.sforum.vn",
      },
      {
        protocol: "https",
        hostname: "droniverse-bucket.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn-useast1.kapwing.com",
      }
    ],
  },
};

export default nextConfig;
