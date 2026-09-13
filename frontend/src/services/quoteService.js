import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { API_BASE_URL } from "./apiConfig";

/**
 * Lead Inquiry & Quotation Service
 * Submissions are processed securely via the backend API (/api/quotes),
 * ensuring email dispatch credentials (Resend) are never exposed to the client.
 */

/**
 * Rate Limiting & Bot Protection Configuration
 */
const RATE_LIMIT_KEY = "kri_form_submissions";
const MAX_SUBMISSIONS_PER_WINDOW = 3;       // Max 3 submissions
const WINDOW_DURATION_MS = 10 * 60 * 1000;  // in 10 minutes
const COOLDOWN_BETWEEN_SUBMITS_MS = 15000;   // 15 seconds between submissions
const MIN_FILL_TIME_MS = 2500;              // Bots submit instantly (< 2.5s)

// Spam keywords commonly used by automated comment/form bots
const SPAM_REGEX = /(casino|viagra|cialis|crypto\s*giveaway|poker|porn|adult\s*dating|loan\s*approved|telegram:\s*@|t\.me\/)/i;

/**
 * Checks client rate limit
 */
function checkRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const now = Date.now();

    // Filter to events within the rolling window
    const recent = history.filter((timestamp) => now - timestamp < WINDOW_DURATION_MS);

    // 1. Check cooldown from last submission
    if (recent.length > 0) {
      const lastSubmit = recent[recent.length - 1];
      const timeSinceLast = now - lastSubmit;
      if (timeSinceLast < COOLDOWN_BETWEEN_SUBMITS_MS) {
        const waitSec = Math.ceil((COOLDOWN_BETWEEN_SUBMITS_MS - timeSinceLast) / 1000);
        return {
          allowed: false,
          error: `Please wait ${waitSec} second(s) before sending another inquiry.`
        };
      }
    }

    // 2. Check maximum submissions in window
    if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
      const oldestSubmit = recent[0];
      const waitMin = Math.ceil((WINDOW_DURATION_MS - (now - oldestSubmit)) / 60000);
      return {
        allowed: false,
        error: `Submission limit reached (maximum ${MAX_SUBMISSIONS_PER_WINDOW} inquiries per 10 minutes). Please wait ${waitMin} minute(s) or contact us directly on WhatsApp.`
      };
    }

    return { allowed: true, history: recent };
  } catch (e) {
    return { allowed: true, history: [] };
  }
}

function recordSubmission() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const history = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = history.filter((timestamp) => now - timestamp < WINDOW_DURATION_MS);
    recent.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Submits a quote request to Supabase and dispatches email alert via Resend
 * Protected by Anti-Bot, Honeypot, and Rate Limiting
 */
export async function submitQuote({ name, phone, email, requirement, notes, honeypot, formStartTime }) {
  // 1. Honeypot check (Bots automatically fill hidden fields)
  if (honeypot && honeypot.trim().length > 0) {
    console.warn("🛡️ Bot submission blocked by honeypot trigger.");
    // Fake success to fool the bot without saving spam
    return { success: true, savedInSupabase: false, botBlocked: true };
  }

  // 2. Timelock check (Human cannot realistically fill form in < 2.5s)
  if (formStartTime && Date.now() - formStartTime < MIN_FILL_TIME_MS) {
    console.warn("🛡️ Automated speed submission blocked.");
    return {
      success: false,
      error: "Submission was too fast. Please take a moment to review your details and try again."
    };
  }

  // 3. Spam content heuristic check
  const combinedText = `${name} ${notes || ""} ${email || ""}`;
  if (SPAM_REGEX.test(combinedText)) {
    console.warn("🛡️ Submission blocked due to spam keywords.");
    return {
      success: false,
      error: "Inquiry rejected. Please remove any promotional links or suspicious text."
    };
  }

  // 4. Phone number digit count check
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10) {
    return {
      success: false,
      error: "Please provide a valid phone number with at least 10 digits."
    };
  }

  // 5. Rate limit check (Max 3 per 10 mins)
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: rateLimit.error
    };
  }

  const quoteRecord = {
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : null,
    requirement: requirement || "Display Counter",
    notes: notes ? notes.trim() : "",
    status: "NEW",
    created_at: new Date().toISOString()
  };

  let savedInSupabase = false;
  let supabaseError = null;

  // 6. Record submission in local rate limiter
  recordSubmission();

  // 7. Process submission via Backend API (Server handles database storage + secure Resend email alert)
  try {
    const apiRes = await fetch(`${API_BASE_URL}/api/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: quoteRecord.name,
        phone: quoteRecord.phone,
        email: quoteRecord.email,
        requirement: quoteRecord.requirement,
        notes: quoteRecord.notes
      })
    });

    const apiData = await apiRes.json().catch(() => ({}));

    if (!apiRes.ok) {
      // Return server-side rate limit (429) or validation error (400) directly to user
      return {
        success: false,
        error: apiData.error || "Inquiry could not be processed. Please try again or WhatsApp us."
      };
    }

    if (apiData.savedInSupabase) {
      savedInSupabase = true;
    }

    return {
      success: true,
      savedInSupabase: true,
      data: apiData.data || quoteRecord
    };
  } catch (err) {
    console.warn("Backend API temporarily unavailable, engaging offline/direct fallback:", err);
  }

  // 8. Direct Supabase fallback if backend server is unreachable
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("quotes")
        .insert([quoteRecord]);

      if (error) {
        console.warn("Supabase insert error:", error);
        supabaseError = error.message;
      } else {
        savedInSupabase = true;
      }
    } catch (e) {
      console.error("Supabase connection exception:", e);
      supabaseError = e.message;
    }
  } else {
    console.info("Saving to local offline state fallback.");
    const existing = JSON.parse(localStorage.getItem("kri_local_quotes") || "[]");
    existing.unshift({ id: Date.now(), ...quoteRecord });
    localStorage.setItem("kri_local_quotes", JSON.stringify(existing));
  }

  return {
    success: true,
    savedInSupabase,
    supabaseError,
    data: quoteRecord
  };
}
