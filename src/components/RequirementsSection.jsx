import React, { useState } from "react";
import { WhatsAppIcon } from "./WhatsAppButton";
import { productImages as I } from "../assets/productImages";
import { CheckCircle2 } from "lucide-react";

export default function RequirementsSection() {
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
              <button type="submit" className="primary reqSubmitBtn">
                Send Enquiry ↗
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
