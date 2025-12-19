// Network Configuration
// We use relative paths because Next.js rewrites (in next.config.mjs) will proxy these to the backend
export const API_BASE_URL = '/api';
export const STATIC_FILE_URL = ''; // The rewrite handles /uploads directly

// The base URL for the frontend (used for QR codes)
// This should be the ngrok URL you provided
// This should be the production URL when deployed
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
