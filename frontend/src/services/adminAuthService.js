import { API_BASE_URL } from "./apiConfig";

/**
 * Admin Authentication & OTP Recovery Service
 * Communicates with backend using HTTP-Only, Secure Cookies (immune to XSS)
 */

/**
 * Log in as Admin via server endpoint
 * Server validates credentials and sets secure HttpOnly cookie
 */
export async function loginAdmin(username, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // Enables receiving and storing HttpOnly cookie
      body: JSON.stringify({ username, password })
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      return {
        success: false,
        error: `Authentication server returned status ${res.status} (${res.statusText || "non-JSON"}). Ensure backend is running on port 5000.`
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Login failed. Please check credentials.",
        lockoutSeconds: data.lockoutSeconds,
        remainingAttempts: data.remainingAttempts
      };
    }

    return {
      success: true,
      user: data.user,
      message: data.message
    };
  } catch (err) {
    console.error("Login request error:", err);
    return {
      success: false,
      error: "Unable to connect to authentication server. Please ensure both frontend (http://localhost:5174) and backend (http://localhost:5000) are running."
    };
  }
}

/**
 * Verifies if the browser currently possesses a valid, unexpired HttpOnly admin session
 */
export async function checkAdminAuth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/check-auth`, {
      method: "GET",
      credentials: "include" // Sends HttpOnly cookie to server for validation
    });

    if (!res.ok) {
      return { authenticated: false };
    }

    const data = await res.json();
    return {
      authenticated: Boolean(data.authenticated),
      user: data.user || null
    };
  } catch (err) {
    // If backend is offline, fail closed
    return { authenticated: false };
  }
}

/**
 * Logs out admin by instructing server to clear the HttpOnly session cookie
 */
export async function logoutAdmin() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/logout`, {
      method: "POST",
      credentials: "include"
    });
    return res.ok;
  } catch (err) {
    console.warn("Logout error:", err);
    return false;
  }
}

/**
 * Requests a 6-digit recovery OTP to be sent to the administrator email
 */
export async function sendAdminRecoveryOtp() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to send recovery code."
      };
    }

    return {
      success: true,
      deliveredTo: data.deliveredTo
    };
  } catch (err) {
    console.error("OTP send error:", err);
    return {
      success: false,
      error: "Network error while connecting to recovery service."
    };
  }
}

/**
 * Verifies recovery OTP on the server and activates HttpOnly admin session on success
 */
export async function verifyAdminRecoveryOtp(code) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Invalid or expired recovery code."
      };
    }

    return { success: true };
  } catch (err) {
    console.error("OTP verify error:", err);
    return {
      success: false,
      error: "Network error during OTP verification."
    };
  }
}
