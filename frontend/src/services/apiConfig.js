/**
 * Global API Base Configuration
 * In development: defaults to "" so Vite dev proxy handles /api -> http://localhost:5000
 * In production: reads VITE_API_BASE_URL (e.g. https://api.kaushalrefrigeration.com)
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
