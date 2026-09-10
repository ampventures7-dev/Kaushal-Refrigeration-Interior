import React, { useState } from "react";
import { BookOpen, Calendar, Clock, ArrowRight, X, CheckCircle2, Share2 } from "lucide-react";
import { productImages as I } from "../assets/productImages";

const blogPosts = [
  {
    id: 1,
    title: "How to Choose the Right Display Counter for Bakeries & Sweet Shops",
    category: "Buying Guide",
    date: "September 2026",
    readTime: "5 min read",
    image: I.showcase,
    summary:
      "Balancing airflow, relative humidity, and LED color temperature to keep Indian sweets soft and bakery crusts crisp without surface drying.",
    content: [
      "In commercial food retail across Rajasthan, temperature control is only half the battle. Relative humidity (RH) determines whether your signature rasgulla remains succulent or your French pastry crust stays crisp.",
      "Ventilated vs. Static Cooling: For bakery items like mousse cakes and delicate pastries, gentle ventilated chilling (+2°C to +6°C) ensures consistent cold air distribution without hotspots.",
      "Traditional Mithai & Indian Sweets: Sweets require higher relative humidity (around 70%-75%) with lower air velocity so moisture isn't stripped from milk solids (khoya/chenna).",
      "Lighting Selection: Avoid blueish cool LEDs that make sweets look dull. At Kaushal Refrigeration, we engineer custom 3000K warm gold lighting strips that accentuate natural golden and saffron tones.",
      "Condensation Management: During humid monsoons, heated double vacuum glass prevents misting, ensuring flawless 100% visibility for your walk-in customers."
    ]
  },
  {
    id: 2,
    title: "Why Food-Grade SS 304 Steel is Essential for Commercial Counters",
    category: "Materials & Quality",
    date: "August 2026",
    readTime: "4 min read",
    image: I.counter,
    summary:
      "Understanding why SS 304 outperforms 201 grade in corrosive, high-moisture environments and complies with FSSAI commercial food hygiene mandates.",
    content: [
      "Commercial kitchens and display showrooms are subjected to milk lactic acids, fruit syrups, sanitizing chemicals, and constant temperature shifts.",
      "Corrosion Resistance: Stainless Steel 304 contains 18% chromium and 8% nickel, creating an invisible, self-healing oxide layer that prevents rust and pitting.",
      "Why Grade 201 Falls Short: Many low-cost fabricators substitute Grade 201 to cut costs. Within 12-18 months of contact with acidic syrups or salt, 201 develops unsightly brown rust stains and structural weakness.",
      "Hygienic Non-Porous Surface: Bacteria cannot penetrate smooth SS 304 sheet surfaces. Cleaning requires only a gentle food-grade detergent wipe down at the end of each shift.",
      "At our Jhotwara manufacturing plant, every Kaushal display counter uses certified high-gauge SS 304 on all food-contact zones."
    ]
  },
  {
    id: 3,
    title: "Energy Efficiency & Compressor Maintenance in Hot Rajasthan Summers",
    category: "Maintenance Guide",
    date: "July 2026",
    readTime: "6 min read",
    image: I.hero,
    summary:
      "Practical steps to maintain optimal chilling performance when outdoor temperatures exceed 45°C in Jaipur and surrounding regions.",
    content: [
      "Jaipur summers routinely push ambient temperatures past 42°C-46°C. Standard off-the-shelf chillers often trip or ice up under extreme thermal load.",
      "Tropicalized Condensing Units: All Kaushal Refrigeration compressors are rated for Tropical Class (ambient operation up to 45°C+), using oversized copper condenser coils for superior heat rejection.",
      "Condenser Coil Dust Cleaning: Dust accumulation on external condenser fins is the #1 cause of cooling degradation. A monthly 5-minute soft brush sweep keeps power consumption low.",
      "Proper Air Gap: Ensure at least 100mm to 150mm clear air space behind and around the counter's compressor louvers for unrestricted airflow.",
      "Magnetic Gasket Check: Regularly inspect rubber door gaskets for gaps or tears. A tight seal prevents chilled air leakage and saves up to 25% on daily commercial electricity bills."
    ]
  }
];

export default function BlogSection() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <section id="blog" className="blogSection">
      <div className="blogContainer">
        {/* Header */}
        <div className="blogHeader">
          <p className="blogEyebrow">
            <span className="blogEyebrowLine" />
            KNOWLEDGE BASE • TECHNICAL GUIDES
          </p>
          <h2 className="blogHeading">Refrigeration & <em>Commercial Display Insights</em></h2>
          <p className="blogSubtext">
            Practical advice, maintenance tips, and fabrication guidelines drawn from 30+ years of commercial refrigeration engineering in Jaipur.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="blogGrid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blogCard">
              <div className="blogImgWrap" onClick={() => setSelectedPost(post)}>
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className="blogCategoryBadge">{post.category}</span>
              </div>
              <div className="blogCardBody">
                <div className="blogMeta">
                  <span>
                    <Calendar size={13} /> {post.date}
                  </span>
                  <span>•</span>
                  <span>
                    <Clock size={13} /> {post.readTime}
                  </span>
                </div>
                <h3 className="blogTitle" onClick={() => setSelectedPost(post)}>
                  {post.title}
                </h3>
                <p className="blogSummary">{post.summary}</p>
                <div className="blogCardFooter">
                  <button
                    type="button"
                    className="blogReadBtn"
                    onClick={() => setSelectedPost(post)}
                  >
                    Read Full Guide <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Reading Modal */}
      {selectedPost && (
        <div className="overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal blogModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setSelectedPost(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="blogModalContent">
              <div className="blogModalMeta">
                <span className="blogCategoryBadge" style={{ position: "static" }}>
                  {selectedPost.category}
                </span>
                <span>
                  <Calendar size={13} /> {selectedPost.date}
                </span>
                <span>
                  <Clock size={13} /> {selectedPost.readTime}
                </span>
              </div>

              <h2>{selectedPost.title}</h2>
              <div className="blogModalImg">
                <img src={selectedPost.image} alt={selectedPost.title} />
              </div>

              <div className="blogModalText">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="blogModalCta">
                <div className="blogModalCtaText">
                  <b>Have a question about your project specifications?</b>
                  <span>Consult our Jaipur engineering team for custom guidance.</span>
                </div>
                <a
                  href={`https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20read%20your%20blog%20article%20'${encodeURIComponent(selectedPost.title)}'%20and%20have%20a%20question.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary"
                >
                  Ask An Expert on WhatsApp ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
