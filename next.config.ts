import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.WORDPRESS_ADMIN_URL}`,
        port: "",
        pathname: "/**",
      },
      new URL(`${process.env.WORDPRESS_ADMIN_URL}/**`),
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
        destination: `${process.env.WORDPRESS_ADMIN_URL}/wp-admin`,
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
