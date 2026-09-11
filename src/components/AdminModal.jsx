import React, { useState } from "react";
import { X, Lock, ShieldCheck, PlusCircle, Trash2, LogOut, Image, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminModal({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout,
  galleryItems,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onResetGallery
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("add"); // "add" | "manage"

  // Form state for adding new photo
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bakery");
  const [location, setLocation] = useState("Jhotwara Manufacturing Unit, Jaipur");
  const [src, setSrc] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [desc, setDesc] = useState("");
  const [specsInput, setSpecsInput] = useState("SS 304 Food Grade Steel, Precision Welding, Custom Chilling");
  const [addSuccessMsg, setAddSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === "admin" && password === "admin123") {
      onLoginSuccess();
      setLoginError("");
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Invalid credentials! Default: admin / admin123");
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSrc(reader.result);
        setPreviewSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setSrc(val);
    setPreviewSrc(val);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !src) {
      alert("Please provide a Title and an Image URL or Upload a Photo.");
      return;
    }

    const specsArray = specsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newItem = {
      id: Date.now(),
      type: "image",
      title: title.trim(),
      category: category,
      location: location.trim(),
      src: src,
      desc: desc.trim() || "High quality commercial refrigeration equipment manufactured in Jaipur.",
      specs: specsArray.length > 0 ? specsArray : ["Custom Built", "SS 304 Steel"]
    };

    onAddGalleryItem(newItem);
    setAddSuccessMsg("✅ New photo added to gallery successfully!");

    // Reset Form
    setTitle("");
    setSrc("");
    setPreviewSrc("");
    setDesc("");

    setTimeout(() => setAddSuccessMsg(""), 3500);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="adminModalBox" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close admin modal">
          <X size={20} />
        </button>

        {!isAdmin ? (
          /* LOGIN FORM */
          <div className="adminLoginContainer">
            <div className="adminHeader">
              <div className="adminBadgeIcon">
                <Lock size={26} color="#ffffff" />
              </div>
              <h2>Admin Portal Login</h2>
              <p>Sign in to add, edit, or delete gallery photos & products.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="adminLoginForm">
              {loginError && (
                <div className="adminErrorAlert">
                  <AlertCircle size={16} /> {loginError}
                </div>
              )}

              <div className="adminField">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username (admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="adminField">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password (admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="adminSubmitBtn">
                <ShieldCheck size={18} /> Sign In as Admin
              </button>

              <div className="adminCredentialHint">
                <small>💡 Default Login Credentials:</small>
                <code>Username: admin | Password: admin123</code>
              </div>
            </form>
          </div>
        ) : (
          /* ADMIN PORTAL CONTROLS */
          <div className="adminPortalContainer">
            <div className="adminPortalTopBar">
              <div>
                <span className="adminStatusBadge">
                  <ShieldCheck size={14} /> 👑 ADMIN MODE ACTIVE
                </span>
                <h2>Admin Management Panel</h2>
              </div>
              <button type="button" className="adminLogoutBtn" onClick={onLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="adminTabs">
              <button
                type="button"
                className={`adminTab ${activeTab === "add" ? "active" : ""}`}
                onClick={() => setActiveTab("add")}
              >
                <PlusCircle size={17} /> Add New Photo
              </button>
              <button
                type="button"
                className={`adminTab ${activeTab === "manage" ? "active" : ""}`}
                onClick={() => setActiveTab("manage")}
              >
                <Image size={17} /> Manage Photos ({galleryItems.length})
              </button>
            </div>

            {addSuccessMsg && (
              <div className="adminSuccessAlert">
                <CheckCircle2 size={18} /> {addSuccessMsg}
              </div>
            )}

            {/* TAB 1: ADD NEW PHOTO */}
            {activeTab === "add" && (
              <form onSubmit={handleAddSubmit} className="adminAddForm">
                <div className="adminFormGrid">
                  <div className="adminField">
                    <label>Product / Photo Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. 4-Tier Gold Trim Cake Showcase"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adminField">
                    <label>Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Bakery">Bakery</option>
                      <option value="Sweet Displays">Sweet Displays</option>
                      <option value="Commercial Chillers">Commercial Chillers</option>
                      <option value="Custom Fabrication">Custom Fabrication</option>
                      <option value="Videos">Videos</option>
                    </select>
                  </div>

                  <div className="adminField">
                    <label>Location / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Jhotwara Factory Unit, Jaipur"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="adminField">
                    <label>Image Upload or Image URL *</label>
                    <div className="adminImageUploadInputs">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="fileInput"
                      />
                      <span className="orText">OR</span>
                      <input
                        type="text"
                        placeholder="Paste Image URL (/gallery/sample.jpg)"
                        value={src}
                        onChange={handleUrlInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Image */}
                {previewSrc && (
                  <div className="adminImagePreviewBox">
                    <small>Photo Preview:</small>
                    <img src={previewSrc} alt="Preview" />
                  </div>
                )}

                <div className="adminField fullWidth">
                  <label>Product Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Write a clear product description based on features, dimensions, cooling system, and steel grade..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="adminField fullWidth">
                  <label>Specifications (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. SS 304 Steel, Digital Controller, Warm LED, 3-Tier Shelves"
                    value={specsInput}
                    onChange={(e) => setSpecsInput(e.target.value)}
                  />
                </div>

                <div className="adminActionButtons">
                  <button type="submit" className="adminSaveBtn">
                    <PlusCircle size={18} /> Publish Photo to Gallery
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: MANAGE & DELETE EXISTING PHOTOS */}
            {activeTab === "manage" && (
              <div className="adminManageSection">
                <div className="adminManageHeader">
                  <p>Click <b>Delete Photo</b> to permanently remove any image from the gallery.</p>
                  <button type="button" className="adminResetBtn" onClick={onResetGallery}>
                    <RefreshCw size={14} /> Reset Gallery to Defaults
                  </button>
                </div>

                <div className="adminPhotoList">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="adminPhotoRow">
                      <div className="adminPhotoThumb">
                        {item.type === "video" ? (
                          <video src={item.src} muted />
                        ) : (
                          <img src={item.src} alt={item.title} />
                        )}
                      </div>
                      <div className="adminPhotoDetails">
                        <span className="adminPhotoCat">{item.category}</span>
                        <h4>{item.title}</h4>
                        <small>{item.location}</small>
                      </div>
                      <button
                        type="button"
                        className="adminDeletePhotoBtn"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            onDeleteGalleryItem(item.id);
                          }
                        }}
                      >
                        <Trash2 size={16} /> Delete Photo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
