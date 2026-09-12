import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { galleryItems as defaultGalleryItems } from "../data/galleryData";
import { API_BASE_URL } from "./apiConfig";

const STORAGE_BUCKET = "gallery-images";
const LOCAL_STORAGE_KEY = "kri_gallery_data";

/**
 * Fetches gallery items from Supabase or falls back to local storage / defaults
 */
export async function fetchGalleryItems() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          ...item,
          desc: item.description || item.desc,
          specs: Array.isArray(item.specs) ? item.specs : []
        }));
      }
    } catch (e) {
      console.warn("Supabase gallery fetch error, using local fallback:", e);
    }
  }

  // Fallback to localStorage or default gallery items
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }

  return defaultGalleryItems;
}

/**
 * Uploads an image file to Supabase Storage 'gallery-images' bucket
 */
export async function uploadGalleryImage(file) {
  if (!file) throw new Error("No file provided");

  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split(".").pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Failed to upload image to Supabase Storage:", err);
      // Fallback to data URL so the user isn't blocked
      return await readFileAsDataUrl(file);
    }
  }

  // Fallback: Read as base64 Data URL for local/offline testing
  return await readFileAsDataUrl(file);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Adds a new counter item through the authenticated backend API
 * (Server checks HttpOnly cookie before executing database insert)
 */
export async function addGalleryItem(item) {
  // 1. Try secure backend API (Protected with HttpOnly cookie)
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/gallery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // Sends HttpOnly admin cookie
      body: JSON.stringify(item)
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return {
          ...result.data,
          desc: result.data.description,
          subCategory: result.data.sub_category
        };
      }
    }
  } catch (err) {
    console.warn("Backend API unavailable, attempting client fallback:", err);
  }

  // 2. Direct Supabase client fallback (if configured)
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        title: item.title,
        type: item.type || "image",
        category: item.category,
        sub_category: item.subCategory || null,
        location: item.location || "",
        src: item.src,
        description: item.desc || "",
        specs: item.specs || []
      };

      const { data, error } = await supabase
        .from("gallery_items")
        .insert([payload])
        .select();

      if (!error && data && data[0]) {
        return {
          ...data[0],
          desc: data[0].description,
          subCategory: data[0].sub_category
        };
      }
    } catch (e) {
      console.warn("Client insert error:", e);
    }
  }

  // Fallback for local state
  return item;
}

/**
 * Deletes a gallery counter item through the authenticated backend API
 * (Server checks HttpOnly cookie before executing database deletion)
 */
export async function deleteGalleryItem(id) {
  // 1. Try secure backend API (Protected with HttpOnly cookie)
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/gallery/${id}`, {
      method: "DELETE",
      credentials: "include" // Sends HttpOnly admin cookie
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn("Backend delete API unavailable, attempting client fallback:", err);
  }

  // 2. Direct Supabase client fallback
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from("gallery_items")
        .delete()
        .eq("id", id);
    } catch (e) {
      console.warn("Client delete error:", e);
    }
  }

  return true;
}

