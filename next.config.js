/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignoruj chyby typů (TypeScript)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignoruj chyby stylu (ESLint)
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;