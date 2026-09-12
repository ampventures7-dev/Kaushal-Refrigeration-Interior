import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, ArrowUp, Instagram, ArrowRight, ShieldCheck, X, Lock } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function Footer({ onSearchClick, onRequestQuoteClick, onOpenAdmin }) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (onSearchClick) {
      onSearchClick();
    } else {
      const el = document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleQuoteClick = (e) => {
    e.preventDefault();
    if (onRequestQuoteClick) {
      onRequestQuoteClick();
    } else {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footerMain">
      <div className="footerTopGrid">
        {/* Column 1: Logo + short company tagline (years of experience) */}
        <div className="footerCol footerColBrand">
          <a href="#top" className="footerBrand">
            <span className="footerBrandMark">KRI</span>
            <div className="footerBrandText">
              <b>KAUSHAL REFRIGERATION & INTERIOR</b>
              <small>30+ YEARS OF EXPERTISE • JAIPUR</small>
            </div>
          </a>
          <p className="footerTagline">
            With 30+ years of manufacturing excellence in Jaipur, we craft commercial display counters, cold rooms, bakery showcases, and custom stainless-steel interior fixtures.
          </p>
          <div className="footerSocials">
            <a
              href="https://www.instagram.com/kaushal_refrigeration/"
              target="_blank"
              rel="noopener noreferrer"
              className="footerSocialLink insta"
              title="Instagram @kaushal_refrigeration"
            >
              <Instagram size={15} />
              <span>@kaushal_refrigeration</span>
            </a>
            <a
              href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration"
              target="_blank"
              rel="noopener noreferrer"
              className="footerSocialLink wa"
              title="WhatsApp +91 98291 96508"
            >
              <WhatsAppIcon size={15} />
              <span>+91 98291 96508</span>
            </a>
          </div>
        </div>

        {/* Column 2: "QUICK LINKS" — Search, About Us, Contact Us, Products */}
        <div className="footerCol">
          <h4 className="footerColTitle">QUICK LINKS</h4>
          <ul className="footerLinksList">
            <li>
              <a href="#top">Home</a>
            </li>
            <li>
              <a href="#products">Products</a>
            </li>
            <li>
              <a href="#gallery">Gallery</a>
            </li>
            <li>
              <a href="#blog">Blog</a>
            </li>
            <li>
              <a href="#contact">Contact Us</a>
            </li>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <button
                type="button"
                className="footerQuickAdminBtn"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenAdmin) onOpenAdmin();
                }}
              >
                🔐 Admin Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: "CONTACT INFO" — address, phone, email */}
        <div className="footerCol">
          <h4 className="footerColTitle">CONTACT INFO</h4>
          <ul className="footerContactList">
            <li>
              <MapPin size={17} className="footerContactIcon" />
              <span>20A, Jeen Mata Marg, Satya Nagar, D.K. Nagar, Jhotwara, Jaipur, Rajasthan 302012</span>
            </li>
            <li>
              <Phone size={17} className="footerContactIcon" />
              <a href="tel:+919829196508" className="footerContactLink">
                +91 98291 96508
              </a>
            </li>
            <li>
              <Mail size={17} className="footerContactIcon" />
              <a href="mailto:autarram528@gmail.com" className="footerContactLink">
                autarram528@gmail.com
              </a>
            </li>
            <li>
              <Clock size={17} className="footerContactIcon" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Column 4: "GET IN TOUCH" — short line + "Request A Quote" button */}
        <div className="footerCol footerColCta">
          <h4 className="footerColTitle">GET IN TOUCH</h4>
          <p className="footerTouchText">
            Planning a new retail showcase, bakery display, or cafe setup? Send us your requirements for an immediate custom quotation.
          </p>
          <a href="#contact" onClick={handleQuoteClick} className="footerQuoteBtn">
            Request A Quote <ArrowRight size={15} />
          </a>
        </div>
      </div>

      {/* Bottom bar: Copyright + Designed by AMP Ventures + Privacy Policy link */}
      <div className="footerBottomBar">
        <div className="footerBottomContent">
          <p className="footerCopyright">
            © {new Date().getFullYear()} Kaushal Refrigeration & Interior. All rights reserved.
          </p>

          <div className="footerCredits">
            <span>Designed & Developed by</span>
            <a
              href="https://www.instagram.com/amp_ventures?stkn=MTkyb2UyOWlsNXI4eA=="
              target="_blank"
              rel="noopener noreferrer"
              className="ampVenturesBadge"
              title="Visit AMP Ventures on Instagram"
            >
              <span className="ampSparkle">✨</span> AMP Ventures ↗
            </a>
          </div>

          <div className="footerBottomLinks">
            <button
              type="button"
              className="footerPolicyBtn"
              onClick={() => setShowPrivacyModal(true)}
            >
              Privacy Policy
            </button>
            <span className="footerDivider">•</span>
            <button
              type="button"
              className="footerAdminLinkBtn"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenAdmin) onOpenAdmin();
              }}
              title="Open Admin Management Portal"
            >
              <Lock size={12} /> Admin Portal
            </button>
            <span className="footerDivider">•</span>
            <a href="#top" className="footerBackToTop">
              Back to top <ArrowUp size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal privacyModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setShowPrivacyModal(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="privacyModalContent">
              <span className="privacyBadge">
                <ShieldCheck size={16} /> PRIVACY POLICY
              </span>
              <h3>Kaushal Refrigeration & Interior</h3>
              <p>
                At Kaushal Refrigeration & Interior, client confidentiality and project data integrity are central to our customer relationships.
              </p>
              <h4>1. Project Information & Inquiries</h4>
              <p>
                Any dimensions, drawings, contact details, and project specifications submitted via our quotation forms, WhatsApp, or phone lines are used strictly to provide engineering estimates, coordinate logistics, and facilitate customer support.
              </p>
              <h4>2. Confidentiality & Third Parties</h4>
              <p>
                We do not sell, rent, or trade your contact or business information. Your details remain within our direct manufacturing and customer service team.
              </p>
              <h4>3. Contact for Inquiries</h4>
              <p>
                For questions regarding your data or project details, contact us directly at <b>autarram528@gmail.com</b> or call <b>+91 98291 96508</b>.
              </p>
              <button
                className="primary"
                onClick={() => setShowPrivacyModal(false)}
                style={{ marginTop: 22 }}
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
