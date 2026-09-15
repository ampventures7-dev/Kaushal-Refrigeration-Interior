import React, { useState, useEffect } from "react";
import { X, Lock, ShieldCheck, PlusCircle, Trash2, LogOut, Image, RefreshCw, CheckCircle2, AlertCircle, Loader2, Clock, ShieldAlert, KeyRound, MailCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { uploadGalleryImage } from "../services/galleryService";
import { loginAdmin, sendAdminRecoveryOtp, verifyAdminRecoveryOtp } from "../services/adminAuthService";

const ADMIN_SECURITY_KEY = "kri_admin_login_security";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function getLoginSecurityState() {
  try {
    const raw = localStorage.getItem(ADMIN_SECURITY_KEY);
    if (!raw) return { attempts: 0, lockoutUntil: 0 };
    return JSON.parse(raw);
  } catch (e) {
    return { attempts: 0, lockoutUntil: 0 };
  }
}

function saveLoginSecurityState(state) {
  try {
    localStorage.setItem(ADMIN_SECURITY_KEY, JSON.stringify(state));
  } catch (e) {
    // Ignore
  }
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("add"); // "add" | "manage"

  // OTP Recovery State
  const [authMode, setAuthMode] = useState("password"); // "password" | "otp"
  const [otpInput, setOtpInput] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState("");
  const [otpError, setOtpError] = useState("");

  // Form state for adding new photo
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Display Counter");
  const [subCategory, setSubCategory] = useState("Cold");
  const [location, setLocation] = useState("Jhotwara Manufacturing Unit, Jaipur");
  const [src, setSrc] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [desc, setDesc] = useState("");
  const [specsInput, setSpecsInput] = useState("SS 304 Food Grade Steel, Precision Welding, Custom Chilling");
  const [addSuccessMsg, setAddSuccessMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [lockoutSeconds, setLockoutSeconds] = useState(() => {
    const state = getLoginSecurityState();
    const now = Date.now();
    if (state.lockoutUntil && state.lockoutUntil > now) {
      return Math.ceil((state.lockoutUntil - now) / 1000);
    }
    return 0;
  });

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const state = getLoginSecurityState();
          saveLoginSecurityState({ ...state, attempts: 0, lockoutUntil: 0 });
          setLoginError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    const state = getLoginSecurityState();
    const now = Date.now();

    // Check if currently locked out
    if (state.lockoutUntil && state.lockoutUntil > now) {
      const remaining = Math.ceil((state.lockoutUntil - now) / 1000);
      setLockoutSeconds(remaining);
      setLoginError(`🔒 Admin portal is locked due to too many failed attempts. Try again in ${formatTime(remaining)}.`);
      return;
    }

    // Call secure server endpoint with HttpOnly cookies
    const res = await loginAdmin(username, password);

    if (res.success) {
      saveLoginSecurityState({ attempts: 0, lockoutUntil: 0 });
      setLoginError("");
      setUsername("");
      setPassword("");
      setLockoutSeconds(0);
      onLoginSuccess();
    } else {
      if (res.lockoutSeconds) {
        saveLoginSecurityState({ attempts: MAX_FAILED_ATTEMPTS, lockoutUntil: now + res.lockoutSeconds * 1000 });
        setLockoutSeconds(res.lockoutSeconds);
        setLoginError(res.error);
      } else {
        const newAttempts = (state.attempts || 0) + 1;
        saveLoginSecurityState({ attempts: newAttempts, lockoutUntil: 0 });
        setLoginError(res.error || "Invalid credentials!");
      }
    }
  };

  const handleSendRecoveryOtp = async () => {
    setSendingOtp(true);
    setLoginError("");
    setOtpError("");
    try {
      const res = await sendAdminRecoveryOtp();
      if (res.success) {
        setAuthMode("otp");
        setOtpStatus(`A 6-digit recovery code was sent to ${res.deliveredTo || "your owner email"}.`);
      } else {
        setLoginError(res.error || "Could not dispatch recovery code.");
      }
    } catch (err) {
      setLoginError("Failed to dispatch recovery code. Please check your internet connection.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError("");
    const res = await verifyAdminRecoveryOtp(otpInput);
    if (res.success) {
      setLockoutSeconds(0);
      setOtpInput("");
      setAuthMode("password");
      onLoginSuccess();
    } else {
      setOtpError(res.error || "Incorrect recovery code.");
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const publicUrl = await uploadGalleryImage(file);
        setSrc(publicUrl);
        setPreviewSrc(publicUrl);
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setSrc(val);
    setPreviewSrc(val);
  };

  const handleAddSubmit = async (e) => {
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
      subCategory: category === "Display Counter" ? subCategory : undefined,
      location: location.trim(),
      src: src,
      desc: desc.trim() || "High quality commercial refrigeration equipment manufactured in Jaipur.",
      specs: specsArray.length > 0 ? specsArray : ["Custom Built", "SS 304 Steel"]
    };

    await onAddGalleryItem(newItem);
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
              {lockoutSeconds > 0 && (
                <div style={{
                  background: "#fef2f2",
                  border: "1.5px solid #f87171",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  color: "#991b1b",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13.5px",
                  lineHeight: "1.45"
                }}>
                  <ShieldAlert size={22} style={{ flexShrink: 0, color: "#dc2626" }} />
                  <div>
                    <b>Security Lockout Active</b>
                    <div>Portal locked. Please wait <b>{formatTime(lockoutSeconds)}</b> before retrying.</div>
                  </div>
                </div>
              )}

              {loginError && lockoutSeconds <= 0 && (
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
                  onChange={(e) => { setUsername(e.target.value); if (loginError) setLoginError(""); }}
                  disabled={lockoutSeconds > 0}
                  required
                />
              </div>

              <div className="adminField">
                <label>Password</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (loginError) setLoginError(""); }}
                    disabled={lockoutSeconds > 0}
                    required
                    style={{ width: "100%", paddingRight: "42px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "10px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      padding: "6px",
                      borderRadius: "6px",
                      outline: "none"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot password trigger */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-4px", marginBottom: "18px" }}>
                <button
                  type="button"
                  onClick={handleSendRecoveryOtp}
                  disabled={sendingOtp}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#166534",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: 0
                  }}
                >
                  {sendingOtp ? <Loader2 size={13} className="spin" /> : <KeyRound size={13} />}
                  {sendingOtp ? "Sending code to email..." : "Forgot password? Send recovery OTP"}
                </button>
              </div>

              <button
                type="submit"
                className="adminSubmitBtn"
                disabled={lockoutSeconds > 0}
                style={{
                  opacity: lockoutSeconds > 0 ? 0.6 : 1,
                  cursor: lockoutSeconds > 0 ? "not-allowed" : "pointer"
                }}
              >
                {lockoutSeconds > 0 ? (
                  <>
                    <Clock size={18} /> Locked ({formatTime(lockoutSeconds)})
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Sign In as Admin
                  </>
                )}
              </button>
            </form>
          </div>
        ) : !isAdmin && authMode === "otp" ? (
          /* OTP RECOVERY FORM */
          <div className="adminLoginContainer">
            <div className="adminHeader">
              <div className="adminBadgeIcon" style={{ background: "#166534" }}>
                <MailCheck size={26} color="#ffffff" />
              </div>
              <h2>Verify Recovery Code</h2>
              <p>Enter the 6-digit code sent to your registered administrator email.</p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="adminLoginForm">
              {otpStatus && (
                <div style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  color: "#166534",
                  fontSize: "13px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
                  <span>{otpStatus}</span>
                </div>
              )}

              {otpError && (
                <div className="adminErrorAlert" style={{ marginBottom: "16px" }}>
                  <AlertCircle size={16} /> {otpError}
                </div>
              )}

              <div className="adminField">
                <label>6-Digit Recovery Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  style={{
                    letterSpacing: "8px",
                    fontSize: "22px",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontFamily: "monospace"
                  }}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="adminSubmitBtn" style={{ marginTop: "12px" }}>
                <ShieldCheck size={18} /> Verify Code & Unlock Portal
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("password");
                    setOtpError("");
                    setOtpStatus("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#556c5e",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <ArrowLeft size={14} /> Back to password
                </button>

                <button
                  type="button"
                  onClick={handleSendRecoveryOtp}
                  disabled={sendingOtp}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#166534",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  {sendingOtp ? "Resending..." : "Resend Code"}
                </button>
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
                      <option value="Display Counter">Display Counter</option>
                      <option value="Sweet Displays">Sweet Displays</option>
                      <option value="Commercial Chillers">Commercial Chillers</option>
                      <option value="Custom Fabrication">Custom Fabrication</option>
                      <option value="Videos">Videos</option>
                    </select>
                  </div>

                  {category === "Display Counter" && (
                    <div className="adminField">
                      <label>Counter Type (Temperature) *</label>
                      <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                        <option value="Cold">❄️ Cold (Chilled - For Cakes, Pastries, Drinks)</option>
                        <option value="Warm">♨️ Warm (Hot Case - For Patties, Samosas, Warm Snacks)</option>
                        <option value="Normal">🌿 Normal (Ambient - For Dry Cookies, Namkeen, Breads)</option>
                      </select>
                    </div>
                  )}

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
                    {uploadingImage && (
                      <small style={{ color: "#0284c7", display: "inline-block", marginTop: "4px" }}>
                        ⏳ Uploading image to cloud storage...
                      </small>
                    )}
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
