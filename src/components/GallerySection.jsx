import React, { useState } from "react";
import { Sparkles, Maximize2, X, CheckCircle2, Play } from "lucide-react";
import { galleryItems, galleryCategories } from "../data/galleryData";

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeItem, setActiveItem] = useState(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  return (
    <section id="gallery" className="gallerySection">
      <div className="galleryContainer">
        {/* Eyebrow and Heading */}
        <div className="galleryHeader">
          <p className="galleryEyebrow">
            <span className="galleryEyebrowLine" />
            OUR CRAFTSMANSHIP • {galleryItems.length} REAL PROJECTS & VIDEOS
          </p>
          <h2 className="galleryHeading">Real Projects & <em>Factory Showroom Gallery</em></h2>
          <p className="gallerySubtext">
            Explore customized commercial display counters, sweet showcases, bakery chiller islands, and factory video tours manufactured in our Jhotwara, Jaipur facility.
          </p>

          {/* Filter Pills */}
          <div className="galleryPills">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`galleryPill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "Videos" ? "🎬 Factory Videos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="galleryGrid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="galleryCard"
              onClick={() => setActiveItem(item)}
            >
              <div className="galleryImgWrap">
                {item.type === "video" ? (
                  <>
                    <video
                      src={item.src}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="galleryPlayOverlay">
                      <div className="galleryPlayIcon">
                        <Play size={22} fill="#ffffff" style={{ marginLeft: 3 }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    style={item.category === "Our Business Card" ? { objectFit: "contain", background: "#092015", padding: "6px" } : {}}
                  />
                )}
                <span className="galleryCategoryBadge">
                  {item.type === "video" ? "📹 Factory Video" : item.category}
                </span>
                <button
                  type="button"
                  className="galleryZoomBtn"
                  title="View full details"
                  aria-label="View full details"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
              <div className="galleryCardBody">
                <small className="galleryLocation">{item.location}</small>
                <h3 className="galleryTitle">{item.title}</h3>
                <p className="gallerySnippet">{item.desc}</p>
                <div className="galleryQuickTags">
                  {item.specs.slice(0, 2).map((spec, idx) => (
                    <span key={idx}>✓ {spec}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <div className="overlay" onClick={() => setActiveItem(null)}>
          <div className="modal galleryModal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setActiveItem(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="galleryModalImg">
              {activeItem.type === "video" ? (
                <video
                  src={activeItem.src}
                  controls
                  autoPlay
                  className="galleryModalVideo"
                />
              ) : (
                <img src={activeItem.src} alt={activeItem.title} />
              )}
              <div className="galleryModalTag">{activeItem.location}</div>
            </div>
            <div className="galleryModalInfo">
              <span className="galleryModalBadge">
                <Sparkles size={14} /> {activeItem.category}
              </span>
              <h2>{activeItem.title}</h2>
              <p className="galleryModalDesc">{activeItem.desc}</p>

              <h4>ENGINEERED SPECIFICATIONS</h4>
              <ul className="galleryModalSpecs">
                {activeItem.specs.map((spec, i) => (
                  <li key={i}>
                    <CheckCircle2 size={15} color="#27724f" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>

              <div className="galleryModalActions">
                <a
                  href={`https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20saw%20${encodeURIComponent(activeItem.title)}%20in%20your%20gallery%20and%20want%20a%20quotation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary"
                >
                  Enquire About This Model ↗
                </a>
                <a href="#contact" onClick={() => setActiveItem(null)} className="outline">
                  Custom Dimension Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
