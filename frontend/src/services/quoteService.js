import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { API_BASE_URL } from "./apiConfig";

/**
 * Sends an email notification using Resend REST API
 */
async function sendResendNotification({ name, phone, email, requirement, notes }) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || "kaushalrefrigeration.inquiry@gmail.com";

  if (!apiKey || apiKey.includes("your_resend_api_key")) {
    console.warn("⚠️ Resend API Key is not set in .env. Skipping email notification.");
    return { skipped: true, reason: "No API key configured" };
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Kaushal Refrigeration & Interior</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">New Commercial Inquiry / Quotation Request</p>
      </div>

      <div style="padding: 24px 8px;">
        <h2 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Client Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone Number:</td>
            <td style="padding: 8px 0; color: #0284c7; font-weight: 700;"><a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
            <td style="padding: 8px 0; color: #0f172a;">${email || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Requirement:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700;"><span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-size: 13px;">${requirement}</span></td>
          </tr>
        </table>

        ${notes ? `
          <div style="margin-top: 20px; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #0284c7;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Requirement Details / Message:</p>
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">${notes}</p>
          </div>
        ` : ""}

        <div style="margin-top: 28px; text-align: center;">
          <a href="https://wa.me/91${phone.replace(/[^0-9]/g, "")}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Chat with Customer on WhatsApp</a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        Sent via Kaushal Refrigeration & Interior Website Lead Management System
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Kaushal Refrigeration Leads <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `New Lead: ${requirement || "Display Counter"} inquiry from ${name}`,
        html: htmlContent
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("Resend API warning:", errData);
      return { success: false, error: errData };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return { success: false, error: err.message };
  }
}

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

  // 7. Try Server Endpoint (Validated on backend with Zod schema)
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

    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData.savedInSupabase) {
        savedInSupabase = true;
      }
    }
  } catch (err) {
    console.warn("Backend quote API unavailable, using direct Supabase fallback:", err);
  }

  // 8. Direct Supabase fallback if not already saved by server
  if (!savedInSupabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert([quoteRecord])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        supabaseError = error.message;
      } else {
        savedInSupabase = true;
      }
    } catch (e) {
      console.error("Supabase connection exception:", e);
      supabaseError = e.message;
    }
  } else if (!savedInSupabase) {
    console.info("Supabase not configured yet. Saving to local state fallback.");
    const existing = JSON.parse(localStorage.getItem("kri_local_quotes") || "[]");
    existing.unshift({ id: Date.now(), ...quoteRecord });
    localStorage.setItem("kri_local_quotes", JSON.stringify(existing));
  }

  // 8. Trigger Resend Notification
  sendResendNotification(quoteRecord).catch((err) => {
    console.warn("Resend notification background error:", err);
  });

  return {
    success: true,
    savedInSupabase,
    supabaseError,
    data: quoteRecord
  };
}
