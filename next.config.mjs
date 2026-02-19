/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // غیرفعال کردن بهینه‌سازی CSS که lightningcss رو می‌خواهد
  experimental: {
    optimizeCss: false,
  }
};

export default nextConfig;