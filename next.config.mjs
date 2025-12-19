/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`, // Proxy to Backend
            },
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`, // Proxy to Backend Static Files
            },
        ];
    },
};

export default nextConfig;
