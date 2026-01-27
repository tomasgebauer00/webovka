/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Tímto řekneme Vercelu: "Ignoruj chyby v kódu a spusť to!"
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;