/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',  // Enable static export
    trailingSlash: true,  // Optional: Add trailing slashes to URLs
    distDir: 'output',  // Optional: Change output directory to 'output'
    
};

export default nextConfig;

