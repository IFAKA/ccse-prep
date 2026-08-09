/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/study",
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
