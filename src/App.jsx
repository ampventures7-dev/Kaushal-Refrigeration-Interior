import React,{useMemo,useState} from "react";
import {ArrowRight,ChevronRight,CheckCircle2,Factory,ShieldCheck,Sparkles,MapPin,Phone,Mail,Instagram} from "lucide-react";
import Navbar from "./components/Navbar"; import ProductCard from "./components/ProductCard"; import ProductModal from "./components/ProductModal"; import QuoteForm from "./components/QuoteForm";
import GallerySection from "./components/GallerySection";
import BlogSection from "./components/BlogSection";
import ContactHero from "./components/ContactHero";
import RequirementsSection from "./components/RequirementsSection";
import FacilitiesSection from "./components/FacilitiesSection";
import ExperienceCenter from "./components/ExperienceCenter";
import CtaBanner from "./components/CtaBanner";
import Footer from "./components/Footer";
import FloatingWhatsApp,{WhatsAppIcon} from "./components/WhatsAppButton";
import {products,categories} from "./data"; import {productImages as I} from "./assets/productImages";

export default function App(){
 const [cat,setCat]=useState("All"),[q,setQ]=useState(""),[selected,setSelected]=useState(null);
 const filtered=useMemo(()=>products.filter(p=>(cat==="All"||p.cat===cat)&&p.name.toLowerCase().includes(q.toLowerCase())),[cat,q]);

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

 return <><Navbar/><main id="top">
 <section className="hero"><div className="heroCopy"><p className="eyebrow"><span/> COMMERCIAL DISPLAY & REFRIGERATION • JAIPUR</p><h1>Built to <em>showcase.</em><br/>Made to perform.</h1><p className="lead">Premium display counters, bakery showcases, and commercial refrigeration equipment manufactured in Jaipur, Rajasthan.</p><div className="actions"><a className="primary" href="#products">Explore collection <ArrowRight size={17}/></a><a className="textLink" href="#contact">Talk to us <ChevronRight size={17}/></a></div><div className="trust"><div className="expHighlight"><span className="expNumber">30+</span><span className="expLabel"><b>Years of</b>Experience</span></div><div className="trustItem"><b>01</b><span>Custom-built<br/>for your space</span></div><div className="trustItem"><b>02</b><span>Premium steel<br/>fabrication</span></div></div></div>
 <div className="heroVisual"><img src={I.hero}/><div className="floatCard"><span>30+ YEARS EXPERIENCE</span><b>Precision • Finish • Function</b></div></div></section>
 <section className="intro"><div><p className="eyebrow">01 — THE COLLECTION</p><h2>Equipment that<br/><em>works beautifully.</em></h2></div><p>From elegant refrigerated displays to practical stainless-steel counters, every piece is designed around your space, workflow and brand.</p></section>
 <section id="products" className="products"><div className="toolbar"><div className="pills">{categories.map(c=><button className={cat===c?"active":""} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products…"/></div><div className="grid">{filtered.map(p=><ProductCard key={p.id} p={p} onClick={setSelected}/>)}</div></section>
 <GallerySection/>
 <BlogSection/>
 <section id="contact" className="contactPageSection"><ContactHero onHomeClick={()=>window.scrollTo({top:0,behavior:"smooth"})}/><RequirementsSection/><FacilitiesSection/><ExperienceCenter/></section>
 <section id="about" className="darkSection"><div className="darkImage"><img src={I.showcase}/></div><div className="darkCopy"><p className="eyebrow">ABOUT US — 30+ YEARS LEGACY</p><h2>Less clutter.<br/><em>More impact.</em></h2><p>With over 3 decades of manufacturing excellence in Jhotwara, Jaipur, Kaushal Refrigeration & Interrior builds commercial equipment that lets your products take centre stage. Clean lines, practical layouts and a premium food-grade finish — without unnecessary complexity.</p><div className="checks"><span><CheckCircle2/> Custom dimensions</span><span><CheckCircle2/> Food-grade materials</span><span><CheckCircle2/> Built for daily use</span><span><CheckCircle2/> Project guidance</span></div><a className="outline" href="#contact">Discuss your project ↗</a></div></section>
 <section id="process" className="process"><p className="eyebrow">OUR PROCESS — HOW WE WORK</p><h2>From idea to <em>installation.</em></h2><div className="steps"><div><b>01</b><Factory/><h3>Understand</h3><p>We learn your space, product and workflow.</p></div><div><b>02</b><Sparkles/><h3>Design</h3><p>We shape the counter around your requirement.</p></div><div><b>03</b><ShieldCheck/><h3>Build</h3><p>Our focus stays on finish, strength and usability.</p></div><div><b>04</b><CheckCircle2/><h3>Deliver</h3><p>Ready for your team to put it to work.</p></div></div></section>
 <CtaBanner/>
 </main>
 <Footer onSearchClick={handleSearchClick} onRequestQuoteClick={handleRequestQuoteClick}/>
 <ProductModal p={selected} onClose={()=>setSelected(null)}/><FloatingWhatsApp/></>
}