/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    async rewrites() {
        let backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        // Ensure the URL starts with a protocol to satisfy Next.js validation
        if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
            backendUrl = `https://${backendUrl}`;
        }
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
