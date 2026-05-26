/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taest-production-media.s3.eu-north-1.amazonaws.com', // Replace with your exact S3 bucket hostname
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;