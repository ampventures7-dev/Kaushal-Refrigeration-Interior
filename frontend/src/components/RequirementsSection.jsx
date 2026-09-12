import React, { useState, useRef } from "react";
import { WhatsAppIcon } from "./WhatsAppButton";
import { productImages as I } from "../assets/productImages";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { submitQuote } from "../services/quoteService";

export default function RequirementsSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const formStartTime = useRef(Date.now());

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    requirement: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await submitQuote({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        requirement: formData.requirement,
        notes: `Company: ${formData.company ? formData.company.trim() : "N/A"} | Notes: ${formData.message ? formData.message.trim() : "None"}`,
        honeypot,
        formStartTime: formStartTime.current
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || "Could not submit inquiry. Please reach out via WhatsApp.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("An unexpected error occurred. Please contact us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="requirementsSection">
      <div className="requirementsContainer">
        {/* Left Side: Showroom / Product Images (2 Overlapping Images) */}
        <div className="requirementsVisualSide">
          <div className="imgWrapperPrimary">
            <img
              src={I.showcase}
              alt="Kaushal Refrigeration Commercial Showroom"
              loading="lazy"
            />
            <div className="imgTag">Showroom & Fabrication</div>
          </div>

          <div className="imgWrapperSecondary">
            <img
              src={I.hero}
              alt="Kaushal Display Counter Fabrication"
              loading="lazy"
            />
            <div className="imgBadge">
              <b>Custom Built</b>
              <span>SS 304 Food Grade</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form and Details */}
        <div className="requirementsFormSide">
          {/* Small label */}
          <p className="reqEyebrow">
            <span className="reqEyebrowLine" />
            HOW CAN WE HELP YOU?
          </p>

          {/* Heading */}
          <h2 className="reqHeading">Send us your requirements</h2>

          {/* Subtext: 1 line about team responding within 24 hours */}
          <p className="reqSubtext">
            Fill in your project details below and our fabrication engineering team will respond within 24 hours.
          </p>

          {submitted ? (
            <div className="reqSuccessCard">
              <div className="reqSuccessIcon">
                <CheckCircle2 size={32} />
              </div>
              <h3>Enquiry Received Successfully!</h3>
              <p>
                Thank you, <b>{formData.name || "valued client"}</b>. Our team will review your specifications and contact you within 24 hours.
              </p>
              <div className="reqSuccessActions">
                <a
                  href={`https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20just%20submitted%20an%20enquiry%20for%20${encodeURIComponent(
                    formData.requirement || "Commercial Display Counter"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reqWaBtn"
                >
                  <WhatsAppIcon size={18} /> Speed up on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      company: "",
                      phone: "",
                      email: "",
                      requirement: "",
                      message: ""
                    });
                  }}
                  className="reqResetBtn"
                >
                  Submit another enquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reqForm">
              {errorMessage && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "14px",
                  border: "1px solid #f87171"
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Anti-Bot Honeypot Field (hidden from humans, trapped by spam bots) */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                  opacity: 0,
                  height: 0,
                  width: 0,
                  overflow: "hidden"
                }}
                aria-hidden="true"
              >
                <label htmlFor="req-website-pot">Leave this field empty</label>
                <input
                  id="req-website-pot"
                  type="text"
                  name="website_pot"
                  tabIndex="-1"
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Form fields in 2-column grid on desktop, single column on mobile */}
              <div className="reqFormGrid">
                {/* 1. Name */}
                <div className="reqField">
                  <label htmlFor="req-name">Your Name *</label>
                  <input
                    id="req-name"
                    name="name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Sharma"
                  />
                </div>

                {/* 2. Company Name */}
                <div className="reqField">
                  <label htmlFor="req-company">Company / Brand Name</label>
                  <input
                    id="req-company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Jaipur Sweets & Bakery"
                  />
                </div>

                {/* 3. Phone Number */}
                <div className="reqField">
                  <label htmlFor="req-phone">Phone Number *</label>
                  <input
                    id="req-phone"
                    name="phone"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98291 96508"
                  />
                </div>

                {/* 4. Email Address */}
                <div className="reqField">
                  <label htmlFor="req-email">Email Address *</label>
                  <input
                    id="req-email"
                    name="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. contact@business.com"
                  />
                </div>

                {/* 5. Product Requirement (dropdown) - spans 2 columns */}
                <div className="reqField reqFieldFull">
                  <label htmlFor="req-product">Product Requirement *</label>
                  <select
                    id="req-product"
                    name="requirement"
                    required
                    value={formData.requirement}
                    onChange={handleChange}
                  >
                    <option value="">Select your required equipment</option>
                    <option value="Refrigerated Cake Display Counter">
                      Refrigerated Cake Display Counter
                    </option>
                    <option value="Bakery Showcase Counter">
                      Bakery Showcase Counter (Ambient / Warm)
                    </option>
                    <option value="Cold Room / Walk-in Chiller">
                      Commercial Cold Room / Walk-in Chiller
                    </option>
                    <option value="Hot Food & Bain-Marie Counter">
                      Hot Food & Bain-Marie Counter
                    </option>
                    <option value="Stainless Steel Kitchen Work Table">
                      Stainless Steel (SS 304) Work Table & Sink
                    </option>
                    <option value="Island 360° Display Cabinet">
                      Island 360° Glass Display Cabinet
                    </option>
                    <option value="Custom Commercial Kitchen Interior">
                      Complete Commercial Kitchen & Interior Setup
                    </option>
                  </select>
                </div>

                {/* 6. Message (textarea) - spans 2 columns */}
                <div className="reqField reqFieldFull">
                  <label htmlFor="req-message">Your Message / Custom Dimensions</label>
                  <textarea
                    id="req-message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Share counter length, cooling temperature, glass profile, or space details..."
                  />
                </div>
              </div>

              {/* Submit button: Send Enquiry */}
              <button
                type="submit"
                className="primary reqSubmitBtn"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Sending Enquiry..." : "Send Enquiry ↗"}
              </button>

              {/* Below form: small note "Need a quotation quickly?" with WhatsApp button */}
              <div className="reqQuickWa">
                <span className="reqQuickWaText">Need a quotation quickly?</span>
                <a
                  className="reqWaBtn"
                  href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20need%20a%20fast%20quotation%20for%20commercial%20counters."
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Direct WhatsApp: 9829196508"
                >
                  <WhatsAppIcon size={17} /> Direct WhatsApp
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
