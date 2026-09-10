import React from "react";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

export default function CtaBanner() {
  return (
    <section className="ctaBannerSection">
      <div className="ctaBannerContainer">
        <div className="ctaBannerContent">
          {/* Label: "START YOUR PROJECT" */}
          <p className="ctaEyebrow">
            <span className="ctaEyebrowLine" />
            START YOUR PROJECT
          </p>

          {/* Heading: "Ready to Build Your Next Refrigeration or Interior Project?" */}
          <h2 className="ctaHeading">
            Ready to Build Your Next Refrigeration or Interior Project?
          </h2>

          {/* Short line about delivering projects */}
          <p className="ctaSubtext">
            From custom-sized display counters to full commercial refrigeration setups, our Jaipur engineering team delivers precision-crafted installations on time and built to last.
          </p>

          {/* Two buttons: "Call Now" and "WhatsApp Enquiry" */}
          <div className="ctaActions">
            <a href="tel:+919829196508" className="ctaCallBtn">
              <Phone size={17} /> Call Now
            </a>
            <a
              href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20am%20ready%20to%20start%20my%20next%20refrigeration%20%26%20interior%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="ctaWaBtn"
            >
              <WhatsAppIcon size={18} /> WhatsApp Enquiry
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
