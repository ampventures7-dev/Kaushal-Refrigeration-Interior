import React, { useState } from "react";
import { Sparkles, Maximize2, X, CheckCircle2, Play, Trash2, PlusCircle } from "lucide-react";
import { galleryCategories } from "../data/galleryData";

export default function GallerySection({ items, isAdmin, onDeleteItem, onOpenAdmin }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubType, setActiveSubType] = useState("All"); // "All" | "Cold" | "Warm" | "Normal"
  const [activeItem, setActiveItem] = useState(null);

  // Normalize legacy category "Bakery" to "Display Counter"
  const getItemCategory = (item) => (item.category === "Bakery" ? "Display Counter" : item.category);

  // Compute counts for Display Counter sub-types
  const displayCounterItems = (items || []).filter((i) => getItemCategory(i) === "Display Counter");
  const countDisplayAll = displayCounterItems.length;
  const countDisplayCold = displayCounterItems.filter((i) => (i.subCategory || "Cold") === "Cold").length;
  const countDisplayWarm = displayCounterItems.filter((i) => i.subCategory === "Warm").length;
  const countDisplayNormal = displayCounterItems.filter((i) => i.subCategory === "Normal").length;

  const filteredItems = (items || []).filter((item) => {
    const cat = getItemCategory(item);
    if (activeCategory !== "All" && cat !== activeCategory) {
      return false;
    }
    if (activeCategory === "Display Counter" && activeSubType !== "All") {
      const sub = item.subCategory || "Cold";
      return sub === activeSubType;
    }
    return true;
  });

  return (
    <section id="gallery" className="gallerySection">
      <div className="galleryContainer">
        {/* Eyebrow and Heading */}
        <div className="galleryHeader">
          <p className="galleryEyebrow">
            <span className="galleryEyebrowLine" />
            OUR CRAFTSMANSHIP • {items ? items.length : 0} REAL PROJECTS & VIDEOS
          </p>
          <h2 className="galleryHeading">Real Projects & <em>Factory Showroom Gallery</em></h2>
          <p className="gallerySubtext">
            Explore customized commercial display counters (Cold, Warm & Normal), sweet showcases, commercial chiller islands, and factory video tours manufactured in our Jhotwara, Jaipur facility.
          </p>

          {/* Filter Pills */}
          <div className="galleryPills">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`galleryPill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat !== "Display Counter") {
                    setActiveSubType("All");
                  }
                }}
              >
                {cat === "Videos" ? "🎬 Factory Videos" : cat}
              </button>
            ))}
          </div>

          {/* Sub-Pills for Display Counter: Cold, Warm, Normal */}
          {activeCategory === "Display Counter" && (
            <div className="gallerySubPillsRow">
              <span className="gallerySubPillsLabel">
                <Sparkles size={14} /> Counter Type:
              </span>
              <div className="gallerySubPills">
                {[
                  { id: "All", label: "All Counters", icon: "✨", count: countDisplayAll },
                  { id: "Cold", label: "Cold (Chilled)", icon: "❄️", count: countDisplayCold },
                  { id: "Warm", label: "Warm (Hot Case)", icon: "♨️", count: countDisplayWarm },
                  { id: "Normal", label: "Normal (Ambient)", icon: "🌿", count: countDisplayNormal }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    className={`gallerySubPill ${activeSubType === sub.id ? "active" : ""} subPill-${sub.id.toLowerCase()}`}
                    onClick={() => setActiveSubType(sub.id)}
                  >
                    <span className="subPillIcon">{sub.icon}</span>
                    <span className="subPillText">{sub.label}</span>
                    <span className="subPillCount">{sub.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="galleryGrid">
          {/* If Admin, show quick Add Card */}
          {isAdmin && (
            <div className="adminAddQuickCard" onClick={onOpenAdmin}>
              <PlusCircle size={36} color="#27724f" />
              <h3>Add New Photo</h3>
              <p>Upload or paste image link</p>
            </div>
          )}

          {filteredItems.map((item) => {
            const cat = getItemCategory(item);
            const isDisplay = cat === "Display Counter";
            const sub = item.subCategory || "Cold";

            return (
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
                    />
                  )}

                  <span
                    className={`galleryCategoryBadge ${
                      isDisplay ? `badge-${sub.toLowerCase()}` : ""
                    }`}
                  >
                    {item.type === "video"
                      ? "📹 Factory Video"
                      : isDisplay
                      ? `${sub === "Warm" ? "♨️ Warm" : sub === "Normal" ? "🌿 Normal" : "❄️ Cold"} Counter`
                      : cat}
                  </span>

                  {/* Admin Delete Action Button */}
                  {isAdmin && (
                    <button
                      type="button"
                      className="galleryAdminDeleteBtn"
                      title="Delete photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${item.title}"?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

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
                    {item.specs &&
                      item.specs.slice(0, 2).map((spec, idx) => (
                        <span key={idx}>✓ {spec}</span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
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
                <Sparkles size={14} /> {getItemCategory(activeItem)}
                {getItemCategory(activeItem) === "Display Counter" && (
                  <>
                    {" "}•{" "}
                    {(activeItem.subCategory || "Cold") === "Warm"
                      ? "♨️ Warm (Hot Case)"
                      : (activeItem.subCategory || "Cold") === "Normal"
                      ? "🌿 Normal (Ambient)"
                      : "❄️ Cold (Chilled)"}
                  </>
                )}
              </span>
              <h2>{activeItem.title}</h2>
              <p className="galleryModalDesc">{activeItem.desc}</p>

              <h4>ENGINEERED SPECIFICATIONS</h4>
              <ul className="galleryModalSpecs">
                {activeItem.specs &&
                  activeItem.specs.map((spec, i) => (
                    <li key={i}>
                      <CheckCircle2 size={15} color="#27724f" />
                      <span>{spec}</span>
                    </li>
                  ))}
              </ul>

              <div className="galleryModalActions">
                <a
                  href={`https://wa.me/919829196508?text=Hello%20Kaushal%20Refrigeration%2C%20I%20saw%20${encodeURIComponent(
                    activeItem.title + (activeItem.subCategory ? ` [${activeItem.subCategory} Type]` : "")
                  )}%20in%20your%20gallery%20and%20want%20a%20quotation.`}
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
