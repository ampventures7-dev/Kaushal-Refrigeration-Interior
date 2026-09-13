import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";

dotenv.config();

const app = express();

// Trust reverse proxy headers (Render, Railway, Heroku, AWS, Cloudflare, Nginx)
// Required for HTTPS protocol detection, secure cookies, and accurate client IP rate-limiting
app.set("trust proxy", 1);

// Hide server tech stack from scanners
app.disable("x-powered-by");

// Core HTTP Security Headers (HSTS, Anti-Clickjacking, Sniffing Protection, Permissions-Policy)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Enforce strong JWT Secret in production
const DEFAULT_DEV_JWT_SECRET = "kri_default_dev_jwt_secret_9829196508";
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (isProduction) {
    console.error("FATAL: JWT_SECRET environment variable is missing in production!");
    process.exit(1);
  } else {
    JWT_SECRET = DEFAULT_DEV_JWT_SECRET;
  }
}

/**
 * Escapes HTML characters to prevent HTML injection and XSS in emails and logs
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Constant-time safe string comparison to prevent timing attacks on passwords
 */
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Run dummy timing-safe comparison to prevent length leak timing attacks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

const COOKIE_NAME = "kri_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/"
};

// Supabase Client (uses service role key if available for full server access, or anon key)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// In-Memory Storage for Rate Limiting & OTP
const loginAttempts = new Map(); // IP -> { count, lockoutUntil }
const otpStore = new Map();      // "admin_otp" -> { code, expiresAt }

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

// Production-Grade CORS Origin Configuration
const defaultAllowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5173"
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

/**
 * Matches an incoming request origin against configured allowed patterns.
 * Supports exact origins (https://example.com) and wildcards (https://*.vercel.app, *.onrender.com).
 */
function originMatchesPattern(origin, pattern) {
  if (!origin || !pattern) return false;

  const normOrigin = origin.trim().replace(/\/$/, "").toLowerCase();
  const normPattern = pattern.trim().replace(/\/$/, "").toLowerCase();

  // 1. Exact match
  if (normOrigin === normPattern) return true;

  // 2. Wildcard pattern match
  if (normPattern.includes("*")) {
    const escaped = normPattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regexPattern = "^" + escaped.replace(/\\\*/g, ".*") + "$";
    try {
      const regex = new RegExp(regexPattern);
      return regex.test(normOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server, health check probes)
    if (!origin) {
      return callback(null, true);
    }

    // Check against configured production and dev allowed origins
    const isAllowed = allowedOrigins.some((pattern) => originMatchesPattern(origin, pattern));

    if (isAllowed) {
      return callback(null, true);
    }

    // In local development, dynamically permit any localhost port
    if (!isProduction && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
      return callback(null, true);
    }

    console.warn(`⚠️ [CORS Blocked] Origin "${origin}" is not authorized by ALLOWED_ORIGINS.`);
    // Passing (null, false) cleanly omits Access-Control-Allow-Origin per W3C specification
    return callback(null, false);
  },
  credentials: true, // Required for HttpOnly cookie (kri_session) transmission across origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours preflight caching to minimize latency and server load
  optionsSuccessStatus: 204
};

// Production Rate Limiter Factory (Zero-dependency sliding window)
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map(); // IP -> { count, resetTime }

  // Periodic memory garbage collection every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (record.resetTime <= now) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown_ip";
    const now = Date.now();
    const record = hits.get(ip) || { count: 0, resetTime: now + windowMs };

    if (record.resetTime <= now) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count += 1;
    hits.set(ip, record);

    const remaining = Math.max(0, max - record.count);
    const resetSec = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSec);

    if (record.count > max) {
      res.setHeader("Retry-After", resetSec);
      console.warn(`⚠️ [RateLimit Blocked] IP "${ip}" exceeded ${max} requests per ${Math.round(windowMs / 1000)}s.`);
      return res.status(429).json({
        success: false,
        error: message || "Too many requests from this IP. Please try again later.",
        retryAfterSeconds: resetSec
      });
    }

    next();
  };
}

// 1. Global DDoS / API Flood Protection: 100 requests per 15 minutes per IP
const globalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many API requests from this IP. Please wait before retrying."
});

// 2. Sensitive OTP Email Limiter: Max 3 OTP emails per 15 minutes per IP
const otpEmailLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many recovery code requests. Please wait 15 minutes before requesting another OTP."
});

// 3. Strict Quote Submission Limiter: Max 5 submissions per 15 minutes per IP (Protects lead mailbox and Resend quota)
const quoteSubmissionLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "You have reached the maximum inquiry submission limit. Please contact us directly on WhatsApp (+91 98291 96508) or try again in a few minutes."
});

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight OPTIONS requests across all routes
app.use(express.json());
app.use(cookieParser());

// Apply Global Rate Limiting across all /api routes
app.use("/api", globalApiLimiter);

// Root Welcome & Status Endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Kaushal Refrigeration & Interior API Server",
    status: "online",
    message: "Backend API is running securely.",
    endpoints: {
      health: "/api/health",
      quotes: "/api/quotes"
    }
  });
});

// Health & CORS Verification Endpoint
app.get("/api/health", (req, res) => {
  const clientOrigin = req.headers.origin || null;
  const isAllowed = !clientOrigin || allowedOrigins.some((pattern) => originMatchesPattern(clientOrigin, pattern));

  res.json({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    clientOrigin: clientOrigin || "direct/same-origin",
    corsAllowed: isAllowed,
    serverTime: new Date().toISOString()
  });
});

// Authentication Middleware
function requireAdmin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: No valid admin session cookie found."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Session expired or invalid signature."
    });
  }
}

// =============================================================================
// INPUT VALIDATION SCHEMAS (Zod - Type Safety & Strict Structural Checking)
// =============================================================================

// 1. Admin Login Payload Schema
const LoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(60, "Username exceeds maximum length"),
  password: z.string().min(1, "Password is required").max(100, "Password exceeds maximum length")
});

// 2. OTP Verification Payload Schema
const VerifyOtpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Recovery code must be exactly 6 numeric digits")
});

// 3. Gallery Item Creation Schema
const GalleryItemSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150, "Title cannot exceed 150 characters"),
  category: z.string().trim().min(2, "Category is required").max(80).default("Display Counter"),
  subCategory: z.string().trim().max(80).nullable().optional(),
  location: z.string().trim().max(120).optional().default("Jhotwara Manufacturing Unit, Jaipur"),
  src: z.string().trim().min(5, "Image URL or valid path is required").max(3000, "Image URL is too long"),
  desc: z.string().trim().max(2000, "Description cannot exceed 2000 characters").optional().default(""),
  specs: z.array(z.string().trim().max(200)).max(30, "Too many specs items").optional().default([])
});

// 4. Gallery ID Parameter Schema
const GalleryIdParamSchema = z.object({
  id: z.coerce.number().int("ID must be an integer").positive("ID must be a positive number")
});

// 5. Quote Inquiry Schema
const QuoteInquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name cannot exceed 80 characters"),
  phone: z.string().trim().regex(/^[0-9+ -]{10,20}$/, "Please provide a valid phone number with at least 10 digits"),
  email: z.string().trim().email("Invalid email address format").max(120).optional().or(z.literal("")),
  requirement: z.string().trim().max(120).optional().default("Display Counter"),
  notes: z.string().trim().max(2500, "Message cannot exceed 2500 characters").optional().default("")
});

/**
 * Express Middleware Factory for Zod Schemas
 * Strictly validates incoming payloads before database execution
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error.issues || [];
      const errorDetails = issues.map((e) => ({
        field: e.path.join(".") || source,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed: " + errorDetails.map((e) => `${e.field}: ${e.message}`).join("; "),
        details: errorDetails
      });
    }
    // Bind sanitized, strictly-typed data back onto req
    req[source] = result.data;
    next();
  };
}

// -----------------------------------------------------------------------------
// AUTH ROUTES
// -----------------------------------------------------------------------------

// 1. Admin Login (Validated with LoginSchema & Sets HttpOnly Cookie on success)
app.post("/api/admin/login", validate(LoginSchema), (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown_ip";
  const now = Date.now();

  const userAttempts = loginAttempts.get(ip) || { count: 0, lockoutUntil: 0 };

  // Check lockout
  if (userAttempts.lockoutUntil && userAttempts.lockoutUntil > now) {
    const waitSec = Math.ceil((userAttempts.lockoutUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Security lockout active. Too many failed attempts. Try again in ${waitSec} second(s).`,
      lockoutSeconds: waitSec
    });
  }

  const { username, password } = req.body;
  const expectedUser = (process.env.ADMIN_USER || "admin").trim().toLowerCase();
  const expectedPass = process.env.ADMIN_PASS || "admin123";

  // Timing-safe credential validation to prevent timing attacks
  const usernameMatch = username && username.trim().toLowerCase() === expectedUser;
  const passwordMatch = timingSafeEqual(password, expectedPass);

  if (usernameMatch && passwordMatch) {
    // Reset failed attempts on success
    loginAttempts.delete(ip);

    // Generate signed JWT
    const token = jwt.sign(
      { role: "admin", username: expectedUser },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: "Admin authenticated successfully.",
      user: expectedUser
    });
  }

  // Failed login handling
  userAttempts.count += 1;
  if (userAttempts.count >= MAX_ATTEMPTS) {
    userAttempts.lockoutUntil = now + LOCKOUT_MS;
    loginAttempts.set(ip, userAttempts);
    return res.status(429).json({
      success: false,
      error: "Security lockout: 5 failed attempts reached. Portal locked for 5 minutes.",
      lockoutSeconds: 300
    });
  }

  loginAttempts.set(ip, userAttempts);
  const remaining = MAX_ATTEMPTS - userAttempts.count;

  return res.status(401).json({
    success: false,
    error: `Invalid credentials. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout).`,
    remainingAttempts: remaining
  });
});

// 2. Check Auth Status (Validates HttpOnly Cookie)
app.get("/api/admin/check-auth", (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      authenticated: true,
      user: decoded.username || "admin"
    });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

// 3. Logout (Clears HttpOnly Cookie)
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return res.json({ success: true, message: "Logged out successfully" });
});

// 4. Send Recovery OTP (Rate limited to max 3 per 15 min to prevent quota exhaustion)
app.post("/api/admin/send-otp", otpEmailLimiter, async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || "ampventures7@gmail.com";
  const adminUser = process.env.ADMIN_USER || "admin";

  if (!apiKey || apiKey.includes("your_resend_api_key")) {
    return res.status(500).json({
      success: false,
      error: "Resend API key is not configured in backend/.env"
    });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set("admin_otp", { code: otpCode, expiresAt });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #d1fae5; border-radius: 10px; background: #ffffff;">
      <h2 style="color: #092015; margin-top: 0;">Admin Portal Recovery Code</h2>
      <p style="color: #4b5563;">Use this code to unlock and sign in to your Kaushal Refrigeration admin panel:</p>
      <div style="background: #f0fdf4; border: 1.5px dashed #22c55e; padding: 18px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #092015; font-family: monospace;">${otpCode}</span>
      </div>
      <p style="color: #6b7280; font-size: 13px;">Admin Username: <b>${adminUser}</b> | Valid for 10 minutes.</p>
    </div>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "KRI Security <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `🔐 Admin Recovery Code: ${otpCode}`,
        html: htmlContent
      })
    });

    const data = await resendRes.json();
    if (!resendRes.ok) {
      return res.status(500).json({
        success: false,
        error: data.message || "Failed to dispatch email via Resend"
      });
    }

    return res.json({ success: true, deliveredTo: ownerEmail });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Verify OTP (Validated with VerifyOtpSchema & Sets HttpOnly Cookie on success)
app.post("/api/admin/verify-otp", validate(VerifyOtpSchema), (req, res) => {
  const { code } = req.body;
  const stored = otpStore.get("admin_otp");

  if (!stored) {
    return res.status(400).json({ success: false, error: "No active recovery code found. Please request a new OTP." });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete("admin_otp");
    return res.status(400).json({ success: false, error: "OTP expired. Please request a new one." });
  }

  if (!timingSafeEqual(stored.code, code)) {
    return res.status(400).json({ success: false, error: "Incorrect 6-digit recovery code." });
  }

  // Success: Clear OTP and reset IP lockout
  otpStore.delete("admin_otp");
  const ip = req.ip || req.socket?.remoteAddress || "unknown_ip";
  loginAttempts.delete(ip);

  // Set secure HttpOnly cookie
  const token = jwt.sign(
    { role: "admin", username: process.env.ADMIN_USER || "admin" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  return res.json({ success: true, message: "OTP verified. Admin session activated." });
});

// -----------------------------------------------------------------------------
// PROTECTED GALLERY ROUTES (Server-side Verified & Validated)
// -----------------------------------------------------------------------------

// Add Gallery Item (Requires valid HttpOnly Cookie & Validated with GalleryItemSchema)
app.post("/api/admin/gallery", requireAdmin, validate(GalleryItemSchema), async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ success: false, error: "Supabase client not initialized on server." });
  }

  const { title, category, subCategory, location, src, desc, specs } = req.body;

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .insert([
        {
          title,
          category,
          sub_category: subCategory || null,
          location,
          src,
          description: desc,
          specs
        }
      ])
      .select();

    if (error) {
      console.error("Supabase server insert error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error("Server insert exception:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Gallery Item (Requires valid HttpOnly Cookie & Validated with GalleryIdParamSchema)
app.delete("/api/admin/gallery/:id", requireAdmin, validate(GalleryIdParamSchema, "params"), async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ success: false, error: "Supabase client not initialized on server." });
  }

  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase server delete error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, message: `Item ${id} deleted successfully.` });
  } catch (err) {
    console.error("Server delete exception:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC QUOTE INQUIRIES (Protected with Dedicated Rate Limiting & Validation)
// -----------------------------------------------------------------------------
app.post("/api/quotes", quoteSubmissionLimiter, validate(QuoteInquirySchema), async (req, res) => {
  const { name, phone, email, requirement, notes } = req.body;

  const quoteRecord = {
    name,
    phone,
    email: email || null,
    requirement: requirement || "Display Counter",
    notes: notes || "",
    status: "NEW",
    created_at: new Date().toISOString()
  };

  let savedInSupabase = false;
  let supabaseError = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert([quoteRecord])
        .select();

      if (error) {
        console.error("Supabase quote insert error:", error);
        supabaseError = error.message;
      } else {
        savedInSupabase = true;
      }
    } catch (err) {
      console.error("Quote save exception:", err);
      supabaseError = err.message;
    }
  }

  // Trigger Server-side Resend Email Notification with Strict HTML Escaping (Anti-XSS / Injection)
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || "autarram528@Gmail.com";
  if (resendApiKey && !resendApiKey.includes("your_resend_api_key")) {
    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeEmail = email ? escapeHtml(email) : "Not provided";
    const safeReq = escapeHtml(requirement || "Display Counter");
    const safeNotes = notes ? escapeHtml(notes) : "None";

    try {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Kaushal Refrigeration Leads <onboarding@resend.dev>",
          to: [ownerEmail],
          subject: `New Lead: ${safeReq} inquiry from ${safeName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff;">
              <h2 style="color: #0284c7; margin-top: 0;">New Commercial Lead Received</h2>
              <p style="margin: 6px 0;"><b>Client Name:</b> ${safeName}</p>
              <p style="margin: 6px 0;"><b>Phone:</b> <a href="tel:${safePhone}" style="color: #0284c7;">${safePhone}</a></p>
              <p style="margin: 6px 0;"><b>Email:</b> ${safeEmail}</p>
              <p style="margin: 6px 0;"><b>Requirement:</b> <span style="background: #e0f2fe; padding: 3px 8px; border-radius: 4px;">${safeReq}</span></p>
              <p style="margin: 12px 0 0 0;"><b>Notes/Message:</b> ${safeNotes}</p>
            </div>
          `
        })
      }).catch((e) => console.warn("Backend Resend dispatch error:", e.message));
    } catch (e) {
      // Non-blocking
    }
  }

  return res.json({
    success: true,
    message: "Inquiry successfully validated and recorded.",
    savedInSupabase,
    supabaseError,
    data: quoteRecord
  });
});

// -----------------------------------------------------------------------------
// ADMIN QUOTE INQUIRIES MANAGEMENT (Requires valid HttpOnly Cookie)
// -----------------------------------------------------------------------------
app.get("/api/admin/quotes", requireAdmin, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ success: false, error: "Supabase client not initialized on server." });
  }

  try {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 404 Handler for Unrecognized Endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Centralized Express Error Handler (Prevents stack trace leaks)
app.use((err, req, res, next) => {
  console.error("⚠️ [Internal Error]", err.stack || err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Malformed JSON payload in request body."
    });
  }

  return res.status(500).json({
    success: false,
    error: isProduction ? "An unexpected server error occurred." : (err.message || "Internal server error")
  });
});

const server = app.listen(PORT, () => {
  console.log(`🔒 Kaushal Refrigeration Backend running securely on http://localhost:${PORT}`);
});

// Graceful shutdown on platform termination signals (Render, Railway, Docker, Kubernetes)
process.on("SIGTERM", () => {
  console.log("SIGTERM received: gracefully terminating HTTP server.");
  server.close(() => console.log("HTTP server closed."));
});

