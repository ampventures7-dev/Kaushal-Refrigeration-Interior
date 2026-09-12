import React, { useState } from "react";
import { Instagram, MoreVertical, X, ShieldCheck, UserCheck } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function Navbar({ isAdmin, onOpenAdmin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="nav">
        {/* Brand link */}
        <a
          className="brand"
          href="#top"
          title="Kaushal Refrigeration & Interior"
        >
          <span className="mark">KRI</span>
          <span>
            <b>KAUSHAL REFRIGERATION & INTERIOR</b>
            <small>📍 JHOTWARA, JAIPUR, RAJASTHAN</small>
          </span>
        </a>

        {/* Desktop Nav items */}
        <nav className="desktopNav">
          <a href="#top">Home</a>
          <a href="#products">Products</a>
          <a href="#gallery">Gallery</a>
          <a href="#blog">Blog</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
          <a href="#about">About</a>
        </nav>

        <div className="navActions">
          <a
            className="navInsta"
            href="https://www.instagram.com/kaushal_refrigeration/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram: @kaushal_refrigeration"
          >
            <Instagram size={18} /> <span>Instagram</span>
          </a>
          <a
            className="navWa"
            href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20want%20to%20enquire%20about%20commercial%20counters."
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={18} /> <span>9829196508</span>
          </a>

          {/* Admin Mode Badge (Visible ONLY when admin is logged in) */}
          {isAdmin && (
            <button
              type="button"
              className="adminActiveBtn"
              onClick={onOpenAdmin}
              title="Open Admin Portal"
            >
              <UserCheck size={16} /> <span>👑 Admin Panel</span>
            </button>
          )}

          {/* Mobile 3-Dots Menu Button */}
          <button
            type="button"
            className="threeDotsBtn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            title="Menu Options"
          >
            {mobileMenuOpen ? <X size={24} /> : <MoreVertical size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobileDrawerOverlay" onClick={closeMenu}>
          <div className="mobileDrawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobileDrawerHeader">
              <div className="mobileBrand">
                <span className="mark">KRI</span>
                <div>
                  <b>KAUSHAL REFRIGERATION</b>
                  <small>Jaipur, Rajasthan</small>
                </div>
              </div>
              <button
                type="button"
                className="mobileDrawerClose"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mobileDrawerLinks">
              <a href="#top" onClick={closeMenu}>
                🏠 Home Section
              </a>
              <a href="#products" onClick={closeMenu}>
                📦 Products & Collection
              </a>
              <a href="#gallery" onClick={closeMenu}>
                🖼️ Real Projects Gallery
              </a>
              <a href="#blog" onClick={closeMenu}>
                📝 News & Articles
              </a>
              <a href="#faq" onClick={closeMenu}>
                ❓ FAQs & Buyer Guide
              </a>
              <a href="#contact" onClick={closeMenu}>
                📞 Contact & Location
              </a>
              <a href="#about" onClick={closeMenu}>
                ℹ️ About 30+ Years Legacy
              </a>
              <a href="#process" onClick={closeMenu}>
                ⚙️ Manufacturing Process
              </a>
            </div>

            {/* Mobile Admin Badge (Visible ONLY when admin is logged in) */}
            {isAdmin && (
              <>
                <div className="mobileDrawerDivider" />
                <div className="mobileAdminSection">
                  <button
                    type="button"
                    className="mobileAdminBtn active"
                    onClick={() => {
                      closeMenu();
                      onOpenAdmin();
                    }}
                  >
                    <ShieldCheck size={18} /> 👑 Admin Panel (Photo Manage)
                  </button>
                </div>
              </>
            )}

            <div className="mobileDrawerFooter">
              <a
                className="mobileDrawerInsta"
                href="https://www.instagram.com/kaushal_refrigeration/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={18} /> Instagram
              </a>
              <a
                className="mobileDrawerWa"
                href="https://wa.me/919829196508"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={18} /> WhatsApp 9829196508
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}