import React, { useMemo, useState, useEffect } from "react";
import { ArrowRight, ChevronRight, CheckCircle2, Factory, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import GallerySection from "./components/GallerySection";
import BlogSection from "./components/BlogSection";
import ContactHero from "./components/ContactHero";
import RequirementsSection from "./components/RequirementsSection";
import FacilitiesSection from "./components/FacilitiesSection";
import ExperienceCenter from "./components/ExperienceCenter";
import CtaBanner from "./components/CtaBanner";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/WhatsAppButton";
import AdminModal from "./components/AdminModal";

import { products, categories } from "./data";
import { galleryItems as defaultGalleryItems } from "./data/galleryData";
import { productImages as I } from "./assets/productImages";

export default function App() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  // Admin & Persistent Gallery State
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("kri_admin_active") === "true";
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [galleryList, setGalleryList] = useState(() => {
    const saved = localStorage.getItem("kri_gallery_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mappedSaved = parsed.map((item) => {
          const fresh = defaultGalleryItems.find((d) => d.id === item.id);
          if (fresh) {
            return {
              ...fresh,
              ...item,
              title: fresh.title,
              desc: fresh.desc,
              specs: fresh.specs,
              category: fresh.category,
              subCategory: fresh.subCategory
            };
          }
          return item.category === "Bakery"
            ? { ...item, category: "Display Counter", subCategory: item.subCategory || "Cold" }
            : item;
        });

        // Merge any new default items (such as dedicated Warm / Normal counters)
        const savedIds = new Set(mappedSaved.map((i) => i.id));
        const missingDefaults = defaultGalleryItems.filter((d) => !savedIds.has(d.id));
        return [...mappedSaved, ...missingDefaults];
      } catch (e) {
        return defaultGalleryItems;
      }
    }
    return defaultGalleryItems;
  });

  // Secret Admin Access Triggers: Keyboard shortcut (Ctrl + Shift + A) & URL hash (#admin)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };

    const handleHashCheck = () => {
      if (window.location.hash === "#admin") {
        setIsAdminModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", handleHashCheck);
    handleHashCheck();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", handleHashCheck);
    };
  }, []);

  const saveGalleryToStorage = (newList) => {
    setGalleryList(newList);
    localStorage.setItem("kri_gallery_data", JSON.stringify(newList));
  };

  const handleAddGalleryItem = (newItem) => {
    const updated = [newItem, ...galleryList];
    saveGalleryToStorage(updated);
  };

  const handleDeleteGalleryItem = (id) => {
    const updated = galleryList.filter((item) => item.id !== id);
    saveGalleryToStorage(updated);
  };

  const handleResetGallery = () => {
    if (window.confirm("Are you sure you want to reset the gallery to default images?")) {
      setGalleryList(defaultGalleryItems);
      localStorage.removeItem("kri_gallery_data");
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem("kri_admin_active", "true");
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("kri_admin_active");
    setIsAdminModalOpen(false);
  };

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.cat === cat) &&
          p.name.toLowerCase().includes(q.toLowerCase())
      ),
    [cat, q]
  );

  const handleSearchClick = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      const input = document.querySelector(".toolbar input");
      if (input) input.focus();
    }, 400);
  };

  const handleRequestQuoteClick = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
      />

      <main id="top">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="heroCopy">
            <p className="eyebrow">
              <span /> COMMERCIAL DISPLAY & REFRIGERATION • JAIPUR
            </p>
            <h1>
              Built to <em>showcase.</em>
              <br />
              Made to perform.
            </h1>
            <p className="lead">
              Premium display counters, bakery showcases, and commercial refrigeration equipment manufactured in Jaipur, Rajasthan.
            </p>
            <div className="actions">
              <a className="primary" href="#products">
                Explore collection <ArrowRight size={17} />
              </a>
              <a className="textLink" href="#contact">
                Talk to us <ChevronRight size={17} />
              </a>
            </div>
            <div className="trust">
              <div className="expHighlight">
                <span className="expNumber">30+</span>
                <span className="expLabel">
                  <b>Years of</b>Experience
                </span>
              </div>
              <div className="trustItem">
                <b>01</b>
                <span>
                  Custom-built
                  <br />
                  for your space
                </span>
              </div>
              <div className="trustItem">
                <b>02</b>
                <span>
                  Premium steel
                  <br />
                  fabrication
                </span>
              </div>
            </div>
          </div>
          <div className="heroVisual">
            <img src={I.hero} alt="Kaushal Refrigeration Showcase" />
            <div className="floatCard">
              <span>30+ YEARS EXPERIENCE</span>
              <b>Precision • Finish • Function</b>
            </div>
          </div>
        </section>

        {/* INTRO SECTION */}
        <section className="intro">
          <div>
            <p className="eyebrow">01 — THE COLLECTION</p>
            <h2>
              Equipment that
              <br />
              <em>works beautifully.</em>
            </h2>
          </div>
          <p>
            From elegant refrigerated displays to practical stainless-steel counters, every piece is designed around your space, workflow and brand.
          </p>
        </section>

        {/* PRODUCTS SECTION */}
        <section id="products" className="products">
          <div className="toolbar">
            <div className="pills">
              {categories.map((c) => (
                <button
                  className={cat === c ? "active" : ""}
                  onClick={() => setCat(c)}
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
            />
          </div>
          <div className="grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} onClick={setSelected} />
            ))}
          </div>
        </section>

        {/* DYNAMIC GALLERY SECTION */}
        <GallerySection
          items={galleryList}
          isAdmin={isAdmin}
          onDeleteItem={handleDeleteGalleryItem}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* BLOG SECTION */}
        <BlogSection />

        {/* CONTACT SECTION */}
        <section id="contact" className="contactPageSection">
          <ContactHero onHomeClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <RequirementsSection />
          <FacilitiesSection />
          <ExperienceCenter />
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="darkSection">
          <div className="darkImage">
            <img src={I.showcase} alt="Kaushal Refrigeration Factory Showcase" />
          </div>
          <div className="darkCopy">
            <p className="eyebrow">ABOUT US — 30+ YEARS LEGACY</p>
            <h2>
              Less clutter.
              <br />
              <em>More impact.</em>
            </h2>
            <p>
              With over 3 decades of manufacturing excellence in Jhotwara, Jaipur, Kaushal Refrigeration & Interrior builds commercial equipment that lets your products take centre stage. Clean lines, practical layouts and a premium food-grade finish — without unnecessary complexity.
            </p>
            <div className="checks">
              <span>
                <CheckCircle2 /> Custom dimensions
              </span>
              <span>
                <CheckCircle2 /> Food-grade materials
              </span>
              <span>
                <CheckCircle2 /> Built for daily use
              </span>
              <span>
                <CheckCircle2 /> Project guidance
              </span>
            </div>
            <a className="outline" href="#contact">
              Discuss your project ↗
            </a>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section id="process" className="process">
          <p className="eyebrow">OUR PROCESS — HOW WE WORK</p>
          <h2>
            From idea to <em>installation.</em>
          </h2>
          <div className="steps">
            <div>
              <b>01</b>
              <Factory />
              <h3>Understand</h3>
              <p>We learn your space, product and workflow.</p>
            </div>
            <div>
              <b>02</b>
              <Sparkles />
              <h3>Design</h3>
              <p>We shape the counter around your requirement.</p>
            </div>
            <div>
              <b>03</b>
              <ShieldCheck />
              <h3>Build</h3>
              <p>Our focus stays on finish, strength and usability.</p>
            </div>
            <div>
              <b>04</b>
              <CheckCircle2 />
              <h3>Deliver</h3>
              <p>Ready for your team to put it to work.</p>
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>

      <Footer
        onSearchClick={handleSearchClick}
        onRequestQuoteClick={handleRequestQuoteClick}
      />

      <ProductModal p={selected} onClose={() => setSelected(null)} />

      {/* ADMIN MODAL */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        galleryItems={galleryList}
        onAddGalleryItem={handleAddGalleryItem}
        onDeleteGalleryItem={handleDeleteGalleryItem}
        onResetGallery={handleResetGallery}
      />

      <FloatingWhatsApp />
    </>
  );
}