import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function ExperienceCenter() {
  return (
    <section className="experienceCenterSection">
      {/* Label: VISIT OUR FACILITY */}
      <p className="expCenterEyebrow">
        <span className="expCenterEyebrowLine" />
        VISIT OUR FACILITY
      </p>

      {/* Heading: Manufacturing Unit & Experience Center */}
      <h2 className="expCenterHeading">Manufacturing Unit & Experience Center</h2>

      {/* Short description line */}
      <p className="expCenterDescription">
        Step into our Jaipur manufacturing unit and display showroom to inspect live display counters, test cooling performance, and discuss custom fabrication requirements with our engineering team.
      </p>

      {/* Address, phone (clickable), email (clickable), working hours */}
      <div className="expCenterInfoGrid">
        <div className="expCenterInfoCard">
          <div className="expCenterIconWrap">
            <MapPin size={22} />
          </div>
          <div className="expCenterContent">
            <small>FACTORY & SHOWROOM ADDRESS</small>
            <b>20A, Shivpuri Colony, Jhotwara, Jaipur, Rajasthan 302012</b>
          </div>
        </div>

        <div className="expCenterInfoCard">
          <div className="expCenterIconWrap">
            <Phone size={22} />
          </div>
          <div className="expCenterContent">
            <small>DIRECT PHONE</small>
            <a href="tel:+919829196508" className="expCenterLink">
              +91 98291 96508
            </a>
          </div>
        </div>

        <div className="expCenterInfoCard">
          <div className="expCenterIconWrap">
            <Mail size={22} />
          </div>
          <div className="expCenterContent">
            <small>OFFICIAL EMAIL</small>
            <a href="mailto:autarram528@gmail.com" className="expCenterLink">
              autarram528@gmail.com
            </a>
          </div>
        </div>

        <div className="expCenterInfoCard">
          <div className="expCenterIconWrap">
            <Clock size={22} />
          </div>
          <div className="expCenterContent">
            <small>WORKING HOURS</small>
            <b>Mon – Sat: 9:00 AM – 8:00 PM (Sunday Closed)</b>
          </div>
        </div>
      </div>

      {/* Two buttons: "Call Now" and "WhatsApp" */}
      <div className="expCenterActions">
        <a href="tel:+919829196508" className="primary expCallBtn">
          <Phone size={16} /> Call Now
        </a>
        <a
          href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20want%20to%20visit%20your%20Experience%20Center%20and%20Manufacturing%20Unit%20in%20Jaipur."
          target="_blank"
          rel="noopener noreferrer"
          className="expWaBtn"
        >
          <WhatsAppIcon size={18} /> WhatsApp
        </a>
      </div>

      {/* Embedded Google Map (full width, below content) */}
      <div className="expCenterMapWrapper">
        <iframe
          title="Kaushal Refrigeration & Interrior Manufacturing Unit Map"
          src="https://maps.google.com/maps?q=20A,+Shivpuri+colony,+Jhotwara,+Jaipur,+Rajasthan+302012&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="420"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="mapFloatingBadge">
          <MapPin size={16} />
          <span>Kaushal Refrigeration & Interrior • 20A, Shivpuri Colony, Jhotwara, Jaipur</span>
        </div>
      </div>
    </section>
  );
}
