/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Prevent SSR issues with Three.js and browser-only APIs
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 
        'three', '@react-three/fiber', '@react-three/drei',
        '@studio-freight/lenis'
      ]
    }
    return config
  },
}

module.exports = nextConfig
