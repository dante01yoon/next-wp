import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.WORDPRESS_URL}`,
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: `${process.env.WORDPRESS_URL}/wp-admin`,
      },
    ];
  },

  // async redirects() {
  //   return [
  //     {
  //       source: "/admin",
  //       destination: `${process.env.WORDPRESS_URL}/wp-admin`,
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
