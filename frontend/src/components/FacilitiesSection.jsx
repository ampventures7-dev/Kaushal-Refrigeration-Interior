import React from "react";
import { Building2, MapPin, Mail, Phone } from "lucide-react";

export default function FacilitiesSection() {
  const office = {
    type: "CORPORATE OFFICE & SHOWROOM",
    icon: <Building2 size={22} />,
    title: "Kaushal Refrigeration & Interior",
    tagline: "Headquarters & Commercial Display Experience Studio",
    address: "20A, Jeen Mata Marg, Satya Nagar, D.K. Nagar, Jhotwara, Jaipur, Rajasthan 302012",
    phone: "+91 98291 96508",
    email: "autarram528@gmail.com"
  };

  return (
    <section className="facilitiesSection">
      {/* VISIT OUR FACILITIES SECTION */}
      <div className="facilityGroup" style={{ marginBottom: 0 }}>
        <p className="facilityEyebrow">
          <span className="facilityEyebrowLine" />
          OUR HEADQUARTERS & FACILITY
        </p>
        <h2 className="facilityHeading">Visit Our <em>Jhotwara Facility</em></h2>
        <p className="expCenterDescription" style={{ marginBottom: 30 }}>
          Kaushal Refrigeration & Interior operates exclusively from our centralized manufacturing unit, corporate office, and experience center located in Jhotwara, Jaipur.
        </p>

        <div className="facilityGrid">
          {/* Card 1: CORPORATE OFFICE */}
          <div className="facilityCard">
            <div className="cardMainContent">
              <div className="cardTopHeader">
                <span className="cardCategory">{office.type}</span>
                <span className="cardIcon">{office.icon}</span>
              </div>
              <h3 className="cardTitle">{office.title}</h3>
              <p className="cardTagline">{office.tagline}</p>
              <div className="cardAddress">
                <MapPin size={16} />
                <span>{office.address}</span>
              </div>
            </div>
            <div className="cardFooter">
              <a href="tel:+919829196508" className="cardFooterLink">
                <Phone size={13} /> {office.phone}
              </a>
              <a href={`mailto:${office.email}`} className="cardFooterLink">
                <Mail size={13} /> {office.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

