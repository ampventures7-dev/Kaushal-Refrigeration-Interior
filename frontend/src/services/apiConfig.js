/**
 * Global API Base Configuration
 * In development (localhost): defaults to "" so Vite dev proxy handles /api -> http://127.0.0.1:5000
 * In production (live link / Vercel): connects directly to the live Render backend
 */
const LIVE_BACKEND_URL = "https://kaushal-refrigeration-interior.onrender.com";

export const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  // If testing locally on localhost or loopback, use relative path for Vite proxy
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "";
    }
  }

  // Fallback for live production deployment (e.g. Vercel, Netlify, Custom Domain)
  return LIVE_BACKEND_URL;
})();
