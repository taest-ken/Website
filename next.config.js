/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 1. Clear the image quality warning by allowing pristine 100% prints
    qualities: [75, 100],
    
    // 2. Whitelist your AWS S3 bucket so Next.js is allowed to optimize your portfolio assets
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taest-production-media.s3.eu-north-1.amazonaws.com', // Change this if your actual bucket name is different
        port: '',
        pathname: '/**', // Allows all folders inside the bucket
      },
    ],
  },
};

module.exports = nextConfig;