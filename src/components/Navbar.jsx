import React from "react";
import { Instagram } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function Navbar() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <span className="mark">KRI</span>
        <span>
          <b>KAUSHAL REFRIGERATION & INTERRIOR</b>
          <small>📍 JHOTWARA, JAIPUR, RAJASTHAN</small>
        </span>
      </a>

      {/* Nav items: Home, Products, Gallery, Blog, Contact, with About at the very last */}
      <nav>
        <a href="#top">Home</a>
        <a href="#products">Products</a>
        <a href="#gallery">Gallery</a>
        <a href="#blog">Blog</a>
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
        <a className="navCta" href="#contact">
          Follow Up ↗
        </a>
      </div>
    </header>
  );
}