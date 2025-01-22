/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src']  // 只在 src 目录下运行 ESLint
  }
};

export default nextConfig;
