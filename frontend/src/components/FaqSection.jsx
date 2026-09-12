import React, { useState } from "react";
import { ChevronDown, HelpCircle, Phone, MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppButton";

const faqs = [
  {
    id: "faq-1",
    category: "Customization & Specs",
    question: "Do you manufacture customized display counters according to our shop dimensions?",
    answer:
      "Yes, 100%. Every commercial display counter at Kaushal Refrigeration is custom-fabricated in our Jhotwara, Jaipur manufacturing plant. We customize total length (from 3 ft up to 14 ft+), width, height, number of display tiers, front glass shape (straight glass, curved glass, or L-shape), and exterior finishes (Titanium Gold PVD, Rose Gold, Matte Black, or Hairline Brushed SS).",
    highlight: "Custom sizing from 3 ft to 14+ ft with 3D design mockups"
  },
  {
    id: "faq-2",
    category: "Customization & Specs",
    question: "Which grade of stainless steel is used in your display counters?",
    answer:
      "We exclusively use heavy-gauge, certified food-grade SS 304 stainless steel on all food-contact surfaces, shelves, and structural frames. Unlike cheap Grade 201 steel, SS 304 contains 18% chromium and 8% nickel, guaranteeing complete resistance against rust caused by milk lactic acids, sugar syrups, and salt wash downs, adhering to strict FSSAI commercial kitchen hygiene guidelines.",
    highlight: "Certified SS 304 Food-Grade — Zero rust guarantee"
  },
  {
    id: "faq-3",
    category: "Cooling & Tech",
    question: "What is the difference between a Bakery Cake Showcase and a Traditional Sweet (Mithai) Counter?",
    answer:
      "Bakery & pastry showcases require gentle ventilated (forced-air) cooling at +2°C to +6°C with controlled airflow to keep fresh cream, cheesecakes, and pastries chilled without freezing or crusting. In contrast, Traditional Indian Sweet (Mithai) counters require static or high-humidity cooling (+6°C to +10°C) with low air velocity so moisture isn't stripped from delicate milk sweets like rasgulla, khoya barfi, and chenna.",
    highlight: "Tailored airflow & relative humidity for bakery vs. sweet shops"
  },
  {
    id: "faq-4",
    category: "Cooling & Tech",
    question: "How do you prevent glass fogging and condensation during humid monsoon weather?",
    answer:
      "We install heated double-glazed insulated vacuum glass equipped with transparent micro-filament heating elements. This keeps the exterior glass crystal-clear at all times with zero misting, water droplets, or dripping, even during humid Rajasthan monsoon months or in air-conditioned showrooms.",
    highlight: "Heated double vacuum glass with 100% anti-fog technology"
  },
  {
    id: "faq-5",
    category: "Cooling & Tech",
    question: "Which compressors do you use, and how energy-efficient are they during hot Rajasthan summers?",
    answer:
      "We use globally recognized tropicalized commercial compressors (Embraco, Danfoss, or Tecumseh) engineered to deliver sustained cooling even when ambient temperatures exceed 45°C in Jaipur. Paired with high-density CFC-free PUF insulation and oversized copper condenser coils, our units reduce electricity consumption by up to 30% compared to local unbranded fabricators.",
    highlight: "Embraco & Danfoss Tropicalized Compressors (rated for 45°C+)"
  },
  {
    id: "faq-6",
    category: "Warranty & Service",
    question: "What warranty and after-sales support do you provide?",
    answer:
      "We provide a 1-Year Comprehensive Warranty on the cooling system, digital controller, and compressor. Because our manufacturing plant is locally situated in Jhotwara, Jaipur, our service engineers offer prompt 24-to-48 hour on-site service across Jaipur and fast dispatch support across Rajasthan.",
    highlight: "1-Year comprehensive warranty & fast on-site support"
  },
  {
    id: "faq-7",
    category: "Warranty & Service",
    question: "Do you deliver and install display counters outside Jaipur?",
    answer:
      "Yes. While our primary factory is in Jaipur, we regularly supply and install commercial refrigeration equipment across Rajasthan (Kota, Jodhpur, Ajmer, Udaipur, Sikar, Bikaner, Alwar, Bhilwara) as well as Delhi NCR, Haryana, and Gujarat. All counters are shipped in heavy-duty wooden crates with insured transit.",
    highlight: "Safe wooden crate delivery across Rajasthan & North India"
  },
  {
    id: "faq-8",
    category: "Customization & Specs",
    question: "How long does it take to manufacture and deliver a custom counter?",
    answer:
      "Standard models and pre-engineered showcases are ready for dispatch within 2 to 4 working days. Custom fabrication (custom lengths, titanium PVD gold plating, stone or Corian cladding) typically takes 7 to 12 working days from CAD design approval.",
    highlight: "Quick 2-4 day dispatch on standard models; 7-12 days on custom"
  }
];

const categories = ["All", "Customization & Specs", "Cooling & Tech", "Warranty & Service"];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState("faq-1"); // First one open by default

  const toggleAccordion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs =
    activeCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <section id="faq" className="faqSection">
      <div className="faqContainer">
        {/* Header */}
        <div className="faqHeader">
          <div className="faqEyebrow">
            <HelpCircle size={15} />
            <span>FREQUENTLY ASKED QUESTIONS — BUYER'S GUIDE</span>
          </div>
          <h2 className="faqTitle">
            Everything you need to know about <em>commercial counters.</em>
          </h2>
          <p className="faqSubtitle">
            Expert answers on custom fabrication, SS 304 food-grade specifications, humidity control, and factory-direct pricing in Jaipur.
          </p>

          {/* Category Filter Pills */}
          <div className="faqCategoryPills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`faqPill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="faqList">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`faqItem ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faqQuestionBtn"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="faqNumber">0{idx + 1}</span>
                  <span className="faqQuestionText">{faq.question}</span>
                  <span className={`faqIconWrap ${isOpen ? "rotated" : ""}`}>
                    <ChevronDown size={20} />
                  </span>
                </button>

                {isOpen && (
                  <div className="faqAnswerWrapper">
                    <p className="faqAnswerText">{faq.answer}</p>
                    {faq.highlight && (
                      <div className="faqHighlightBadge">
                        <CheckCircle2 size={16} />
                        <span>{faq.highlight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA Card */}
        <div className="faqCtaBox">
          <div className="faqCtaContent">
            <div className="faqCtaBadge">
              <Sparkles size={16} />
              <span>CUSTOM SPECIFICATION CONSULTATION</span>
            </div>
            <h3>Have a specific size or layout requirement?</h3>
            <p>
              Speak directly with our technical fabrication team in Jhotwara, Jaipur. We will assist you with custom CAD layouts, humidity requirements, and a free factory quotation.
            </p>
          </div>
          <div className="faqCtaActions">
            <a
              href="https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20have%20a%20technical%20question%20about%20display%20counters."
              target="_blank"
              rel="noopener noreferrer"
              className="faqCtaWaBtn"
            >
              <WhatsAppIcon size={18} />
              <span>WhatsApp Us</span>
            </a>
            <a href="tel:+919829196508" className="faqCtaCallBtn">
              <Phone size={17} />
              <span>Call +91 98291 96508</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
