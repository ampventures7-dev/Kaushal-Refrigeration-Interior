import React from "react";
import { Phone, Mail } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function ContactHero({ onHomeClick }) {
  return (
    <header className="contactHero">
      {/* Breadcrumb line: HOME / CONTACT US */}
      <nav className="contactBreadcrumb" aria-label="Breadcrumb">
        <a href="#top" onClick={onHomeClick} className="bcLink">
          HOME
        </a>
        <span className="bcDivider">/</span>
        <span className="bcCurrent">CONTACT US</span>
      </nav>

      {/* Small eyebrow label above heading */}
      <p className="contactEyebrow">
        <span className="contactEyebrowLine" />
        GET IN TOUCH
      </p>

      {/* Large heading */}
      <h1 className="contactHeroHeading">WE'D LOVE TO HEAR FROM YOU</h1>

      {/* Short subtext (1-2 lines) about reaching out for refrigeration & interior solutions */}
      <p className="contactHeroSubtext">
        Reach out to discuss custom commercial display counters, cold rooms, and complete interior refrigeration solutions designed for your space.
      </p>

      {/* Row of 3 quick contact options: Phone, Email, WhatsApp */}
      <div className="quickContactRow">
        <a href="tel:+919829196508" className="quickContactCard">
          <div className="quickContactIcon">
            <Phone size={20} />
          </div>
          <div className="quickContactContent">
            <small>PHONE NUMBER</small>
            <b>+91 98291 96508</b>
          </div>
        </a>

        <a href="mailto:autarram528@gmail.com" className="quickContactCard">
          <div className="quickContactIcon">
            <Mail size={20} />
          </div>
          <div className="quickContactContent">
            <small>EMAIL ADDRESS</small>
            <b>autarram528@gmail.com</b>
          </div>
        </a>

        <a
          href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20want%20to%20enquire%20about%20refrigeration%20and%20interior%20solutions."
          target="_blank"
          rel="noopener noreferrer"
          className="quickContactCard quickContactWa"
        >
          <div className="quickContactIcon waIcon">
            <WhatsAppIcon size={20} />
          </div>
          <div className="quickContactContent">
            <small>WHATSAPP</small>
            <b>+91 98291 96508</b>
          </div>
        </a>
      </div>
    </header>
  );
}
