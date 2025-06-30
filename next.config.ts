import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    webpackBuildWorker: true,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Split vendor chunks for better caching
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        sanity: {
          name: 'sanity',
          test: /[\\/]node_modules[\\/](@sanity|next-sanity|groq)[\\/]/,
          chunks: 'all',
          priority: 30,
        },
        stripe: {
          name: 'stripe',
          test: /[\\/]node_modules[\\/]@stripe[\\/]/,
          chunks: 'all',
          priority: 30,
        },
        // Separate styled-components if used
        styledComponents: {
          name: 'styled-components',
          test: /[\\/]node_modules[\\/]styled-components[\\/]/,
          chunks: 'all',
          priority: 20,
        },
      }
    }
    return config
  },

  images: {
    // Use remotePatterns instead of domains (Next.js 15 best practice)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
    // Add device sizes for better responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize formats (WebP and AVIF for better compression)
    formats: ['image/webp', 'image/avif'],
    // Enable responsive images by default
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
