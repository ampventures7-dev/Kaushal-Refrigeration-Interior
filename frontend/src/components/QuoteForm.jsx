import React, { useState, useRef } from "react";
import { submitQuote } from "../services/quoteService";

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    requirement: "Refrigerated display",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const formStartTime = useRef(Date.now());

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await submitQuote({
        ...formData,
        honeypot,
        formStartTime: formStartTime.current
      });
      if (res.success) {
        setSent(true);
      } else {
        setErrorMsg(res.error || "Could not submit. Please contact us via WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again or reach out on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="success">
        <div>✓</div>
        <h3>Quote Request Submitted!</h3>
        <p>
          Thank you, <b>{formData.name}</b>. Your requirement for <b>{formData.requirement}</b> has been received. Our team will contact you shortly on <b>{formData.phone}</b>.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setFormData({
              name: "",
              phone: "",
              email: "",
              requirement: "Refrigerated display",
              notes: ""
            });
          }}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Anti-Bot Honeypot Field */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <input
          type="text"
          name="quote_form_website_pot"
          tabIndex="-1"
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {errorMsg && (
        <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "12px", background: "#fee2e2", padding: "8px 12px", borderRadius: "6px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="formGrid">
        <input
          required
          name="name"
          placeholder="Your name *"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          required
          type="tel"
          name="phone"
          placeholder="Phone number *"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <input
        type="email"
        name="email"
        placeholder="Email address (optional)"
        value={formData.email}
        onChange={handleChange}
      />

      <select
        name="requirement"
        value={formData.requirement}
        onChange={handleChange}
      >
        <option value="Refrigerated display">Refrigerated display (Cold Showcase)</option>
        <option value="Bakery counter">Bakery counter (Cakes & Pastries)</option>
        <option value="Hot food counter">Hot food counter (Heated Hot Case)</option>
        <option value="Commercial Chillers">Commercial Vertical Chillers / Freezers</option>
        <option value="Custom fabrication">Custom SS Kitchen Fabrication</option>
      </select>

      <textarea
        rows="4"
        name="notes"
        placeholder="Tell us about dimensions, location, or custom requirements..."
        value={formData.notes}
        onChange={handleChange}
      ></textarea>

      <button className="primary" type="submit" disabled={loading}>
        {loading ? "Submitting quote request..." : "Request a quote ↗"}
      </button>
    </form>
  );
}